import "./Readouts.css";

export default function Readouts({ refacciones, estado }) {
  const tieneDatos = estado === "ready" && refacciones.length > 0;

  const total = tieneDatos ? refacciones.length : 0;
  const maquinasUnicas = tieneDatos ? contarUnicos(refacciones, "ma") : 0;
  const refaccionTop = tieneDatos ? calcularModa(refacciones, "refaccion") : null;
  const maquinaTop = tieneDatos ? calcularModa(refacciones, "ma") : null;
  const marcaTop = tieneDatos ? calcularModa(refacciones, "marca") : null;

  const top3Maquinas = tieneDatos ? calcularTopN(refacciones, "ma", 3) : [];
  const top3Marcas = tieneDatos ? calcularTopN(refacciones, "marca", 3) : [];

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
      <Readout
        label="Marca con más fallas"
        value={
          tieneDatos && marcaTop
            ? `${marcaTop.valor} · ${marcaTop.cantidad}`
            : "—"
        }
        destacado
      />

      {tieneDatos && (top3Maquinas.length > 0 || top3Marcas.length > 0) && (
        <div className="readouts__top3-wrap">
          {top3Maquinas.length > 0 && (
            <Top3Lista titulo="Top 3 máquinas" items={top3Maquinas} />
          )}
          {top3Marcas.length > 0 && (
            <Top3Lista titulo="Top 3 marcas" items={top3Marcas} />
          )}
        </div>
      )}
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

// Mini lista de las 3 posiciones mas altas de un campo, para aprovechar el espacio
// que dejo libre el panel de "Origen de datos"
function Top3Lista({ titulo, items }) {
  return (
    <div className="readouts__top3">
      <span className="readouts__top3-titulo">{titulo}</span>
      <ol className="readouts__top3-lista">
        {items.map((item, i) => (
          <li key={item.valor}>
            <span className="readouts__top3-pos">{i + 1}</span>
            <span className="readouts__top3-nombre">{item.valor}</span>
            <span className="readouts__top3-cantidad">{item.cantidad}</span>
          </li>
        ))}
      </ol>
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

// Top N valores mas frecuentes de un campo (ignorando vacios), ordenados descendente
function calcularTopN(refacciones, campo, n) {
  const conteo = new Map();
  for (const r of refacciones) {
    const valor = (r[campo] || "").trim();
    if (!valor) continue;
    conteo.set(valor, (conteo.get(valor) || 0) + 1);
  }

  return Array.from(conteo.entries())
    .map(([valor, cantidad]) => ({ valor, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, n);
}
