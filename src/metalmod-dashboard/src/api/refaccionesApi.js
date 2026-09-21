const API_BASE = "http://localhost:8080/api/v1";

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

export async function obtenerRefacciones(nombre) {
  const url = new URL(`${API_BASE}/refacciones`);
  if (nombre) url.searchParams.set("nombre", nombre);
  return manejarRespuesta(await fetch(url));
}

export async function crearRefaccion(payload) {
  return manejarRespuesta(
    await fetch(`${API_BASE}/refacciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function actualizarRefaccion(id, payload) {
  return manejarRespuesta(
    await fetch(`${API_BASE}/refacciones/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function eliminarRefaccion(id) {
  return manejarRespuesta(
    await fetch(`${API_BASE}/refacciones/${id}`, { method: "DELETE" })
  );
}
