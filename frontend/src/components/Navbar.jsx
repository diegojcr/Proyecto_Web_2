import { useState, useEffect } from 'react'
import { Menu, X, Package, LogIn, UserPlus, LayoutDashboard } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { label: 'Servicios', href: '#services' },
  { label: 'Nosotros', href: '#about' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contacto', href: '#contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLink = (e, href) => {
    e.preventDefault()
    setOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.3s ease',
        backgroundColor: scrolled ? 'rgba(8,13,26,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #1e293b' : '1px solid transparent',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>

          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Package size={20} color="#fff" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
              Sky<span style={{ color: '#38bdf8' }}>Ship</span>
            </span>
          </a>

          <div style={{ display: 'flex', gap: 36, alignItems: 'center' }} className="desktop-nav">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => handleLink(e, l.href)}
                style={{
                  color: '#94a3b8', fontSize: 14, fontWeight: 500,
                  textDecoration: 'none', letterSpacing: '0.3px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.color = '#f1f5f9'}
                onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
              >
                {l.label}
              </a>
            ))}

            {usuario ? (
              <button
                onClick={() => navigate(usuario.rol === 'Administrador' ? '/admin/dashboard' : '/dashboard')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  backgroundColor: '#38bdf8', color: '#080d1a',
                  padding: '8px 18px', borderRadius: 6, fontSize: 14,
                  fontWeight: 600, border: 'none', cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7dd3fc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#38bdf8'}
              >
                <LayoutDashboard size={15} />
                Mi cuenta
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <Link
                  to="/login"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    backgroundColor: 'transparent',
                    border: '1px solid #1e293b',
                    color: '#f1f5f9', padding: '8px 18px', borderRadius: 6,
                    fontSize: 14, fontWeight: 600, textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.color = '#38bdf8' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#f1f5f9' }}
                >
                  <LogIn size={15} />
                  Iniciar sesion
                </Link>
                <Link
                  to="/register"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    backgroundColor: '#38bdf8', color: '#080d1a',
                    padding: '8px 18px', borderRadius: 6, fontSize: 14,
                    fontWeight: 600, textDecoration: 'none',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7dd3fc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#38bdf8'}
                >
                  <UserPlus size={15} />
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            style={{
              display: 'none', background: 'none', border: 'none',
              color: '#94a3b8', cursor: 'pointer', padding: 4,
            }}
            className="mobile-menu-btn"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div style={{
          backgroundColor: '#0d1628',
          borderTop: '1px solid #1e293b',
          padding: '16px 24px 24px',
        }}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleLink(e, l.href)}
              style={{
                display: 'block', color: '#94a3b8', fontSize: 15,
                padding: '12px 0', textDecoration: 'none',
                borderBottom: '1px solid #1e293b',
              }}
            >
              {l.label}
            </a>
          ))}

          {usuario ? (
            <button
              onClick={() => { setOpen(false); navigate(usuario.rol === 'Administrador' ? '/admin/dashboard' : '/dashboard') }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                width: '100%', marginTop: 16,
                backgroundColor: '#38bdf8', color: '#080d1a',
                padding: '12px', borderRadius: 6, fontSize: 15,
                fontWeight: 600, border: 'none', cursor: 'pointer',
              }}
            >
              <LayoutDashboard size={15} />
              Mi cuenta
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  border: '1px solid #1e293b', color: '#f1f5f9',
                  padding: '12px', borderRadius: 6, fontSize: 15,
                  fontWeight: 600, textDecoration: 'none', textAlign: 'center',
                }}
              >
                <LogIn size={15} />
                Iniciar sesion
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  backgroundColor: '#38bdf8', color: '#080d1a',
                  padding: '12px', borderRadius: 6, fontSize: 15,
                  fontWeight: 600, textDecoration: 'none', textAlign: 'center',
                }}
              >
                <UserPlus size={15} />
                Registrarse
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}