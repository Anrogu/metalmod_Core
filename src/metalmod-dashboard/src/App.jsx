import { useState } from "react";
import SourcePanel from "./components/SourcePanel";
import Readouts from "./components/Readouts";
import MetricsChart from "./components/MetricsChart";
import { obtenerMetricasCloud, obtenerMetricasDesdeArchivo } from "./api/dashboardApi";
import "./App.css";

export default function App() {
  const [metricas, setMetricas] = useState([]);
  const [estado, setEstado] = useState("idle"); // idle | loading | ready | error
  const [origen, setOrigen] = useState(null); // "cloud" | archivo.name
  const [errorMsg, setErrorMsg] = useState("");

  async function cargarDesdeNube() {
    setEstado("loading");
    setErrorMsg("");
    try {
      const data = await obtenerMetricasCloud();
      setMetricas(data);
      setOrigen("Sincronización en la nube");
      setEstado("ready");
    } catch (err) {
      setEstado("error");
      setErrorMsg(mensajeDeError(err));
    }
  }

  async function cargarDesdeArchivo(file) {
    setEstado("loading");
    setErrorMsg("");
    try {
      const data = await obtenerMetricasDesdeArchivo(file);
      setMetricas(data);
      setOrigen(file.name);
      setEstado("ready");
    } catch (err) {
      setEstado("error");
      setErrorMsg(mensajeDeError(err));
    }
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__mark">
          <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="16" r="6" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
            <g fill="var(--accent)">
              {[0, 45, 90, 135].map((deg) => (
                <g key={deg} transform={`rotate(${deg} 16 16)`}>
                  <rect x="14.5" y="2" width="3" height="6" rx="1" />
                  <rect x="14.5" y="24" width="3" height="6" rx="1" />
                </g>
              ))}
            </g>
          </svg>
          <div>
            <div className="topbar__title">METALMOD CORE</div>
            <div className="topbar__subtitle">Panel de métricas de planta</div>
          </div>
        </div>
        <div className={`topbar__status topbar__status--${estado}`}>
          <span className="dot" />
          {textoEstado(estado)}
        </div>
      </header>

      <main className="layout">
        <section className="layout__side">
          <SourcePanel
            estado={estado}
            origen={origen}
            onCargarNube={cargarDesdeNube}
            onCargarArchivo={cargarDesdeArchivo}
          />
          <Readouts refacciones={metricas} estado={estado} />
        </section>

        <section className="layout__main">
          <MetricsChart
            refacciones={metricas}
            estado={estado}
            errorMsg={errorMsg}
          />
        </section>
      </main>
    </div>
  );
}

function textoEstado(estado) {
  switch (estado) {
    case "loading":
      return "Cargando datos";
    case "ready":
      return "Datos cargados";
    case "error":
      return "Error de carga";
    default:
      return "En espera";
  }
}

function mensajeDeError(err) {
  if (err.response) {
    return `El servidor respondió con error ${err.response.status}. Verifica el archivo o la conexión con la nube.`;
  }
  if (err.request) {
    return "No se obtuvo respuesta del backend. Confirma que metalmod-core esté corriendo y accesible.";
  }
  return "No se pudo procesar la solicitud. Intenta de nuevo.";
}
