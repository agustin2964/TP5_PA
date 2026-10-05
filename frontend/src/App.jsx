import { useEffect, useState } from 'react'
import { api } from './api'
import { tareaVacia, validar } from './campos.js'
import TareaForm from './components/TareaForm.jsx'
import TareaList from './components/TareaList.jsx'

/**
 * App — el unico componente con estado. Es el "dueño" de los datos.
 *
 * Los componentes hijos no guardan nada: dibujan lo que les pasan y avisan
 * cuando pasa algo. Toda la logica vive aca.
 */
export default function App() {
  // ── Los 4 estados que sostienen la app ──────────────────────────
  const [tareas, setTareas] = useState([]) // el listado
  const [form, setForm] = useState(tareaVacia()) // los 12 campos
  const [editandoId, setEditandoId] = useState(null) // cual se esta editando
  const [cargando, setCargando] = useState(true) // pantalla de espera
  const [error, setError] = useState(null) // mensaje de error
  const [guardando, setGuardando] = useState(false) // evita doble submit

  /**
   * Cargar las tareas al montar el componente.
   *
   * El [] del final es lo que hace que corra UNA sola vez. Sin los corchetes
   * correria en cada renderizado y le pegaria 500 peticiones al backend.
   */
  useEffect(() => {
    api
      .listar()
      .then(setTareas)
      .catch((e) => setError(`No se pudieron cargar las tareas: ${e.message}`))
      .finally(() => setCargando(false))
  }, [])

  /** Refresca el listado. Se llama despues de cada operacion. */
  const cargar = async () => {
    setTareas(await api.listar())
  }

  // ── Crear / editar ───────────────────────────────────────────────

  const guardar = async (e) => {
    e.preventDefault() // sin esto, la pagina se recarga y se pierde el estado

    const problema = validar(form)
    if (problema) return setError(problema)

    setGuardando(true)
    setError(null)

    try {
      // Normalizamos antes de mandar: sprint es numero (o null), y la fecha
      // de cierre solo existe si la tarea esta finalizada.
      const datos = {
        ...form,
        sprint: form.sprint === '' ? null : Number(form.sprint),
        fechaCierre:
          form.estado === 'Finalizada' ? form.fechaCierre || null : null,
      }

      if (editandoId) await api.actualizar(editandoId, datos)
      else await api.crear(datos)

      await cargar() // volvemos a leer: la base es la fuente de verdad
      limpiarFormulario()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const limpiarFormulario = () => {
    setForm(tareaVacia())
    setEditandoId(null)
    setError(null)
  }

  const editar = (t) => {
    // tareaVacia() primero garantiza los 12 campos aunque la tarea venga
    // incompleta desde la base.
    setForm({ ...tareaVacia(), ...t })
    setEditandoId(t.id)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Las otras dos acciones ────────────────────────────────────────

  const finalizar = async (id) => {
    setError(null)
    try {
      await api.finalizar(id)
      await cargar()
    } catch (err) {
      // Si el backend responde 409, ya estaba finalizada.
      setError(err.message)
    }
  }

  const reabrir = async (id) => {
    setError(null)
    try {
      // No hay endpoint para reabrir en el enunciado, asi que usamos PUT
      // con el estado y la fecha de cierre cambiados.
      const t = tareas.find((x) => x.id === id)
      await api.actualizar(id, { ...t, estado: 'En progreso', fechaCierre: null })
      await cargar()
    } catch (err) {
      setError(err.message)
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return
    setError(null)
    try {
      await api.eliminar(id)
      if (editandoId === id) limpiarFormulario()
      await cargar()
    } catch (err) {
      setError(err.message)
    }
  }

  // ── Lo que se ve ─────────────────────────────────────────────────

  return (
    <div className="app">
      <header>
        <h1>Gestor de Tareas</h1>
        <p className="sub">
          {tareas.length} tarea{tareas.length === 1 ? '' : 's'} ·{' '}
          {tareas.filter((t) => t.estado === 'Finalizada').length} finalizada
          {tareas.filter((t) => t.estado === 'Finalizada').length === 1 ? '' : 's'}
        </p>
      </header>

      <div className="layout">
        <TareaForm
          form={form}
          setForm={setForm}
          onGuardar={guardar}
          editando={editandoId !== null}
          onCancelar={limpiarFormulario}
          error={guardando ? null : error}
        />

        <section className="panel">
          <h2>Listado de Tareas</h2>
          {error && <p className="error">{error}</p>}
          <TareaList
            tareas={tareas}
            cargando={cargando}
            onEditar={editar}
            onFinalizar={finalizar}
            onReabrir={reabrir}
            onEliminar={eliminar}
          />
        </section>
      </div>
    </div>
  )
}