import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  // Al montar, verifica si hay sesion activa
  useEffect(() => {
    const token = localStorage.getItem('skyship_token')
    const usuarioGuardado = localStorage.getItem('skyship_user')

    if (token && usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado))
    }
    setCargando(false)
  }, [])

  const login = async (correo, contrasena) => {
    const response = await api.post('/auth/login', { correo, contrasena })
    const { token, usuario } = response.data

    localStorage.setItem('skyship_token', token)
    localStorage.setItem('skyship_user', JSON.stringify(usuario))
    setUsuario(usuario)

    return usuario
  }

  const register = async (datos) => {
    const response = await api.post('/auth/register', datos)
    const { token, usuario } = response.data

    localStorage.setItem('skyship_token', token)
    localStorage.setItem('skyship_user', JSON.stringify(usuario))
    setUsuario(usuario)

    return usuario
  }

  const logout = () => {
    localStorage.removeItem('skyship_token')
    localStorage.removeItem('skyship_user')
    setUsuario(null)
  }

  const esAdmin = () => usuario?.rol === 'Administrador'
  const esCliente = () => usuario?.rol === 'Cliente'

  return (
    <AuthContext.Provider value={{
      usuario,
      cargando,
      login,
      register,
      logout,
      esAdmin,
      esCliente,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}