import { useEffect, useState } from "react";
import Readouts from "./components/Readouts";
import MetricsChart from "./components/MetricsChart";
import MaquinasPage from "./components/MaquinasPage";
import RefaccionesPage from "./components/RefaccionesPage";
import MantenimientosPage from "./components/MantenimientosPage";
import LoginPage from "./components/LoginPage";
import { obtenerSesion, cerrarSesion } from "./api/authApi";
import { apiFetch, EVENTO_SESION_EXPIRADA } from "./api/http";
import { SesionContext } from "./auth/SesionContext";
import "./App.css";

const API_BASE = "/api/v1/dashboard";

function Panel({ sesion, onCerrarSesion }) {
  const [metricas, setMetricas] = useState([]);
  const [estado, setEstado] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [vistaApp, setVistaApp] = useState("dashboard");

  async function cargarDesdeBaseDeDatos() {
    setEstado("loading");
    setErrorMsg("");
    try {
      const data = await obtenerRegistrosDb();
      setMetricas(data);
      setEstado("ready");
    } catch (err) {
      setEstado("error");
      setErrorMsg(mensajeDeError(err));
    }
  }

  useEffect(() => {
    cargarDesdeBaseDeDatos();
  }, []);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__mark">
          <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="16" r="6" fill="none" stroke="var(--accent, #e85d25)" strokeWidth="2.5" />
            <g fill="var(--accent, #e85d25)">
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
        <div className="topbar__right">
          <div className={`topbar__status topbar__status--${estado}`}>
            <span className="dot" />
            {textoEstado(estado)}
          </div>
          <div className="topbar__user">
            <span>{sesion.username} · {sesion.rol}</span>
            <button type="button" onClick={onCerrarSesion}>Cerrar sesión</button>
          </div>
        </div>
      </header>

      {/* Se agregó flexWrap para celulares y la clase app-nav */}
      <nav className="app-nav" style={{ display: "flex", gap: "8px", padding: "16px 24px 0", flexWrap: "wrap" }}>
        <button
          type="button"
          className="app-nav__btn"
          onClick={() => setVistaApp("dashboard")}
          style={{
            border: `1px solid ${vistaApp === "dashboard" ? "#e85d25" : "#3a4148"}`,
            background: vistaApp === "dashboard" ? "rgba(232, 93, 37, 0.1)" : "transparent",
            color: vistaApp === "dashboard" ? "#e85d25" : "#929aa2",
          }}
        >
          Panel de métricas
        </button>
        <button
          type="button"
          className="app-nav__btn"
          onClick={() => setVistaApp("maquinas")}
          style={{
            border: `1px solid ${vistaApp === "maquinas" ? "#e85d25" : "#3a4148"}`,
            background: vistaApp === "maquinas" ? "rgba(232, 93, 37, 0.1)" : "transparent",
            color: vistaApp === "maquinas" ? "#e85d25" : "#929aa2",
          }}
        >
          Máquinas
        </button>
        <button
          type="button"
          className="app-nav__btn"
          onClick={() => setVistaApp("refacciones")}
          style={{
            border: `1px solid ${vistaApp === "refacciones" ? "#e85d25" : "#3a4148"}`,
            background: vistaApp === "refacciones" ? "rgba(232, 93, 37, 0.1)" : "transparent",
            color: vistaApp === "refacciones" ? "#e85d25" : "#929aa2",
          }}
        >
          Refacciones
        </button>
        <button
          type="button"
          className="app-nav__btn"
          onClick={() => setVistaApp("mantenimientos")}
          style={{
            border: `1px solid ${vistaApp === "mantenimientos" ? "#e85d25" : "#3a4148"}`,
            background: vistaApp === "mantenimientos" ? "rgba(232, 93, 37, 0.1)" : "transparent",
            color: vistaApp === "mantenimientos" ? "#e85d25" : "#929aa2",
          }}
        >
          Mantenimientos
        </button>
      </nav>

      {/* Clases layout--page agregadas para control de padding en celular */}
      {vistaApp === "maquinas" && (
        <main className="layout layout--page" style={{ display: "block", padding: "24px" }}>
          <MaquinasPage />
        </main>
      )}

      {vistaApp === "refacciones" && (
        <main className="layout layout--page" style={{ display: "block", padding: "24px" }}>
          <RefaccionesPage />
        </main>
      )}

      {vistaApp === "mantenimientos" && (
        <main className="layout layout--page" style={{ display: "block", padding: "24px" }}>
          <MantenimientosPage />
        </main>
      )}

      {vistaApp === "dashboard" && (
        <main className="layout">
          <section className="layout__side">
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

export default function App() {
  const [sesion, setSesion] = useState(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    obtenerSesion()
      .then(setSesion)
      .catch(() => setSesion(null))
      .finally(() => setVerificando(false));

    // Cualquier 401 en la app (sesion vencida) regresa al login.
    const alExpirar = () => setSesion(null);
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
  }, []);

  async function salir() {
    try {
      await cerrarSesion();
    } finally {
      setSesion(null);
    }
  }

  if (verificando) return null;
  if (!sesion) return <LoginPage onSesionIniciada={setSesion} />;

  return (
    <SesionContext.Provider value={{ ...sesion, esAdmin: sesion.rol === "ADMINISTRADOR" }}>
      <Panel sesion={sesion} onCerrarSesion={salir} />
    </SesionContext.Provider>
  );
}

// Funciones helpers (sin cambios)
async function obtenerRegistrosDb() {
  const res = await apiFetch(`${API_BASE}/registros`);
  if (!res.ok) {
    const error = new Error("Error de servidor");
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
}

function textoEstado(estado) {
  switch (estado) {
    case "loading": return "Cargando datos";
    case "ready": return "Datos cargados";
    case "error": return "Error de carga";
    default: return "En espera";
  }
}

function mensajeDeError(err) {
  if (err.response) return `El servidor respondió con error ${err.response.status}. Verifica que metalmod-core esté corriendo.`;
  if (err.request) return "No se obtuvo respuesta del backend. Confirma que metalmod-core esté corriendo y accesible.";
  return "No se pudo procesar la solicitud. Intenta de nuevo.";
}
