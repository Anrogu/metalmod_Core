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

const FORM_VACIO = { nombre: "", descripcion: "", idMarca: "", idModelo: "" };
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
  const [pagina, setPagina] = useState(0);

  const totalPaginas = Math.max(1, Math.ceil(maquinas.length / MAQUINAS_POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas - 1);
  const maquinasPagina = maquinas.slice(
    paginaSegura * MAQUINAS_POR_PAGINA,
    paginaSegura * MAQUINAS_POR_PAGINA + MAQUINAS_POR_PAGINA
  );

  useEffect(() => {
    cargarTodo();
  }, []);

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

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function iniciarEdicion(maquina) {
    setEditandoId(maquina.id);
    setForm({
      nombre: maquina.nombre,
      descripcion: maquina.descripcion || "",
      idMarca: maquina.idMarca || "",
      idModelo: maquina.idModelo || "",
    });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setForm(FORM_VACIO);
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError("");

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      idMarca: form.idMarca ? Number(form.idMarca) : null,
      idModelo: form.idModelo ? Number(form.idModelo) : null,
    };

    try {
      if (editandoId) {
        await actualizarMaquina(editandoId, payload);
      } else {
        await crearMaquina(payload);
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

  async function manejarNuevaMarca() {
    const nombre = window.prompt("Nombre de la nueva marca:");
    if (!nombre || !nombre.trim()) return;
    try {
      const marca = await crearMarca(nombre.trim());
      setMarcas((prev) => [...prev, marca]);
      setForm((prev) => ({ ...prev, idMarca: marca.id }));
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
      setForm((prev) => ({ ...prev, idModelo: modelo.id }));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="maquinas-page">
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
              <select
                value={form.idMarca}
                onChange={(e) => actualizarCampo("idMarca", e.target.value)}
              >
                <option value="">Sin marca</option>
                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
              <button type="button" onClick={manejarNuevaMarca}>+ nueva</button>
            </div>
          </label>

          <label>
            Modelo
            <div className="maquinas-form__select-row">
              <select
                value={form.idModelo}
                onChange={(e) => actualizarCampo("idModelo", e.target.value)}
              >
                <option value="">Sin modelo</option>
                {modelos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
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
          Máquinas registradas {cargando ? "(cargando…)" : `(${maquinas.length})`}
        </span>

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
            {maquinas.length === 0 && !cargando && (
              <tr>
                <td colSpan={5} className="maquinas-table__vacio">
                  No hay máquinas registradas todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {maquinas.length > MAQUINAS_POR_PAGINA && (
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
    </div>
  );
}
