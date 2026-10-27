#!/usr/bin/env bash
# Despliegue: respaldo -> git pull -> build -> levantar -> verificar.
# Uso (desde cualquier carpeta, como TU usuario, no como root):
#     bash scripts/desplegar.sh
# Opciones:  --forzar   reconstruye aunque no haya commits nuevos
set -euo pipefail
cd "$(dirname "$0")/.."

[ "$(id -u)" -ne 0 ] || { echo "ERROR: no ejecutes esto como root (usa tu usuario, en el grupo docker)."; exit 1; }
[ -f .env ] || { echo "ERROR: falta .env (no viaja en Git; créalo a partir de .env.example)."; exit 1; }

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: hay cambios locales sin commit en el servidor. Un servidor no se edita a mano."
  git status --short
  exit 1
fi

valor() { grep -E "^$1=" .env | head -n1 | cut -d= -f2- | tr -d "'\""; }
USUARIO=$(valor POSTGRES_USER); BD=$(valor POSTGRES_DB)
[ -n "$USUARIO" ] && [ -n "$BD" ] || { echo "ERROR: faltan POSTGRES_USER o POSTGRES_DB en .env"; exit 1; }

ANTES=$(git rev-parse --short HEAD)
git fetch origin main
DESPUES=$(git rev-parse --short origin/main)
echo ">> Versión instalada: $ANTES   |   Versión en GitHub: $DESPUES"

if [ "$ANTES" = "$DESPUES" ] && [ "${1:-}" != "--forzar" ]; then
  echo "Ya estás en la última versión. Nada que desplegar."
  exit 0
fi

echo ">> Commits que se van a desplegar:"
git log --oneline HEAD..origin/main
echo ">> Migraciones de base de datos nuevas o modificadas:"
MIG=$(git diff --name-status HEAD origin/main -- backend/src/main/resources/db/migration)
[ -n "$MIG" ] && echo "$MIG" || echo "   (ninguna)"
echo
read -rp "¿Continuar con el despliegue? (s/N) " R
[ "$R" = "s" ] || { echo "Cancelado."; exit 0; }

echo ">> 1/4 Respaldo previo de la base..."
mkdir -p respaldos && chmod 700 respaldos
RESPALDO="respaldos/antes-de-desplegar-$(date +%F-%H%M)-$ANTES.sql"
docker compose exec -T db pg_dump -U "$USUARIO" "$BD" > "$RESPALDO"
[ -s "$RESPALDO" ] || { rm -f "$RESPALDO"; echo "ERROR: el respaldo salió vacío; no despliego."; exit 1; }
chmod 600 "$RESPALDO"
echo "   guardado en $RESPALDO"

echo ">> 2/4 Descargando el código (solo avance limpio, sin mezclas)..."
git pull --ff-only origin main

echo ">> 3/4 Construyendo y levantando (el sitio se corta unos segundos)..."
INICIO=$(date -u +%Y-%m-%dT%H:%M:%SZ)
docker compose up -d --build

echo ">> 4/4 Verificando..."
OK=0
for _ in $(seq 1 40); do
  if docker compose logs --since "$INICIO" backend 2>/dev/null | grep -q "Started CoreApplication"; then OK=1; break; fi
  sleep 3
done
CODIGO=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8081/api/v1/auth/me || true)

if [ "$OK" = 1 ] && [ "$CODIGO" = "401" ]; then
  echo
  echo "LISTO. Versión $DESPUES en marcha. Respaldo previo: $RESPALDO"
  docker compose logs --since "$INICIO" backend 2>/dev/null | grep -E "Migrating|Successfully applied|No migration" || true
  exit 0
fi

echo
echo "FALLÓ la verificación (backend arrancó: $OK, respuesta del sitio: $CODIGO)."
echo "  1) Revisa:     docker compose logs --tail=80 backend"
echo "  2) Volver al código anterior:"
echo "       git reset --hard $ANTES && docker compose up -d --build"
echo "  3) Si la nueva versión alcanzó a aplicar migraciones, el respaldo está en:"
echo "       $RESPALDO"
exit 1
