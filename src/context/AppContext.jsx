import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)

const HORARIOS = ['10h às 11h', '11h às 12h', '12h às 13h', '13h às 14h']

export function AppProvider({ children }) {
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gt_logado')) || null } catch { return null }
  })

  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem('gt_logado', JSON.stringify(usuarioLogado))
  }, [usuarioLogado])

  useEffect(() => {
    if (usuarioLogado && !usuarioLogado.isAdmin) {
      carregarMinhasReservas()
    } else if (usuarioLogado?.isAdmin) {
      carregarTodasReservas()
    }
  }, [usuarioLogado])

  async function login(email, senha) {
    if (email === 'admin' && senha === '0000') {
      setUsuarioLogado({ nome: 'Admin', email: 'admin', isAdmin: true })
      return 'admin'
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('senha', senha.trim())

    console.log('data:', data)
    console.log('error:', error)

    if (error || !data || data.length === 0) return null

    setUsuarioLogado(data[0])
    return 'user'
  }

  function logout() {
    setUsuarioLogado(null)
    setReservas([])
  }

  async function cadastrar(dados) {
    const { data: emailExiste } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', dados.email.toLowerCase())
      .single()

    if (emailExiste) return 'email'

    const { data: cpfExiste } = await supabase
      .from('usuarios')
      .select('id')
      .eq('cpf', dados.cpf)
      .single()

    if (cpfExiste) return 'cpf'

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nome: dados.nome,
        cpf: dados.cpf,
        telefone: dados.telefone,
        email: dados.email.toLowerCase(),
        senha: dados.senha,
      }])
      .select()
      .single()

    if (error) return null

    setUsuarioLogado(data)
    return 'ok'
  }

  async function carregarMinhasReservas() {
    if (!usuarioLogado) return
    setLoading(true)
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('email', usuarioLogado.email)
      .order('created_at', { ascending: false })

    if (!error && data) setReservas(data)
    setLoading(false)
  }

  async function carregarTodasReservas() {
    setLoading(true)
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setReservas(data)
    setLoading(false)
  }

  async function getMesasOcupadas(data, horario) {
    const { data: result, error } = await supabase
      .from('reservas')
      .select('mesa_idx')
      .eq('data', data)
      .eq('horario', horario)

    if (error || !result) return []
    return result.map(r => r.mesa_idx)
  }

  async function criarReserva(dados) {
    const usuario = usuarioLogado
    const codigo = 'GT-' + Math.floor(100000 + Math.random() * 900000)

    const nova = {
      nome: usuario.nome,
      email: usuario.email,
      cpf: usuario.cpf || '',
      telefone: usuario.telefone || '',
      mesa: dados.mesaIdx + 1,
      mesa_idx: dados.mesaIdx,
      horario: dados.horario,
      data: dados.data,
      qtd_lugares: dados.qtdLugares,
      codigo,
    }

    const { data, error } = await supabase
      .from('reservas')
      .insert([nova])
      .select()
      .single()

    if (error) return null

    setReservas(prev => [data, ...prev])
    return data
  }

  async function editarReserva(id, dadosNovos) {
    const update = {
      data: dadosNovos.data,
      horario: dadosNovos.horario,
      mesa: dadosNovos.mesa,
      mesa_idx: dadosNovos.mesaIdx,
      qtd_lugares: dadosNovos.qtdLugares,
    }

    const { error } = await supabase
      .from('reservas')
      .update(update)
      .eq('id', id)

    if (!error) {
      setReservas(prev => prev.map(r => r.id === id ? { ...r, ...update } : r))
    }
  }

  async function cancelarReserva(id) {
    const { error } = await supabase
      .from('reservas')
      .delete()
      .eq('id', id)

    if (!error) {
      setReservas(prev => prev.filter(r => r.id !== id))
    }
  }

  function getMinhasReservas() {
    if (!usuarioLogado) return []
    return reservas.filter(r => r.email === usuarioLogado.email)
  }

  return (
    <AppContext.Provider value={{
      usuarioLogado, loading,
      login, logout, cadastrar,
      reservas, getMesasOcupadas, criarReserva, editarReserva, cancelarReserva, getMinhasReservas,
      carregarTodasReservas, carregarMinhasReservas,
      HORARIOS,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
