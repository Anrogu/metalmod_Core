#!/usr/bin/env bash
# Respaldo automatico de la base de datos y envio por SSH.
#
# Pensado para ejecutarse desde cron los viernes a las 15:00 (hora local):
#     0 15 * * 5 /home/angelroberto/Documentos/ideas/core/scripts/respaldo.sh
#
# La configuracion del destino vive en .env (no viaja en Git):
#     RESPALDO_SSH_USUARIO       usuario en la PC destino (obligatorio)
#     RESPALDO_SSH_HOST          IP o nombre de la PC destino
#     RESPALDO_SSH_DIRECTORIO    carpeta destino (se crea si no existe)
#     RESPALDO_SSH_PUERTO        puerto SSH (por defecto 22)
#     RESPALDO_SSH_LLAVE         llave privada a usar
#     RESPALDO_RETENCION_DIAS    dias que se conservan los respaldos locales
#     RESPALDO_REMOTO_DIAS       dias que se conservan los respaldos remotos
set -uo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
cd "$RAIZ" || exit 1

DIR_LOCAL="$RAIZ/respaldos"
LOG="$DIR_LOCAL/respaldo.log"
CANDADO="$DIR_LOCAL/.respaldo.lock"

mkdir -p "$DIR_LOCAL"
chmod 700 "$DIR_LOCAL" 2>/dev/null || true

log() {
  printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" | tee -a "$LOG"
}

error() {
  printf '%s ERROR: %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" | tee -a "$LOG" >&2
}

# Evita dos respaldos simultaneos (por ejemplo, si el anterior se tarda).
exec 9>"$CANDADO"
if ! flock -n 9; then
  error "ya hay otro respaldo en curso; salgo."
  exit 0
fi

valor_env() {
  grep -E "^$1=" "$RAIZ/.env" 2>/dev/null | head -n1 | cut -d= -f2- | tr -d "'\""
}

[ -f "$RAIZ/.env" ] || { error "falta .env en $RAIZ"; exit 1; }

USUARIO_BD=$(valor_env POSTGRES_USER)
BD=$(valor_env POSTGRES_DB)
[ -n "$USUARIO_BD" ] && [ -n "$BD" ] || { error "faltan POSTGRES_USER o POSTGRES_DB en .env"; exit 1; }

DESTINO_USUARIO=$(valor_env RESPALDO_SSH_USUARIO)
DESTINO_HOST=$(valor_env RESPALDO_SSH_HOST)
DESTINO_HOST=${DESTINO_HOST:-192.168.1.52}
DESTINO_DIR=$(valor_env RESPALDO_SSH_DIRECTORIO)
DESTINO_PUERTO=$(valor_env RESPALDO_SSH_PUERTO)
DESTINO_PUERTO=${DESTINO_PUERTO:-22}
LLAVE=$(valor_env RESPALDO_SSH_LLAVE)
LLAVE=${LLAVE:-$HOME/.ssh/id_ed25519_respaldos}
RETENCION_LOCAL=$(valor_env RESPALDO_RETENCION_DIAS)
RETENCION_LOCAL=${RETENCION_LOCAL:-30}
RETENCION_REMOTA=$(valor_env RESPALDO_REMOTO_DIAS)
RETENCION_REMOTA=${RETENCION_REMOTA:-90}

if [ -z "$DESTINO_USUARIO" ] || [ -z "$DESTINO_DIR" ]; then
  error "faltan RESPALDO_SSH_USUARIO o RESPALDO_SSH_DIRECTORIO en .env; no se puede enviar el respaldo."
  exit 1
fi
[ -r "$LLAVE" ] || { error "no se puede leer la llave SSH $LLAVE"; exit 1; }

SSH_OPTS=(-i "$LLAVE" -p "$DESTINO_PUERTO" -o BatchMode=yes -o ConnectTimeout=15 -o StrictHostKeyChecking=yes)
DESTINO="$DESTINO_USUARIO@$DESTINO_HOST"

log "=== Inicio del respaldo de $BD ==="

docker info >/dev/null 2>&1 || { error "tu usuario no puede usar Docker (revisa el grupo docker)."; exit 1; }

