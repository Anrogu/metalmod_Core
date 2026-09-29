const API_BASE = "/api/v1";

async function manejarRespuesta(res) {
  if (!res.ok) {
    let mensaje = `Error ${res.status}`;
    try {
      const body = await res.json();
      mensaje = body.mensaje || mensaje;
    } catch {
      // sin cuerpo JSON, se queda con el mensaje generico
    }
    throw new Error(mensaje);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function obtenerTiposMantenimiento() {
  return manejarRespuesta(await fetch(`${API_BASE}/tipo`));
}
