import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)

const HORARIOS = ['10h às 11h', '11h às 12h', '12h às 13h', '13h às 14h']

export function AppProvider({ children }) {
  const [usuarioLogado, setUsuarioLogado] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuarioLogado(session?.user ?? null)
      if (session?.user) carregarPerfil(session.user.id)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuarioLogado(session?.user ?? null)
      if (session?.user) carregarPerfil(session.user.id)
      else { setPerfil(null); setReservas([]) }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function carregarPerfil(userId) {
    const { data } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (data) setPerfil(data)
  }

  async function login(email, senha) {
    if (email === 'admin' && senha === '0000') {
      setUsuarioLogado({ email: 'admin', isAdmin: true, id: 'admin' })
      setPerfil({ nome: 'Admin', email: 'admin' })
      return 'admin'
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: senha.trim(),
    })

    if (error) {
      if (error.message.includes('Email not confirmed')) return 'unconfirmed'
      return null
    }

    return 'user'
  }

  async function logout() {
    if (usuarioLogado?.isAdmin) {
      setUsuarioLogado(null)
      setPerfil(null)
      setReservas([])
      return
    }
    await supabase.auth.signOut()
  }

  async function cadastrar(dados) {
    // Checar CPF duplicado
    const { data: cpfExiste } = await supabase
      .from('perfis')
      .select('id')
      .eq('cpf', dados.cpf)
      .maybeSingle()
    if (cpfExiste) return 'cpf'

    // Criar usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: dados.email.toLowerCase().trim(),
      password: dados.senha,
    })

    if (error) {
      if (error.message.includes('already registered')) return 'email'
      return null
    }

    // upsert evita erro 409 caso o perfil já exista por tentativa anterior
    const { error: perfilError } = await supabase
      .from('perfis')
      .upsert([{
        id: data.user.id,
        nome: dados.nome,
        cpf: dados.cpf,
        telefone: dados.telefone,
        email: dados.email.toLowerCase().trim(),
      }], { onConflict: 'id' })

    if (perfilError) {
      console.log('erro perfil:', perfilError)
      return null
    }

    return 'confirmar_email'
  }

  useEffect(() => {
    if (usuarioLogado && !usuarioLogado.isAdmin) {
      carregarMinhasReservas()
    } else if (usuarioLogado?.isAdmin) {
      carregarTodasReservas()
    }
  }, [usuarioLogado])

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
    const codigo = 'GT-' + Math.floor(100000 + Math.random() * 900000)
    const nova = {
      nome: perfil?.nome || usuarioLogado.email,
      email: usuarioLogado.email,
      telefone: perfil?.telefone || '',
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
    const { error } = await supabase.from('reservas').update(update).eq('id', id)
    if (!error) setReservas(prev => prev.map(r => r.id === id ? { ...r, ...update } : r))
  }

  async function cancelarReserva(id) {
    const { error } = await supabase.from('reservas').delete().eq('id', id)
    if (!error) setReservas(prev => prev.filter(r => r.id !== id))
  }

  function getMinhasReservas() {
    if (!usuarioLogado) return []
    return reservas.filter(r => r.email === usuarioLogado.email)
  }

  async function recuperarSenha(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/nova-senha',
    })
    return !error
  }

  return (
    <AppContext.Provider value={{
      usuarioLogado, perfil, loading,
      login, logout, cadastrar, recuperarSenha,
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
