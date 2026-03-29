import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Dropdown from '../components/Dropdown'
import MesaMap from '../components/MesaMap'
import { AlertToast, ConfirmModal } from '../components/Modals'

const QTD_OPTIONS = [
  { value: 2, label: '2 lugares' },
  { value: 4, label: '4 lugares' },
  { value: 8, label: '8 lugares' },
  { value: 16, label: '16 lugares' },
]

function getDateRange() {
  const today = new Date()
  const max = new Date()
  max.setDate(today.getDate() + 30)
  return {
    min: today.toISOString().split('T')[0],
    max: max.toISOString().split('T')[0],
  }
}

export default function ReservaPage() {
  const navigate = useNavigate()
  const { HORARIOS, getMesasOcupadas, criarReserva } = useApp()

  const [qtd, setQtd] = useState(null)
  const [data, setData] = useState('')
  const [horario, setHorario] = useState(null)
  const [mesaSelecionada, setMesaSelecionada] = useState(null)
  const [mesasOcupadas, setMesasOcupadas] = useState([])
  const [alerta, setAlerta] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const { min, max } = getDateRange()

  useEffect(() => {
    if (data && horario) {
      getMesasOcupadas(data, horario).then(setMesasOcupadas)
    } else {
      setMesasOcupadas([])
    }
  }, [data, horario])

  function handleSelectMesa(idx) {
    setMesaSelecionada(idx)
  }

  function handleConfirmar() {
    if (!qtd && !data && !horario && mesaSelecionada === null) {
      setAlerta('Preencha todos os filtros e selecione uma mesa!')
      return
    }
    if (!qtd) {
      setAlerta('Selecione a quantidade de lugares!')
      return
    }
    if (!data) {
      setAlerta('Selecione uma data!')
      return
    }
    if (!horario) {
      setAlerta('Selecione um horário!')
      return
    }
    if (mesaSelecionada === null) {
      setAlerta('Selecione uma mesa!')
      return
    }
    setShowConfirm(true)
  }

  async function confirmarReserva() {
    const nova = await criarReserva({
      mesaIdx: mesaSelecionada,
      horario,
      data,
      qtdLugares: qtd,
    })
    if (!nova) {
      setAlerta('Erro ao criar reserva. Tente novamente!')
      setShowConfirm(false)
      return
    }
    navigate('/confirmacao', { state: { reserva: nova } })
  }

  return (
    <div className="app-shell">
      <Header />

      <div className="page-content" style={{ gap: 20 }}>
        <h2 className="page-title-white">Reservar Mesa</h2>

        {/* Filtros */}
        <div className="filters-row" style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div className="section-label">Qtd. Lugares</div>
            <Dropdown
              label="Qtd. Lugares"
              options={QTD_OPTIONS}
              value={qtd}
              onChange={v => { setQtd(Number(v)); setMesaSelecionada(null) }}
              placeholder="Selecione"
            />
          </div>

          <div style={{ flex: 1, minWidth: 140 }}>
            <div className="section-label">Data</div>
            <input
              type="date"
              className="input-field"
              style={{ padding: '11px 14px' }}
              value={data}
              min={min}
              max={max}
              onChange={e => { setData(e.target.value); setMesaSelecionada(null) }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 140 }}>
            <div className="section-label">Horário</div>
            <Dropdown
              label="Horário"
              options={HORARIOS}
              value={horario}
              onChange={v => { setHorario(v); setMesaSelecionada(null) }}
              placeholder="Selecione"
            />
          </div>
        </div>

        {/* Mapa */}
        <div style={{ width: '100%', maxWidth: 700, margin: '0 auto' }}>
          <MesaMap
            mesasOcupadas={mesasOcupadas}
            mesaSelecionada={mesaSelecionada}
            onSelect={handleSelectMesa}
            qtdLugares={qtd}
          />
        </div>

        {/* Legenda */}
        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--branco)', opacity: 0.8 }}>
          <span>🟢 Disponível</span>
          <span>🔴 Ocupada</span>
          {mesaSelecionada !== null && <span style={{ color: 'var(--dourado)' }}>✓ Mesa {mesaSelecionada + 1} selecionada</span>}
        </div>

        {/* Botões — sempre visíveis */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/home')}>
            ← Voltar
          </button>

          <button className="btn btn-green" onClick={handleConfirmar}>
            Confirmar Reserva
          </button>
        </div>
      </div>

      <Footer />

      {alerta && <AlertToast message={alerta} onClose={() => setAlerta('')} />}

      {showConfirm && (
        <ConfirmModal
          message="Deseja confirmar sua reserva?"
          confirmLabel="Sim, confirmar"
          confirmType="green"
          onConfirm={confirmarReserva}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
