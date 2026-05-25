import { useState, useEffect } from 'react'
import { MessageSquare, Mail, Phone, Search, CheckCircle, Clock } from 'lucide-react'
import AdminLayout from './AdminLayout'
import api from '../../services/api'

function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr + 'Z')
  return fecha.toLocaleString('es-GT', {
    timeZone: 'America/Guatemala',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminMessages() {
  const [mensajes, setMensajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos') // 'todos' | 'no_leidos' | 'leidos'
  const [expandido, setExpandido] = useState(null)
  const [marcando, setMarcando] = useState(null)

  const cargar = async () => {
    try {
      const res = await api.get('/admin/messages')
      setMensajes(res.data.mensajes)
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const marcarLeido = async (id) => {
    setMarcando(id)
    try {
      await api.put(`/admin/messages/${id}/read`)
      setMensajes((prev) =>
        prev.map((m) => m.id_mensaje === id ? { ...m, leido: true } : m)
      )
    } catch (err) {
      console.error(err)
    } finally {
      setMarcando(null)
    }
  }

  const filtrados = mensajes
    .filter((m) => {
      if (filtro === 'no_leidos') return !m.leido
      if (filtro === 'leidos') return m.leido
      return true
    })
    .filter((m) =>
      m.nombre_remitente.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.correo_remitente.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.asunto.toLowerCase().includes(busqueda.toLowerCase())
    )

  const noLeidos = mensajes.filter((m) => !m.leido).length

  return (
    <AdminLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          Mensajes de contacto
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          {mensajes.length} mensaje{mensajes.length !== 1 ? 's' : ''} en total
          {noLeidos > 0 && (
            <span style={{
              marginLeft: 10, backgroundColor: 'rgba(251,191,36,0.15)',
              color: '#fbbf24', fontSize: 12, fontWeight: 600,
              padding: '2px 8px', borderRadius: 20,
              border: '1px solid rgba(251,191,36,0.3)',
            }}>
              {noLeidos} sin leer
            </span>
          )}
        </p>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>

        {/* Buscador */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 380 }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, correo o asunto..."
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

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 'todos',     label: 'Todos'    },
            { key: 'no_leidos', label: 'Sin leer' },
            { key: 'leidos',    label: 'Leídos'   },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13,
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                border: '1px solid',
                borderColor: filtro === key ? '#38bdf8' : '#1e293b',
                backgroundColor: filtro === key ? 'rgba(56,189,248,0.1)' : 'transparent',
                color: filtro === key ? '#38bdf8' : '#64748b',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {cargando ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '80px 0' }}>Cargando...</div>
      ) : filtrados.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 0',
          backgroundColor: '#111827', border: '1px solid #1e293b',
          borderRadius: 12,
        }}>
          <MessageSquare size={40} color="#1e293b" style={{ marginBottom: 12 }} />
          <p style={{ margin: 0, color: '#64748b' }}>No hay mensajes</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtrados.map((m) => {
            const abierto = expandido === m.id_mensaje
            return (
              <div
                key={m.id_mensaje}
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid',
                  borderColor: abierto ? 'rgba(56,189,248,0.35)' : (m.leido ? '#1e293b' : 'rgba(251,191,36,0.25)'),
                  borderRadius: 12,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
              >
                {/* Cabecera */}
                <div
                  onClick={() => setExpandido(abierto ? null : m.id_mensaje)}
                  style={{
                    padding: '16px 20px',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 16,
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0 }}>
                    {/* Indicador leído */}
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      backgroundColor: m.leido ? '#334155' : '#fbbf24',
                    }} />

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>
                          {m.nombre_remitente}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                          backgroundColor: 'rgba(56,189,248,0.1)', color: '#38bdf8',
                        }}>
                          {m.asunto}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Mail size={11} /> {m.correo_remitente}
                        </span>
                        {m.telefono && (
                          <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={11} /> {m.telefono}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {formatearFecha(m.fecha_envio)}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      backgroundColor: m.leido ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)',
                      color: m.leido ? '#4ade80' : '#fbbf24',
                    }}>
                      {m.leido ? 'Leído' : 'Sin leer'}
                    </span>
                  </div>
                </div>

                {/* Contenido expandido */}
                {abierto && (
                  <div style={{
                    padding: '0 20px 20px',
                    borderTop: '1px solid #1e293b',
                  }}>
                    <p style={{
                      color: '#94a3b8', fontSize: 14, lineHeight: 1.75,
                      margin: '16px 0 20px', whiteSpace: 'pre-wrap',
                    }}>
                      {m.mensaje}
                    </p>

                    {!m.leido && (
                      <button
                        onClick={() => marcarLeido(m.id_mensaje)}
                        disabled={marcando === m.id_mensaje}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '8px 18px', borderRadius: 8, fontSize: 13,
                          fontWeight: 600, cursor: marcando === m.id_mensaje ? 'not-allowed' : 'pointer',
                          border: 'none', transition: 'all 0.2s',
                          backgroundColor: marcando === m.id_mensaje ? '#1e293b' : '#4ade80',
                          color: marcando === m.id_mensaje ? '#64748b' : '#080d1a',
                        }}
                      >
                        <CheckCircle size={14} />
                        {marcando === m.id_mensaje ? 'Marcando...' : 'Marcar como leído'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}