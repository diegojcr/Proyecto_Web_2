import { useState, useEffect, useRef } from 'react'
import { Search, Package, CheckCircle, Clock, Truck, MapPin, X, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import api from '../../services/api'

const estadoIcono = {
  'Recibido':       <Clock size={16} />,
  'En preparacion': <Package size={16} />,
  'En transito':    <Truck size={16} />,
  'En destino':     <MapPin size={16} />,
  'Entregado':      <CheckCircle size={16} />,
  'Cancelado':      <X size={16} />,
}

const estadoColor = {
  'Recibido':       '#38bdf8',
  'En preparacion': '#fbbf24',
  'En transito':    '#a855f7',
  'En destino':     '#22c55e',
  'Entregado':      '#4ade80',
  'Cancelado':      '#f87171',
}

// Convierte fecha UTC a hora Guatemala (UTC-6)
function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr + 'Z') // fuerza interpretacion UTC
  return fecha.toLocaleString('es-GT', {
    timeZone: 'America/Guatemala',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Tracking() {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')
  const [envio, setEnvio] = useState(null)
  const [historial, setHistorial] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000')

    socketRef.current.on('estado_actualizado', (data) => {
      setHistorial((prev) => [...prev, {
        estado:       data.estado,
        observacion:  data.observacion,
        fecha_cambio: data.fecha,
      }])
      setEnvio((prev) => prev ? { ...prev, estado: data.estado } : prev)
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  const buscar = async (e) => {
    e.preventDefault()
    if (!codigo.trim()) return

    setError('')
    setEnvio(null)
    setHistorial([])
    setCargando(true)

    try {
      const res = await api.get(`/shipments/${codigo.trim()}`)
      setEnvio(res.data.envio)
      setHistorial(res.data.historial)
      socketRef.current?.emit('join', { codigo_guia: codigo.trim() })
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No se encontró ningún envío con ese código de guía')
      } else {
        setError('Error al buscar el envío')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080d1a' }}>

      {/* Header con boton regresar */}
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

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              backgroundColor: 'transparent', border: '1px solid #1e293b',
              color: '#94a3b8', padding: '7px 14px', borderRadius: 6,
              fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.color = '#38bdf8' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#94a3b8' }}
          >
            <ArrowLeft size={14} /> Mis envíos
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 24px 40px' }}>

        {/* Titulo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Package size={28} color="#fff" />
          </div>
          <h1 style={{
            fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800,
            color: '#f1f5f9', margin: '0 0 12px', letterSpacing: '-0.5px',
          }}>
            Rastrear paquete
          </h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>
            Ingresa tu código de guía para ver el estado en tiempo real
          </p>
        </div>

        {/* Buscador */}
        <form onSubmit={buscar} style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} color="#64748b" style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)'
            }} />
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="SKY-20260524-XXXXXX"
              style={{
                width: '100%', padding: '14px 16px 14px 44px',
                backgroundColor: '#111827', border: '1px solid #1e293b',
                borderRadius: 10, color: '#f1f5f9', fontSize: 15,
                outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
              onBlur={(e) => e.target.style.borderColor = '#1e293b'}
            />
          </div>
          <button
            type="submit"
            disabled={cargando}
            style={{
              backgroundColor: cargando ? '#1e293b' : '#38bdf8',
              color: cargando ? '#64748b' : '#080d1a',
              padding: '14px 24px', borderRadius: 10, fontSize: 15,
              fontWeight: 700, border: 'none', cursor: cargando ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => { if (!cargando) e.currentTarget.style.backgroundColor = '#7dd3fc' }}
            onMouseLeave={(e) => { if (!cargando) e.currentTarget.style.backgroundColor = '#38bdf8' }}
          >
            {cargando ? 'Buscando...' : 'Rastrear'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 10, padding: '14px 18px', color: '#f87171',
            fontSize: 14, marginBottom: 24, textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Resultado */}
        {envio && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Info del envio */}
            <div style={{
              backgroundColor: '#111827', border: '1px solid #1e293b',
              borderRadius: 14, padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Código de guía</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                    {envio.codigo_guia}
                  </div>
                </div>
                <div style={{
                  backgroundColor: `${estadoColor[envio.estado]}20`,
                  color: estadoColor[envio.estado] || '#38bdf8',
                  padding: '6px 14px', borderRadius: 20,
                  fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {estadoIcono[envio.estado]}
                  {envio.estado}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
                {[
                  ['Destinatario',    envio.nombre_destinatario],
                  ['Región destino',  envio.region_destino],
                  ['Tipo de servicio', envio.tipo_servicio],
                  ['Costo estimado',  `Q${envio.costo_estimado}`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ color: '#64748b', marginBottom: 2 }}>{label}</div>
                    <div style={{ color: '#f1f5f9', fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline historial */}
            <div style={{
              backgroundColor: '#111827', border: '1px solid #1e293b',
              borderRadius: 14, padding: '24px',
            }}>
              <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>
                Historial de estados
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {historial.map((h, i) => {
                  const color = estadoColor[h.estado] || '#38bdf8'
                  const esUltimo = i === historial.length - 1
                  return (
                    <div key={i} style={{ display: 'flex', gap: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          backgroundColor: `${color}20`,
                          border: `2px solid ${color}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color, flexShrink: 0,
                        }}>
                          {estadoIcono[h.estado]}
                        </div>
                        {!esUltimo && (
                          <div style={{ width: 2, flex: 1, backgroundColor: '#1e293b', minHeight: 24, margin: '4px 0' }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: esUltimo ? 0 : 20, paddingTop: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 2 }}>
                          {h.estado}
                        </div>
                        {h.observacion && (
                          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>
                            {h.observacion}
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {formatearFecha(h.fecha_cambio)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}