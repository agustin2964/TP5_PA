/**
 * api.js — todas las llamadas al backend, en un solo archivo.
 *
 * Por que separarlo: los componentes no deberian saber CÓMO se habla con el
 * servidor, solo QUÉ se le pide. Si manana la API cambia de puerto o cambia la
 * libreria de HTTP, se toca este archivo y ningun otro.
 *
 * La URL es relativa ('/api/...') a proposito. Vite (en desarrollo) y Nginx
 * (en produccion) se encargan de reenviar /api al backend. Por eso no hay
 * problemas de CORS y nunca hay que escribir http://localhost:3000.
 */

const BASE = '/api/tareas'

/**
 * El nucleo: hace el fetch, verifica que la respuesta sea correcta y la
 * convierte a objeto.
 *
 * Los tres pasos que siempre hay que dar, en este orden:
 *   1. pedir   -> await fetch(...)
 *   2. verificar -> if (!res.ok) throw ...
 *   3. convertir -> await res.json()
 *
 * El paso 2 es el que se olvida. fetch() NO falla cuando el servidor devuelve
 * 404 o 500: solo falla si no hay conexion. Sin res.ok, un error del backend
 * llega a tu codigo como undefined y no te enteras.
 */
async function pedir(url, opciones = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  })

  if (!res.ok) {
    // El backend manda { error: "..." }. Intentamos leerlo para mostrarlo.
    let detalle = ''
    try {
      detalle = (await res.json()).error
    } catch {
      detalle = await res.text()
    }
    throw new Error(detalle || `Error ${res.status}`)
  }

  // 204 (DELETE) no tiene cuerpo, y res.json() fallaria.
  if (res.status === 204) return null

  return res.json()
}

export const api = {
  // GET — listar todas
  listar: () => pedir(''),

  // POST — crear. JSON.stringify es obligatorio: fetch no sabe convertir
  // objetos a JSON por su cuenta y los mandaria como "[object Object]".
  crear: (tarea) =>
    pedir('', { method: 'POST', body: JSON.stringify(tarea) }),

  // PUT — reemplazar
  actualizar: (id, tarea) =>
    pedir(`/${id}`, { method: 'PUT', body: JSON.stringify(tarea) }),

  // DELETE — borrar
  eliminar: (id) => pedir(`/${id}`, { method: 'DELETE' }),

  // PATCH — finalizar
  finalizar: (id) => pedir(`/${id}/finalizar`, { method: 'PATCH' }),
}