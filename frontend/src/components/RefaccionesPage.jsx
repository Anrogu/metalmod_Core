import { useEffect, useState } from "react";
import {
  obtenerRefacciones,
  crearRefaccion,
  actualizarRefaccion,
  eliminarRefaccion,
} from "../api/refaccionesApi";
import "./RefaccionesPage.css";

const FORM_VACIO = { codigo: "", nombre: "", descripcion: "", cantidadStock: "0", stockMinimo: "0" };
const POR_PAGINA = 10;

export default function RefaccionesPage() {
  const [refacciones, setRefacciones] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(false);
  
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState(""); 

  const [busqueda, setBusqueda] = useState("");
  const [filtroStock, setFiltroStock] = useState(""); 

  const [pagina, setPagina] = useState(0);

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    setPagina(0);
  }, [busqueda, filtroStock]);

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      setRefacciones(await obtenerRefacciones());
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  const refaccionesFiltradas = refacciones.filter((r) => {
const coincideTexto = !busqueda || (
  (r.codigo && r.codigo.toLowerCase().includes(busqueda.toLowerCase())) ||
  (r.nombre && r.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
  (r.descripcion && r.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
);
    const esStockBajo = r.stockBajo || (Number(r.cantidadStock) <= Number(r.stockMinimo));
    const coincideStock = !filtroStock || 
      (filtroStock === "bajo" ? esStockBajo : !esStockBajo);

    return coincideTexto && coincideStock;
  });

  const totalPaginas = Math.max(1, Math.ceil(refaccionesFiltradas.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas - 1);
  const refaccionesPagina = refaccionesFiltradas.slice(
    paginaSegura * POR_PAGINA,
    paginaSegura * POR_PAGINA + POR_PAGINA
  );

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

 function iniciarEdicion(refaccion) {
  setEditandoId(refaccion.id);
  setForm({
    codigo: refaccion.codigo || "",
    nombre: refaccion.nombre,
    descripcion: refaccion.descripcion || "",
    cantidadStock: String(refaccion.cantidadStock ?? 0),
    stockMinimo: String(refaccion.stockMinimo ?? 0),
  });
}
  function cancelarEdicion() {
    setEditandoId(null);
    setForm(FORM_VACIO);
  }

  function mostrarExito(mensaje) {
    setMensajeExito(mensaje);
    setTimeout(() => {
      setMensajeExito("");
    }, 3000);
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError("");
    setMensajeExito("");
const codigoLimpio = form.codigo.trim().toLowerCase();
if (codigoLimpio) {
  const duplicado = refacciones.some(
    (r) => r.codigo?.trim().toLowerCase() === codigoLimpio && r.id !== editandoId
  );
  if (duplicado) {
    setError(`Ya existe una refacción con el código "${form.codigo.trim()}".`);
    return;
  }
}
    const payload = {
  codigo: form.codigo.trim() || null,
  nombre: form.nombre.trim(),
  descripcion: form.descripcion.trim() || null,
  cantidadStock: Number(form.cantidadStock) || 0,
  stockMinimo: Number(form.stockMinimo) || 0,
};

    try {
      if (editandoId) {
        await actualizarRefaccion(editandoId, payload);
        mostrarExito("¡La refacción se actualizó correctamente!");
      } else {
        await crearRefaccion(payload);
        mostrarExito("¡Refacción registrada correctamente!");
      }
      cancelarEdicion();
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function manejarEliminar(id) {
    if (!window.confirm("¿Eliminar esta refacción? No se puede deshacer.")) return;
    setError("");
    try {
      await eliminarRefaccion(id);
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  function irPaginaAnterior() {
    setPagina((p) => Math.max(0, p - 1));
  }

  function irPaginaSiguiente() {
    setPagina((p) => Math.min(totalPaginas - 1, p + 1));
  }

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroStock("");
  }

  return (
    <div className="refacciones-page">
      {/* POP UP DE ÉXITO */}
      {mensajeExito && (
        <div style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          backgroundColor: "#28a745",
          color: "white",
          padding: "16px 24px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontWeight: "bold",
          animation: "fade-in-up 0.3s ease-out"
        }}>
          <span style={{ fontSize: "1.2rem" }}>✓</span>
          {mensajeExito}
        </div>
      )}

      <div className="tick-panel refacciones-form-panel">
        <span className="chart-panel__eyebrow">
          {editandoId ? `Editando refacción #${editandoId}` : "Registrar refacción nueva"}
        </span>

        <form className="refacciones-form" onSubmit={manejarSubmit}>
        <label>
  	 Código
  		<input
    		type="text"
    		value={form.codigo}
    		onChange={(e) => actualizarCampo("codigo", e.target.value)}
    		maxLength={50}
    		placeholder="Ej. REF-0001 (opcional)"
  		/>
</label>
          <label>
            Nombre
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => actualizarCampo("nombre", e.target.value)}
              required
              maxLength={150}
            />
          </label>

          <label>
            Descripción
            <input
              type="text"
              value={form.descripcion}
              onChange={(e) => actualizarCampo("descripcion", e.target.value)}
              maxLength={255}
            />
          </label>

          <div className="refacciones-form__row">
            <label>
              Stock actual
              <input
                type="number"
                min="0"
                max="999999" 
                value={form.cantidadStock}
                onChange={(e) => actualizarCampo("cantidadStock", e.target.value)}
              />
            </label>

            <label>
              Stock mínimo
              <input
                type="number"
                min="0"
                max="999999" 
                value={form.stockMinimo}
                onChange={(e) => actualizarCampo("stockMinimo", e.target.value)}
              />
            </label>
          </div>

          <div className="refacciones-form__actions">
            <button type="submit" className="refacciones-form__submit">
              {editandoId ? "Guardar cambios" : "Registrar refacción"}
            </button>
            {editandoId && (
              <button type="button" onClick={cancelarEdicion}>
                Cancelar
              </button>
            )}
          </div>

          {error && <p className="refacciones-form__error">{error}</p>}
        </form>
      </div>

      <div className="tick-panel refacciones-list-panel">
        <span className="chart-panel__eyebrow">
          Refacciones registradas {cargando ? "(cargando…)" : `(${refaccionesFiltradas.length})`}
        </span>

        {/* BARRA DE BÚSQUEDA USANDO LAS CLASES CSS EXACTAS */}
        <div className="refacciones-filtros">
          <input
            type="text"
            placeholder="Buscar refacción, descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <select 
            value={filtroStock} 
            onChange={(e) => setFiltroStock(e.target.value)}
          >
            <option value="">Todo el stock</option>
            <option value="bajo">Stock bajo (Alerta)</option>
            <option value="normal">Stock normal</option>
          </select>

          <button 
            type="button" 
            onClick={limpiarFiltros} 
            disabled={!busqueda && !filtroStock}
          >
            Limpiar filtros
          </button>
        </div>

        <table className="refacciones-table">
          <thead>
  <tr>
    <th>Código</th>
    <th>Nombre</th>
    <th>Descripción</th>
    <th>Stock</th>
    <th>Mínimo</th>
    <th></th>
  </tr>
</thead>
          <tbody>
            {refaccionesPagina.map((r) => (
<tr key={r.id} className={r.stockBajo ? "refacciones-table__fila--bajo" : ""}>
  <td style={{ fontFamily: "IBM Plex Mono, monospace", whiteSpace: "nowrap" }}>
    {r.codigo || "—"}
  </td>
  <td>{r.nombre}</td>
                <td style={{ wordBreak: 'break-word', maxWidth: '200px' }}>{r.descripcion || "—"}</td>
                <td>
                  {r.cantidadStock}
                  {r.stockBajo && <span className="refacciones-table__badge" style={{ marginLeft: '8px' }}>bajo</span>}
                </td>
                <td style={{ wordBreak: 'break-word', maxWidth: '100px' }}>{r.stockMinimo}</td>
                <td className="refacciones-table__acciones">
                  <button type="button" onClick={() => iniciarEdicion(r)}>
                    Editar
                  </button>
                  <button type="button" onClick={() => manejarEliminar(r.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {refaccionesFiltradas.length === 0 && !cargando && (
              <tr>
                <td colSpan={6} className="refacciones-table__vacio">
                  No se encontraron refacciones con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {refaccionesFiltradas.length > POR_PAGINA && (
          <div className="refacciones-carrusel">
            <button type="button" onClick={irPaginaAnterior} disabled={paginaSegura === 0}>
              ‹ Anterior
            </button>
            <span className="refacciones-carrusel__indicador">
              Página {paginaSegura + 1} de {totalPaginas}
            </span>
            <button
              type="button"
              onClick={irPaginaSiguiente}
              disabled={paginaSegura >= totalPaginas - 1}
            >
              Siguiente ›
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
