import React from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <Header />

      <div className="page-content" style={{ gap: 20 }}>
        <h1 className="page-title" style={{ fontSize: 52, marginBottom: 12 }}>
          GastroTech
        </h1>

        <p style={{ color: 'rgba(254,254,253,0.6)', fontSize: 15, marginBottom: 20 }}>
          Reserve sua mesa com facilidade
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 320 }}>
          <button className="btn btn-gold" style={{ fontSize: 17, padding: '16px 0' }} onClick={() => navigate('/reserva')}>
            🍽 Reservar
          </button>
          <button className="btn btn-gold" style={{ fontSize: 17, padding: '16px 0' }} onClick={() => navigate('/minhas-reservas')}>
            📋 Minhas Reservas
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
