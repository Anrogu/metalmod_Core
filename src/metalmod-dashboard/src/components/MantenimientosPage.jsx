import { useEffect, useState } from "react";
import {
  obtenerMantenimientos,
  crearMantenimiento,
  eliminarMantenimiento,
} from "../api/mantenimientosApi";
import { obtenerMaquinas } from "../api/maquinasApi";
import { obtenerRefacciones } from "../api/refaccionesApi";
import "./MantenimientosPage.css";

const FORM_VACIO = {
  idMaquina: "",
  fecha: "",
  falla: "",
  solucion: "",
  proveedor: "",
  costo: "",
  idRefaccion: "",
  tecnico: "",
  horas: "0",
  minutos: "0",
};

const POR_PAGINA = 10;

export default function MantenimientosPage() {
  const [tickets, setTickets] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [refacciones, setRefacciones] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(0);

  // Nuevo estado para el mensaje de éxito (toast)
  const [mensajeExito, setMensajeExito] = useState("");

  // Filtros de la API
  const [filtroMaquina, setFiltroMaquina] = useState("");
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");

  // Nuevo estado para la barra de búsqueda (texto libre)
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarCatalogos();
    cargarTickets();
  }, []);

  // Volver a la página 1 cada vez que se escriba en la barra de búsqueda
  useEffect(() => {
    setPagina(0);
  }, [busqueda]);

  async function cargarCatalogos() {
    try {
      const [listaMaquinas, listaRefacciones] = await Promise.all([
        obtenerMaquinas(),
        obtenerRefacciones(),
      ]);
      setMaquinas(listaMaquinas);
      setRefacciones(listaRefacciones);
    } catch (err) {
      setError(err.message);
    }
  }

  async function cargarTickets() {
    setCargando(true);
    setError("");
    try {
      const data = await obtenerMantenimientos({
        idMaquina: filtroMaquina || undefined,
        desde: filtroDesde || undefined,
        hasta: filtroHasta || undefined,
      });
      setTickets(data);
      setPagina(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  // 1. Filtrar los tickets con base en la búsqueda por texto
  const ticketsFiltrados = tickets.filter((t) => {
    if (!busqueda) return true;
    const termino = busqueda.toLowerCase();
    return (
      (t.nombreMaquina && t.nombreMaquina.toLowerCase().includes(termino)) ||
      (t.falla && t.falla.toLowerCase().includes(termino)) ||
      (t.tecnico && t.tecnico.toLowerCase().includes(termino)) ||
      (t.proveedor && t.proveedor.toLowerCase().includes(termino))
    );
  });

  // 2. Aplicar la paginación a la lista filtrada, no a la lista original
  const totalPaginas = Math.max(1, Math.ceil(ticketsFiltrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas - 1);
  const ticketsPagina = ticketsFiltrados.slice(
    paginaSegura * POR_PAGINA,
    paginaSegura * POR_PAGINA + POR_PAGINA
  );

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  // Función para mostrar el toast temporalmente
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

    const tiempoInvertidoMinutos =
      (Number(form.horas) || 0) * 60 + (Number(form.minutos) || 0);

    const payload = {
      idMaquina: Number(form.idMaquina),
      fecha: form.fecha,
      falla: form.falla.trim(),
      solucion: form.solucion.trim() || null,
      proveedor: form.proveedor.trim() || null,
      costo: form.costo ? Number(form.costo) : null,
      idRefaccion: form.idRefaccion ? Number(form.idRefaccion) : null,
      tecnico: form.tecnico.trim() || null,
      tiempoInvertidoMinutos: tiempoInvertidoMinutos > 0 ? tiempoInvertidoMinutos : null,
    };

    try {
      await crearMantenimiento(payload);
      setForm(FORM_VACIO);
      await cargarTickets();
      mostrarExito("¡Ticket de mantenimiento registrado correctamente!");
    } catch (err) {
      setError(err.message);
    }
  }

  async function manejarEliminar(id) {
    if (!window.confirm("¿Eliminar este ticket de mantenimiento?")) return;
    setError("");
    setMensajeExito("");
    try {
      await eliminarMantenimiento(id);
      await cargarTickets();
      mostrarExito("¡Ticket eliminado correctamente!");
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

  function formatearTiempo(minutos) {
    if (minutos == null) return "—";
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h}:${String(m).padStart(2, "0")}`;
  }

  return (
    <div className="mant-page">
      {/* POP UP DE ÉXITO (TOAST) */}
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

      <div className="tick-panel mant-form-panel">
        <span className="chart-panel__eyebrow">Registrar ticket de mantenimiento</span>

        <form className="mant-form" onSubmit={manejarSubmit}>
          <label>
            Máquina
            <select
              value={form.idMaquina}
              onChange={(e) => actualizarCampo("idMaquina", e.target.value)}
              required
            >
              <option value="">Selecciona una máquina</option>
              {maquinas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Fecha
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => actualizarCampo("fecha", e.target.value)}
              required
            />
          </label>

          <label>
            Falla
            <input
              type="text"
              value={form.falla}
              onChange={(e) => actualizarCampo("falla", e.target.value)}
              required
              maxLength={255}
            />
          </label>

          <label>
            Solución
            <input
              type="text"
              value={form.solucion}
              onChange={(e) => actualizarCampo("solucion", e.target.value)}
              maxLength={255}
            />
          </label>

          <label>
            Proveedor
            <input
              type="text"
              value={form.proveedor}
              onChange={(e) => actualizarCampo("proveedor", e.target.value)}
              maxLength={150}
            />
          </label>

          <label>
            Técnico
            <input
              type="text"
              value={form.tecnico}
              onChange={(e) => actualizarCampo("tecnico", e.target.value)}
              maxLength={150}
            />
          </label>

          <label>
            Costo
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.costo}
              onChange={(e) => actualizarCampo("costo", e.target.value)}
            />
          </label>

          <label>
            Refacción usada (opcional)
            <select
              value={form.idRefaccion}
              onChange={(e) => actualizarCampo("idRefaccion", e.target.value)}
            >
              <option value="">Ninguna</option>
              {refacciones.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tiempo invertido
            <div className="mant-form__tiempo-row">
              <input
                type="number"
                min="0"
                value={form.horas}
                onChange={(e) => actualizarCampo("horas", e.target.value)}
              />
              <span>h</span>
              <input
                type="number"
                min="0"
                max="59"
                value={form.minutos}
                onChange={(e) => actualizarCampo("minutos", e.target.value)}
              />
              <span>min</span>
            </div>
          </label>

          <button type="submit" className="mant-form__submit">
            Registrar ticket
          </button>

          {error && <p className="mant-form__error">{error}</p>}
        </form>
      </div>

      <div className="tick-panel mant-list-panel">
        <span className="chart-panel__eyebrow">
          Tickets registrados {cargando ? "(cargando…)" : `(${ticketsFiltrados.length})`}
        </span>

        <div className="mant-filtros">
          {/* BARRA DE BÚSQUEDA AÑADIDA AQUÍ */}
          <input
            type="text"
            placeholder="Buscar máquina, falla, técnico..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="mant-search-input" 
          />

          <select value={filtroMaquina} onChange={(e) => setFiltroMaquina(e.target.value)}>
            <option value="">Todas las máquinas</option>
            {maquinas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filtroDesde}
            onChange={(e) => setFiltroDesde(e.target.value)}
            title="Desde"
          />
          <input
            type="date"
            value={filtroHasta}
            onChange={(e) => setFiltroHasta(e.target.value)}
            title="Hasta"
          />
          <button type="button" onClick={cargarTickets}>
            Buscar
          </button>
        </div>

        <table className="mant-table">
          <thead>
            <tr>
              <th>Máquina</th>
              <th>Fecha</th>
              <th>Falla</th>
              <th>Proveedor</th>
              <th>Técnico</th>
              <th>Tiempo</th>
              <th>Costo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ticketsPagina.map((t) => (
              <tr key={t.id}>
                <td>{t.nombreMaquina}</td>
                <td>{t.fecha}</td>
                <td>{t.falla}</td>
                <td>{t.proveedor || "—"}</td>
                <td>{t.tecnico || "—"}</td>
                <td>{formatearTiempo(t.tiempoInvertidoMinutos)}</td>
                <td>{t.costo != null ? `$${t.costo}` : "—"}</td>
                <td>
                  <button type="button" onClick={() => manejarEliminar(t.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {ticketsFiltrados.length === 0 && !cargando && (
              <tr>
                <td colSpan={8} className="mant-table__vacio">
                  No hay tickets que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {ticketsFiltrados.length > POR_PAGINA && (
          <div className="mant-carrusel">
            <button type="button" onClick={irPaginaAnterior} disabled={paginaSegura === 0}>
              ‹ Anterior
            </button>
            <span className="mant-carrusel__indicador">
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

      {/* ESTILO PARA LA ANIMACIÓN DEL TOAST */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
