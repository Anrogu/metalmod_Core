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

export async function obtenerMaquinas(nombre) {
  const url = new URL(`${API_BASE}/maquinas`);
  if (nombre) url.searchParams.set("nombre", nombre);
  return manejarRespuesta(await fetch(url));
}

export async function crearMaquina(payload) {
  return manejarRespuesta(
    await fetch(`${API_BASE}/maquinas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function actualizarMaquina(id, payload) {
  return manejarRespuesta(
    await fetch(`${API_BASE}/maquinas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function cambiarEstadoMaquina(id, codigoEstado) {
  return manejarRespuesta(
    await fetch(`${API_BASE}/maquinas/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigoEstado }),
    })
  );
}

export async function obtenerMarcas() {
  return manejarRespuesta(await fetch(`${API_BASE}/marcas`));
}

export async function crearMarca(nombre) {
  return manejarRespuesta(
    await fetch(`${API_BASE}/marcas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    })
  );
}

export async function obtenerModelos() {
  return manejarRespuesta(await fetch(`${API_BASE}/modelos`));
}

export async function crearModelo(nombre) {
  return manejarRespuesta(
    await fetch(`${API_BASE}/modelos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    })
  );
}
