import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ConfirmModal, AlertToast } from '../components/Modals'
import QRCode from 'qrcode'

export default function ConfirmacaoPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cancelarReserva } = useApp()
  const [showCancelarConfirm, setShowCancelarConfirm] = useState(false)
  const [showEditarConfirm, setShowEditarConfirm] = useState(false)
  const [alerta, setAlerta] = useState('')
  const canvasRef = useRef(null)

  const reserva = location.state?.reserva

  useEffect(() => {
    if (!reserva) return
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, reserva.codigo, {
        width: 160,
        color: { dark: '#EBBA55', light: '#1F1F1F' },
      })
    }
  }, [reserva])

  if (!reserva) {
    navigate('/home')
    return null
  }

  function handleCancelar() {
    cancelarReserva(reserva.id)
    navigate('/home')
  }

  function handleEditar() {
    navigate('/editar-reserva', { state: { reserva } })
  }

  return (
    <div className="app-shell">
      <Header />

      <div className="page-content" style={{ gap: 20, paddingBottom: 40 }}>
        <div className="card" style={{ maxWidth: 480, textAlign: 'center' }}>
          <h2 className="page-title" style={{ fontSize: 26, marginBottom: 16 }}>
            🎉 Reserva Confirmada!
          </h2>

          <div style={{ color: 'var(--branco)', lineHeight: 2, fontSize: 15, marginBottom: 20 }}>
            <p>Obrigado, <strong style={{ color: 'var(--dourado)' }}>{reserva.nome}</strong>!</p>
            <p>Mesa: <strong>{reserva.mesa}</strong></p>
            <p>Data: <strong>{reserva.data}</strong></p>
            <p>Horário: <strong>{reserva.horario}</strong></p>
            <p style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>Código: {reserva.codigo}</p>
          </div>

          <div className="qr-wrapper" style={{ marginBottom: 8 }}>
            <p className="qr-label">Seu QR Code</p>
            <canvas ref={canvasRef} style={{ borderRadius: 8 }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-gold" onClick={() => setShowEditarConfirm(true)}>
            ✏️ Editar Reserva
          </button>
          <button className="btn btn-gold" onClick={() => setShowCancelarConfirm(true)}>
            ✕ Cancelar Reserva
          </button>
        </div>

        <button className="btn btn-green" onClick={() => navigate('/home')}>
          Voltar ao Início
        </button>
      </div>

      <Footer />

      {alerta && <AlertToast message={alerta} onClose={() => setAlerta('')} />}

      {showCancelarConfirm && (
        <ConfirmModal
          message="Tem certeza que deseja cancelar sua reserva?"
          confirmLabel="Sim, cancelar"
          confirmType="red"
          onConfirm={handleCancelar}
          onCancel={() => setShowCancelarConfirm(false)}
        />
      )}

      {showEditarConfirm && (
        <ConfirmModal
          message="Tem certeza que gostaria de editar sua reserva?"
          confirmLabel="Sim, editar"
          confirmType="green"
          onConfirm={handleEditar}
          onCancel={() => setShowEditarConfirm(false)}
        />
      )}
    </div>
  )
}
