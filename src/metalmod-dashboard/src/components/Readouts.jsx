import "./Readouts.css";

export default function Readouts({ refacciones, estado }) {
  const tieneDatos = estado === "ready" && refacciones.length > 0;

  const total = tieneDatos ? refacciones.length : 0;
  const maquinasUnicas = tieneDatos ? contarUnicos(refacciones, "ma") : 0;
  const refaccionTop = tieneDatos ? calcularModa(refacciones, "refaccion") : null;
  const maquinaTop = tieneDatos ? calcularModa(refacciones, "ma") : null;

  return (
    <div className="tick-panel readouts">
      <div className="readouts__eyebrow">02 — Lecturas</div>

      <Readout label="Registros" value={tieneDatos ? total : "—"} />
      <Readout label="Máquinas" value={tieneDatos ? maquinasUnicas : "—"} />
      <Readout
        label="Refacción más pedida"
        value={
          tieneDatos && refaccionTop
            ? `${refaccionTop.valor} · ${refaccionTop.cantidad}`
            : "—"
        }
      />
      <Readout
        label="Máquina con más fallas"
        value={
          tieneDatos && maquinaTop
            ? `${maquinaTop.valor} · ${maquinaTop.cantidad}`
            : "—"
        }
        destacado
      />
    </div>
  );
}

function Readout({ label, value, destacado }) {
  return (
    <div className="readout">
      <span className="readout__label">{label}</span>
      <span className={`readout__value ${destacado ? "is-accent" : ""}`}>
        {value}
      </span>
    </div>
  );
}

// Cuenta valores únicos y no vacíos de un campo (p. ej. cuántas máquinas distintas hay)
function contarUnicos(refacciones, campo) {
  const set = new Set();
  for (const r of refacciones) {
    const valor = (r[campo] || "").trim();
    if (valor) set.add(valor);
  }
  return set.size;
}

// Encuentra el valor más frecuente de un campo (ignorando vacíos), con su cantidad
function calcularModa(refacciones, campo) {
  const conteo = new Map();
  for (const r of refacciones) {
    const valor = (r[campo] || "").trim();
    if (!valor) continue;
    conteo.set(valor, (conteo.get(valor) || 0) + 1);
  }

  let top = null;
  for (const [valor, cantidad] of conteo) {
    if (!top || cantidad > top.cantidad) top = { valor, cantidad };
  }
  return top;
}
