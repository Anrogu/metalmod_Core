import { useRef, useState } from "react";
import "./SourcePanel.css";

export default function SourcePanel({ estado, origen, onCargarNube, onCargarArchivo }) {
  const inputRef = useRef(null);
  const [arrastrando, setArrastrando] = useState(false);
  const cargando = estado === "loading";

  function manejarSeleccion(e) {
    const file = e.target.files?.[0];
    if (file) onCargarArchivo(file);
    e.target.value = "";
  }

  function manejarDrop(e) {
    e.preventDefault();
    setArrastrando(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onCargarArchivo(file);
  }

  return (
    <div className="tick-panel source-panel">
      <div className="source-panel__head">
        <span className="source-panel__eyebrow">01 — Origen de datos</span>
      </div>

      <button
        type="button"
        className="source-panel__cloud-btn"
        onClick={onCargarNube}
        disabled={cargando}
      >
        <CloudIcon />
        <span>
          <span className="source-panel__cloud-title">Sincronizar desde la nube</span>
          <span className="source-panel__cloud-sub">OneDrive · vía Microsoft Graph</span>
        </span>
      </button>

      <div className="source-panel__divider">
        <span>o sube un archivo</span>
      </div>

      <div
        className={`source-panel__drop ${arrastrando ? "is-active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={manejarDrop}
        onClick={() => inputRef.current?.click()}
      >
        <FileIcon />
        <p>
          Arrastra un <strong>.xlsx</strong> aquí o haz clic para elegirlo
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          hidden
          onChange={manejarSeleccion}
        />
      </div>

      {origen && (
        <div className="source-panel__origin">
          <span className="source-panel__origin-label">Fuente actual</span>
          <span className="source-panel__origin-value">{origen}</span>
        </div>
      )}
    </div>
  );
}

function CloudIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 18a4 4 0 0 1-.4-7.98 5 5 0 0 1 9.75-1.7A4.5 4.5 0 0 1 17.5 18H7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
