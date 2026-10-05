import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,

    // Esta línea es la que hace que todo funcione.
    //
    // El frontend pide a /api/tareas (ruta relativa, mismo origen). Vite
    // intercepta lo que empieza con /api y lo reenvía al backend, que corre
    // en OTRO puerto. El navegador nunca se entera del cambio, asi que
    // nunca hay problemas de CORS.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})