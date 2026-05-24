import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Mail, Lock, User, Phone, MapPin, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const inputStyle = {
  width: '100%', padding: '12px 16px 12px 42px',
  backgroundColor: '#0d1628', border: '1px solid #1e293b',
  borderRadius: 8, color: '#f1f5f9', fontSize: 14,
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}

function Campo({ label, error, icon: Icon, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
        {children}
      </div>
      {error && <span style={{ fontSize: 12, color: '#f87171' }}>{error}</span>}
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState({
    nombre_completo: '', correo: '', telefono: '',
    direccion: '', contrasena: '', confirmar: '',
  })
  const [errors, setErrors] = useState({})
  const [cargando, setCargando] = useState(false)

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }))
  }

  const validar = () => {
    const errs = {}
    if (!form.nombre_completo.trim()) errs.nombre_completo = 'Requerido'
    if (!form.correo.trim()) errs.correo = 'Requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) errs.correo = 'Correo inválido'
    if (!form.telefono.trim()) errs.telefono = 'Requerido'
    if (!form.direccion.trim()) errs.direccion = 'Requerido'
    if (!form.contrasena) errs.contrasena = 'Requerido'
    else if (form.contrasena.length < 8) errs.contrasena = 'Mínimo 8 caracteres'
    if (form.contrasena !== form.confirmar) errs.confirmar = 'Las contraseñas no coinciden'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validar()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setCargando(true)
    try {
      await register({
        nombre_completo: form.nombre_completo.trim(),
        correo:          form.correo.trim(),
        telefono:        form.telefono.trim(),
        direccion:       form.direccion.trim(),
        contrasena:      form.contrasena,
      })
      navigate('/dashboard')
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'Error al registrarse' })
    } finally {
      setCargando(false)
    }
  }

  const focus = (e) => e.target.style.borderColor = '#38bdf8'
  const blur  = (e) => e.target.style.borderColor = '#1e293b'

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#080d1a',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

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
            Crea tu cuenta y empieza a enviar
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#111827', border: '1px solid #1e293b',
          borderRadius: 16, padding: '40px',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {errors.general && (
              <div style={{
                backgroundColor: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 8, padding: '12px 16px',
                color: '#f87171', fontSize: 13,
              }}>
                {errors.general}
              </div>
            )}

            <Campo label="Nombre completo" error={errors.nombre_completo} icon={User}>
              <input type="text" value={form.nombre_completo} onChange={set('nombre_completo')}
                placeholder="Juan García" style={inputStyle} onFocus={focus} onBlur={blur} />
            </Campo>

            <Campo label="Correo electrónico" error={errors.correo} icon={Mail}>
              <input type="email" value={form.correo} onChange={set('correo')}
                placeholder="juan@gmail.com" style={inputStyle} onFocus={focus} onBlur={blur} />
            </Campo>

            <Campo label="Teléfono" error={errors.telefono} icon={Phone}>
              <input type="tel" value={form.telefono} onChange={set('telefono')}
                placeholder="5551234567" style={inputStyle} onFocus={focus} onBlur={blur} />
            </Campo>

            <Campo label="Dirección" error={errors.direccion} icon={MapPin}>
              <input type="text" value={form.direccion} onChange={set('direccion')}
                placeholder="Zona 10, Guatemala City" style={inputStyle} onFocus={focus} onBlur={blur} />
            </Campo>

            <Campo label="Contraseña" error={errors.contrasena} icon={Lock}>
              <input type="password" value={form.contrasena} onChange={set('contrasena')}
                placeholder="Mínimo 8 caracteres" style={inputStyle} onFocus={focus} onBlur={blur} />
            </Campo>

            <Campo label="Confirmar contraseña" error={errors.confirmar} icon={Lock}>
              <input type="password" value={form.confirmar} onChange={set('confirmar')}
                placeholder="Repite tu contraseña" style={inputStyle} onFocus={focus} onBlur={blur} />
            </Campo>

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
              {cargando ? 'Creando cuenta...' : (<>Crear cuenta <ArrowRight size={16} /></>)}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#64748b' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
              Inicia sesión
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13 }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}