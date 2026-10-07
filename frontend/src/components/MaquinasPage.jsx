import { useEffect, useState } from "react";
import {
  obtenerMaquinas,
  crearMaquina,
  actualizarMaquina,
  cambiarEstadoMaquina,
  obtenerMarcas,
  crearMarca,
  obtenerModelos,
  crearModelo,
} from "../api/maquinasApi";
import "./MaquinasPage.css";

const FORM_VACIO = { nombre: "", descripcion: "", buscadorMarca: "", buscadorModelo: "" };
const MAQUINAS_POR_PAGINA = 10;

const ESTADOS = [
  { codigo: "activa", label: "Activa" },
  { codigo: "mantenimiento", label: "Mantenimiento" },
  { codigo: "baja", label: "Baja" },
];

export default function MaquinasPage() {
  const [maquinas, setMaquinas] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(false);
  
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState(""); 
  
  const [busqueda, setBusqueda] = useState("");         
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const [pagina, setPagina] = useState(0);

  // Estados para los menús desplegables
  const [mostrarListaMarcas, setMostrarListaMarcas] = useState(false);
  const [mostrarListaModelos, setMostrarListaModelos] = useState(false);

  useEffect(() => {
    cargarTodo();
  }, []);

  useEffect(() => {
    setPagina(0);
  }, [busqueda, filtroMarca, filtroEstado]);

  async function cargarTodo() {
    setCargando(true);
    setError("");
    try {
      const [listaMaquinas, listaMarcas, listaModelos] = await Promise.all([
        obtenerMaquinas(),
        obtenerMarcas(),
        obtenerModelos(),
      ]);
      setMaquinas(listaMaquinas);
      setMarcas(listaMarcas);
      setModelos(listaModelos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  const maquinasFiltradas = maquinas.filter((m) => {
    const coincideTexto = !busqueda || (
      (m.nombre && m.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
      (m.descripcion && m.descripcion.toLowerCase().includes(busqueda.toLowerCase())) ||
      (m.nombreModelo && m.nombreModelo.toLowerCase().includes(busqueda.toLowerCase()))
    );

    const coincideMarca = !filtroMarca || m.idMarca === Number(filtroMarca);
    const coincideEstado = !filtroEstado || m.codigoEstado === filtroEstado;

    return coincideTexto && coincideMarca && coincideEstado;
  });

  const totalPaginas = Math.max(1, Math.ceil(maquinasFiltradas.length / MAQUINAS_POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas - 1);
  const maquinasPagina = maquinasFiltradas.slice(
    paginaSegura * MAQUINAS_POR_PAGINA,
    paginaSegura * MAQUINAS_POR_PAGINA + MAQUINAS_POR_PAGINA
  );

  const marcasSugeridas = marcas.filter((m) => 
    m.nombre.toLowerCase().includes((form.buscadorMarca || "").toLowerCase())
  );
  
  const modelosSugeridos = modelos.filter((m) => 
    m.nombre.toLowerCase().includes((form.buscadorModelo || "").toLowerCase())
  );

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function iniciarEdicion(maquina) {
    setEditandoId(maquina.id);
    setForm({
      nombre: maquina.nombre,
      descripcion: maquina.descripcion || "",
      buscadorMarca: maquina.nombreMarca || "",
      buscadorModelo: maquina.nombreModelo || "",
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

    const marcaSeleccionada = marcas.find((m) => m.nombre === form.buscadorMarca);
    const modeloSeleccionado = modelos.find((m) => m.nombre === form.buscadorModelo);
    const nombreNormalizado = form.nombre.trim().toLowerCase();

    const nombreDuplicado = maquinas.some(
  (m) =>
    m.nombre.trim().toLowerCase() === nombreNormalizado &&
    m.id !== editandoId // al editar, no se compara contra sí misma
);

if (nombreDuplicado) {
  setError(`Ya existe una máquina llamada "${form.nombre.trim()}".`);
  return;
}
    if (form.buscadorMarca && !marcaSeleccionada) {
      setError("La marca escrita no existe. Déjala en blanco o elige una válida.");
      return;
    }

    if (form.buscadorModelo && !modeloSeleccionado) {
      setError("El modelo escrito no existe. Déjalo en blanco o elige uno válido.");
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      idMarca: marcaSeleccionada ? marcaSeleccionada.id : null,
      idModelo: modeloSeleccionado ? modeloSeleccionado.id : null,
    };

    try {
      if (editandoId) {
        await actualizarMaquina(editandoId, payload);
        mostrarExito("¡La máquina se actualizó correctamente!");
      } else {
        await crearMaquina(payload);
        mostrarExito("¡Máquina registrada correctamente!");
      }
      cancelarEdicion();
      await cargarTodo();
    } catch (err) {
      setError(err.message);
    }
  }

  async function manejarCambioEstado(id, codigoEstado) {
    setError("");
    try {
      await cambiarEstadoMaquina(id, codigoEstado);
      await cargarTodo();
      mostrarExito("¡El estado de la máquina se actualizó correctamente!");
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
    setFiltroMarca("");
    setFiltroEstado("");
  }

  async function manejarNuevaMarca() {
    const nombre = window.prompt("Nombre de la nueva marca:");
    if (!nombre || !nombre.trim()) return;
    try {
      const marca = await crearMarca(nombre.trim());
      setMarcas((prev) => [...prev, marca]);
      setForm((prev) => ({ ...prev, buscadorMarca: marca.nombre }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function manejarNuevoModelo() {
    const nombre = window.prompt("Nombre del nuevo modelo:");
    if (!nombre || !nombre.trim()) return;
    try {
      const modelo = await crearModelo(nombre.trim());
      setModelos((prev) => [...prev, modelo]);
      setForm((prev) => ({ ...prev, buscadorModelo: modelo.nombre }));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="maquinas-page">
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

      <div className="tick-panel maquinas-form-panel">
        <span className="chart-panel__eyebrow">
          {editandoId ? `Editando máquina #${editandoId}` : "Registrar máquina nueva"}
        </span>

        <form className="maquinas-form" onSubmit={manejarSubmit}>
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

          <label>
            Marca
            <div className="maquinas-form__select-row">
              <div className="maquinas-autocomplete">
                <input
                  type="text"
                  value={form.buscadorMarca}
                  onChange={(e) => {
                    actualizarCampo("buscadorMarca", e.target.value);
                    setMostrarListaMarcas(true);
                  }}
                  onFocus={() => setMostrarListaMarcas(true)}
                  onBlur={() => setTimeout(() => setMostrarListaMarcas(false), 200)}
                  placeholder="Buscar o seleccionar marca..."
                  autoComplete="off"
                />
                {mostrarListaMarcas && marcasSugeridas.length > 0 && (
                  <ul className="maquinas-autocomplete-list">
                    {marcasSugeridas.map((m) => (
                      <li
                        key={m.id}
                        className="maquinas-autocomplete-item"
                        onClick={() => {
                          actualizarCampo("buscadorMarca", m.nombre);
                          setMostrarListaMarcas(false);
                        }}
                      >
                        {m.nombre}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button type="button" onClick={manejarNuevaMarca}>+ nueva</button>
            </div>
          </label>

          <label>
            Modelo
            <div className="maquinas-form__select-row">
              <div className="maquinas-autocomplete">
                <input
                  type="text"
                  value={form.buscadorModelo}
                  onChange={(e) => {
                    actualizarCampo("buscadorModelo", e.target.value);
                    setMostrarListaModelos(true);
                  }}
                  onFocus={() => setMostrarListaModelos(true)}
                  onBlur={() => setTimeout(() => setMostrarListaModelos(false), 200)}
                  placeholder="Buscar o seleccionar modelo..."
                  autoComplete="off"
                />
                {mostrarListaModelos && modelosSugeridos.length > 0 && (
                  <ul className="maquinas-autocomplete-list">
                    {modelosSugeridos.map((m) => (
                      <li
                        key={m.id}
                        className="maquinas-autocomplete-item"
                        onClick={() => {
                          actualizarCampo("buscadorModelo", m.nombre);
                          setMostrarListaModelos(false);
                        }}
                      >
                        {m.nombre}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button type="button" onClick={manejarNuevoModelo}>+ nuevo</button>
            </div>
          </label>

          <div className="maquinas-form__actions">
            <button type="submit" className="maquinas-form__submit">
              {editandoId ? "Guardar cambios" : "Registrar máquina"}
            </button>
            {editandoId && (
              <button type="button" onClick={cancelarEdicion}>
                Cancelar
              </button>
            )}
          </div>

          {error && <p className="maquinas-form__error">{error}</p>}
        </form>
      </div>

      <div className="tick-panel maquinas-list-panel">
        <span className="chart-panel__eyebrow">
          Máquinas registradas {cargando ? "(cargando…)" : `(${maquinasFiltradas.length})`}
        </span>

        <div className="maquinas-filtros">
          <input
            type="text"
            placeholder="Buscar máquina, descripción, modelo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          
          <select 
            value={filtroMarca} 
            onChange={(e) => setFiltroMarca(e.target.value)}
          >
            <option value="">Todas las marcas</option>
            {marcas.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>

          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((estado) => (
              <option key={estado.codigo} value={estado.codigo}>{estado.label}</option>
            ))}
          </select>

          <button 
            type="button" 
            onClick={limpiarFiltros} 
            disabled={!busqueda && !filtroMarca && !filtroEstado}
          >
            Limpiar filtros
          </button>
        </div>

        <table className="maquinas-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {maquinasPagina.map((m) => (
              <tr key={m.id}>
                <td>{m.nombre}</td>
                <td>{m.nombreMarca || "—"}</td>
                <td>{m.nombreModelo || "—"}</td>
                <td>
                  <select
                    value={m.codigoEstado}
                    onChange={(e) => manejarCambioEstado(m.id, e.target.value)}
                    className={`maquinas-table__estado maquinas-table__estado--${m.codigoEstado}`}
                  >
                    {ESTADOS.map((estado) => (
                      <option key={estado.codigo} value={estado.codigo}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button type="button" onClick={() => iniciarEdicion(m)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
            {maquinasFiltradas.length === 0 && !cargando && (
              <tr>
                <td colSpan={5} className="maquinas-table__vacio">
                  No se encontraron máquinas con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {maquinasFiltradas.length > MAQUINAS_POR_PAGINA && (
          <div className="maquinas-carrusel">
            <button
              type="button"
              onClick={irPaginaAnterior}
              disabled={paginaSegura === 0}
            >
              ‹ Anterior
            </button>
            <span className="maquinas-carrusel__indicador">
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
