import pg from 'pg'

pg.types.setTypeParser(1082, (valor) => valor)
const { Pool } = pg

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

pool.on('error', (err) => console.error('Error inesperado de Postgres:', err))