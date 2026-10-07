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
  Legend,
  Cell,
} from "recharts";
import "./MetricsChart.css";

const VISTAS = {
  maquinas: {
    label: "Máquinas",
    titulo: "Top 10 máquinas que más se descomponen",
    campo: "ma",
    unidad: "Fallas",
    vacio: "El archivo se procesó pero no contiene registros con máquina (MA).",
  },
  marca: {
    label: "Marca",
    titulo: "Top 10 marcas con más fallas",
    campo: "marca",
    unidad: "Fallas",
    vacio: "No hay registros con marca de máquina asignada.",
  },
  refacciones: {
    label: "Refacciones",
    titulo: "Top 10 refacciones más pedidas",
    campo: "refaccion",
    unidad: "Piezas",
    vacio: "El archivo se procesó pero no contiene registros con refacción.",
  },
  tecnicos: {
    label: "Técnicos",
    titulo: "Top 10 técnicos por mantenimientos realizados",
    campo: "nombreTecnico",
    unidad: "Tickets",
    vacio: "No hay registros de mantenimientos con técnico asignado.",
  },
};

const TRIMESTRES = ["Todos", "Q1", "Q2", "Q3", "Q4"];
const SIN_TIPO = "Sin tipo";
const COLORES_TIPO = ["#e85d25", "#4f9fd6", "#6bbf7a", "#d9b84a", "#a77bd1", "#d96a8f"];

const TOOLTIP_STYLE = {
  background: "#2b3035",
  border: "1px solid #3a4148",
  borderRadius: 0,
  fontFamily: "IBM Plex Sans",
  fontSize: 12.5,
};

const TICK_NUM = { fill: "#929aa2", fontSize: 12, fontFamily: "IBM Plex Mono" };
const TICK_TXT = { fill: "#929aa2", fontSize: 12, fontFamily: "IBM Plex Sans" };

