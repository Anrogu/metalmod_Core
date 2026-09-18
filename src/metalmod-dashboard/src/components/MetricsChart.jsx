import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import "./MetricsChart.css";

const VISTAS = {
  maquinas: {
    label: "Máquinas",
    titulo: "Top 10 máquinas que más se descomponen",
    campo: "ma",
    vacio: "El archivo se procesó pero no contiene registros con máquina (MA).",
  },
  refacciones: {
    label: "Refacciones",
    titulo: "Top 10 refacciones más pedidas",
    campo: "refaccion",
    vacio: "El archivo se procesó pero no contiene registros con refacción.",
  },
};

const TRIMESTRES = ["Todos", "Q1", "Q2", "Q3", "Q4", "Desconocido"];

export default function MetricsChart({ refacciones = [], estado, errorMsg }) {
  const [vista, setVista] = useState("maquinas");
  const [filtroTrimestre, setFiltroTrimestre] = useState("Todos");
  const config = VISTAS[vista];

  // 1. Filtramos los datos de la API según el trimestre elegido
  const refaccionesFiltradas = useMemo(() => {
    if (filtroTrimestre === "Todos") return refacciones;
    return refacciones.filter((r) => r.trimestre === filtroTrimestre);
  }, [refacciones, filtroTrimestre]);

  // 2. Agrupamos los datos para la pestaña activa (Máquinas o Refacciones)
  const datosCompletos = useMemo(
    () => agruparDatos(refaccionesFiltradas, config.campo),
    [refaccionesFiltradas, config.campo]
  );

  // 3. Extraemos el Top 10 para las gráficas
  const datosTop10 = useMemo(() => {
    return datosCompletos.slice(0, 10).reverse();
  }, [datosCompletos]);

  // 4. Agrupamos SIEMPRE las refacciones (para la tabla inferior fija)
  const todasLasRefacciones = useMemo(
    () => agruparDatos(refaccionesFiltradas, "refaccion"),
    [refaccionesFiltradas]
  );

  return (
    <div className="tick-panel chart-panel">
      <div className="chart-panel__head">
        <span className="chart-panel__eyebrow">03 — Gráfica y Tabla</span>
        <span className="chart-panel__title">{config.titulo}</span>

        <div className="chart-panel__tabs">
          {Object.entries(VISTAS).map(([key, v]) => (
            <button
              key={key}
              type="button"
              className={`chart-panel__tab ${vista === key ? "is-active" : ""}`}
              onClick={() => setVista(key)}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Botones de filtro por Trimestre */}
        <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {TRIMESTRES.map((trim) => (
            <button
              key={trim}
              onClick={() => setFiltroTrimestre(trim)}
              style={{
                padding: "4px 12px",
                borderRadius: "16px",
                border: `1px solid ${filtroTrimestre === trim ? "#e85d25" : "#3a4148"}`,
                background: filtroTrimestre === trim ? "rgba(232, 93, 37, 0.1)" : "transparent",
                color: filtroTrimestre === trim ? "#e85d25" : "#929aa2",
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: "IBM Plex Sans",
                transition: "all 0.2s ease"
              }}
            >
              {trim}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-panel__body">
        {estado === "idle" && <EstadoVacio />}
        {estado === "loading" && <EstadoCargando />}
        {estado === "error" && <EstadoError mensaje={errorMsg} />}
        {estado === "ready" && refaccionesFiltradas.length === 0 && (
          <EstadoVacio mensaje={`No hay datos para mostrar en ${filtroTrimestre !== "Todos" ? filtroTrimestre : "este momento"}.`} />
        )}
        
        {estado === "ready" && refaccionesFiltradas.length > 0 && (
          // Envoltorio principal para forzar que los elementos vayan de arriba hacia abajo
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            
            {/* SECCIÓN 1: GRÁFICA */}
            <div style={{ width: "100%", height: "440px" }}>
              {vista === "maquinas" && datosTop10.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
                    <CartesianGrid stroke="#3a4148" />
                    <XAxis
                      type="number"
                      dataKey="cantidad"
                      name="Fallas"
                      allowDecimals={false}
                      tick={{ fill: "#929aa2", fontSize: 12, fontFamily: "IBM Plex Mono" }}
                      axisLine={{ stroke: "#3a4148" }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="nombre"
                      name="Máquina"
                      width={140}
                      interval={0}
                      tick={{ fill: "#929aa2", fontSize: 12, fontFamily: "IBM Plex Sans" }}
                      axisLine={{ stroke: "#3a4148" }}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3', stroke: "#929aa2" }}
                      contentStyle={{
                        background: "#2b3035",
                        border: "1px solid #3a4148",
                        borderRadius: 0,
                        fontFamily: "IBM Plex Sans",
                        fontSize: 12.5,
                      }}
                      labelStyle={{ color: "#edeae3", fontWeight: 600, marginBottom: 4 }}
                      itemStyle={{ color: "#e85d25" }}
                      formatter={(value) => [formatearNumero(value), "Fallas"]}
                    />
                    <Scatter data={datosTop10} fill="#e85d25" />
                  </ScatterChart>
                </ResponsiveContainer>
              )}

              {vista === "refacciones" && datosTop10.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={datosTop10}
                    layout="vertical"
                    margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid stroke="#3a4148" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fill: "#929aa2", fontSize: 12, fontFamily: "IBM Plex Mono" }}
                      axisLine={{ stroke: "#3a4148" }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="nombre"
                      width={140}
                      tick={{ fill: "#929aa2", fontSize: 12, fontFamily: "IBM Plex Sans" }}
                      axisLine={{ stroke: "#3a4148" }}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(232, 93, 37, 0.06)" }}
                      contentStyle={{
                        background: "#2b3035",
                        border: "1px solid #3a4148",
                        borderRadius: 0,
                        fontFamily: "IBM Plex Sans",
                        fontSize: 12.5,
                      }}
                      labelStyle={{ color: "#edeae3", fontWeight: 600, marginBottom: 4 }}
                      itemStyle={{ color: "#e85d25" }}
                      formatter={(value) => [formatearNumero(value), "Fallas"]}
                    />
                    <Bar dataKey="cantidad" radius={[0, 2, 2, 0]} maxBarSize={22}>
                      {datosTop10.map((_, i) => (
                        <Cell key={i} fill={i % 2 === 0 ? "#e85d25" : "#c9531f"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* SECCIÓN 2: TABLAS (Ambas en la parte inferior, lado a lado) */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginTop: "40px",
              borderTop: "1px solid #3a4148",
              paddingTop: "24px"
            }}>
              
              {/* TABLA 1: Depende de la pestaña activa (Máquinas / Refacciones) */}
              <div>
                <h4 style={{ color: "#edeae3", marginBottom: "16px", fontFamily: "IBM Plex Sans", fontSize: "14px" }}>
                  Registro completo de {config.label.toLowerCase()} ({filtroTrimestre})
                </h4>
                <div style={{ maxHeight: "250px", overflowY: "auto", paddingRight: "8px" }}>
                  <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead style={{ position: "sticky", top: 0, background: "#1e2226" }}>
                      <tr>
                        <th style={{ padding: "8px", borderBottom: "1px solid #3a4148", color: "#929aa2", fontWeight: 600 }}>
                          {config.label}
                        </th>
                        <th style={{ padding: "8px", borderBottom: "1px solid #3a4148", color: "#929aa2", fontWeight: 600, textAlign: "right" }}>
                          Fallas
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {datosCompletos.map((item, index) => (
                        <tr key={index}>
                          <td style={{ padding: "8px", borderBottom: "1px solid #2b3035", color: "#edeae3" }}>
                            {item.nombre}
                          </td>
                          <td style={{ padding: "8px", borderBottom: "1px solid #2b3035", color: "#e85d25", fontWeight: 600, textAlign: "right", fontFamily: "IBM Plex Mono" }}>
                            {formatearNumero(item.cantidad)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABLA 2: Fija siempre en Refacciones utilizadas */}
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "8px" }}>
                <h4 style={{ color: "#e85d25", marginBottom: "16px", fontFamily: "IBM Plex Sans", fontSize: "14px", fontWeight: 600 }}>
                  Resumen global de refacciones ({filtroTrimestre})
                </h4>
                <div style={{ maxHeight: "220px", overflowY: "auto", paddingRight: "8px" }}>
                  <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead style={{ position: "sticky", top: 0, background: "#1e2226" }}>
                      <tr>
                        <th style={{ padding: "8px", borderBottom: "1px solid #3a4148", color: "#929aa2", fontWeight: 600 }}>
                          Refacción
                        </th>
                        <th style={{ padding: "8px", borderBottom: "1px solid #3a4148", color: "#929aa2", fontWeight: 600, textAlign: "right" }}>
                          Uso
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {todasLasRefacciones.length === 0 ? (
                        <tr>
                          <td colSpan="2" style={{ padding: "16px", textAlign: "center", color: "#929aa2" }}>
                            No hay refacciones registradas en este periodo.
                          </td>
                        </tr>
                      ) : (
                        todasLasRefacciones.map((item, index) => (
                          <tr key={index}>
                            <td style={{ padding: "8px", borderBottom: "1px solid #2b3035", color: "#edeae3" }}>
                              {item.nombre}
                            </td>
                            <td style={{ padding: "8px", borderBottom: "1px solid #2b3035", color: "#edeae3", fontWeight: 600, textAlign: "right", fontFamily: "IBM Plex Mono" }}>
                              {formatearNumero(item.cantidad)} {item.cantidad === 1 ? "vez" : "veces"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Agrupa los registros por el campo indicado, cuenta ocurrencias
function agruparDatos(refacciones, campo) {
  if (!Array.isArray(refacciones) || refacciones.length === 0) return [];

  const conteo = new Map();
  for (const r of refacciones) {
    const valor = (r[campo] || "").trim();
    if (!valor) continue;
    conteo.set(valor, (conteo.get(valor) || 0) + 1);
  }

  return Array.from(conteo.entries())
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);
}

function EstadoVacio({ mensaje }) {
  return (
    <div className="chart-state">
      <GaugeIcon />
      <p>{mensaje || "Sin datos todavía. Sincroniza con la nube o sube un Excel para ver la gráfica."}</p>
    </div>
  );
}

function EstadoCargando() {
  return (
    <div className="chart-state">
      <div className="spinner" />
      <p>Procesando datos…</p>
    </div>
  );
}

function EstadoError({ mensaje }) {
  return (
    <div className="chart-state chart-state--error">
      <AlertIcon />
      <p>{mensaje || "Ocurrió un error al cargar las métricas."}</p>
    </div>
  );
}

function GaugeIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 15a8 8 0 1 1 16 0" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 15 16 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4 21 19H3L12 4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12 10v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r="0.9" fill="currentColor" />
    </svg>
  );
}

function formatearNumero(n) {
  return new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }).format(n);
}
