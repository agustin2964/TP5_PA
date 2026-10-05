import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// createRoot engancha React al <div id="root"> del index.html. A partir de
// aca, React dibuja todo lo que App.jsx devuelva.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)