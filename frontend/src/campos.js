/**
 * Los 12 campos del TP, en un solo lugar.
 *
 * El mismo archivo alimenta tres cosas distintas:
 *   1. el formulario (se generan los inputs con un map)
 *   2. las reglas de validación (required)
 *   3. el objeto vacio de una tarea nueva
 *
 * Si el enunciado pide agregar un campo, se agrega SOLO acá.
 */

export const TIPOS_ACTIVIDAD = [
  'Análisis',
  'Diseño',
  'Desarrollo',
  'Testing',
  'Documentación',
  'Corrección de errores',
]

export const ESTADOS = ['Pendiente', 'En progreso', 'Finalizada']

export const PRIORIDADES = ['Baja', 'Media', 'Alta', 'Crítica']

export const CAMPOS = [
  { name: 'nombreProyecto', label: 'Nombre del Proyecto', type: 'text', required: true },
  { name: 'tipoActividad', label: 'Tipo de Actividad', type: 'select', options: TIPOS_ACTIVIDAD, required: true },
  { name: 'estado', label: 'Estado', type: 'select', options: ESTADOS, required: true },
  { name: 'resumen', label: 'Resumen', type: 'text', required: true },
  { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true },
  { name: 'prioridad', label: 'Prioridad', type: 'select', options: PRIORIDADES, required: true },
  { name: 'informador', label: 'Informador', type: 'text', required: true },
  { name: 'personaAsignada', label: 'Persona asignada', type: 'text', required: true },
  { name: 'precondicion', label: 'Precondición', type: 'textarea' },
  { name: 'fechaCreacion', label: 'Fecha de Creación', type: 'date', soloLectura: true },
  { name: 'fechaCierre', label: 'Fecha de Cierre', type: 'date' },
  { name: 'sprint', label: 'Sprint', type: 'number', min: 1, max: 99 },
]

/**
 * La fecha de hoy en formato YYYY-MM-DD, que es lo que espera un
 * <input type="date">.
 *
 * Ojo: new Date().toISOString() devuelve la fecha en UTC, que puede ser un
 * dia distinto al tuyo. Por eso se arma el string a mano con la fecha local.
 *
 * Ojo tambien: la base le pone la fecha de creacion sola (DEFAULT CURRENT_DATE).
 * Este valor es solo para que el campo no aparezca vacio.
 */
export function hoy() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

/** Una tarea en blanco, para el formulario nuevo. */
export function tareaVacia() {
  return {
    nombreProyecto: '',
    tipoActividad: 'Desarrollo',
    estado: 'Pendiente',
    resumen: '',
    descripcion: '',
    prioridad: 'Media',
    informador: '',
    personaAsignada: '',
    precondicion: '',
    fechaCreacion: hoy(),
    fechaCierre: '',
    sprint: '',
  }
}

/**
 * Valida el formulario. Devuelve un texto con el error, o null si todo bien.
 *
 * Nota: el HTML ya obliga a llenar los campos con required, pero eso lo
 * valida el navegador, no nuestra logica. Esta funcion es la que le permite
 * mostrar el mensaje de error adentro de la pagina.
 */
export function validar(tarea) {
  const vacio = (campo) => !String(tarea[campo] ?? '').trim()

  if (vacio('nombreProyecto')) return 'El Nombre del Proyecto es obligatorio.'
  if (vacio('resumen')) return 'El Resumen es obligatorio.'
  if (vacio('descripcion')) return 'La Descripción es obligatoria.'
  if (vacio('informador')) return 'El Informador es obligatorio.'
  if (vacio('personaAsignada')) return 'La Persona asignada es obligatoria.'

  if (tarea.sprint !== '' && tarea.sprint !== null) {
    const n = Number(tarea.sprint)
    if (!Number.isInteger(n) || n < 1 || n > 99) return 'El Sprint debe ser un número entre 1 y 99.'
  }

  return null
}