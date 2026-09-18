import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const client = axios.create({
  baseURL: `${BASE_URL}/api/v1/dashboard`,
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
