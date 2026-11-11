#!/usr/bin/env bash
# Restaura un respaldo de PostgreSQL sobre la base del proyecto.
#
# Uso:
#   bash scripts/restaurar.sh ARCHIVO.sql
#   bash scripts/restaurar.sh ARCHIVO.sql.gz
#   bash scripts/restaurar.sh --solo-datos ARCHIVO.sql[.gz]
#
# Modos:
#   (por defecto)  Reemplaza TODO: borra y recrea la base y restaura el respaldo
#                  completo (esquema + datos). Es el camino para un montaje
#                  desde cero o para volver a un respaldo antiguo.
#   --solo-datos   Conserva el esquema y el historial de Flyway que ya existen y
#                  carga unicamente las filas del respaldo. Util cuando la base
#                  ya esta migrada y solo faltan los datos.
#
# Opciones:
#   --si           No pide confirmacion (para uso automatizado).
#   --no-arrancar  No levanta backend/frontend al terminar.
#
# Antes de tocar nada, el script guarda un respaldo del estado actual en
# respaldos/ y lo verifica. Si algo falla, ese archivo es la vuelta atras.
set -euo pipefail
cd "$(dirname "$0")/.."

USO="Uso: bash scripts/restaurar.sh [--solo-datos] [--si] [--no-arrancar] ARCHIVO.sql[.gz]"

MODO=completo
CONFIRMAR=1
ARRANCAR=1
ARCHIVO=""

while [ $# -gt 0 ]; do
  case "$1" in
    --solo-datos) MODO=solo-datos ;;
    --si|--yes)   CONFIRMAR=0 ;;
    --no-arrancar) ARRANCAR=0 ;;
    -h|--help)    echo "$USO"; exit 0 ;;
    -*)           echo "ERROR: opcion desconocida: $1"; echo "$USO"; exit 1 ;;
    *)
      [ -z "$ARCHIVO" ] || { echo "ERROR: sobra un argumento: $1"; echo "$USO"; exit 1; }
      ARCHIVO=$1
      ;;
  esac
  shift
done

[ "$(id -u)" -ne 0 ] || { echo "ERROR: no ejecutes esto como root (usa tu usuario, en el grupo docker)."; exit 1; }
docker info >/dev/null 2>&1 || { echo "ERROR: tu usuario no puede usar Docker. Cierra sesion y vuelve a entrar (o ejecuta: newgrp docker)."; exit 1; }
[ -f .env ] || { echo "ERROR: falta .env (no viaja en Git; crealo a partir de .env.example)."; exit 1; }

[ -n "$ARCHIVO" ] || { echo "$USO"; exit 1; }
[ -f "$ARCHIVO" ] || { echo "ERROR: no existe el archivo '$ARCHIVO'."; exit 1; }
[ -s "$ARCHIVO" ] || { echo "ERROR: el archivo '$ARCHIVO' esta vacio."; exit 1; }

valor_env() { grep -E "^$1=" .env | head -n1 | cut -d= -f2- | tr -d "'\""; }
USUARIO=$(valor_env POSTGRES_USER)
BD=$(valor_env POSTGRES_DB)
[ -n "$USUARIO" ] && [ -n "$BD" ] || { echo "ERROR: faltan POSTGRES_USER o POSTGRES_DB en .env"; exit 1; }
[ "$BD" != "postgres" ] || { echo "ERROR: POSTGRES_DB=postgres no es la base de la aplicacion; revisa .env"; exit 1; }

