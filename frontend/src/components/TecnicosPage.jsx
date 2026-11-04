import { useEffect, useState } from "react";
import {
  obtenerTecnicos,
  crearTecnico,
  actualizarTecnico,
  eliminarTecnico,
} from "../api/tecnicosApi";
import "./TecnicosPage.css";

const FORM_VACIO = { nombre: "", activo: true };

export default function TecnicosPage() {
  const [tecnicos, setTecnicos] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      setTecnicos(await obtenerTecnicos());
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  const tecnicosFiltrados = tecnicos.filter((t) => {
    const coincideTexto =
      !busqueda || t.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado =
      !filtroEstado ||
      (filtroEstado === "activos" ? t.activo !== false : t.activo === false);
    return coincideTexto && coincideEstado;
  });

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function iniciarEdicion(tecnico) {
    setEditandoId(tecnico.id);
    setForm({ nombre: tecnico.nombre, activo: tecnico.activo !== false });
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

    const nombre = form.nombre.trim();
    if (!nombre) {
      setError("El nombre del técnico es obligatorio.");
      return;
    }

    const duplicado = tecnicos.some(
      (t) =>
        t.nombre.trim().toLowerCase() === nombre.toLowerCase() &&
        t.id !== editandoId
    );
    if (duplicado) {
      setError(`Ya existe un técnico llamado "${nombre}".`);
      return;
    }

    try {
      if (editandoId) {
        await actualizarTecnico(editandoId, { nombre, activo: form.activo });
        mostrarExito("¡Técnico actualizado correctamente!");
      } else {
        await crearTecnico({ nombre, activo: form.activo });
        mostrarExito("¡Técnico registrado correctamente!");
      }
      cancelarEdicion();
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function manejarActivar(tecnico) {
    setError("");
    try {
      await actualizarTecnico(tecnico.id, { nombre: tecnico.nombre, activo: true });
      await cargar();
      mostrarExito(`Técnico "${tecnico.nombre}" activado.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function manejarDesactivar(tecnico) {
    if (
      !window.confirm(
        `¿Desactivar a "${tecnico.nombre}"? Dejará de aparecer en las gráficas y en nuevos mantenimientos, pero su historial se conserva.`
      )
    ) {
      return;
    }
    setError("");
    try {
      await eliminarTecnico(tecnico.id);
      await cargar();
      mostrarExito(`Técnico "${tecnico.nombre}" desactivado.`);
    } catch (err) {
      setError(err.message);
    }
  }

  const activos = tecnicos.filter((t) => t.activo !== false).length;

  return (
    <div className="tecnicos-page">
      {mensajeExito && (
        <div className="tecnicos-toast">
          <span style={{ fontSize: "1.2rem" }}>✓</span>
          {mensajeExito}
        </div>
      )}

      <div className="tick-panel tecnicos-form-panel">
        <span className="chart-panel__eyebrow">
          {editandoId ? `Editando técnico #${editandoId}` : "Registrar técnico nuevo"}
        </span>

        <form className="tecnicos-form" onSubmit={manejarSubmit}>
          <label>
            Nombre
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => actualizarCampo("nombre", e.target.value)}
              required
              maxLength={150}
              placeholder="Ej. Daniel Zavala"
            />
          </label>

          <label className="tecnicos-form__check">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => actualizarCampo("activo", e.target.checked)}
            />
            Activo (aparece en gráficas y nuevos mantenimientos)
          </label>

          <div className="tecnicos-form__actions">
            <button type="submit" className="tecnicos-form__submit">
              {editandoId ? "Guardar cambios" : "Registrar técnico"}
            </button>
            {editandoId && (
              <button type="button" onClick={cancelarEdicion}>
                Cancelar
              </button>
            )}
          </div>

          {error && <p className="tecnicos-form__error">{error}</p>}
        </form>
      </div>

      <div className="tick-panel tecnicos-list-panel">
        <span className="chart-panel__eyebrow">
          Técnicos registrados{" "}
          {cargando ? "(cargando…)" : `(${activos} activos de ${tecnicos.length})`}
        </span>

        <div className="tecnicos-filtros">
          <input
            type="text"
            placeholder="Buscar técnico..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="activos">Solo activos</option>
            <option value="inactivos">Solo inactivos</option>
          </select>
        </div>

        <table className="tecnicos-table">
          <thead>
            <tr>
              <th>Técnico</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tecnicosFiltrados.map((t) => {
              const activo = t.activo !== false;
              return (
                <tr key={t.id} className={activo ? "" : "tecnicos-table__fila--inactiva"}>
                  <td>{t.nombre}</td>
                  <td>
                    <span
                      className={`tecnicos-table__estado ${
                        activo
                          ? "tecnicos-table__estado--activo"
                          : "tecnicos-table__estado--inactivo"
                      }`}
                    >
                      {activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="tecnicos-table__acciones">
                    <button type="button" onClick={() => iniciarEdicion(t)}>
                      Editar
                    </button>
                    {activo ? (
                      <button type="button" onClick={() => manejarDesactivar(t)}>
                        Desactivar
                      </button>
                    ) : (
                      <button type="button" onClick={() => manejarActivar(t)}>
                        Activar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {tecnicosFiltrados.length === 0 && !cargando && (
              <tr>
                <td colSpan={3} className="tecnicos-table__vacio">
                  No hay técnicos que coincidan con el filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
