import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ConfirmModal, AlertToast } from '../components/Modals'
import QRCode from 'qrcode'

function ReservaCard({ reserva, onCancelar, onEditar }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, reserva.codigo, {
        width: 120,
        color: { dark: '#EBBA55', light: '#1F1F1F' },
      })
    }
  }, [reserva])

  return (
    <div className="card" style={{ maxWidth: 420, marginBottom: 20, textAlign: 'center' }}>
      <h3 style={{ color: 'var(--dourado)', fontFamily: 'var(--font-display)', marginBottom: 12 }}>
        Mesa {reserva.mesa}
      </h3>
      <div style={{ color: 'var(--branco)', lineHeight: 1.9, fontSize: 14, marginBottom: 14 }}>
        <p>Data: <strong>{reserva.data}</strong></p>
        <p>Horário: <strong>{reserva.horario}</strong></p>
        <p style={{ fontSize: 12, opacity: 0.6 }}>Código: {reserva.codigo}</p>
      </div>

      <canvas ref={canvasRef} style={{ borderRadius: 6, marginBottom: 14 }} />

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-gold" style={{ fontSize: 13, padding: '9px 18px' }} onClick={() => onEditar(reserva)}>
          ✏️ Editar
        </button>
        <button className="btn btn-gold" style={{ fontSize: 13, padding: '9px 18px' }} onClick={() => onCancelar(reserva)}>
          ✕ Cancelar
        </button>
      </div>
    </div>
  )
}

export default function MinhasReservasPage() {
  const navigate = useNavigate()
  const { getMinhasReservas, cancelarReserva } = useApp()
  const [reservaParaCancelar, setReservaParaCancelar] = useState(null)
  const [reservaParaEditar, setReservaParaEditar] = useState(null)
  const [alerta, setAlerta] = useState('')

  const minhasReservas = getMinhasReservas()

  function handleCancelar() {
    cancelarReserva(reservaParaCancelar.id)
    setReservaParaCancelar(null)
  }

  function handleEditar() {
    navigate('/editar-reserva', { state: { reserva: reservaParaEditar } })
  }

  return (
    <div className="app-shell">
      <Header />

      <div className="page-content" style={{ gap: 20 }}>
        <h2 className="page-title-white">Minhas Reservas</h2>

        {minhasReservas.length === 0 ? (
          <div style={{ textAlign: 'center', opacity: 0.6, marginTop: 20 }}>
            <p style={{ fontSize: 40 }}>🍽️</p>
            <p style={{ marginTop: 10 }}>Você ainda não tem reservas.</p>
            <button className="btn btn-gold" style={{ marginTop: 20 }} onClick={() => navigate('/reserva')}>
              Fazer uma reserva
            </button>
          </div>
        ) : (
          minhasReservas.map(r => (
            <ReservaCard
              key={r.id}
              reserva={r}
              onCancelar={setReservaParaCancelar}
              onEditar={setReservaParaEditar}
            />
          ))
        )}

        <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => navigate('/home')}>
          ← Voltar ao Início
        </button>
      </div>

      <Footer />

      {alerta && <AlertToast message={alerta} onClose={() => setAlerta('')} />}

      {reservaParaCancelar && (
        <ConfirmModal
          message="Tem certeza que deseja cancelar sua reserva?"
          confirmLabel="Sim, cancelar"
          confirmType="red"
          onConfirm={handleCancelar}
          onCancel={() => setReservaParaCancelar(null)}
        />
      )}

      {reservaParaEditar && (
        <ConfirmModal
          message="Tem certeza que gostaria de editar sua reserva?"
          confirmLabel="Sim, editar"
          confirmType="green"
          onConfirm={handleEditar}
          onCancel={() => setReservaParaEditar(null)}
        />
      )}
    </div>
  )
}
