import { Router } from 'express'
import { pool } from '../db.js'

export const router = Router()

/**
 * CONTRATO DE LA API
 * -------------------
 * Postgres usa snake_case (nombre_proyecto) y JavaScript usa camelCase
 * (nombreProyecto). Sin esto el frontend recibe una cosa y espera otra, y el
 * formulario nunca se llena al editar.
 *
 * Con estos alias la API habla SIEMPRE camelCase: es lo que acepta en los
 * cuerpos (b.nombreProyecto) y lo que devuelve. Un solo idioma, un contrato.
 *
 * Las comillas en "nombreProyecto" son obligatorias: sin ellas PostgreSQL
 * pasa el alias a minúsculas y deja de funcionar.
 */
const CAMPOS = `
  id,
  nombre_proyecto   AS "nombreProyecto",
  tipo_actividad   AS "tipoActividad",
  estado,
  resumen,
  descripcion,
  prioridad,
  informador,
  persona_asignada AS "personaAsignada",
  precondicion,
  fecha_creacion   AS "fechaCreacion",
  fecha_cierre     AS "fechaCierre",
  sprint
`

// GET /api/tareas — listar todas
router.get('/', async (req, res) => {
  const { rows } = await pool.query(`SELECT ${CAMPOS} FROM tareas ORDER BY id DESC`)
  res.json(rows)
})

// GET /api/tareas/:id — traer una
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query(`SELECT ${CAMPOS} FROM tareas WHERE id = $1`, [req.params.id])
  if (rows.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' })
  res.json(rows[0])
})

// POST /api/tareas — crear
router.post('/', async (req, res) => {
  const b = req.body
  const { rows } = await pool.query(
    `INSERT INTO tareas
       (nombre_proyecto, tipo_actividad, estado, resumen, descripcion,
        prioridad, informador, persona_asignada, precondicion,
        fecha_creacion, fecha_cierre, sprint)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10::date, CURRENT_DATE),$11::date,$12::int)
     RETURNING ${CAMPOS}`,
    [
      b.nombreProyecto, b.tipoActividad, b.estado || 'Pendiente', b.resumen,
      b.descripcion, b.prioridad || 'Media', b.informador, b.personaAsignada,
      b.precondicion || null, b.fechaCreacion || null, b.fechaCierre || null,
      b.sprint ? Number(b.sprint) : null,
    ],
  )
  res.status(201).json(rows[0])
})

// PUT /api/tareas/:id — reemplazar
router.put('/:id', async (req, res) => {
  const b = req.body
  const { rows } = await pool.query(
    `UPDATE tareas SET
       nombre_proyecto=$1, tipo_actividad=$2, estado=$3, resumen=$4,
       descripcion=$5, prioridad=$6, informador=$7, persona_asignada=$8,
       precondicion=$9, fecha_cierre=$10, sprint=$11
     WHERE id=$12
     RETURNING ${CAMPOS}`,
    [
      b.nombreProyecto, b.tipoActividad, b.estado, b.resumen, b.descripcion,
      b.prioridad, b.informador, b.personaAsignada, b.precondicion || null,
      b.fechaCierre || null, b.sprint ? Number(b.sprint) : null,
      req.params.id,
    ],
  )
  if (rows.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' })
  res.json(rows[0])
})

// PATCH /api/tareas/:id/finalizar — la acción "Finalizar"
router.patch('/:id/finalizar', async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE tareas
     SET estado = 'Finalizada', fecha_cierre = COALESCE(fecha_cierre, CURRENT_DATE)
     WHERE id = $1 AND estado <> 'Finalizada'
     RETURNING ${CAMPOS}`,
    [req.params.id],
  )
  if (rows.length === 0) {
    return res.status(409).json({ error: 'La tarea no existe o ya está finalizada' })
  }
  res.json(rows[0])
})

// DELETE /api/tareas/:id — borrar
router.delete('/:id', async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM tareas WHERE id = $1', [req.params.id])
  if (rowCount === 0) return res.status(404).json({ error: 'Tarea no encontrada' })
  res.status(204).end()
})