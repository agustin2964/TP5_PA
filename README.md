# TP5 — Gestor de Tareas

Aplicación web full-stack para administrar tareas de proyectos de software.
Formulario con 12 campos, listado, y las acciones de **editar**, **eliminar** y
**finalizar**. Los datos persisten en PostgreSQL.

---

## Stack

| Capa | Tecnología | Rol |
|---|---|---|
| Frontend | React 19 + Vite 8 | Formulario y listado |
| Backend | Node.js 22 + Express 5 | API REST |
| Base de datos | PostgreSQL 17 | Persistencia |
| Proxy | Nginx | Sirve el frontend y reenvía `/api` al backend |
| Contenedores | Docker + Docker Compose | Ejecuta los 3 componentes |

---

## Cómo levantar

```bash
# 1. Crear el archivo de variables de entorno
cp .env.example .env

# 2. Construir las imágenes y levantar todo
docker compose up -d --build

# 3. Abrir la aplicación
```

La aplicación queda en **http://localhost**.

Para verla de nuevo más tarde:

```bash
docker compose up -d
```

Para apagarla:

```bash
docker compose down
```

Para apagarla **y borrar los datos**:

```bash
docker compose down -v
```

---

## Variables de entorno

El proyecto lee estas variables del archivo `.env` en la raíz.

| Variable | Default | Para qué |
|---|---|---|
| `POSTGRES_USER` | `admin` | Usuario de la base de datos |
| `POSTGRES_PASSWORD` | `admin123` | Contraseña de la base de datos |
| `POSTGRES_DB` | `taskmanager` | Nombre de la base de datos |

---

## Estructura

```
tp5/
├── docker-compose.yml       los 3 servicios
├── .env                     credenciales de la base
├── db/
│   └── init.sql             esquema de la base (tipos ENUM + tabla tareas)
├── backend/
│   ├── Dockerfile
│   └── src/
│       ├── index.js         servidor Express
│       ├── db.js            conexión a PostgreSQL
│       └── routes/
│           └── tareas.js    las 6 rutas
└── frontend/
    ├── Dockerfile           build multi-stage
    ├── nginx.conf           proxy /api hacia el backend
    └── src/
        ├── App.jsx          estado + lógica de la app
        ├── api.js           llamadas al backend
        ├── campos.js        definición de los 12 campos
        └── components/
            ├── TareaForm.jsx
            └── TareaList.jsx
```

---

## Endpoints de la API

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| `GET` | `/api/health` | Estado del servidor | `200` |
| `GET` | `/api/tareas` | Listar todas | `200` |
| `GET` | `/api/tareas/:id` | Obtener una | `200` / `404` |
| `POST` | `/api/tareas` | Crear | `201` / `400` |
| `PUT` | `/api/tareas/:id` | Actualizar | `200` / `404` |
| `PATCH` | `/api/tareas/:id/finalizar` | Marcar como finalizada | `200` / `409` |
| `DELETE` | `/api/tareas/:id` | Eliminar | `204` / `404` |

### `409 Conflict` en el finalizado

`PATCH /api/tareas/:id/finalizar` devuelve **409** si la tarea ya estaba
finalizada. La regla de negocio se aplica en la base con
`WHERE id = $1 AND estado <> 'Finalizada'`, no en el frontend.

---

## Modelo de datos

### Tipos ENUM

Restringen los valores a los que el enunciado permite:

- `tipo_actividad`: Análisis, Diseño, Desarrollo, Testing, Documentación,
  Corrección de errores
- `estado_tarea`: Pendiente, En progreso, Finalizada
- `prioridad_tarea`: Baja, Media, Alta, Crítica

### Tabla `tareas`

```sql
CREATE TABLE tareas (
  id               SERIAL PRIMARY KEY,
  nombre_proyecto  VARCHAR(120)   NOT NULL,
  tipo_actividad   tipo_actividad NOT NULL,
  estado           estado_tarea   NOT NULL DEFAULT 'Pendiente',
  resumen          VARCHAR(200)   NOT NULL,
  descripcion      TEXT           NOT NULL,
  prioridad        prioridad_tarea NOT NULL DEFAULT 'Media',
  informador       VARCHAR(120)   NOT NULL,
  persona_asignada VARCHAR(120)   NOT NULL,
  precondicion     TEXT,
  fecha_creacion   DATE           NOT NULL DEFAULT CURRENT_DATE,
  fecha_cierre     DATE,
  sprint           INT,

  -- Si la tarea está Finalizada, tiene que tener fecha de cierre.
  CONSTRAINT check_cierre_consistente
    CHECK (estado <> 'Finalizada' OR fecha_cierre IS NOT NULL),

  CONSTRAINT check_sprint_positivo
    CHECK (sprint IS NULL OR sprint > 0)
);

CREATE INDEX idx_tareas_estado ON tareas(estado);
```

**Decisiones del modelo:**

| Decisión | Por qué |
|---|---|
| `SERIAL PRIMARY KEY` | El `id` lo genera la base, nunca el cliente. |
| `DEFAULT CURRENT_DATE` | La fecha de creación es dato del servidor, no del formulario. |
| `ENUM` en los 3 campos cerrados | Impide valores inválidos como `"urgente"` o `"finalisada"`. |
| `VARCHAR(n)` en vez de `TEXT` | Documenta el largo esperado y fuerza a ser conciso. |
| `CHECK` de fecha de cierre | La regla de negocio queda garantizada por la base. |
| Índice por `estado` | Es la columna por la que más se filtra. |

---

## Contrato de la API

PostgreSQL usa `snake_case` y JavaScript usa `camelCase`. Para que la API
hable un solo idioma, las consultas usan alias:

```sql
nombre_proyecto AS "nombreProyecto"
```

La API **acepta y devuelve `camelCase`**. Las columnas de la base siguen
siendo `snake_case`.

---

## Desarrollo sin Docker

Para trabajar con recarga automática:

```bash
# 1. Solo la base de datos
docker compose up -d db

# 2. Backend (puerto 3000)
cd backend
npm install
npm run dev

# 3. Frontend (puerto 5173), en otra terminal
cd frontend
npm install
npm run dev
```

En desarrollo el proxy lo hace **Vite** (`frontend/vite.config.js`) y en
producción lo hace **Nginx** (`frontend/nginx.conf`). Los dos reenvían `/api`
al backend, así que nunca hay problemas de CORS.

### Por qué el puerto 5433

El `5432` del host suele estar ocupado por el PostgreSQL nativo de Windows. La
base se publica en el `5433` de la máquina pero escucha en el `5432` dentro del
contenedor. Por eso `backend/.env` dice `DB_PORT=5433` cuando corre fuera de
Docker, y el `docker-compose.yml` dice `DB_PORT: 5432` cuando corre dentro.

---

## Servicios

| Servicio | Puerto (host) | Puerto (contenedor) | Imagen |
|---|---|---|---|
| `db` | 5433 | 5432 | `postgres:17-alpine` |
| `backend` | 3000 | 3000 | `node:22-alpine` |
| `frontend` | 80 | 80 | `nginx:alpine` |

`backend` espera a que `db` esté **healthy** y `frontend` espera a que
`backend` esté **healthy** (`depends_on: condition: service_healthy`).

El frontend se construye en **dos etapas**: Node compila el proyecto y Nginx
sirve los archivos estáticos. La imagen final no incluye Node.