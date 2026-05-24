import { useState, useEffect } from 'react'
import { Truck, Search, Edit2, Trash2, X, Save, ChevronDown } from 'lucide-react'
import AdminLayout from './AdminLayout'
import api from '../../services/api'

const estadoColor = {
  'Recibido':       { bg: 'rgba(56,189,248,0.1)',  color: '#38bdf8'  },
  'En preparacion': { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24'  },
  'En transito':    { bg: 'rgba(168,85,247,0.1)',  color: '#a855f7'  },
  'En destino':     { bg: 'rgba(34,197,94,0.1)',   color: '#22c55e'  },
  'Entregado':      { bg: 'rgba(74,222,128,0.1)',  color: '#4ade80'  },
  'Cancelado':      { bg: 'rgba(248,113,113,0.1)', color: '#f87171'  },
}

const COLS = '1.8fr 1.5fr 1fr 110px 110px 80px'

function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr + 'Z')
  return fecha.toLocaleDateString('es-GT', {
    timeZone: 'America/Guatemala',
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export default function AdminShipments() {
  const [envios, setEnvios] = useState([])
  const [estados, setEstados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState(null)
  const [formEdit, setFormEdit] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [confirmEliminar, setConfirmEliminar] = useState(null)

  const cargar = async () => {
    try {
      const [resEnvios, resEstados] = await Promise.all([
        api.get('/admin/shipments'),
        api.get('/shipments/estados'),
      ])
      setEnvios(resEnvios.data.envios)
      setEstados(resEstados.data.estados)
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const filtrados = envios.filter((e) =>
    e.codigo_guia.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.nombre_destinatario.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.region_destino.toLowerCase().includes(busqueda.toLowerCase())
  )

  const abrirEdicion = (envio) => {
    setEditando(envio.codigo_guia)
    setFormEdit({
      id_estado:           estados.find((e) => e.nombre === envio.estado)?.id_estado || '',
      nombre_destinatario: envio.nombre_destinatario,
      direccion_destino:   envio.direccion_destino,
      observacion:         '',
    })
  }

  const guardarEdicion = async (codigo) => {
    setGuardando(true)
    try {
      await api.put(`/admin/shipments/${codigo}`, formEdit)
      setEditando(null)
      cargar()
    } catch (err) {
      console.error(err)
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (codigo) => {
    try {
      await api.delete(`/admin/shipments/${codigo}`)
      setConfirmEliminar(null)
      cargar()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <AdminLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          Envíos
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          {envios.length} envío{envios.length !== 1 ? 's' : ''} registrado{envios.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Buscador */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
        <Search size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text" value={busqueda}
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

      {cargando ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '80px 0' }}>Cargando...</div>
      ) : (
        <div style={{
          backgroundColor: '#111827', border: '1px solid #1e293b',
          borderRadius: 12, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: COLS,
            padding: '12px 20px', borderBottom: '1px solid #1e293b',
            fontSize: 11, fontWeight: 600, color: '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <span>Código / Servicio</span>
            <span>Destinatario</span>
            <span>Región</span>
            <span>Fecha</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>

          {filtrados.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <Truck size={40} color="#1e293b" style={{ marginBottom: 12 }} />
              <p style={{ margin: 0 }}>No se encontraron envíos</p>
            </div>
          ) : (
            filtrados.map((envio) => {
              const estilo = estadoColor[envio.estado] || estadoColor['Recibido']
              return (
                <div key={envio.codigo_guia}>
                  {editando !== envio.codigo_guia ? (
                    /* Fila normal */
                    <div
                      style={{
                        display: 'grid', gridTemplateColumns: COLS,
                        padding: '16px 20px', borderBottom: '1px solid #1e293b',
                        alignItems: 'center', transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0d1628'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                          {envio.codigo_guia}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          {envio.tipo_servicio}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 500 }}>
                          {envio.nombre_destinatario}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          {envio.direccion_destino}
                        </div>
                      </div>

                      <div style={{ fontSize: 13, color: '#94a3b8' }}>
                        {envio.region_destino}
                      </div>

                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {formatearFecha(envio.fecha_creacion)}
                      </div>

                      <div>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                          backgroundColor: estilo.bg, color: estilo.color,
                        }}>
                          {envio.estado}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => abrirEdicion(envio)}
                          title="Editar"
                          style={{
                            width: 32, height: 32, borderRadius: 6,
                            border: '1px solid #1e293b', backgroundColor: 'transparent',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#64748b', transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.color = '#38bdf8' }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setConfirmEliminar(envio.codigo_guia)}
                          title="Eliminar"
                          style={{
                            width: 32, height: 32, borderRadius: 6,
                            border: '1px solid #1e293b', backgroundColor: 'transparent',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#64748b', transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#f87171' }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Fila edicion inline */
                    <div style={{
                      padding: '20px', borderBottom: '1px solid #1e293b',
                      backgroundColor: 'rgba(56,189,248,0.04)',
                      borderLeft: '2px solid #38bdf8',
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Estado</label>
                          <div style={{ position: 'relative' }}>
                            <select
                              value={formEdit.id_estado}
                              onChange={(e) => setFormEdit((f) => ({ ...f, id_estado: e.target.value }))}
                              style={{
                                width: '100%', padding: '10px 14px',
                                backgroundColor: '#0d1628', border: '1px solid #1e293b',
                                borderRadius: 8, color: '#f1f5f9', fontSize: 14,
                                outline: 'none', fontFamily: 'inherit',
                                boxSizing: 'border-box', appearance: 'none', cursor: 'pointer',
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                              onBlur={(e) => e.target.style.borderColor = '#1e293b'}
                            >
                              {estados.map((e) => (
                                <option key={e.id_estado} value={e.id_estado}>{e.nombre}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} color="#64748b" style={{
                              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                              pointerEvents: 'none',
                            }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Observación</label>
                          <input
                            value={formEdit.observacion}
                            onChange={(e) => setFormEdit((f) => ({ ...f, observacion: e.target.value }))}
                            placeholder="Ej: Paquete en camino..."
                            style={{
                              width: '100%', padding: '10px 14px',
                              backgroundColor: '#0d1628', border: '1px solid #1e293b',
                              borderRadius: 8, color: '#f1f5f9', fontSize: 14,
                              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                            onBlur={(e) => e.target.style.borderColor = '#1e293b'}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Destinatario</label>
                          <input
                            value={formEdit.nombre_destinatario}
                            onChange={(e) => setFormEdit((f) => ({ ...f, nombre_destinatario: e.target.value }))}
                            style={{
                              width: '100%', padding: '10px 14px',
                              backgroundColor: '#0d1628', border: '1px solid #1e293b',
                              borderRadius: 8, color: '#f1f5f9', fontSize: 14,
                              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                            onBlur={(e) => e.target.style.borderColor = '#1e293b'}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Dirección destino</label>
                          <input
                            value={formEdit.direccion_destino}
                            onChange={(e) => setFormEdit((f) => ({ ...f, direccion_destino: e.target.value }))}
                            style={{
                              width: '100%', padding: '10px 14px',
                              backgroundColor: '#0d1628', border: '1px solid #1e293b',
                              borderRadius: 8, color: '#f1f5f9', fontSize: 14,
                              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                            onBlur={(e) => e.target.style.borderColor = '#1e293b'}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => guardarEdicion(envio.codigo_guia)}
                          disabled={guardando}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px', borderRadius: 6, fontSize: 13,
                            fontWeight: 600, border: 'none', cursor: 'pointer',
                            backgroundColor: '#38bdf8', color: '#080d1a',
                          }}
                        >
                          <Save size={13} /> {guardando ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                          onClick={() => setEditando(null)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px', borderRadius: 6, fontSize: 13,
                            fontWeight: 600, cursor: 'pointer',
                            backgroundColor: 'transparent',
                            border: '1px solid #1e293b', color: '#94a3b8',
                          }}
                        >
                          <X size={13} /> Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Modal confirmacion eliminar */}
      {confirmEliminar && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#111827', border: '1px solid #1e293b',
            borderRadius: 14, padding: '32px', maxWidth: 400, width: '90%',
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
              ¿Eliminar envío?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
              Esta acción eliminará permanentemente el envío{' '}
              <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{confirmEliminar}</strong>{' '}
              y todo su historial. No se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmEliminar(null)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 8, fontSize: 14,
                  fontWeight: 600, cursor: 'pointer',
                  backgroundColor: 'transparent',
                  border: '1px solid #1e293b', color: '#94a3b8',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminar(confirmEliminar)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 8, fontSize: 14,
                  fontWeight: 600, cursor: 'pointer', border: 'none',
                  backgroundColor: '#f87171', color: '#fff',
                }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}