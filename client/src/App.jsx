import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [message, setMessage] = useState('Carregando...')
  const [count, setCount] = useState(0)

  useEffect(() => {
    axios.get('/api/health')
      .then(response => {
        setMessage(response.data.message)
      })
      .catch(error => {
        console.error('Erro ao conectar com o backend:', error)
        setMessage('Erro ao conectar com o servidor')
      })
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>DX01 - Fullstack Application</h1>
        <div className="card">
          <p>Mensagem do servidor: <strong>{message}</strong></p>
        </div>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            Contador: {count}
          </button>
        </div>
        <p className="read-the-docs">
          Aplicação React + Node.js + Express
        </p>
      </header>
    </div>
  )
}

export default App
