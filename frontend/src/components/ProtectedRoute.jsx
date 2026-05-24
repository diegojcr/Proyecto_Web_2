import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, soloAdmin = false }) {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#080d1a',
        color: '#38bdf8',
        fontSize: 16,
      }}>
        Cargando...
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (soloAdmin && usuario.rol !== 'Administrador') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}