import React, { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

const HORARIOS = ['10h às 11h', '11h às 12h', '12h às 13h', '13h às 14h']

// Capacidade de cada mesa (índice 0..11)
const MESA_CAPACIDADE = [2, 2, 2, 2, 4, 4, 4, 4, 8, 8, 16, 16]

function initMesas() {
  const obj = {}
  HORARIOS.forEach(h => { obj[h] = {} })
  return obj
}

// reservas[data][horario] = array de { mesaIdx, codigo, email }
function initReservasPorData() { return {} }

export function AppProvider({ children }) {
  const [usuarios, setUsuarios] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gt_usuarios')) || [] } catch { return [] }
  })

  // reservas: [{ nome, email, cpf, telefone, mesa, mesaIdx, horario, data, codigo, id }]
  const [reservas, setReservas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gt_reservas')) || [] } catch { return [] }
  })

  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gt_logado')) || null } catch { return null }
  })

  // Salvar sempre que mudar
  useEffect(() => {
    localStorage.setItem('gt_usuarios', JSON.stringify(usuarios))
  }, [usuarios])

  useEffect(() => {
    localStorage.setItem('gt_reservas', JSON.stringify(reservas))
  }, [reservas])

  useEffect(() => {
    localStorage.setItem('gt_logado', JSON.stringify(usuarioLogado))
  }, [usuarioLogado])

  // ---- Auth ----
  function login(email, senha) {
    if (email === 'admin' && senha === '0000') {
      setUsuarioLogado({ nome: 'Admin', email: 'admin', isAdmin: true })
      return 'admin'
    }
    const u = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha)
    if (!u) return null
    setUsuarioLogado(u)
    return 'user'
  }

  function logout() {
    setUsuarioLogado(null)
  }

  function cadastrar(dados) {
    // dados: { nome, cpf, telefone, email, senha }
    if (usuarios.some(u => u.email.toLowerCase() === dados.email.toLowerCase())) return 'email'
    if (usuarios.some(u => u.cpf === dados.cpf)) return 'cpf'
    const novo = { ...dados, id: Date.now().toString() }
    setUsuarios(prev => [...prev, novo])
    return 'ok'
  }

  // ---- Reservas ----
  function getMesasOcupadas(data, horario) {
    return reservas
      .filter(r => r.data === data && r.horario === horario)
      .map(r => r.mesaIdx)
  }

  function criarReserva(dados) {
    // dados: { mesaIdx, horario, data, qtdLugares }
    const usuario = usuarioLogado
    const codigo = 'GT-' + Math.floor(100000 + Math.random() * 900000)
    const id = Date.now().toString()
    const nova = {
      id,
      nome: usuario.nome,
      email: usuario.email,
      cpf: usuario.cpf || '',
      telefone: usuario.telefone || '',
      mesa: dados.mesaIdx + 1,
      mesaIdx: dados.mesaIdx,
      horario: dados.horario,
      data: dados.data,
      qtdLugares: dados.qtdLugares,
      codigo,
    }
    setReservas(prev => [...prev, nova])
    return nova
  }

  function editarReserva(id, dadosNovos) {
    setReservas(prev => prev.map(r => r.id === id ? { ...r, ...dadosNovos } : r))
  }

  function cancelarReserva(id) {
    setReservas(prev => prev.filter(r => r.id !== id))
  }

  function getMinhasReservas() {
    if (!usuarioLogado) return []
    return reservas.filter(r => r.email === usuarioLogado.email)
  }

  return (
    <AppContext.Provider value={{
      usuarios, usuarioLogado,
      login, logout, cadastrar,
      reservas, getMesasOcupadas, criarReserva, editarReserva, cancelarReserva, getMinhasReservas,
      HORARIOS, MESA_CAPACIDADE,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