export default function MetricsChart({ refacciones = [], estado, errorMsg }) {
  const [vista, setVista] = useState("maquinas");
  const [filtroTrimestre, setFiltroTrimestre] = useState("Todos");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const config = VISTAS[vista];
  const esTecnicos = vista === "tecnicos";

  // Tipos de mantenimiento presentes en los datos (para botones y colores estables)
  const tiposDisponibles = useMemo(() => {
    const set = new Set(refacciones.map(tipoDe));
    return Array.from(set).sort();
  }, [refacciones]);

  const colorPorTipo = useMemo(() => {
    const mapa = {};
    tiposDisponibles.forEach((t, i) => {
      mapa[t] = COLORES_TIPO[i % COLORES_TIPO.length];
    });
    return mapa;
  }, [tiposDisponibles]);

  // 1. Filtro por trimestre (todas las vistas) y por tipo (solo técnicos)
  const refaccionesFiltradas = useMemo(() => {
    return refacciones.filter((r) => {
      const okTrim = filtroTrimestre === "Todos" || r.trimestre === filtroTrimestre;
      const okTipo = !esTecnicos || filtroTipo === "Todos" || tipoDe(r) === filtroTipo;
      return okTrim && okTipo;
    });
  }, [refacciones, filtroTrimestre, filtroTipo, esTecnicos]);

  // 2. Agrupación simple (máquinas, marca, refacciones)
  const datosCompletos = useMemo(
    () => agruparDatos(refaccionesFiltradas, config.campo),
    [refaccionesFiltradas, config.campo]
  );

  const datosTop10 = useMemo(() => datosCompletos.slice(0, 10).reverse(), [datosCompletos]);

  // 3. Agrupación de técnicos por tipo (barras apiladas y tabla)
  const tecnicosPorTipo = useMemo(
    () => agruparPorTecnicoYTipo(refaccionesFiltradas),
    [refaccionesFiltradas]
  );

  const tecnicosTop10 = useMemo(
    () => tecnicosPorTipo.filas.slice(0, 10).reverse(),
    [tecnicosPorTipo]
  );

  // 4. Tabla fija de refacciones
  const todasLasRefacciones = useMemo(
    () => agruparDatos(refaccionesFiltradas, "refaccion"),
    [refaccionesFiltradas]
  );

  const sufijoPeriodo = esTecnicos && filtroTipo !== "Todos"
    ? `${filtroTrimestre} · ${filtroTipo}`
    : filtroTrimestre;

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

        {/* Filtro por trimestre */}
        <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {TRIMESTRES.map((trim) => (
            <BotonFiltro
              key={trim}
              activo={filtroTrimestre === trim}
              onClick={() => setFiltroTrimestre(trim)}
            >
              {trim}
            </BotonFiltro>
          ))}
        </div>

        {/* Filtro por tipo de mantenimiento (solo en Técnicos) */}
        {esTecnicos && (
          <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["Todos", ...tiposDisponibles].map((tipo) => (
              <BotonFiltro
                key={tipo}
                activo={filtroTipo === tipo}
                onClick={() => setFiltroTipo(tipo)}
              >
                {tipo}
              </BotonFiltro>
            ))}
          </div>
        )}
      </div>

      <div className="chart-panel__body">
        {estado === "idle" && <EstadoVacio />}
        {estado === "loading" && <EstadoCargando />}
        {estado === "error" && <EstadoError mensaje={errorMsg} />}
        {estado === "ready" && refaccionesFiltradas.length === 0 && (
          <EstadoVacio
            mensaje={`No hay datos para mostrar${
              sufijoPeriodo !== "Todos" ? ` en ${sufijoPeriodo}` : " en este momento"
            }.`}
          />
        )}

        {estado === "ready" && refaccionesFiltradas.length > 0 && (
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
                      name={config.unidad}
                      allowDecimals={false}
                      tick={TICK_NUM}
                      axisLine={{ stroke: "#3a4148" }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="nombre"
                      name={config.label}
                      width={140}
                      interval={0}
                      tick={TICK_TXT}
                      axisLine={{ stroke: "#3a4148" }}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3", stroke: "#929aa2" }}
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={{ color: "#edeae3", fontWeight: 600, marginBottom: 4 }}
                      itemStyle={{ color: "#e85d25" }}
                      formatter={(value, name) =>
                        name === config.unidad
                          ? [formatearNumero(value), config.unidad]
                          : [value, config.label]
                      }
                    />
                    <Scatter data={datosTop10} fill="#e85d25" />
                  </ScatterChart>
                </ResponsiveContainer>
              )}

              {(vista === "refacciones" || vista === "marca") && datosTop10.length > 0 && (
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
                      tick={TICK_NUM}
                      axisLine={{ stroke: "#3a4148" }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="nombre"
                      width={140}
                      tick={TICK_TXT}
                      axisLine={{ stroke: "#3a4148" }}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(232, 93, 37, 0.06)" }}
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={{ color: "#edeae3", fontWeight: 600, marginBottom: 4 }}
                      itemStyle={{ color: "#e85d25" }}
                      formatter={(value) => [formatearNumero(value), config.unidad]}
                    />
                    <Bar dataKey="cantidad" radius={[0, 2, 2, 0]} maxBarSize={22}>
                      {datosTop10.map((_, i) => (
                        <Cell key={i} fill={i % 2 === 0 ? "#e85d25" : "#c9531f"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* Técnicos: barras apiladas por tipo de mantenimiento */}
              {esTecnicos && tecnicosTop10.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={tecnicosTop10}
                    layout="vertical"
                    margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid stroke="#3a4148" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={TICK_NUM}
                      axisLine={{ stroke: "#3a4148" }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="nombre"
                      width={140}
                      interval={0}
                      tick={TICK_TXT}
                      axisLine={{ stroke: "#3a4148" }}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(232, 93, 37, 0.06)" }}
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={{ color: "#edeae3", fontWeight: 600, marginBottom: 4 }}
                      itemStyle={{ color: "#edeae3" }}
                      formatter={(value, name) => [formatearNumero(value), name]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#929aa2" }} />
                    {tecnicosPorTipo.tipos.map((tipo) => (
                      <Bar
                        key={tipo}
                        dataKey={tipo}
                        name={tipo}
                        stackId="tecnico"
                        fill={colorPorTipo[tipo]}
                        maxBarSize={22}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* SECCIÓN 2: TABLAS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginTop: "40px",
                borderTop: "1px solid #3a4148",
                paddingTop: "24px",
              }}
            >
              {/* TABLA 1: dinámica */}
              <div>
                <h4
                  style={{
                    color: "#edeae3",
                    marginBottom: "16px",
                    fontFamily: "IBM Plex Sans",
                    fontSize: "14px",
                  }}
                >
                  Registro completo de {config.label.toLowerCase()} ({sufijoPeriodo})
                </h4>
                <div style={{ maxHeight: "250px", overflowY: "auto", paddingRight: "8px" }}>
                  {esTecnicos ? (
                    <TablaTecnicos
                      filas={tecnicosPorTipo.filas}
                      tipos={tecnicosPorTipo.tipos}
                      colorPorTipo={colorPorTipo}
                      vacio={config.vacio}
                    />
                  ) : (
                    <TablaSimple
                      etiqueta={config.label}
                      unidad={config.unidad}
                      datos={datosCompletos}
                      vacio={config.vacio}
                    />
                  )}
                </div>
              </div>

              {/* TABLA 2: fija en refacciones */}
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  padding: "16px",
                  borderRadius: "8px",
                }}
              >
                <h4
                  style={{
                    color: "#e85d25",
                    marginBottom: "16px",
                    fontFamily: "IBM Plex Sans",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Resumen global de refacciones ({sufijoPeriodo})
                </h4>
                <div style={{ maxHeight: "220px", overflowY: "auto", paddingRight: "8px" }}>
                  <table style={TABLA}>
                    <thead style={THEAD}>
                      <tr>
                        <th style={TH}>Refacción</th>
                        <th style={{ ...TH, textAlign: "right" }}>Uso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todasLasRefacciones.length === 0 ? (
                        <tr>
                          <td colSpan="2" style={TD_VACIO}>
                            No hay refacciones registradas en este periodo.
                          </td>
                        </tr>
                      ) : (
                        todasLasRefacciones.map((item, index) => (
                          <tr key={index}>
                            <td style={TD}>{item.nombre}</td>
                            <td
                              style={{
                                ...TD,
                                fontWeight: 600,
                                textAlign: "right",
                                fontFamily: "IBM Plex Mono",
                              }}
                            >
                              {formatearNumero(item.cantidad)}{" "}
                              {item.cantidad === 1 ? "vez" : "veces"}
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

/* ---------- Estilos de tabla compartidos ---------- */

const TABLA = { width: "100%", textAlign: "left", borderCollapse: "collapse", fontSize: "13px" };
const THEAD = { position: "sticky", top: 0, background: "#1e2226", zIndex: 10 };
const TH = { padding: "8px", borderBottom: "1px solid #3a4148", color: "#929aa2", fontWeight: 600 };
const TD = { padding: "8px", borderBottom: "1px solid #2b3035", color: "#edeae3" };
const TD_VACIO = { padding: "16px", textAlign: "center", color: "#929aa2" };

/* ---------- Subcomponentes ---------- */

function BotonFiltro({ activo, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "4px 12px",
        borderRadius: "16px",
        border: `1px solid ${activo ? "#e85d25" : "#3a4148"}`,
        background: activo ? "rgba(232, 93, 37, 0.1)" : "transparent",
        color: activo ? "#e85d25" : "#929aa2",
        cursor: "pointer",
        fontSize: "12px",
        fontFamily: "IBM Plex Sans",
        transition: "all 0.2s ease",
      }}
    >
      {children}
    </button>
  );
}

function TablaSimple({ etiqueta, unidad, datos, vacio }) {
  return (
    <table style={TABLA}>
      <thead style={THEAD}>
        <tr>
          <th style={TH}>{etiqueta}</th>
          <th style={{ ...TH, textAlign: "right" }}>{unidad}</th>
        </tr>
      </thead>
      <tbody>
        {datos.length === 0 ? (
          <tr>
            <td colSpan="2" style={TD_VACIO}>
              {vacio}
            </td>
          </tr>
        ) : (
          datos.map((item, index) => (
            <tr key={index}>
              <td style={TD}>{item.nombre}</td>
              <td
                style={{
                  ...TD,
                  color: "#e85d25",
                  fontWeight: 600,
                  textAlign: "right",
                  fontFamily: "IBM Plex Mono",
                }}
              >
                {formatearNumero(item.cantidad)}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function TablaTecnicos({ filas, tipos, colorPorTipo, vacio }) {
  const colSpan = tipos.length + 2;
  return (
    <table style={TABLA}>
      <thead style={THEAD}>
        <tr>
          <th style={TH}>Técnico</th>
          {tipos.map((tipo) => (
            <th key={tipo} style={{ ...TH, textAlign: "right" }}>
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  marginRight: 6,
                  background: colorPorTipo[tipo],
                }}
              />
              {tipo}
            </th>
          ))}
          <th style={{ ...TH, textAlign: "right" }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {filas.length === 0 ? (
          <tr>
            <td colSpan={colSpan} style={TD_VACIO}>
              {vacio}
            </td>
          </tr>
        ) : (
          filas.map((fila) => (
            <tr key={fila.nombre}>
              <td style={TD}>{fila.nombre}</td>
              {tipos.map((tipo) => (
                <td
                  key={tipo}
                  style={{ ...TD, textAlign: "right", fontFamily: "IBM Plex Mono" }}
                >
                  {formatearNumero(fila[tipo] || 0)}
                </td>
              ))}
              <td
                style={{
                  ...TD,
                  color: "#e85d25",
                  fontWeight: 600,
                  textAlign: "right",
                  fontFamily: "IBM Plex Mono",
                }}
              >
                {formatearNumero(fila.total)}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function EstadoVacio({ mensaje }) {
  return (
    <div className="chart-state">
      <GaugeIcon />
      <p>
        {mensaje ||
          "Sin datos todavía. Sincroniza con la nube o sube un Excel para ver la gráfica."}
      </p>
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
      <path
        d="M12 4 21 19H3L12 4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M12 10v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r="0.9" fill="currentColor" />
    </svg>
  );
}

/* ---------- Utilidades ---------- */

// Tipo de mantenimiento normalizado; los registros sin tipo caen en "Sin tipo"
function tipoDe(r) {
  const t = r?.tipoMantenimiento;
  return typeof t === "string" && t.trim() ? t.trim() : SIN_TIPO;
}

// Agrupa por el campo indicado y cuenta ocurrencias
function agruparDatos(registros, campo) {
  if (!Array.isArray(registros) || registros.length === 0) return [];

  const conteo = new Map();
  for (const r of registros) {
    const valor = String(r[campo] ?? "").trim();
    if (!valor) continue;
    conteo.set(valor, (conteo.get(valor) || 0) + 1);
  }

  return Array.from(conteo.entries())
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);
}

// Agrupa por técnico y, dentro de cada uno, por tipo de mantenimiento.
// Devuelve filas ordenadas de mayor a menor total, y los tipos presentes.
function agruparPorTecnicoYTipo(registros) {
  if (!Array.isArray(registros) || registros.length === 0) {
    return { filas: [], tipos: [] };
  }

  const porTecnico = new Map();
  const tipos = new Set();

  for (const r of registros) {
    const tecnico = String(r.nombreTecnico ?? "").trim();
    if (!tecnico) continue;

    const tipo = tipoDe(r);
    tipos.add(tipo);

    const fila = porTecnico.get(tecnico) || { nombre: tecnico, total: 0 };
    fila[tipo] = (fila[tipo] || 0) + 1;
    fila.total += 1;
    porTecnico.set(tecnico, fila);
  }

  return {
    filas: Array.from(porTecnico.values()).sort((a, b) => b.total - a.total),
    tipos: Array.from(tipos).sort(),
  };
}

function formatearNumero(n) {
  return new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }).format(n);
}
