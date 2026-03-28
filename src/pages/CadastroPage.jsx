import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { AlertToast, ConfirmModal } from '../components/Modals'

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function formatarCPF(v) {
  return v.replace(/\D/g, '').slice(0, 11)
}

function formatarTelefone(v) {
  return v.replace(/\D/g, '').slice(0, 15)
}

export default function CadastroPage() {
  const navigate = useNavigate()
  const { cadastrar } = useApp()

  const [form, setForm] = useState({
    nome: '', cpf: '', telefone: '', email: '', senha: '', confirmarSenha: ''
  })
  const [alerta, setAlerta] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  function handleChange(field, value) {
    let v = value
    if (field === 'nome') v = value.slice(0, 15)
    if (field === 'cpf') v = formatarCPF(value)
    if (field === 'telefone') v = formatarTelefone(value)
    setForm(prev => ({ ...prev, [field]: v }))
  }

  function validar() {
    const { nome, cpf, telefone, email, senha, confirmarSenha } = form

    if (!nome || !cpf || !telefone || !email || !senha || !confirmarSenha) {
      setAlerta('Preencha todos os campos!'); return false
    }
    if (!validarEmail(email)) {
      setAlerta('E-mail inválido!'); return false
    }
    if (cpf.length !== 11) {
      setAlerta('Dados inválidos!'); return false
    }
    if (senha.length < 8) {
      setAlerta('Dados inválidos!'); return false
    }
    if (senha !== confirmarSenha) {
      setAlerta('Dados não conferem!'); return false
    }
    return true
  }

  function handleConfirmar() {
    if (!validar()) return
    setShowConfirm(true)
  }

  function confirmar() {
    const { nome, cpf, telefone, email, senha } = form
    const result = cadastrar({ nome, cpf, telefone, email, senha })

    if (result === 'email') { setAlerta('E-mail já cadastrado!'); setShowConfirm(false); return }
    if (result === 'cpf') { setAlerta('CPF já cadastrado!'); setShowConfirm(false); return }

    navigate('/home')
  }

  const fields = [
    { key: 'nome', label: 'Nome', type: 'text', hint: 'Máximo 15 caracteres' },
    { key: 'cpf', label: 'CPF', type: 'text', hint: '11 dígitos numéricos' },
    { key: 'telefone', label: 'Telefone', type: 'tel', hint: 'Somente números, máximo 15 dígitos' },
    { key: 'email', label: 'E-mail', type: 'email', hint: 'Formato válido de e-mail' },
    { key: 'senha', label: 'Senha', type: 'password', hint: 'Mínimo 8 caracteres' },
    { key: 'confirmarSenha', label: 'Confirmar Senha', type: 'password', hint: 'Deve ser igual à senha acima' },
  ]

  return (
    <div className="app-shell">
      <Header />

      <div className="page-content" style={{ paddingBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, width: '100%', maxWidth: 420 }}>
          <button
            style={{ background: 'transparent', border: 'none', color: 'var(--branco)', fontSize: 22, cursor: 'pointer' }}
            onClick={() => navigate('/login')}
          >
            ←
          </button>
          <h2 className="page-title-white" style={{ margin: 0 }}>Cadastro</h2>
        </div>

        <div className="card" style={{ maxWidth: 420 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {fields.map(f => (
              <div key={f.key} className="input-group">
                <input
                  className="input-field"
                  type={f.type}
                  placeholder={f.label}
                  value={form[f.key]}
                  onChange={e => handleChange(f.key, e.target.value)}
                />
                <span className="input-hint">{f.hint}</span>
              </div>
            ))}

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
