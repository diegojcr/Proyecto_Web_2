import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ correo: '', contrasena: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.correo || !form.contrasena) {
      setError('Todos los campos son requeridos')
      return
    }

    setCargando(true)
    try {
      const usuario = await login(form.correo, form.contrasena)
      if (usuario.rol === 'Administrador') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesion')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#080d1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Package size={24} color="#fff" />
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>
              Sky<span style={{ color: '#38bdf8' }}>Ship</span>
            </span>
          </Link>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 12 }}>
            Inicia sesión en tu cuenta
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#111827',
          border: '1px solid #1e293b',
          borderRadius: 16,
          padding: '40px',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {error && (
              <div style={{
                backgroundColor: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 8, padding: '12px 16px',
                color: '#f87171', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {/* Correo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
                Correo electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={form.correo}
                  onChange={set('correo')}
                  placeholder="juan@gmail.com"
                  style={{
                    width: '100%', padding: '12px 16px 12px 42px',
                    backgroundColor: '#0d1628', border: '1px solid #1e293b',
                    borderRadius: 8, color: '#f1f5f9', fontSize: 14,
                    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                  onBlur={(e) => e.target.style.borderColor = '#1e293b'}
                />
              </div>
            </div>

            {/* Contrasena */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  value={form.contrasena}
                  onChange={set('contrasena')}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '12px 16px 12px 42px',
                    backgroundColor: '#0d1628', border: '1px solid #1e293b',
                    borderRadius: 8, color: '#f1f5f9', fontSize: 14,
                    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                  onBlur={(e) => e.target.style.borderColor = '#1e293b'}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={cargando}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                backgroundColor: cargando ? '#1e293b' : '#38bdf8',
                color: cargando ? '#64748b' : '#080d1a',
                padding: '13px', borderRadius: 8, fontSize: 15,
                fontWeight: 700, border: 'none', cursor: cargando ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', marginTop: 4,
              }}
              onMouseEnter={(e) => { if (!cargando) e.currentTarget.style.backgroundColor = '#7dd3fc' }}
              onMouseLeave={(e) => { if (!cargando) e.currentTarget.style.backgroundColor = '#38bdf8' }}
            >
              {cargando ? 'Iniciando sesión...' : (<>Iniciar sesión <ArrowRight size={16} /></>)}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#64748b' }}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
              Regístrate aquí
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#64748b' }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}