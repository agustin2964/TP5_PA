CREATE TYPE tipo_actividad AS ENUM (
  'Análisis', 'Diseño', 'Desarrollo', 'Testing',
  'Documentación', 'Corrección de errores'
);

CREATE TYPE estado_tarea AS ENUM ('Pendiente', 'En progreso', 'Finalizada');

CREATE TYPE prioridad_tarea AS ENUM ('Baja', 'Media', 'Alta', 'Crítica');

CREATE TABLE tareas (
  id               SERIAL PRIMARY KEY,
  nombre_proyecto  VARCHAR(120)  NOT NULL,
  tipo_actividad   tipo_actividad NOT NULL,
  estado           estado_tarea   NOT NULL DEFAULT 'Pendiente',
  resumen          VARCHAR(200)  NOT NULL,
  descripcion      TEXT           NOT NULL,
  prioridad        prioridad_tarea NOT NULL DEFAULT 'Media',
  informador       VARCHAR(120)  NOT NULL,
  persona_asignada VARCHAR(120)  NOT NULL,
  precondicion     TEXT,
  fecha_creacion   DATE           NOT NULL DEFAULT CURRENT_DATE,
  fecha_cierre     DATE,
  sprint           INT,

  CONSTRAINT check_cierre_consistente
    CHECK (estado <> 'Finalizada' OR fecha_cierre IS NOT NULL),

  CONSTRAINT check_sprint_positivo
    CHECK (sprint IS NULL OR sprint > 0)
);

CREATE INDEX idx_tareas_estado ON tareas(estado);