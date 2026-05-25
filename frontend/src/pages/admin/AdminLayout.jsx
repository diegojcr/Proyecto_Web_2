import { NavLink, useNavigate } from 'react-router-dom'
import { Package, Users, LayoutDashboard, LogOut, Truck, MessageSquare } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/admin/users',     icon: Users,           label: 'Usuarios'   },
  { to: '/admin/shipments', icon: Truck,           label: 'Envíos'     },
  { to: '/admin/messages',  icon: MessageSquare,   label: 'Mensajes'   },
]

export default function AdminLayout({ children }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#080d1a' }}>

      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0,
        backgroundColor: '#0d1628',
        borderRight: '1px solid #1e293b',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 40,
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #1e293b',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Package size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>
              Sky<span style={{ color: '#38bdf8' }}>Ship</span>
            </div>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500, letterSpacing: '0.5px' }}>
              ADMIN
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                fontSize: 14, fontWeight: 500, textDecoration: 'none',
                transition: 'all 0.2s',
                backgroundColor: isActive ? 'rgba(56,189,248,0.1)' : 'transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                borderLeft: isActive ? '2px solid #38bdf8' : '2px solid transparent',
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Usuario y logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #1e293b' }}>
          <div style={{ padding: '8px 12px', marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 500 }}>
              {usuario?.nombre_completo?.split(' ')[0]}
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{usuario?.correo}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 12px', borderRadius: 8, fontSize: 13,
              fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: 'transparent', border: '1px solid #1e293b',
              color: '#94a3b8',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#94a3b8' }}
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main style={{ flex: 1, marginLeft: 240, padding: '40px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}