# La base debe estar corriendo. Si el contenedor esta detenido se intenta levantar.
if [ -z "$(docker compose ps -q db 2>/dev/null)" ]; then
  log "el contenedor de la base esta detenido; intento levantarlo..."
  docker compose up -d db >>"$LOG" 2>&1 || { error "no se pudo levantar el contenedor db."; exit 1; }
fi
CORRIENDO=$(docker compose ps -q db 2>/dev/null)
[ -n "$CORRIENDO" ] || { error "el contenedor db no esta corriendo."; exit 1; }

LISTO=0
for _ in $(seq 1 30); do
  if docker compose exec -T db pg_isready -U "$USUARIO_BD" -d "$BD" >/dev/null 2>&1; then LISTO=1; break; fi
  sleep 2
done
[ "$LISTO" = 1 ] || { error "la base de datos no respondio a tiempo."; exit 1; }

FECHA=$(date '+%Y-%m-%d_%H%M%S')
NOMBRE="metalmod_core-$FECHA.sql.gz"
RUTA_LOCAL="$DIR_LOCAL/$NOMBRE"

log "generando $RUTA_LOCAL ..."
if ! docker compose exec -T db pg_dump -U "$USUARIO_BD" "$BD" | gzip -9 > "$RUTA_LOCAL"; then
  rm -f "$RUTA_LOCAL"
  error "fallo pg_dump; no se genero el respaldo."
  exit 1
fi

if [ ! -s "$RUTA_LOCAL" ] || ! gzip -t "$RUTA_LOCAL" 2>/dev/null; then
  rm -f "$RUTA_LOCAL"
  error "el respaldo salio vacio o corrupto; se descarta."
  exit 1
fi
chmod 600 "$RUTA_LOCAL"

TAM_LOCAL=$(stat -c %s "$RUTA_LOCAL")
log "respaldo local listo ($(du -h "$RUTA_LOCAL" | cut -f1), $TAM_LOCAL bytes)."

# Envio por SSH.
log "preparando la carpeta remota $DESTINO_DIR en $DESTINO ..."
if ! ssh "${SSH_OPTS[@]}" "$DESTINO" "mkdir -p -- '$DESTINO_DIR'"; then
  error "no se pudo conectar por SSH a $DESTINO ni crear $DESTINO_DIR."
  exit 1
fi

log "enviando respaldo a $DESTINO:$DESTINO_DIR ..."
if ! scp -q -P "$DESTINO_PUERTO" -i "$LLAVE" -o BatchMode=yes -o ConnectTimeout=15 \
     -o StrictHostKeyChecking=yes "$RUTA_LOCAL" "$DESTINO:$DESTINO_DIR/"; then
  error "fallo el envio por scp."
  exit 1
fi

TAM_REMOTO=$(ssh "${SSH_OPTS[@]}" "$DESTINO" "stat -c %s -- '$DESTINO_DIR/$NOMBRE'" 2>/dev/null)
if [ "$TAM_REMOTO" != "$TAM_LOCAL" ]; then
  error "el archivo remoto no coincide (local=$TAM_LOCAL, remoto=${TAM_REMOTO:-desconocido})."
  exit 1
fi
log "respaldo copiado y verificado en $DESTINO:$DESTINO_DIR/$NOMBRE"

# Limpieza de respaldos viejos.
find "$DIR_LOCAL" -maxdepth 1 -type f -name 'metalmod_core-*.sql.gz' -mtime +"$RETENCION_LOCAL" -delete 2>/dev/null || true
if ssh "${SSH_OPTS[@]}" "$DESTINO" "find '$DESTINO_DIR' -maxdepth 1 -type f -name 'metalmod_core-*.sql.gz' -mtime +$RETENCION_REMOTA -delete" 2>>"$LOG"; then
  log "limpieza aplicada (local: $RETENCION_LOCAL dias, remoto: $RETENCION_REMOTA dias)."
else
  log "aviso: no se pudo limpiar respaldos viejos en el destino."
fi

# El log no debe crecer sin control.
if [ "$(stat -c %s "$LOG" 2>/dev/null || echo 0)" -gt 1048576 ]; then
  tail -n 500 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
fi

log "=== Respaldo terminado correctamente ==="
exit 0
