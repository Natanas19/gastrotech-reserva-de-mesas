import React, { useEffect } from 'react'

/* ---- Alert Toast (aviso simples) ---- */
export function AlertToast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: 80 }}>
      <div className="alert-toast" onClick={e => e.stopPropagation()}>
        <div className="alert-icon" style={{ display: 'flex', justifyContent: 'center' }}>
          <img src="/logo-vermelho.png" alt="aviso" style={{ width: 36, height: 36, objectFit: 'contain' }} />
        </div>
        <p>{message}</p>
      </div>
    </div>
  )
}

/* ---- Confirm Modal ---- */
export function ConfirmModal({ message, onConfirm, onCancel, confirmLabel = 'Sim, confirmar', confirmType = 'green' }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <img src="/logo.png" alt="logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
        </div>
        <p className="modal-text">{message}</p>
        <div className="modal-actions">
          <button
            className={`btn btn-${confirmType === 'red' ? 'red' : 'green'}`}
            style={{ fontSize: 13, padding: '10px 20px' }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button className="btn btn-ghost" style={{ fontSize: 13, padding: '10px 20px' }} onClick={onCancel}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---- Info Modal (mais detalhes do cliente no admin) ---- */
export function InfoModal({ data, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <img src="/logo.png" alt="logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
        </div>
        <p className="modal-title">Detalhes da Reserva</p>
        <div style={{ textAlign: 'left', fontSize: 14, color: 'var(--branco)', lineHeight: 2 }}>
          <div><span style={{ color: 'var(--dourado)' }}>Nome:</span> {data.nome}</div>
          <div><span style={{ color: 'var(--dourado)' }}>Mesa:</span> {data.mesa}</div>
          <div><span style={{ color: 'var(--dourado)' }}>Data:</span> {data.data}</div>
          <div><span style={{ color: 'var(--dourado)' }}>Horário:</span> {data.horario}</div>
          {data.telefone && <div><span style={{ color: 'var(--dourado)' }}>Telefone:</span> {data.telefone}</div>}
          <div><span style={{ color: 'var(--dourado)' }}>E-mail:</span> {data.email}</div>
          <div><span style={{ color: 'var(--dourado)' }}>Código:</span> {data.codigo}</div>
        </div>
        <div style={{ marginTop: 20 }}>
          <button className="btn btn-gold" style={{ fontSize: 13 }} onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}
