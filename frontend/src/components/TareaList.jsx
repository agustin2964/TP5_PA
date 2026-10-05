/**
 * TareaList — el "Listado de Tareas" del enunciado.
 *
 * Igual que el formulario, no guarda estado ni habla con el servidor.
 * Solo dibuja la lista que le pasan y avisa cuando tocan un botón.
 */
export default function TareaList({
  tareas,
  cargando,
  onEditar,
  onFinalizar,
  onReabrir,
  onEliminar,
}) {
  if (cargando) {
    return <p className="vacio">Cargando tareas...</p>
  }

  if (tareas.length === 0) {
    return (
      <p className="vacio">
        Todavia no hay tareas. Creá la primera con el formulario de al lado.
      </p>
    )
  }

  return (
    <table className="tabla">
      <thead>
        <tr>
          <th>ID</th>
          <th>Proyecto</th>
          <th>Actividad</th>
          <th>Resumen</th>
          <th>Informador</th>
          <th>Prioridad</th>
          <th>Sprint</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {tareas.map((t) => (
          <tr key={t.id}>
            <td>{t.id}</td>
            <td>{t.nombreProyecto}</td>
            <td>{t.tipoActividad}</td>
            <td className="resumen">{t.resumen}</td>
            <td>{t.informador}</td>
            <td>
              <span className={`badge prio-${(t.prioridad || '').toLowerCase()}`}>
                {t.prioridad}
              </span>
            </td>
            <td>{t.sprint ?? '-'}</td>
            <td>
              <span className={`badge estado-${slug(t.estado)}`}>{t.estado}</span>
              {t.fechaCierre && (
                <small className="fecha">cierre: {t.fechaCierre}</small>
              )}
            </td>

            {/* Las tres acciones que pide el enunciado. */}
            <td className="acciones">
              <button onClick={() => onEditar(t)}>Editar</button>

              {t.estado === 'Finalizada' ? (
                <button onClick={() => onReabrir(t.id)}>Reabrir</button>
              ) : (
                <button
                  className="ok"
                  onClick={() => onFinalizar(t.id)}
                >
                  Finalizar
                </button>
              )}

              <button className="peligro" onClick={() => onEliminar(t.id)}>
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** "En progreso" -> "en-progreso", para poder usarlo en el className. */
function slug(texto) {
  return texto.toLowerCase().replace(/\s+/g, '-')
}