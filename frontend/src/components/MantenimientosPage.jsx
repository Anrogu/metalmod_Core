import { useEffect, useState } from "react";
import {
  obtenerMantenimientos,
  crearMantenimiento,
  eliminarMantenimiento,
} from "../api/mantenimientosApi";
import { obtenerMaquinas } from "../api/maquinasApi";
import { obtenerRefacciones } from "../api/refaccionesApi";
import { obtenerTecnicos } from "../api/tecnicosApi";
import { obtenerTiposMantenimiento } from "../api/tiposMantenimientoApi";
import "./MantenimientosPage.css";

const FORM_VACIO = {
  buscadorMaquina: "",
  fecha: "",
  falla: "",
  solucion: "",
  buscadorRefaccion: "", 
  idTecnico: "",
  idTipoMantenimiento: "",
  horas: "0",
  minutos: "0",
};

// IDs para controlar el comportamiento del formulario según el tipo de mantenimiento
const ID_LIMPIEZA = 4;
const ID_RECORRIDO = 5;

// Listas de opciones predefinidas
const TAREAS_LIMPIEZA = [
  "Cambio de Solubles",
  "Limpieza de Tanques",
  "Lavado de Boquillas",
  "Retiro de rebaba o escoria"
];

const TAREAS_RECORRIDO = [
  "Revision de escurrimientos",
  "Revisión de fugas",
  "Ajuste de cables",
  "Verificación de ruidos o vibraciones anómalas"
];

const POR_PAGINA = 10;

