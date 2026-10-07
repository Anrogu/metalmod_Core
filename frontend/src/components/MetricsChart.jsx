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

// Recharts requiere estos estilos como objetos
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

  const refaccionesFiltradas = useMemo(() => {
    return refacciones.filter((r) => {
      const okTrim = filtroTrimestre === "Todos" || r.trimestre === filtroTrimestre;
      const okTipo = !esTecnicos || filtroTipo === "Todos" || tipoDe(r) === filtroTipo;
      return okTrim && okTipo;
    });
  }, [refacciones, filtroTrimestre, filtroTipo, esTecnicos]);

  const datosCompletos = useMemo(
    () => agruparDatos(refaccionesFiltradas, config.campo),
    [refaccionesFiltradas, config.campo]
  );
  const datosTop10 = useMemo(() => datosCompletos.slice(0, 10).reverse(), [datosCompletos]);

  const tecnicosPorTipo = useMemo(
    () => agruparPorTecnicoYTipo(refaccionesFiltradas),
    [refaccionesFiltradas]
  );
  const tecnicosTop10 = useMemo(
    () => tecnicosPorTipo.filas.slice(0, 10).reverse(),
    [tecnicosPorTipo]
  );

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

        <div className="chart-panel__filters">
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

        {esTecnicos && (
          <div className="chart-panel__filters chart-panel__filters--secondary">
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
          <div className="chart-panel__content">
            {/* SECCIÓN 1: GRÁFICA */}
            <div className="chart-panel__chart-wrapper">
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
            <div className="chart-panel__tables-wrapper">
              <div>
                <h4 className="metrics-table-title">
                  Registro completo de {config.label.toLowerCase()} ({sufijoPeriodo})
                </h4>
                <div className="metrics-table-scroll">
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

              <div className="metrics-table-card">
                <h4 className="metrics-table-title metrics-table-title--accent">
                  Resumen global de refacciones ({sufijoPeriodo})
                </h4>
                <div className="metrics-table-scroll metrics-table-scroll--shorter">
                  <table className="metrics-table">
                    <thead>
                      <tr>
                        <th>Refacción</th>
                        <th className="text-right">Uso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todasLasRefacciones.length === 0 ? (
                        <tr>
                          <td colSpan="2" className="metrics-table__empty">
                            No hay refacciones registradas en este periodo.
                          </td>
                        </tr>
                      ) : (
                        todasLasRefacciones.map((item, index) => (
                          <tr key={index}>
                            <td>{item.nombre}</td>
                            <td className="metrics-table__count">
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

/* ---------- Subcomponentes ---------- */

function BotonFiltro({ activo, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`filter-btn ${activo ? "filter-btn--active" : ""}`}
    >
      {children}
    </button>
  );
}

function TablaSimple({ etiqueta, unidad, datos, vacio }) {
  return (
    <table className="metrics-table">
      <thead>
        <tr>
          <th>{etiqueta}</th>
          <th className="text-right">{unidad}</th>
        </tr>
      </thead>
      <tbody>
        {datos.length === 0 ? (
          <tr>
            <td colSpan="2" className="metrics-table__empty">
              {vacio}
            </td>
          </tr>
        ) : (
          datos.map((item, index) => (
            <tr key={index}>
              <td>{item.nombre}</td>
              <td className="metrics-table__count">{formatearNumero(item.cantidad)}</td>
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
    <table className="metrics-table">
      <thead>
        <tr>
          <th>Técnico</th>
          {tipos.map((tipo) => (
            <th key={tipo} className="text-right">
              <span
                aria-hidden="true"
                className="metrics-table__swatch"
                style={{ backgroundColor: colorPorTipo[tipo] }}
              />
              {tipo}
            </th>
          ))}
          <th className="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {filas.length === 0 ? (
          <tr>
            <td colSpan={colSpan} className="metrics-table__empty">
              {vacio}
            </td>
          </tr>
        ) : (
          filas.map((fila) => (
            <tr key={fila.nombre}>
              <td>{fila.nombre}</td>
              {tipos.map((tipo) => (
                <td key={tipo} className="text-right" style={{ fontFamily: "IBM Plex Mono" }}>
                  {formatearNumero(fila[tipo] || 0)}
                </td>
              ))}
              <td className="metrics-table__count">{formatearNumero(fila.total)}</td>
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

/* ---------- Utilidades ---------- */
function tipoDe(r) {
  const t = r?.tipoMantenimiento;
  return typeof t === "string" && t.trim() ? t.trim() : SIN_TIPO;
}

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
