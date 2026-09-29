import axios from "axios";

// Axios detectará automáticamente tu dominio (localhost o la IP en red local)
const client = axios.create({
  baseURL: "/api/v1/dashboard",
});

/**
 * GET /api/v1/dashboard/metricas-cloud
 * Trae las métricas conectándose automáticamente a OneDrive/SharePoint vía Graph.
 * Devuelve List<DataGraficaDto> -> [{ etiqueta, valor }, ...]
 */
export async function obtenerMetricasCloud() {
  const { data } = await client.get("/metricas-cloud");
  return data;
}

/**
 * POST /api/v1/dashboard/metricas-upload
 * Sube un archivo Excel (.xlsx) manualmente y devuelve las métricas procesadas.
 * @param {File} file
 */
export async function obtenerMetricasDesdeArchivo(file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await client.post("/metricas-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
