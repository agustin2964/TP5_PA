import { CAMPOS } from '../campos.js'

/**
 * TareaForm — el formulario de los 12 campos.
 *
 * Es un componente "tonto" a proposito: no tiene estado propio ni hace fetch.
 * Solo dibuja y avisa. El estado y las llamadas viven en App.
 *
 * Se le pasa:
 *   form, setForm  -> el objeto con los 12 valores
 *   onGuardar      -> la funcion a llamar al enviar
 *   editando       -> bool, para cambiar el texto del boton
 *   onCancelar     -> para abandonar la edicion
 *   error          -> mensaje de error, o null
 */
export default function TareaForm({
  form,
  setForm,
  onGuardar,
  editando,
  onCancelar,
  error,
}) {
  /**
   * Un solo handler para los 12 campos.
   *
   * El name del input nos dice qué campo es, asi que no hace falta 12
   * funciones distintas. El spread copia el objeto viejo y el [name] pisa
   * solo la propiedad que cambio.
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((anterior) => ({ ...anterior, [name]: value }))
  }

  return (
    <section className="panel">
      <h2>{editando ? 'Editando tarea' : 'Nueva tarea'}</h2>

      <form onSubmit={onGuardar} className="form-grid">
        {CAMPOS.map((campo) => {
          // La fecha de cierre solo tiene sentido si la tarea esta finalizada.
          // Es "estado derivado", no otro estado que mantener sincronizado.
          const bloqueado =
            campo.name === 'fechaCierre' && form.estado !== 'Finalizada'

          return (
            <label
              key={campo.name}
              className={campo.type === 'textarea' ? 'ancho' : ''}
            >
              <span className="etiqueta">
                {campo.label}
                {campo.required && <em> *</em>}
              </span>

              {campo.type === 'select' ? (
                <select
                  name={campo.name}
                  value={form[campo.name] ?? ''}
                  onChange={handleChange}
                >
                  {campo.options.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>
              ) : campo.type === 'textarea' ? (
                <textarea
                  name={campo.name}
                  rows={3}
                  value={form[campo.name] ?? ''}
                  onChange={handleChange}
                />
              ) : (
                <input
                  type={campo.type}
                  name={campo.name}
                  min={campo.min}
                  max={campo.max}
                  value={form[campo.name] ?? ''}
                  onChange={handleChange}
                  disabled={bloqueado || campo.soloLectura}
                  placeholder={
                    bloqueado ? 'Se completa al finalizar' : ''
                  }
                />
              )}
            </label>
          )
        })}

        {error && <p className="error">{error}</p>}

        <div className="acciones-form ancho">
          <button type="submit" className="primario">
            {editando ? 'Guardar cambios' : 'Crear tarea'}
          </button>
          {editando && (
            <button type="button" onClick={onCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  )
}