import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'

import LoginPage from './pages/LoginPage'
import CadastroPage from './pages/CadastroPage'
import HomePage from './pages/HomePage'
import ReservaPage from './pages/ReservaPage'
import ConfirmacaoPage from './pages/ConfirmacaoPage'
import MinhasReservasPage from './pages/MinhasReservasPage'
import EditarReservaPage from './pages/EditarReservaPage'
import AdminPage from './pages/AdminPage'
import NovaSenhaPage from './pages/NovaSenhaPage'

function PrivateRoute({ children, adminOnly = false }) {
  const { usuarioLogado, loading } = useApp()
  if (loading) return null
  if (!usuarioLogado) return <Navigate to="/login" replace />
  if (adminOnly && !usuarioLogado.isAdmin) return <Navigate to="/home" replace />
  if (!adminOnly && usuarioLogado.isAdmin) return <Navigate to="/admin" replace />
  return children
}

function AppRoutes() {
  const { usuarioLogado, loading } = useApp()
  if (loading) return null

  return (
    <Routes>
      <Route path="/" element={
        usuarioLogado
          ? usuarioLogado.isAdmin
            ? <Navigate to="/admin" replace />
            : <Navigate to="/home" replace />
          : <Navigate to="/login" replace />
      } />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroPage />} />
      <Route path="/nova-senha" element={<NovaSenhaPage />} />

      <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/reserva" element={<PrivateRoute><ReservaPage /></PrivateRoute>} />
      <Route path="/confirmacao" element={<PrivateRoute><ConfirmacaoPage /></PrivateRoute>} />
      <Route path="/minhas-reservas" element={<PrivateRoute><MinhasReservasPage /></PrivateRoute>} />
      <Route path="/editar-reserva" element={<PrivateRoute><EditarReservaPage /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute adminOnly><AdminPage /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}
