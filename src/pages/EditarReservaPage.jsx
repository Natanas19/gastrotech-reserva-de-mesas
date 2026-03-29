import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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

export default function EditarReservaPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { HORARIOS, getMesasOcupadas, editarReserva } = useApp()

  const reserva = location.state?.reserva
  if (!reserva) { navigate('/home'); return null }

  const [qtd, setQtd] = useState(reserva.qtd_lugares || reserva.qtdLugares || null)
  const [data, setData] = useState(reserva.data || '')
  const [horario, setHorario] = useState(reserva.horario || null)
  const [mesaSelecionada, setMesaSelecionada] = useState(reserva.mesa_idx ?? reserva.mesaIdx ?? null)
  const [mesasOcupadas, setMesasOcupadas] = useState([])
  const [alerta, setAlerta] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const { min, max } = getDateRange()

  const mesaAtualIdx = reserva.mesa_idx ?? reserva.mesaIdx ?? null

  // Busca mesas ocupadas sempre que data ou horário mudarem
  useEffect(() => {
    if (data && horario) {
      getMesasOcupadas(data, horario).then(result => {
        // Exclui a mesa atual do próprio usuário
        const filtradas = result.filter(idx =>
          !(idx === mesaAtualIdx && horario === reserva.horario && data === reserva.data)
        )
        setMesasOcupadas(filtradas)
      })
    } else {
      setMesasOcupadas([])
    }
  }, [data, horario])

  function handleSelectMesa(idx) {
    setMesaSelecionada(idx)
  }

  function handleSalvar() {
    if (!qtd || !data || !horario || mesaSelecionada === null) {
      setAlerta('Preencha todos os campos e selecione uma mesa!')
      return
    }
    setShowConfirm(true)
  }

  async function confirmar() {
    await editarReserva(reserva.id, {
      data,
      horario,
      mesa: mesaSelecionada + 1,
      mesaIdx: mesaSelecionada,
      qtdLugares: qtd,
    })
    navigate('/minhas-reservas')
  }

  return (
    <div className="app-shell">
      <Header />

      <div className="page-content" style={{ gap: 20 }}>
        <h2 className="page-title-white">Editar Reserva</h2>

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

        <div style={{ width: '100%', maxWidth: 700, margin: '0 auto' }}>
          <MesaMap
            mesasOcupadas={mesasOcupadas}
            mesaSelecionada={mesaSelecionada}
            onSelect={handleSelectMesa}
            qtdLugares={qtd}
            mesaAtualEdit={mesaAtualIdx}
          />
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8 }}>
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            ← Voltar
          </button>
          <button className="btn btn-green" onClick={handleSalvar}>
            Salvar Alterações
          </button>
        </div>
      </div>

      <Footer />

      {alerta && <AlertToast message={alerta} onClose={() => setAlerta('')} />}

      {showConfirm && (
        <ConfirmModal
          message="Tem certeza que deseja atualizar a reserva?"
          confirmLabel="Sim, atualizar"
          confirmType="green"
          onConfirm={confirmar}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
