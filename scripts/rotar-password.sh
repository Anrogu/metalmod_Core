#!/usr/bin/env bash
# Rota la contraseña de PostgreSQL sin perder datos.
# Ejecutar desde la raiz del proyecto (donde estan docker-compose.yml y .env)
# con los contenedores arriba:   bash scripts/rotar-password.sh
#
# Por que hace falta un script: cambiar POSTGRES_PASSWORD en .env NO cambia la
# contraseña de una base que ya existe. Hay que cambiarla dentro de PostgreSQL
# (ALTER USER) Y en .env, y reiniciar el backend. Este script hace las tres cosas
# en el orden seguro.
set -euo pipefail

[ -f .env ] || { echo "ERROR: no encuentro .env en $(pwd)"; exit 1; }
docker compose ps --status running --services | grep -qx db \
  || { echo "ERROR: el contenedor 'db' no esta corriendo. Ejecuta: docker compose up -d"; exit 1; }

valor() { grep -E "^$1=" .env | head -n1 | cut -d= -f2- | tr -d "'\""; }
USUARIO=$(valor POSTGRES_USER)
BD=$(valor POSTGRES_DB)
[ -n "$USUARIO" ] && [ -n "$BD" ] || { echo "ERROR: faltan POSTGRES_USER o POSTGRES_DB en .env"; exit 1; }

# Solo hexadecimal: sin caracteres que rompan .env, SQL o la URL JDBC.
NUEVA=$(openssl rand -hex 24)

echo ">> 1/4 Respaldo previo de la base..."
mkdir -p respaldos && chmod 700 respaldos
RESPALDO="respaldos/antes-de-rotar-$(date +%F-%H%M).sql"
docker compose exec -T db pg_dump -U "$USUARIO" "$BD" > "$RESPALDO"
[ -s "$RESPALDO" ] || { echo "ERROR: el respaldo salio vacio; no continuo."; exit 1; }
chmod 600 "$RESPALDO"
echo "   guardado en $RESPALDO"

echo ">> 2/4 Actualizando .env..."
cp .env .env.bak
sed -i -E "s|^(POSTGRES_PASSWORD=).*|\1'${NUEVA}'|; s|^(SPRING_DATASOURCE_PASSWORD=).*|\1'${NUEVA}'|" .env
chmod 600 .env

echo ">> 3/4 Cambiando la contraseña dentro de PostgreSQL..."
if ! docker compose exec -T db psql -U "$USUARIO" -d "$BD" -v ON_ERROR_STOP=1 \
      -c "ALTER USER \"${USUARIO}\" WITH PASSWORD '${NUEVA}';" >/dev/null; then
  echo "ERROR: PostgreSQL rechazo el cambio. Restauro .env; nada cambio."
  mv .env.bak .env
  exit 1
fi

echo ">> 4/4 Reiniciando servicios con la nueva contraseña..."
docker compose up -d

echo "   esperando a que el backend conecte..."
for _ in $(seq 1 40); do
  if docker compose logs --tail=300 backend 2>/dev/null | grep -q "Started CoreApplication"; then
    echo
    echo "LISTO. El backend arranco con la nueva contraseña."
    echo "Ahora borra la copia con la contraseña vieja:   rm .env.bak"
    exit 0
  fi
  sleep 3
done

echo
echo "AVISO: no vi 'Started CoreApplication' en 2 minutos. Revisa:  docker compose logs backend"
echo "La contraseña nueva YA esta aplicada en PostgreSQL y en .env (la vieja esta en .env.bak)."
exit 1