export default function MantenimientosPage() {
  const [tickets, setTickets] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [refacciones, setRefacciones] = useState([]);
  const [tecnicos, setTecnicos] = useState([]); 
  const [tipos, setTipos] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(0);
  const [mensajeExito, setMensajeExito] = useState("");

  const [filtroMaquina, setFiltroMaquina] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [mostrarListaMaquinas, setMostrarListaMaquinas] = useState(false);
  const [mostrarListaRefacciones, setMostrarListaRefacciones] = useState(false);

  useEffect(() => {
    cargarCatalogos();
    cargarTickets();
  }, []);

  useEffect(() => {
    setPagina(0);
  }, [busqueda, filtroTipo]);

  async function cargarCatalogos() {
    try {
      const [listaMaquinas, listaRefacciones, listaTecnicos, listaTipos] = await Promise.all([
        obtenerMaquinas(),
        obtenerRefacciones(),
        obtenerTecnicos(),
        obtenerTiposMantenimiento(),
      ]);
      setMaquinas(listaMaquinas);
      setRefacciones(listaRefacciones);
      setTecnicos(listaTecnicos);
      setTipos(listaTipos);
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
        idTipoMantenimiento: filtroTipo || undefined,
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

  const ticketsFiltrados = tickets.filter((t) => {
    if (filtroTipo) {
      const idTipoTicket = t.idTipoMantenimiento || t.tipoMantenimiento; 
      if (String(idTipoTicket) !== String(filtroTipo)) {
        return false;
      }
    }

    if (!busqueda) return true;
    const termino = busqueda.toLowerCase();
    const nombreTec = t.nombreTecnico || t.tecnico || "";
    
    return (
      (t.nombreMaquina && t.nombreMaquina.toLowerCase().includes(termino)) ||
      (t.falla && t.falla.toLowerCase().includes(termino)) ||
      (nombreTec.toLowerCase().includes(termino))
    );
  });

  const totalPaginas = Math.max(1, Math.ceil(ticketsFiltrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas - 1);
  const ticketsPagina = ticketsFiltrados.slice(
    paginaSegura * POR_PAGINA,
    paginaSegura * POR_PAGINA + POR_PAGINA
  );

  const maquinasSugeridas = maquinas.filter((m) => 
    m.nombre.toLowerCase().includes(form.buscadorMaquina.toLowerCase())
  );
  
  const refaccionesSugeridas = refacciones.filter((r) => 
    r.nombre.toLowerCase().includes(form.buscadorRefaccion.toLowerCase())
  );

  // Lógica para renderizado condicional del formulario
  const esLimpieza = Number(form.idTipoMantenimiento) === ID_LIMPIEZA;
  const esRecorrido = Number(form.idTipoMantenimiento) === ID_RECORRIDO;
  
  // Si es limpieza O recorrido, ocultamos los campos de detalle y mostramos el select de tareas
  const esTipoSinDetalle = esLimpieza || esRecorrido;
  const mostrarSelectFalla = esLimpieza || esRecorrido;

  let opcionesFalla = [];
  if (esLimpieza) opcionesFalla = TAREAS_LIMPIEZA;
  if (esRecorrido) opcionesFalla = TAREAS_RECORRIDO;

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
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

    const maquinaSeleccionada = maquinas.find((m) => m.nombre === form.buscadorMaquina);
    const refaccionSeleccionada = refacciones.find((r) => r.nombre === form.buscadorRefaccion);

    if (!maquinaSeleccionada) {
      setError("Por favor, selecciona una máquina válida de la lista.");
      return;
    }

    if (!esTipoSinDetalle && form.buscadorRefaccion && !refaccionSeleccionada) {
      setError("La refacción escrita no existe en el catálogo. Déjalo en blanco o elige una de la lista.");
      return;
    }

    const tiempoInvertidoMinutos = (Number(form.horas) || 0) * 60 + (Number(form.minutos) || 0);

    const payload = {
      idMaquina: maquinaSeleccionada.id,
      fecha: form.fecha,
      falla: form.falla.trim(),
      solucion: esTipoSinDetalle ? null : (form.solucion.trim() || null),
      idRefaccion: esTipoSinDetalle ? null : (refaccionSeleccionada ? refaccionSeleccionada.id : null),
      idTecnico: form.idTecnico ? Number(form.idTecnico) : null, 
      tipoMantenimiento: form.idTipoMantenimiento ? Number(form.idTipoMantenimiento) : null,
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
          
          <label className="mant-autocomplete">
            Máquina
            <input
              type="text"
              value={form.buscadorMaquina}
              onChange={(e) => {
                actualizarCampo("buscadorMaquina", e.target.value);
                setMostrarListaMaquinas(true);
              }}
              onFocus={() => setMostrarListaMaquinas(true)}
              onBlur={() => setTimeout(() => setMostrarListaMaquinas(false), 200)}
              placeholder="Buscar o seleccionar máquina..."
              required
              autoComplete="off"
            />
            {mostrarListaMaquinas && maquinasSugeridas.length > 0 && (
              <ul className="mant-autocomplete-list">
                {maquinasSugeridas.map((m) => (
                  <li
                    key={m.id}
                    className="mant-autocomplete-item"
                    onClick={() => {
                      actualizarCampo("buscadorMaquina", m.nombre);
                      setMostrarListaMaquinas(false);
                    }}
                  >
                    {m.nombre}
                  </li>
                ))}
              </ul>
            )}
          </label>

          <label>
            Tipo de mantenimiento
            <select
              value={form.idTipoMantenimiento}
              onChange={(e) => {
                actualizarCampo("idTipoMantenimiento", e.target.value);
                actualizarCampo("falla", ""); 
              }}
              required
            >
              <option value="">Selecciona un tipo</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
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
            {mostrarSelectFalla ? "Tarea realizada" : "Falla"}
            {mostrarSelectFalla ? (
              <select
                value={form.falla}
                onChange={(e) => actualizarCampo("falla", e.target.value)}
                required
              >
                <option value="">Selecciona la tarea...</option>
                {opcionesFalla.map((opcion, index) => (
                  <option key={index} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.falla}
                onChange={(e) => actualizarCampo("falla", e.target.value)}
                required
                maxLength={255}
                placeholder="Describe la falla presentada..."
              />
            )}
          </label>

          {!esTipoSinDetalle && (
            <label>
              Solución
              <input
                type="text"
                value={form.solucion}
                onChange={(e) => actualizarCampo("solucion", e.target.value)}
                maxLength={255}
              />
            </label>
          )}

          <label>
            Técnico
            <select
              value={form.idTecnico}
              onChange={(e) => actualizarCampo("idTecnico", e.target.value)}
              required 
            >
              <option value="">Selecciona un técnico</option>
              {tecnicos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </label>

          {!esTipoSinDetalle && (
            <label className="mant-autocomplete">
              Refacción usada (opcional)
              <input
                type="text"
                value={form.buscadorRefaccion}
                onChange={(e) => {
                  actualizarCampo("buscadorRefaccion", e.target.value);
                  setMostrarListaRefacciones(true);
                }}
                onFocus={() => setMostrarListaRefacciones(true)}
                onBlur={() => setTimeout(() => setMostrarListaRefacciones(false), 200)}
                placeholder="Buscar o seleccionar refacción..."
                autoComplete="off"
              />
              {mostrarListaRefacciones && refaccionesSugeridas.length > 0 && (
                <ul className="mant-autocomplete-list">
                  {refaccionesSugeridas.map((r) => (
                    <li
                      key={r.id}
                      className="mant-autocomplete-item"
                      onClick={() => {
                        actualizarCampo("buscadorRefaccion", r.nombre);
                        setMostrarListaRefacciones(false);
                      }}
                    >
                      {r.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </label>
          )}

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

          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="">Todos los tipos</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
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
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Falla / Tarea</th>
              <th>Técnico</th>
              <th>Tiempo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ticketsPagina.map((t) => (
              <tr key={t.id}>
                <td>{t.nombreMaquina}</td>
                <td>{t.nombreTipoMantenimiento || "—"}</td>
                <td>{t.fecha}</td>
                <td>{t.falla}</td>
                <td>{t.nombreTecnico || t.tecnico || "—"}</td>
                <td>{formatearTiempo(t.tiempoInvertidoMinutos)}</td>
                <td>
                  <button type="button" onClick={() => manejarEliminar(t.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {ticketsFiltrados.length === 0 && !cargando && (
              <tr>
                <td colSpan={9} className="mant-table__vacio">
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

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
