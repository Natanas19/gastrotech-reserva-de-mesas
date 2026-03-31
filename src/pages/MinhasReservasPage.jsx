import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ConfirmModal, AlertToast } from '../components/Modals'
import QRCode from 'qrcode'

// ---- Modo Card (expandido com QR Code) ----
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

// ---- Modo Lista (compacto) ----
function ReservaLinha({ reserva, onCancelar, onEditar }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(31,31,31,0.8)',
      border: '1.5px solid var(--dourado-contorno)',
      borderRadius: 10,
      padding: '12px 16px',
      marginBottom: 10,
      gap: 12,
      flexWrap: 'wrap',
      maxWidth: 600,
      width: '100%',
    }}>
      <div style={{ color: 'var(--branco)', fontSize: 14, lineHeight: 1.7 }}>
        <div><span style={{ color: 'var(--dourado)', fontWeight: 700 }}>Mesa {reserva.mesa}</span></div>
        <div style={{ opacity: 0.8 }}>{reserva.data} · {reserva.horario}</div>
        <div style={{ fontSize: 11, opacity: 0.5 }}>{reserva.codigo}</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-gold" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => onEditar(reserva)}>
          ✏️ Editar
        </button>
        <button className="btn btn-gold" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => onCancelar(reserva)}>
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
  const [modoLista, setModoLista] = useState(false)

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

        {/* Título + toggle de modo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 600 }}>
          <h2 className="page-title-white">Minhas Reservas</h2>
          {minhasReservas.length > 0 && (
            <div style={{ display: 'flex', gap: 6 }}>
              {/* Botão modo card */}
              <button
                onClick={() => setModoLista(false)}
                title="Modo card"
                style={{
                  background: !modoLista ? 'var(--dourado)' : 'transparent',
                  border: '1.5px solid var(--dourado)',
                  borderRadius: 6,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  color: !modoLista ? 'var(--vinho)' : 'var(--dourado)',
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                ⊞
              </button>
              {/* Botão modo lista */}
              <button
                onClick={() => setModoLista(true)}
                title="Modo lista"
                style={{
                  background: modoLista ? 'var(--dourado)' : 'transparent',
                  border: '1.5px solid var(--dourado)',
                  borderRadius: 6,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  color: modoLista ? 'var(--vinho)' : 'var(--dourado)',
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                ☰
              </button>
            </div>
          )}
        </div>

        {minhasReservas.length === 0 ? (
          <div style={{ textAlign: 'center', opacity: 0.6, marginTop: 20 }}>
            <p style={{ fontSize: 40 }}>🍽️</p>
            <p style={{ marginTop: 10 }}>Você ainda não tem reservas.</p>
            <button className="btn btn-gold" style={{ marginTop: 20 }} onClick={() => navigate('/reserva')}>
              Fazer uma reserva
            </button>
          </div>
        ) : modoLista ? (
          minhasReservas.map(r => (
            <ReservaLinha
              key={r.id}
              reserva={r}
              onCancelar={setReservaParaCancelar}
              onEditar={setReservaParaEditar}
            />
          ))
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
