import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ConfirmModal } from './Modals'

export default function Header({ hideLogout = false }) {
  const navigate = useNavigate()
  const { usuarioLogado, logout } = useApp()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  function handleLogoClick() {
    if (!usuarioLogado) {
      navigate('/login')
    } else if (usuarioLogado.isAdmin) {
      navigate('/admin')
    } else {
      navigate('/home')
    }
  }

  function handleLogout() {
    setShowLogoutConfirm(true)
  }

  function confirmarLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      <header className="header">
        <img
          src="/logo.png"
          alt="GastroTech"
          className="header-logo"
          onClick={handleLogoClick}
        />

        {!hideLogout && usuarioLogado && (
          <button className="btn-logout" onClick={handleLogout} title="Sair">
            ⎋
          </button>
        )}
      </header>

      {showLogoutConfirm && (
        <ConfirmModal
          message="Realmente deseja sair?"
          confirmLabel="Sim, sair"
          confirmType="red"
          onConfirm={confirmarLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  )
}
