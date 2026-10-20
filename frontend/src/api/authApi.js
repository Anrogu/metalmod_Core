import { apiFetch } from "./http";

const API_AUTH = "/api/v1/auth";

/** Devuelve { username, rol } si hay sesion activa, o null si no. */
export async function obtenerSesion() {
  const res = await apiFetch(`${API_AUTH}/me`, { silencioso: true });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export async function iniciarSesion(username, password) {
  // Garantiza que el navegador ya tenga la cookie CSRF antes de enviar el login.
  await obtenerSesion().catch(() => null);

  const res = await apiFetch(`${API_AUTH}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
    silencioso: true,
  });

  if (!res.ok) {
    let mensaje = res.status === 429
      ? "Demasiados intentos. Espera un momento e inténtalo de nuevo."
      : "No se pudo iniciar sesión.";
    try {
      const body = await res.json();
      if (body.mensaje) mensaje = body.mensaje;
    } catch {
      // sin cuerpo JSON: se queda el mensaje generico
    }
    throw new Error(mensaje);
  }

  const sesion = await obtenerSesion();
  if (!sesion) throw new Error("No se pudo iniciar sesión.");
  return sesion;
}

export async function cerrarSesion() {
  await apiFetch(`${API_AUTH}/logout`, { method: "POST", silencioso: true });
  // El logout borra el token CSRF; pedimos uno nuevo para el siguiente login.
  await obtenerSesion().catch(() => null);
}
