import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [healthData, setHealthData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch health data including database status
    axios.get('/api/health')
      .then(response => {
        setHealthData(response.data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Erro ao conectar com o backend:', error)
        setError('Erro ao conectar com o servidor')
        setLoading(false)
      })
  }, [])

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${hours}h ${minutes}m ${secs}s`
  }

  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>DX01 - Fullstack Application</h1>
          <p>Carregando...</p>
        </header>
      </div>
    )
  }

  if (error) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>DX01 - Fullstack Application</h1>
          <div className="card error">
            <p>❌ {error}</p>
          </div>
        </header>
      </div>
    )
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 DX01 - Fullstack Application</h1>
        
        <div className="card">
          <h2>✅ Status do Servidor</h2>
          <p><strong>Mensagem:</strong> {healthData.message}</p>
          <p><strong>Uptime:</strong> {formatUptime(healthData.uptime)}</p>
          <p><strong>Timestamp:</strong> {new Date(healthData.timestamp).toLocaleString('pt-BR')}</p>
        </div>

        {healthData.database && (
          <div className={`card ${healthData.database.connected ? 'success' : 'error'}`}>
            <h2>🗄️ Status do Banco de Dados</h2>
            {healthData.database.connected ? (
              <>
                <p>✅ <strong>Conexão:</strong> Conectado</p>
                <p><strong>Versão:</strong> {healthData.database.version}</p>
                <p><strong>Pool Size:</strong> {healthData.database.poolSize}</p>
                <p><strong>Conexões Idle:</strong> {healthData.database.idleConnections}</p>
                <p><strong>Requests Aguardando:</strong> {healthData.database.waitingRequests}</p>
              </>
            ) : (
              <>
                <p>❌ <strong>Conexão:</strong> Desconectado</p>
                {healthData.database.error && (
                  <p><strong>Erro:</strong> {healthData.database.error}</p>
                )}
              </>
            )}
          </div>
        )}

        {healthData.stats && (
          <div className="card stats">
            <h2>📊 Estatísticas</h2>
            <p><strong>Total de Visitas:</strong> {healthData.stats.totalVisits}</p>
            <p><strong>Visitas (24h):</strong> {healthData.stats.visitsLast24h}</p>
            <p><strong>Usuários Cadastrados:</strong> {healthData.stats.totalUsers}</p>
          </div>
        )}

        <p className="read-the-docs">
          React + Node.js + Express + PostgreSQL + AWS RDS
        </p>
      </header>
    </div>
  )
}

export default App
