import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { AlertToast } from '../components/Modals'

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

function validarSenha(senha) {
  if (senha.length < 8) return false
  if (!/[A-Z]/.test(senha)) return false
  if (!/[a-z]/.test(senha)) return false
  if (!/[0-9]/.test(senha)) return false
  if (!/[^A-Za-z0-9]/.test(senha)) return false
  return true
}

export default function NovaSenhaPage() {
  const navigate = useNavigate()
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [mostrar2, setMostrar2] = useState(false)
  const [alerta, setAlerta] = useState('')
  const [sucesso, setSucesso] = useState(false)

  async function handleSalvar() {
    if (!senha || !confirmar) { setAlerta('Preencha todos os campos!'); return }
    if (!validarSenha(senha)) { setAlerta('Dados inválidos!'); return }
    if (senha !== confirmar) { setAlerta('Dados não conferem!'); return }

    const { error } = await supabase.auth.updateUser({ password: senha })
    if (error) { setAlerta('Erro ao atualizar senha. Tente novamente!'); return }

    setSucesso(true)
  }

  if (sucesso) {
    return (
      <div className="app-shell">
        <Header hideLogout />
        <div className="page-content">
          <div className="card" style={{ maxWidth: 420, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 className="page-title" style={{ fontSize: 22, marginBottom: 12 }}>Senha atualizada!</h2>
            <p style={{ color: 'var(--branco)', fontSize: 14, marginBottom: 20 }}>
              Sua senha foi redefinida com sucesso.
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
      <Header hideLogout />
      <div className="page-content">
        <h2 className="page-title-white" style={{ marginBottom: 24 }}>Nova Senha</h2>
        <div className="card" style={{ maxWidth: 420 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Nova senha */}
            <div className="input-group">
              <div style={{ position: 'relative', width: '100%' }}>
                <input className="input-field" type={mostrar ? 'text' : 'password'}
                  placeholder="Nova senha" value={senha}
                  onChange={e => setSenha(e.target.value)} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setMostrar(m => !m)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'rgba(254,254,253,0.6)', padding: 0, display: 'flex', alignItems: 'center',
                }}>
                  <IconeOlho aberto={mostrar} />
                </button>
              </div>
              <span className="input-hint">Mín. 8 caracteres, maiúscula, minúscula, número e caractere especial</span>
            </div>

            {/* Confirmar senha */}
            <div className="input-group">
              <div style={{ position: 'relative', width: '100%' }}>
                <input className="input-field" type={mostrar2 ? 'text' : 'password'}
                  placeholder="Confirmar nova senha" value={confirmar}
                  onChange={e => setConfirmar(e.target.value)} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setMostrar2(m => !m)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'rgba(254,254,253,0.6)', padding: 0, display: 'flex', alignItems: 'center',
                }}>
                  <IconeOlho aberto={mostrar2} />
                </button>
              </div>
              <span className="input-hint">Deve ser igual à senha acima</span>
            </div>

            <button className="btn btn-green" style={{ marginTop: 8 }} onClick={handleSalvar}>
              Salvar Nova Senha
            </button>
          </div>
        </div>
      </div>
      <Footer />
      {alerta && <AlertToast message={alerta} onClose={() => setAlerta('')} />}
    </div>
  )
}
