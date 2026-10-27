#!/usr/bin/env bash
# Administra los usuarios del sistema sin escribir SQL ni contraseñas en comandos.
#   bash scripts/usuario.sh listar
#   bash scripts/usuario.sh crear USUARIO Administrador|Tecnico
#   bash scripts/usuario.sh password USUARIO
#   bash scripts/usuario.sh desactivar USUARIO
#   bash scripts/usuario.sh activar USUARIO
# Ejecútalo SOLO (un comando por vez), espera el aviso y escribe la contraseña.
set -euo pipefail
cd "$(dirname "$0")/.."

USO="Uso: bash scripts/usuario.sh listar | crear USUARIO Administrador|Tecnico | password USUARIO | desactivar USUARIO | activar USUARIO"

docker info >/dev/null 2>&1 || { echo "ERROR: tu usuario no puede usar Docker. Cierra sesión y vuelve a entrar (o: newgrp docker)."; exit 1; }
[ -f .env ] || { echo "ERROR: falta .env"; exit 1; }
valor() { grep -E "^$1=" .env | head -n1 | cut -d= -f2- | tr -d "'\""; }
DBU=$(valor POSTGRES_USER); DBN=$(valor POSTGRES_DB)
[ -n "$DBU" ] && [ -n "$DBN" ] || { echo "ERROR: faltan POSTGRES_USER o POSTGRES_DB en .env"; exit 1; }

sql() { docker compose exec -T db psql -U "$DBU" -d "$DBN" -v ON_ERROR_STOP=1 -q -t -A "$@"; }

validar_usuario() {
  [[ "$1" =~ ^[A-Za-z0-9._-]{3,50}$ ]] || { echo "ERROR: usuario inválido (3 a 50 caracteres: letras, números, . _ -)"; exit 1; }
}

# Pide la contraseña dos veces: si una línea pegada se "coló" como respuesta, no coincidirán.
pedir_password() {
  local a b
  read -rsp "Contraseña (mínimo 12 caracteres): " a; echo
  [ "${#a}" -ge 12 ] || { echo "ERROR: muy corta o vacía; no se cambió nada."; exit 1; }
  read -rsp "Repite la contraseña: " b; echo
  [ "$a" = "$b" ] || { echo "ERROR: no coinciden; no se cambió nada."; exit 1; }
  PASS="$a"
}
# La contraseña viaja en hexadecimal por stdin: ningún carácter especial puede romper el SQL
# y no aparece en la lista de procesos.
hex() { printf '%s' "$1" | od -An -v -tx1 | tr -d ' \n'; }

# Lee el SQL de stdin. pgcrypto se crea y se quita en cada uso para que la base quede igual que antes.
con_pgcrypto() {
  local rc=0 out
  out=$({ echo "CREATE EXTENSION IF NOT EXISTS pgcrypto;"; cat; } | sql 2>&1) || rc=$?
  sql -c "DROP EXTENSION IF EXISTS pgcrypto;" >/dev/null 2>&1 || true
  printf '%s' "$out"
  return $rc
}
HASH_SQL="crypt(convert_from(decode(:'h','hex'),'UTF8'), gen_salt('bf',12))"

CMD=${1:-}
case "$CMD" in
  listar)
    printf '%s\n' "SELECT u.username, r.nombre AS rol, u.activo, u.created_at::date AS creado FROM usuario u JOIN rol r ON r.id = u.id_rol ORDER BY u.id;" \
      | docker compose exec -T db psql -U "$DBU" -d "$DBN" -v ON_ERROR_STOP=1 -q
    ;;
  crear)
    U=${2:-}; ROL=${3:-}; validar_usuario "$U"
    case "${ROL,,}" in administrador) ROL=Administrador;; tecnico|técnico) ROL=Tecnico;; *) echo "$USO"; exit 1;; esac
    pedir_password; H=$(hex "$PASS")
    OUT=$(printf '%s\n' "\\set u '$U'" "\\set r '$ROL'" "\\set h '$H'" \
      "INSERT INTO usuario (username, password_hash, id_rol, activo) SELECT :'u', $HASH_SQL, r.id, true FROM rol r WHERE r.nombre = :'r' RETURNING username;" \
      | con_pgcrypto) || { echo "ERROR: $OUT"; exit 1; }
    if [ -n "$OUT" ]; then echo "Usuario creado: $OUT ($ROL)"; else echo "ERROR: no se creó (¿existe el rol $ROL?)"; exit 1; fi
    ;;
  password)
    U=${2:-}; validar_usuario "$U"
    pedir_password; H=$(hex "$PASS")
    OUT=$(printf '%s\n' "\\set u '$U'" "\\set h '$H'" \
      "UPDATE usuario SET password_hash = $HASH_SQL WHERE username = :'u' RETURNING username;" \
      | con_pgcrypto) || { echo "ERROR: $OUT"; exit 1; }
    if [ -n "$OUT" ]; then echo "Contraseña actualizada para: $OUT"; else echo "ERROR: no existe el usuario $U"; exit 1; fi
    ;;
  desactivar|activar)
    U=${2:-}; validar_usuario "$U"
    if [ "$CMD" = desactivar ]; then
      ES_ADMIN=$(printf '%s\n' "\\set u '$U'" "SELECT count(*) FROM usuario x JOIN rol r ON r.id = x.id_rol WHERE r.nombre = 'Administrador' AND x.username = :'u';" | sql)
      OTROS=$(printf '%s\n' "\\set u '$U'" "SELECT count(*) FROM usuario x JOIN rol r ON r.id = x.id_rol WHERE r.nombre = 'Administrador' AND x.activo AND x.username <> :'u';" | sql)
      if [ "$ES_ADMIN" != 0 ] && [ "$OTROS" = 0 ]; then
        echo "ERROR: es el único administrador activo; si lo desactivas te quedas sin acceso."; exit 1
      fi
      VAL=false
    else
      VAL=true
    fi
    OUT=$(printf '%s\n' "\\set u '$U'" "UPDATE usuario SET activo = $VAL WHERE username = :'u' RETURNING username;" | sql) || { echo "ERROR: $OUT"; exit 1; }
    if [ -n "$OUT" ]; then echo "$CMD: $OUT"; else echo "ERROR: no existe el usuario $U"; exit 1; fi
    ;;
  *) echo "$USO"; exit 1;;
esac
