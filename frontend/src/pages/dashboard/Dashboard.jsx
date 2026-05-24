import { useState, useEffect } from 'react'
import { Package, Plus, LogOut, MapPin, Calendar, DollarSign, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import CrearEnvio from './CrearEnvio'

const estadoColor = {
  'Recibido':       { bg: 'rgba(56,189,248,0.1)',  color: '#38bdf8'  },
  'En preparacion': { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24'  },
  'En transito':    { bg: 'rgba(168,85,247,0.1)',  color: '#a855f7'  },
  'En destino':     { bg: 'rgba(34,197,94,0.1)',   color: '#22c55e'  },
  'Entregado':      { bg: 'rgba(74,222,128,0.1)',  color: '#4ade80'  },
  'Cancelado':      { bg: 'rgba(248,113,113,0.1)', color: '#f87171'  },
}

export default function Dashboard() {
  const { usuario, logout } = useAuth()
  const [envios, setEnvios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarCrear, setMostrarCrear] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const cargarEnvios = async () => {
    try {
      const res = await api.get('/shipments')
      setEnvios(res.data.envios)
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarEnvios()
  }, [])

  const enviosFiltrados = envios.filter((e) =>
    e.codigo_guia.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.nombre_destinatario.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.region_destino.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080d1a' }}>

      {/* Header */}
      <header style={{
        backgroundColor: 'rgba(8,13,26,0.95)',
        borderBottom: '1px solid #1e293b',
        padding: '0 24px',
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: 68,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Package size={20} color="#fff" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
              Sky<span style={{ color: '#38bdf8' }}>Ship</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 14, color: '#94a3b8' }}>
              Hola, <strong style={{ color: '#f1f5f9' }}>{usuario?.nombre_completo?.split(' ')[0]}</strong>
            </span>
            <button
              onClick={logout}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                backgroundColor: 'transparent', border: '1px solid #1e293b',
                color: '#94a3b8', padding: '7px 14px', borderRadius: 6,
                fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#f87171' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#94a3b8' }}
            >
              <LogOut size={14} /> Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        {/* Titulo y boton */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' }}>
              Mis envíos
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
              {envios.length} envío{envios.length !== 1 ? 's' : ''} registrado{envios.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setMostrarCrear(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              backgroundColor: '#38bdf8', color: '#080d1a',
              padding: '10px 20px', borderRadius: 8, fontSize: 14,
              fontWeight: 700, border: 'none', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7dd3fc'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#38bdf8'}
          >
            <Plus size={16} /> Nuevo envío
          </button>
        </div>

        {/* Buscador */}
        <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por guía, destinatario o región..."
            style={{
              width: '100%', padding: '10px 16px 10px 42px',
              backgroundColor: '#111827', border: '1px solid #1e293b',
              borderRadius: 8, color: '#f1f5f9', fontSize: 13,
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
            }}
            onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
            onBlur={(e) => e.target.style.borderColor = '#1e293b'}
          />
        </div>

        {/* Lista de envios */}
        {cargando ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b' }}>
            Cargando envíos...
          </div>
        ) : enviosFiltrados.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 0',
            backgroundColor: '#111827', border: '1px solid #1e293b',
            borderRadius: 12,
          }}>
            <Package size={48} color="#1e293b" style={{ marginBottom: 16 }} />
            <p style={{ color: '#64748b', fontSize: 15 }}>
              {busqueda ? 'No se encontraron envíos' : 'Aún no tienes envíos registrados'}
            </p>
            {!busqueda && (
              <button
                onClick={() => setMostrarCrear(true)}
                style={{
                  marginTop: 16, backgroundColor: 'rgba(56,189,248,0.1)',
                  border: '1px solid rgba(56,189,248,0.3)',
                  color: '#38bdf8', padding: '10px 24px', borderRadius: 8,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Crear primer envío
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {enviosFiltrados.map((envio) => {
              const estilo = estadoColor[envio.estado] || estadoColor['Recibido']
              return (
                <div
                  key={envio.codigo_guia}
                  style={{
                    backgroundColor: '#111827',
                    border: '1px solid #1e293b',
                    borderRadius: 12, padding: '20px 24px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr auto',
                    gap: 16, alignItems: 'center',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#334155'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e293b'}
                >
                  {/* Codigo y tipo */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', marginBottom: 4, fontFamily: 'monospace' }}>
                      {envio.codigo_guia}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {envio.tipo_servicio}
                    </div>
                  </div>

                  {/* Destinatario y region */}
                  <div>
                    <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 500, marginBottom: 4 }}>
                      {envio.nombre_destinatario}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
                      <MapPin size={11} /> {envio.region_destino}
                    </div>
                  </div>

                  {/* Fecha y costo */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                      <Calendar size={11} />
                      {new Date(envio.fecha_creacion).toLocaleDateString('es-GT')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>
                      <DollarSign size={12} color="#4ade80" />
                      Q{envio.costo_estimado}
                    </div>
                  </div>

                  {/* Estado */}
                  <div style={{
                    backgroundColor: estilo.bg,
                    color: estilo.color,
                    padding: '4px 12px', borderRadius: 20,
                    fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                  }}>
                    {envio.estado}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Modal crear envio */}
      {mostrarCrear && (
        <CrearEnvio
          onClose={() => setMostrarCrear(false)}
          onCreado={() => { setMostrarCrear(false); cargarEnvios() }}
        />
      )}
    </div>
  )
}