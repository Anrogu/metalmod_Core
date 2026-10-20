// Cliente HTTP central. Todas las llamadas a la API deben pasar por aqui para que:
//  1) viaje el token CSRF en las escrituras (POST/PUT/PATCH/DELETE), y
//  2) si el servidor responde 401 (sesion vencida) la app vuelva al login.

export const EVENTO_SESION_EXPIRADA = "metalmod:sesion-expirada";

function leerCookie(nombre) {
  const par = document.cookie.split("; ").find((c) => c.startsWith(`${nombre}=`));
  return par ? decodeURIComponent(par.slice(nombre.length + 1)) : null;
}

/**
 * Igual que fetch(), mas la opcion { silencioso: true } para las llamadas de
 * autenticacion, donde un 401 es una respuesta esperada y no una sesion vencida.
 */
export async function apiFetch(input, init = {}) {
  const { silencioso = false, ...opciones } = init;
  const metodo = (opciones.method || "GET").toUpperCase();
  const headers = new Headers(opciones.headers || {});

  if (!["GET", "HEAD", "OPTIONS"].includes(metodo)) {
    const token = leerCookie("XSRF-TOKEN");
    if (token) headers.set("X-XSRF-TOKEN", token);
  }

  const res = await fetch(input, { ...opciones, headers, credentials: "same-origin" });

  if (res.status === 401 && !silencioso) {
    window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
  }
  return res;
}
