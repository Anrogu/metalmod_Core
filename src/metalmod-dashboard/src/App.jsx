import { useEffect, useState } from "react";
import SourcePanel from "./components/SourcePanel";
import Readouts from "./components/Readouts";
import MetricsChart from "./components/MetricsChart";
import MaquinasPage from "./components/MaquinasPage";
import "./App.css";

const API_BASE = "http://localhost:8080/api/v1/dashboard";

export default function App() {
  const [metricas, setMetricas] = useState([]);
  const [estado, setEstado] = useState("idle"); // idle | loading | ready | error
  const [origen, setOrigen] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [vistaApp, setVistaApp] = useState("dashboard"); // dashboard | maquinas

  async function cargarDesdeBaseDeDatos() {
    setEstado("loading");
    setErrorMsg("");
    try {
      const data = await obtenerRegistrosDb();
      setMetricas(data);
      setOrigen("Base de datos");
      setEstado("ready");
    } catch (err) {
      setEstado("error");
      setErrorMsg(mensajeDeError(err));
    }
  }

  // Carga automatica al entrar al panel, ya no hace falta sincronizar manualmente
  useEffect(() => {
    cargarDesdeBaseDeDatos();
  }, []);

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

      <nav style={{ display: "flex", gap: "8px", padding: "16px 24px 0" }}>
        <button
          type="button"
          onClick={() => setVistaApp("dashboard")}
          style={{
            padding: "6px 14px",
            border: `1px solid ${vistaApp === "dashboard" ? "#e85d25" : "#3a4148"}`,
            background: vistaApp === "dashboard" ? "rgba(232, 93, 37, 0.1)" : "transparent",
            color: vistaApp === "dashboard" ? "#e85d25" : "#929aa2",
            cursor: "pointer",
            fontFamily: "IBM Plex Sans",
            fontSize: "13px",
          }}
        >
          Panel de métricas
        </button>
        <button
          type="button"
          onClick={() => setVistaApp("maquinas")}
          style={{
            padding: "6px 14px",
            border: `1px solid ${vistaApp === "maquinas" ? "#e85d25" : "#3a4148"}`,
            background: vistaApp === "maquinas" ? "rgba(232, 93, 37, 0.1)" : "transparent",
            color: vistaApp === "maquinas" ? "#e85d25" : "#929aa2",
            cursor: "pointer",
            fontFamily: "IBM Plex Sans",
            fontSize: "13px",
          }}
        >
          Máquinas
        </button>
      </nav>

      {vistaApp === "maquinas" ? (
        <main className="layout" style={{ display: "block", padding: "24px" }}>
          <MaquinasPage />
        </main>
      ) : (
        <main className="layout">
          <section className="layout__side">
            <SourcePanel
              estado={estado}
              origen={origen}
              onActualizar={cargarDesdeBaseDeDatos}
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
      )}
    </div>
  );
}

async function obtenerRegistrosDb() {
  const res = await fetch(`${API_BASE}/registros`);
  if (!res.ok) {
    const error = new Error("Error de servidor");
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
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
    return `El servidor respondió con error ${err.response.status}. Verifica que metalmod-core esté corriendo.`;
  }
  if (err.request) {
    return "No se obtuvo respuesta del backend. Confirma que metalmod-core esté corriendo y accesible.";
  }
  return "No se pudo procesar la solicitud. Intenta de nuevo.";
}
