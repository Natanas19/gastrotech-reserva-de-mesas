import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Dropdown from '../components/Dropdown'
import MesaMap from '../components/MesaMap'
import { AlertToast, ConfirmModal, InfoModal } from '../components/Modals'

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

const PAGE_SIZE = 10

export default function AdminPage() {
  const navigate = useNavigate()
  const { HORARIOS, reservas, getMesasOcupadas, cancelarReserva, editarReserva } = useApp()

  // Filtros
  const [qtd, setQtd] = useState(null)
  const [data, setData] = useState('')
  const [horario, setHorario] = useState(null)

  // Paginação
  const [pagina, setPagina] = useState(1)

  // Modais
  const [reservaInfo, setReservaInfo] = useState(null)
  const [reservaCancelar, setReservaCancelar] = useState(null)
  const [reservaEditar, setReservaEditar] = useState(null)
  const [alerta, setAlerta] = useState('')

  // Modo edição inline
  const [modoEditar, setModoEditar] = useState(false)
  const [editQtd, setEditQtd] = useState(null)
  const [editData, setEditData] = useState('')
  const [editHorario, setEditHorario] = useState(null)
  const [editMesa, setEditMesa] = useState(null)
  const [showConfirmEdit, setShowConfirmEdit] = useState(false)

  const { min, max } = getDateRange()

  // Filtrar reservas
  let lista = [...reservas].reverse() // mais recentes primeiro
  if (qtd) lista = lista.filter(r => r.qtdLugares === qtd)
  if (data) lista = lista.filter(r => r.data === data)
  if (horario) lista = lista.filter(r => r.horario === horario)

  const totalPaginas = Math.ceil(lista.length / PAGE_SIZE)
  const listaPaginada = lista.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

  function handleCancelar() {
    cancelarReserva(reservaCancelar.id)
    setReservaCancelar(null)
  }

  function abrirEditar(reserva) {
    setReservaEditar(reserva)
    setEditQtd(reserva.qtdLugares || null)
    setEditData(reserva.data || '')
    setEditHorario(reserva.horario || null)
    setEditMesa(reserva.mesaIdx)
    setModoEditar(true)
  }

  function handleSalvarEdicao() {
    if (!editQtd || !editData || !editHorario || editMesa === null) {
      setAlerta('Preencha todos os campos e selecione uma mesa!')
      return
    }
    setShowConfirmEdit(true)
  }

  function confirmarEdicao() {
    editarReserva(reservaEditar.id, {
      data: editData,
      horario: editHorario,
      mesa: editMesa + 1,
      mesaIdx: editMesa,
      qtdLugares: editQtd,
    })
    setModoEditar(false)
    setReservaEditar(null)
    setShowConfirmEdit(false)
  }

  const mesasOcupadasEdit = (editData && editHorario)
    ? getMesasOcupadas(editData, editHorario).filter(
        idx => !(reservaEditar && idx === reservaEditar.mesaIdx && editHorario === reservaEditar.horario && editData === reservaEditar.data)
      )
    : []

  // ---- Modo edição ----
  if (modoEditar && reservaEditar) {
    return (
      <div className="app-shell">
        <Header />
        <div className="page-content" style={{ gap: 20 }}>
          <h2 className="page-title-white">Editar Reserva — {reservaEditar.nome}</h2>

          <div className="filters-row" style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div className="section-label">Qtd. Lugares</div>
              <Dropdown label="Qtd. Lugares" options={QTD_OPTIONS} value={editQtd}
                onChange={v => { setEditQtd(Number(v)); setEditMesa(null) }} placeholder="Selecione" />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div className="section-label">Data</div>
              <input type="date" className="input-field" style={{ padding: '11px 14px' }}
                value={editData} min={min} max={max}
                onChange={e => { setEditData(e.target.value); setEditMesa(null) }} />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div className="section-label">Horário</div>
              <Dropdown label="Horário" options={HORARIOS} value={editHorario}
                onChange={v => { setEditHorario(v); setEditMesa(null) }} placeholder="Selecione" />
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: 700, margin: '0 auto' }}>
            <MesaMap
              mesasOcupadas={mesasOcupadasEdit}
              mesaSelecionada={editMesa}
              onSelect={idx => {
                if (!editQtd || !editData || !editHorario) { setAlerta('Preencha os filtros primeiro!'); return }
                setEditMesa(idx)
              }}
              qtdLugares={editQtd}
              mesaAtualEdit={reservaEditar.mesaIdx}
            />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <button className="btn btn-ghost" onClick={() => { setModoEditar(false); setReservaEditar(null) }}>← Voltar</button>
            <button className="btn btn-green" onClick={handleSalvarEdicao}>Salvar Alterações</button>
          </div>
        </div>
        <Footer />

        {alerta && <AlertToast message={alerta} onClose={() => setAlerta('')} />}
        {showConfirmEdit && (
          <ConfirmModal
            message={`Tem certeza que deseja editar a reserva de ${reservaEditar.nome}?`}
            confirmLabel="Sim, editar"
            confirmType="green"
            onConfirm={confirmarEdicao}
            onCancel={() => setShowConfirmEdit(false)}
          />
        )}
      </div>
    )
  }

  // ---- Painel principal ----
  return (
    <div className="app-shell">
      <Header />

      <div className="page-content" style={{ gap: 20 }}>
        <h2 className="page-title" style={{ fontSize: 28 }}>Admin</h2>

        {/* Filtros */}
        <div className="filters-row" style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div className="section-label">Qtd. Lugares</div>
            <Dropdown label="Qtd. Lugares" options={QTD_OPTIONS} value={qtd}
              onChange={v => { setQtd(Number(v)); setPagina(1) }} placeholder="Todos" />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div className="section-label">Data</div>
            <input type="date" className="input-field" style={{ padding: '11px 14px' }}
              value={data} min={min} max={max}
              onChange={e => { setData(e.target.value); setPagina(1) }} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div className="section-label">Horário</div>
            <Dropdown label="Horário" options={HORARIOS} value={horario}
              onChange={v => { setHorario(v); setPagina(1) }} placeholder="Todos" />
          </div>
        </div>

        {/* Botão limpar filtros */}
        {(qtd || data || horario) && (
          <button className="btn btn-ghost" style={{ fontSize: 13, padding: '8px 18px' }}
            onClick={() => { setQtd(null); setData(''); setHorario(null); setPagina(1) }}>
            ✕ Limpar filtros
          </button>
        )}

        {/* Lista */}
        <div style={{ width: '100%', maxWidth: 700 }}>
          {listaPaginada.length === 0 ? (
            <p style={{ textAlign: 'center', opacity: 0.6, padding: 30 }}>Nenhuma reserva encontrada.</p>
          ) : (
            listaPaginada.map(r => (
              <div key={r.id} className="admin-row">
                <div className="admin-row-info">
                  <strong>{r.nome}</strong> &nbsp;|&nbsp; Mesa {r.mesa} &nbsp;|&nbsp; {r.data} &nbsp;|&nbsp; {r.horario}
                </div>
                <div className="admin-row-actions">
                  {/* Editar */}
                  <button className="btn-icon" title="Editar" onClick={() => abrirEditar(r)}
                    style={{ color: 'var(--vinho)', fontSize: 18 }}>✏️</button>

                  {/* Cancelar */}
                  <button className="btn-icon" title="Cancelar reserva" onClick={() => setReservaCancelar(r)}
                    style={{ color: 'var(--vermelho)', fontSize: 18 }}>✕</button>

                  {/* Mais */}
                  <button className="btn-icon" title="Mais detalhes" onClick={() => setReservaInfo(r)}
                    style={{ color: 'var(--vinho)', fontSize: 18 }}>⋮</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}
              disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>‹</button>
            <span style={{ fontSize: 14 }}>{pagina} / {totalPaginas}</span>
            <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}
              disabled={pagina === totalPaginas} onClick={() => setPagina(p => p + 1)}>›</button>
          </div>
        )}
      </div>

      <Footer />

      {alerta && <AlertToast message={alerta} onClose={() => setAlerta('')} />}

      {reservaInfo && <InfoModal data={reservaInfo} onClose={() => setReservaInfo(null)} />}

      {reservaCancelar && (
        <ConfirmModal
          message={`Tem certeza que deseja cancelar a reserva de ${reservaCancelar.nome}?`}
          confirmLabel="Sim, cancelar"
          confirmType="red"
          onConfirm={handleCancelar}
          onCancel={() => setReservaCancelar(null)}
        />
      )}
    </div>
  )
}