mkdir -p respaldos
chmod 700 respaldos 2>/dev/null || true
LOG="respaldos/restauracion.log"
log()   { printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" | tee -a "$LOG"; }
error() { printf '%s ERROR: %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" | tee -a "$LOG" >&2; }

es_gzip() {
  local magic
  magic=$(head -c 2 "$ARCHIVO" | od -An -tx1 | tr -d ' \n')
  [ "$magic" = "1f8b" ]
}
if es_gzip; then
  gzip -t "$ARCHIVO" 2>/dev/null || { error "el archivo .gz esta corrupto o incompleto."; exit 1; }
else
  grep -q "PostgreSQL database dump" "$ARCHIVO" 2>/dev/null \
    || log "AVISO: el archivo no parece un pg_dump de PostgreSQL; continuo de todos modos."
fi

# psql contra una base concreta (sin mostrar filas ni cabeceras).
psql_en() {
  local base=$1; shift
  docker compose exec -T db psql -U "$USUARIO" -d "$base" -v ON_ERROR_STOP=1 -q -t -A "$@"
}

restaurar_en() {
  local base=$1
  if es_gzip; then
    gzip -dc "$ARCHIVO" | docker compose exec -T db psql -U "$USUARIO" -d "$base" \
      --single-transaction -v ON_ERROR_STOP=1 -q
  else
    docker compose exec -T db psql -U "$USUARIO" -d "$base" \
      --single-transaction -v ON_ERROR_STOP=1 -q < "$ARCHIVO"
  fi
}

log "=== Inicio de la restauracion de $BD ==="
log "archivo: $ARCHIVO ($(du -h "$ARCHIVO" | cut -f1)) | modo: $MODO"

if [ "$CONFIRMAR" = 1 ]; then
  [ -t 0 ] || { error "no hay terminal interactiva; usa --si para confirmar sin preguntas."; exit 1; }
  echo
  echo "Se va a restaurar:"
  echo "  archivo : $ARCHIVO"
  echo "  base    : $USUARIO@$BD (contenedor db)"
  if [ "$MODO" = "completo" ]; then
    echo "  modo    : COMPLETO (borra y recrea la base; se pierden los datos actuales)"
  else
    echo "  modo    : SOLO DATOS (conserva el esquema y Flyway; reemplaza las filas)"
  fi
  echo "Antes se guardara un respaldo del estado actual en respaldos/."
  echo
  read -rp "Escribe RESTAURAR para continuar: " R
  [ "$R" = "RESTAURAR" ] || { echo "Cancelado."; exit 0; }
fi

# --- 1. Base de datos arriba ------------------------------------------------
log "asegurando que el contenedor db este corriendo..."
docker compose up -d db >>"$LOG" 2>&1
LISTO=0
for _ in $(seq 1 30); do
  if docker compose exec -T db psql -U "$USUARIO" -d postgres -Atqc 'select 1' >/dev/null 2>&1; then
    LISTO=1; break
  fi
  sleep 2
done
[ "$LISTO" = 1 ] || { error "la base de datos no respondio a tiempo."; exit 1; }

# --- 2. Respaldo de seguridad del estado actual -----------------------------
PRE="respaldos/pre-restauracion-$(date '+%F-%H%M%S').sql.gz"
EXISTE_BD=$(psql_en postgres -v bd="$BD" <<'SQL' | tr -d '[:space:]'
select 1 from pg_database where datname = :'bd';
SQL
)
if [ "$EXISTE_BD" = "1" ]; then
  log "guardando respaldo del estado actual en $PRE ..."
  if ! docker compose exec -T db pg_dump -U "$USUARIO" "$BD" | gzip -9 > "$PRE"; then
    rm -f "$PRE"
    error "no se pudo respaldar la base actual; no se restaura nada."
    exit 1
  fi
  if [ ! -s "$PRE" ] || ! gzip -t "$PRE" 2>/dev/null; then
    rm -f "$PRE"
    error "el respaldo de seguridad salio vacio o corrupto; no se restaura nada."
    exit 1
  fi
  chmod 600 "$PRE"
  log "respaldo de seguridad verificado: $PRE"
else
  log "la base $BD no existe todavia; no hay estado actual que respaldar."
fi

# --- 3. Restaurar -----------------------------------------------------------
TMP_DB=""
TMP_DIR=""
limpiar() {
  if [ -n "$TMP_DB" ]; then
    docker compose exec -T db psql -U "$USUARIO" -d postgres -v ON_ERROR_STOP=1 -q \
      -v tmp="$TMP_DB" >/dev/null 2>&1 <<'SQL' || true
DROP DATABASE IF EXISTS :"tmp" WITH (FORCE);
SQL
  fi
  if [ -n "$TMP_DIR" ]; then rm -rf "$TMP_DIR"; fi
  return 0
}
trap limpiar EXIT

if [ "$MODO" = "completo" ]; then
  log "deteniendo backend para liberar conexiones..."
  docker compose stop backend >/dev/null 2>&1 || true
  log "recreando la base $BD (drop + create) ..."
  docker compose exec -T db psql -U "$USUARIO" -d postgres -v ON_ERROR_STOP=1 -q \
    -v bd="$BD" -v usr="$USUARIO" <<'SQL'
DROP DATABASE IF EXISTS :"bd" WITH (FORCE);
CREATE DATABASE :"bd" OWNER :"usr";
SQL
  log "restaurando el respaldo completo..."
  if ! restaurar_en "$BD"; then
    error "fallo la restauracion. La base quedo incompleta."
    error "Vuelve a intentarlo o restaura el respaldo de seguridad: $PRE"
    exit 1
  fi
else
  TIENE_ESQUEMA=$(psql_en "$BD" -c "select to_regclass('public.mantenimiento') is not null;" 2>/dev/null | tr -d '[:space:]' || true)
  if [ "$TIENE_ESQUEMA" != "t" ]; then
    error "la base $BD no tiene el esquema de la aplicacion."
    error "Para un montaje desde cero usa el modo completo (sin --solo-datos)."
    exit 1
  fi

  TMP_DB="${BD}_restore_$$"
  TMP_DIR=$(mktemp -d)
  log "cargando el respaldo en una base temporal ($TMP_DB)..."
  docker compose exec -T db psql -U "$USUARIO" -d postgres -v ON_ERROR_STOP=1 -q \
    -v tmp="$TMP_DB" -v usr="$USUARIO" <<'SQL'
CREATE DATABASE :"tmp" OWNER :"usr";
SQL
  if ! restaurar_en "$TMP_DB"; then
    error "el archivo de respaldo no se pudo cargar en la base temporal; no se toco la base real."
    exit 1
  fi

  log "extrayendo solo los datos (sin esquema ni flyway_schema_history)..."
  docker compose exec -T db pg_dump -U "$USUARIO" -d "$TMP_DB" \
    --data-only --no-owner --no-privileges --disable-triggers \
    -T public.flyway_schema_history > "$TMP_DIR/datos.sql"

  TABLAS=$(psql_en "$BD" -c "select string_agg(format('%I', table_name), ', ' order by table_name) from information_schema.tables where table_schema='public' and table_type='BASE TABLE' and table_name <> 'flyway_schema_history';")
  [ -n "$TABLAS" ] || { error "no se encontraron tablas en $BD."; exit 1; }

  log "reemplazando los datos de $BD en una sola transaccion..."
  { echo "TRUNCATE TABLE $TABLAS RESTART IDENTITY CASCADE;"; cat "$TMP_DIR/datos.sql"; } > "$TMP_DIR/carga.sql"
  if ! docker compose exec -T db psql -U "$USUARIO" -d "$BD" \
        --single-transaction -v ON_ERROR_STOP=1 -q < "$TMP_DIR/carga.sql"; then
    error "fallo la carga de datos; la transaccion se revirtio y la base real quedo como estaba."
    exit 1
  fi

  log "comparando filas contra el respaldo..."
  DESAJUSTES=0
  for T in $(psql_en "$BD" -c "select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' and table_name <> 'flyway_schema_history' order by table_name;"); do
    A=$(psql_en "$BD" -c "select count(*) from public.\"$T\";")
    B=$(psql_en "$TMP_DB" -c "select count(*) from public.\"$T\";")
    if [ "$A" != "$B" ]; then
      echo "  AVISO: $T -> base=$A, respaldo=$B"
      DESAJUSTES=1
    fi
  done
  [ "$DESAJUSTES" = 0 ] && log "todas las tablas coinciden con el respaldo." \
    || { error "hay tablas con diferencias de filas (ver AVISOS arriba)."; exit 1; }
fi

# --- 4. Verificacion de integridad ------------------------------------------
MANT=$(psql_en "$BD" -c "select count(*) from mantenimiento;" 2>/dev/null || echo "?")
MAQ=$(psql_en "$BD" -c "select count(*) from maquina;" 2>/dev/null || echo "?")
HUERFANOS=$(psql_en "$BD" -c "
  select count(*) from mantenimiento m
  left join maquina x on x.id = m.id_maquina
  left join refaccion r on r.id = m.id_refaccion
  left join tecnico t on t.id = m.id_tecnico
  left join tipo_mantenimiento tp on tp.id = m.id_tipo_mantenimiento
  where x.id is null
     or (m.id_refaccion is not null and r.id is null)
     or (m.id_tecnico is not null and t.id is null)
     or (m.id_tipo_mantenimiento is not null and tp.id is null);" 2>/dev/null || echo "?")
log "mantenimientos: $MANT | maquinas: $MAQ | registros con referencias rotas: $HUERFANOS"
if [ "$HUERFANOS" != "0" ]; then
  error "hay mantenimientos con referencias rotas; revisa el respaldo."
  exit 1
fi

# --- 5. Arrancar la aplicacion ----------------------------------------------
if [ "$ARRANCAR" = 1 ]; then
  INICIO=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  if [ "$MODO" = "solo-datos" ]; then
    log "reiniciando backend para que tome los datos restaurados..."
    docker compose restart backend >>"$LOG" 2>&1 || true
  fi
  log "levantando backend y frontend..."
  if [ -n "$(docker compose images -q backend 2>/dev/null)" ]; then
    docker compose up -d >>"$LOG" 2>&1
  else
    log "no hay imagenes construidas; construyendo (puede tardar)..."
    docker compose up -d --build >>"$LOG" 2>&1
  fi

  OK=0
  for _ in $(seq 1 60); do
    if docker compose logs --since "$INICIO" backend 2>/dev/null | grep -q "Started CoreApplication"; then
      OK=1; break
    fi
    sleep 3
  done
  docker compose logs --since "$INICIO" backend 2>/dev/null \
    | grep -E "Migrating|Successfully applied|No migration necessary|Schema .* is up to date" || true

  CODIGO=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8081/api/v1/auth/me || true)
  if [ "$OK" = 1 ] && [ "$CODIGO" = "401" ]; then
    log "backend y frontend en marcha."
  else
    error "la aplicacion no respondio como se esperaba (backend=$OK, http=$CODIGO)."
    echo "  1) Revisa:  docker compose logs --tail=80 backend" >&2
    echo "  2) Respaldo del estado anterior: $PRE" >&2
    exit 1
  fi
fi

log "=== Restauracion terminada correctamente ==="
echo
echo "Resumen:"
echo "  base restaurada : $USUARIO@$BD"
echo "  mantenimientos  : $MANT"
echo "  maquinas        : $MAQ"
echo "  respaldo previo : $PRE"
if [ "$ARRANCAR" = 1 ]; then
  echo "  plataforma      : http://localhost:8081"
fi
exit 0
