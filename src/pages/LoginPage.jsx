import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { AlertToast } from '../components/Modals'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useApp()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [alerta, setAlerta] = useState('')

  async function handleEntrar() {
    if (!email.trim() || !senha.trim()) {
      setAlerta('Preencha todos os campos!')
      return
    }

    const result = await login(email.trim(), senha.trim())

    if (result === 'admin') {
      navigate('/admin')
    } else if (result === 'user') {
      navigate('/home')
    } else {
      setAlerta('Dados não conferem!')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleEntrar()
  }

  return (
    <div className="app-shell">
      <Header hideLogout />

      <div className="page-content">
        <h1 className="page-title-white" style={{ marginBottom: 32 }}>Login</h1>

        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Email */}
            <div className="input-group">
              <input
                className="input-field"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Senha com olho */}
            <div className="input-group">
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  className="input-field"
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Senha"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(m => !m)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(254,254,253,0.6)',
                    fontSize: 18,
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  {mostrarSenha ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button className="btn btn-green" style={{ marginTop: 8 }} onClick={handleEntrar}>
              Entrar
            </button>

            <button
              className="btn btn-gold"
              onClick={() => navigate('/cadastro')}
            >
              Cadastrar
            </button>

            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--branco)',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: 14,
                marginTop: 4,
              }}
              onClick={() => setAlerta('Funcionalidade disponível em breve!')}
            >
              Esqueci a senha
            </button>
          </div>
        </div>
      </div>

      <Footer />

      {alerta && <AlertToast message={alerta} onClose={() => setAlerta('')} />}
    </div>
  )
}
