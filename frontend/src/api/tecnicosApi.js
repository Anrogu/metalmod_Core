// Cambiamos la ruta a relativa para que Nginx la intercepte
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

export async function obtenerTecnicos(nombre) {
  // Agregamos window.location.origin al constructor URL
  const url = new URL(`${API_BASE}/tecnicos`, window.location.origin);
  if (nombre) url.searchParams.set("nombre", nombre);
  return manejarRespuesta(await fetch(url));
}

export async function crearTecnico(payload) {
  return manejarRespuesta(
    await fetch(`${API_BASE}/tecnicos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function actualizarTecnico(id, payload) {
  return manejarRespuesta(
    await fetch(`${API_BASE}/tecnicos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function eliminarTecnico(id) {
  return manejarRespuesta(
    await fetch(`${API_BASE}/tecnicos/${id}`, {
      method: "DELETE",
    })
  );
}
