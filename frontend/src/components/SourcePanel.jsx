import "./SourcePanel.css";

export default function SourcePanel({ estado, origen, onActualizar }) {
  const cargando = estado === "loading";

  return (
    <div className="tick-panel source-panel">
      <div className="source-panel__head">
        <span className="source-panel__eyebrow">01 — Origen de datos</span>
      </div>

      <button
        type="button"
        className="source-panel__cloud-btn"
        onClick={onActualizar}
        disabled={cargando}
      >
        <DbIcon />
        <span>
          <span className="source-panel__cloud-title">
            {cargando ? "Actualizando…" : "Actualizar desde la base de datos"}
          </span>
          <span className="source-panel__cloud-sub">Metalmod Core · PostgreSQL</span>
        </span>
      </button>

      {origen && (
        <div className="source-panel__origin">
          <span className="source-panel__origin-label">Fuente actual</span>
          <span className="source-panel__origin-value">{origen}</span>
        </div>
      )}
    </div>
  );
}

function DbIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7" ry="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
