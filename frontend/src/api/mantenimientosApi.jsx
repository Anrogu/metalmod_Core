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

export async function obtenerMantenimientos({ idMaquina, desde, hasta } = {}) {
  // Se agrega window.location.origin como base para la ruta relativa
  const url = new URL(`${API_BASE}/mantenimientos`, window.location.origin);
  
  if (idMaquina) url.searchParams.set("idMaquina", idMaquina);
  if (desde) url.searchParams.set("desde", desde);
  if (hasta) url.searchParams.set("hasta", hasta);
  
  return manejarRespuesta(await fetch(url));
}
export async function crearMantenimiento(payload) {
  return manejarRespuesta(
    await fetch(`${API_BASE}/mantenimientos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function eliminarMantenimiento(id) {
  return manejarRespuesta(
    await fetch(`${API_BASE}/mantenimientos/${id}`, { method: "DELETE" })
  );
}
