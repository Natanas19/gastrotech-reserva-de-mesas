import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { AlertToast, ConfirmModal } from '../components/Modals'

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '')
  if (cpf.length !== 11) return false
  if (/^(\d)\1+$/.test(cpf)) return false
  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf[9])) return false
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf[10])) return false
  return true
}

function validarTelefone(tel) {
  const digits = tel.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

function validarSenha(senha) {
  if (senha.length < 8) return false
  if (!/[A-Z]/.test(senha)) return false
  if (!/[a-z]/.test(senha)) return false
  if (!/[0-9]/.test(senha)) return false
  if (!/[^A-Za-z0-9]/.test(senha)) return false
  return true
}

function formatarCPF(v) { return v.replace(/\D/g, '').slice(0, 11) }
function formatarTelefone(v) { return v.replace(/\D/g, '').slice(0, 15) }

function IconeOlho({ aberto }) {
  return aberto ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function InputSenha({ placeholder, value, onChange, hint }) {
  const [mostrar, setMostrar] = useState(false)
  return (
    <div className="input-group">
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          className="input-field"
          type={mostrar ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ paddingRight: 44 }}
        />
        <button
          type="button"
          onClick={() => setMostrar(m => !m)}
          style={{
            position: 'absolute', right: 12, top: '50%',
            transform: 'translateY(-50%)', background: 'transparent',
            border: 'none', cursor: 'pointer',
            color: 'rgba(254,254,253,0.6)', padding: 0,
            lineHeight: 1, display: 'flex', alignItems: 'center',
          }}
        >
          <IconeOlho aberto={mostrar} />
        </button>
      </div>
      {hint && <span className="input-hint">{hint}</span>}
    </div>
  )
}

export default function CadastroPage() {
  const navigate = useNavigate()
  const { cadastrar } = useApp()

  const [form, setForm] = useState({ nome: '', cpf: '', telefone: '', email: '', senha: '', confirmarSenha: '' })
  const [alerta, setAlerta] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [emailEnviado, setEmailEnviado] = useState(false)

  function handleChange(field, value) {
    let v = value
    if (field === 'nome') v = value.slice(0, 50)
    if (field === 'cpf') v = formatarCPF(value)
    if (field === 'telefone') v = formatarTelefone(value)
    setForm(prev => ({ ...prev, [field]: v }))
  }

  function validar() {
    const { nome, cpf, telefone, email, senha, confirmarSenha } = form
    if (!nome || !cpf || !telefone || !email || !senha || !confirmarSenha) {
      setAlerta('Preencha todos os campos!'); return false
    }
    if (!validarEmail(email)) { setAlerta('E-mail inválido!'); return false }
    if (!validarCPF(cpf)) { setAlerta('CPF inválido!'); return false }
    if (!validarTelefone(telefone)) { setAlerta('Dados inválidos!'); return false }
    if (!validarSenha(senha)) { setAlerta('Dados inválidos!'); return false }
    if (senha !== confirmarSenha) { setAlerta('Dados não conferem!'); return false }
    return true
  }

  async function handleConfirmar() {
    if (!validar()) return
    setShowConfirm(true)
  }

  async function confirmar() {
    const { nome, cpf, telefone, email, senha } = form
    const result = await cadastrar({ nome, cpf, telefone, email, senha })

    if (result === 'email') { setAlerta('E-mail já cadastrado!'); setShowConfirm(false); return }
    if (result === 'cpf') { setAlerta('CPF já cadastrado!'); setShowConfirm(false); return }
    if (result === null) { setAlerta('Erro ao cadastrar. Tente novamente!'); setShowConfirm(false); return }

    // Sucesso — mostrar tela de confirmação de e-mail
    setShowConfirm(false)
    setEmailEnviado(true)
  }

  // ---- Tela de aguardando confirmação ----
  if (emailEnviado) {
    return (
      <div className="app-shell">
        <Header hideLogout />
        <div className="page-content">
          <div className="card" style={{ maxWidth: 420, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h2 className="page-title" style={{ fontSize: 22, marginBottom: 12 }}>
              Confirme seu e-mail!
            </h2>
            <p style={{ color: 'var(--branco)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Enviamos um link de confirmação para<br />
              <strong style={{ color: 'var(--dourado)' }}>{form.email}</strong><br /><br />
              Clique no link do e-mail para ativar sua conta e depois faça o login.
            </p>
            <p style={{ color: 'rgba(254,254,253,0.5)', fontSize: 12, marginBottom: 20 }}>
              Não recebeu? Verifique a pasta de spam.
            </p>
            <button className="btn btn-green" onClick={() => navigate('/login')}>
              Ir para o Login
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Header />
      <div className="page-content" style={{ paddingBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, width: '100%', maxWidth: 420 }}>
          <button
            style={{ background: 'transparent', border: 'none', color: 'var(--branco)', fontSize: 22, cursor: 'pointer' }}
            onClick={() => navigate('/login')}
          >←</button>
          <h2 className="page-title-white" style={{ margin: 0 }}>Cadastro</h2>
        </div>

        <div className="card" style={{ maxWidth: 420 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="input-group">
              <input className="input-field" type="text" placeholder="Nome completo"
                value={form.nome} onChange={e => handleChange('nome', e.target.value)} />
              <span className="input-hint">Máximo 50 caracteres ({form.nome.length}/50)</span>
            </div>
            <div className="input-group">
              <input className="input-field" type="text" placeholder="CPF"
                value={form.cpf} onChange={e => handleChange('cpf', e.target.value)} />
              <span className="input-hint">Somente números, 11 dígitos</span>
            </div>
            <div className="input-group">
              <input className="input-field" type="tel" placeholder="Telefone"
                value={form.telefone} onChange={e => handleChange('telefone', e.target.value)} />
              <span className="input-hint">Somente números, com DDD</span>
            </div>
            <div className="input-group">
              <input className="input-field" type="email" placeholder="E-mail"
                value={form.email} onChange={e => handleChange('email', e.target.value)} />
              <span className="input-hint">Formato válido de e-mail</span>
            </div>
            <InputSenha placeholder="Senha" value={form.senha}
              onChange={e => handleChange('senha', e.target.value)}
              hint="Mín. 8 caracteres, maiúscula, minúscula, número e caractere especial" />
            <InputSenha placeholder="Confirmar Senha" value={form.confirmarSenha}
              onChange={e => handleChange('confirmarSenha', e.target.value)}
              hint="Deve ser igual à senha acima" />
            <button className="btn btn-green" style={{ marginTop: 8 }} onClick={handleConfirmar}>
              Confirmar
            </button>
          </div>
        </div>
      </div>

      <Footer />
      {alerta && <AlertToast message={alerta} onClose={() => setAlerta('')} />}
      {showConfirm && (
        <ConfirmModal
          message="Deseja confirmar seu cadastro?"
          confirmLabel="Sim, confirmar"
          confirmType="green"
          onConfirm={confirmar}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
