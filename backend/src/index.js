import 'dotenv/config'
import express from 'express'
import { router as tareasRouter } from './routes/tareas.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/tareas', tareasRouter)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message })
})

app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`))