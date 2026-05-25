import { useState, useEffect } from 'react'
import { Truck, Search, Edit2, Trash2, X, Save, ChevronDown, Plus, Package } from 'lucide-react'
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

const inputStyle = {
  width: '100%', padding: '10px 14px',
  backgroundColor: '#0d1628', border: '1px solid #1e293b',
  borderRadius: 8, color: '#f1f5f9', fontSize: 14,
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}

const initialForm = {
  id_usuario: '', id_tipo_servicio: '', id_region_destino: '',
  direccion_origen: '', nombre_destinatario: '',
  direccion_destino: '', peso_kg: '', descripcion_paquete: '',
}

function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr + 'Z')
  return fecha.toLocaleDateString('es-GT', {
    timeZone: 'America/Guatemala',
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

const focus = (e) => e.target.style.borderColor = '#38bdf8'
const blur  = (e) => e.target.style.borderColor = '#1e293b'

export default function AdminShipments() {
  const [envios, setEnvios]                 = useState([])
  const [estados, setEstados]               = useState([])
  const [tipos, setTipos]                   = useState([])
  const [regiones, setRegiones]             = useState([])
  const [usuarios, setUsuarios]             = useState([])
  const [cargando, setCargando]             = useState(true)
  const [busqueda, setBusqueda]             = useState('')
  const [editando, setEditando]             = useState(null)
  const [formEdit, setFormEdit]             = useState({})
  const [guardando, setGuardando]           = useState(false)
  const [confirmEliminar, setConfirmEliminar] = useState(null)
  const [modalCrear, setModalCrear]         = useState(false)
  const [formCrear, setFormCrear]           = useState(initialForm)
  const [erroresCrear, setErroresCrear]     = useState({})
  const [creando, setCreando]               = useState(false)

  const cargar = async () => {
    try {
      const [resEnvios, resEstados, resTipos, resRegiones, resUsuarios] = await Promise.all([
        api.get('/admin/shipments'),
        api.get('/shipments/estados'),
        api.get('/shipments/tipos'),
        api.get('/shipments/regiones'),
        api.get('/admin/users'),
      ])
      setEnvios(resEnvios.data.envios)
      setEstados(resEstados.data.estados)
      setTipos(resTipos.data.tipos)
      setRegiones(resRegiones.data.regiones)
      setUsuarios(resUsuarios.data.usuarios.filter((u) => u.activo))
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

  // ── Edición inline ──────────────────────────────────────
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

  // ── Crear envío ─────────────────────────────────────────
  const validarCrear = () => {
    const errs = {}
    if (!formCrear.id_usuario)          errs.id_usuario          = 'Requerido'
    if (!formCrear.id_tipo_servicio)    errs.id_tipo_servicio    = 'Requerido'
    if (!formCrear.id_region_destino)   errs.id_region_destino   = 'Requerido'
    if (!formCrear.direccion_origen.trim())    errs.direccion_origen    = 'Requerido'
    if (!formCrear.nombre_destinatario.trim()) errs.nombre_destinatario = 'Requerido'
    if (!formCrear.direccion_destino.trim())   errs.direccion_destino   = 'Requerido'
    if (!formCrear.peso_kg)             errs.peso_kg             = 'Requerido'
    else if (parseFloat(formCrear.peso_kg) <= 0) errs.peso_kg   = 'Debe ser mayor a 0'
    return errs
  }

  const handleCrear = async (e) => {
    e.preventDefault()
    const errs = validarCrear()
    if (Object.keys(errs).length) { setErroresCrear(errs); return }

    setCreando(true)
    try {
      await api.post('/admin/shipments', {
        id_usuario:          parseInt(formCrear.id_usuario),
        id_tipo_servicio:    parseInt(formCrear.id_tipo_servicio),
        id_region_destino:   parseInt(formCrear.id_region_destino),
        direccion_origen:    formCrear.direccion_origen,
        nombre_destinatario: formCrear.nombre_destinatario,
        direccion_destino:   formCrear.direccion_destino,
        peso_kg:             parseFloat(formCrear.peso_kg),
        descripcion_paquete: formCrear.descripcion_paquete,
      })
      setModalCrear(false)
      setFormCrear(initialForm)
      setErroresCrear({})
      cargar()
    } catch (err) {
      setErroresCrear({ general: err.response?.data?.error || 'Error al crear el envío' })
    } finally {
      setCreando(false)
    }
  }

  const setCrearField = (field) => (e) => {
    setFormCrear((f) => ({ ...f, [field]: e.target.value }))
    if (erroresCrear[field]) setErroresCrear((er) => ({ ...er, [field]: undefined }))
    if (erroresCrear.general) setErroresCrear((er) => ({ ...er, general: undefined }))
  }

  return (
    <AdminLayout>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Envíos
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            {envios.length} envío{envios.length !== 1 ? 's' : ''} registrado{envios.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setModalCrear(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            backgroundColor: '#38bdf8', color: '#080d1a',
            padding: '10px 20px', borderRadius: 8, fontSize: 14,
            fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
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
        <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
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
                    <div
                      style={{ display: 'grid', gridTemplateColumns: COLS, padding: '16px 20px', borderBottom: '1px solid #1e293b', alignItems: 'center', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0d1628'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>{envio.codigo_guia}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{envio.tipo_servicio}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 500 }}>{envio.nombre_destinatario}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{envio.direccion_destino}</div>
                      </div>
                      <div style={{ fontSize: 13, color: '#94a3b8' }}>{envio.region_destino}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{formatearFecha(envio.fecha_creacion)}</div>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, backgroundColor: estilo.bg, color: estilo.color }}>
                          {envio.estado}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => abrirEdicion(envio)} title="Editar"
                          style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #1e293b', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.color = '#38bdf8' }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setConfirmEliminar(envio.codigo_guia)} title="Eliminar"
                          style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #1e293b', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#f87171' }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '20px', borderBottom: '1px solid #1e293b', backgroundColor: 'rgba(56,189,248,0.04)', borderLeft: '2px solid #38bdf8' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Estado</label>
                          <div style={{ position: 'relative' }}>
                            <select value={formEdit.id_estado} onChange={(e) => setFormEdit((f) => ({ ...f, id_estado: e.target.value }))}
                              style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }} onFocus={focus} onBlur={blur}>
                              {estados.map((e) => <option key={e.id_estado} value={e.id_estado}>{e.nombre}</option>)}
                            </select>
                            <ChevronDown size={14} color="#64748b" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Observación</label>
                          <input value={formEdit.observacion} onChange={(e) => setFormEdit((f) => ({ ...f, observacion: e.target.value }))}
                            placeholder="Ej: Paquete en camino..." style={inputStyle} onFocus={focus} onBlur={blur} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Destinatario</label>
                          <input value={formEdit.nombre_destinatario} onChange={(e) => setFormEdit((f) => ({ ...f, nombre_destinatario: e.target.value }))}
                            style={inputStyle} onFocus={focus} onBlur={blur} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Dirección destino</label>
                          <input value={formEdit.direccion_destino} onChange={(e) => setFormEdit((f) => ({ ...f, direccion_destino: e.target.value }))}
                            style={inputStyle} onFocus={focus} onBlur={blur} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => guardarEdicion(envio.codigo_guia)} disabled={guardando}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: '#38bdf8', color: '#080d1a' }}>
                          <Save size={13} /> {guardando ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button onClick={() => setEditando(null)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #1e293b', color: '#94a3b8' }}>
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

      {/* Modal crear envío */}
      {modalCrear && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Package size={20} color="#38bdf8" />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Nuevo envío</h2>
              </div>
              <button onClick={() => { setModalCrear(false); setFormCrear(initialForm); setErroresCrear({}) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {erroresCrear.general && (
              <div style={{ backgroundColor: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 20 }}>
                {erroresCrear.general}
              </div>
            )}

            <form onSubmit={handleCrear} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Usuario */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Cliente *</label>
                <select value={formCrear.id_usuario} onChange={setCrearField('id_usuario')}
                  style={{ ...inputStyle, cursor: 'pointer', borderColor: erroresCrear.id_usuario ? '#f87171' : '#1e293b' }}
                  onFocus={focus} onBlur={blur}>
                  <option value="">Seleccionar cliente...</option>
                  {usuarios.map((u) => (
                    <option key={u.id_usuario} value={u.id_usuario}>
                      {u.nombre_completo} — {u.correo}
                    </option>
                  ))}
                </select>
                {erroresCrear.id_usuario && <span style={{ fontSize: 11, color: '#f87171' }}>{erroresCrear.id_usuario}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Tipo de servicio *</label>
                  <select value={formCrear.id_tipo_servicio} onChange={setCrearField('id_tipo_servicio')}
                    style={{ ...inputStyle, cursor: 'pointer', borderColor: erroresCrear.id_tipo_servicio ? '#f87171' : '#1e293b' }}
                    onFocus={focus} onBlur={blur}>
                    <option value="">Seleccionar...</option>
                    {tipos.map((t) => <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>)}
                  </select>
                  {erroresCrear.id_tipo_servicio && <span style={{ fontSize: 11, color: '#f87171' }}>{erroresCrear.id_tipo_servicio}</span>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Región destino *</label>
                  <select value={formCrear.id_region_destino} onChange={setCrearField('id_region_destino')}
                    style={{ ...inputStyle, cursor: 'pointer', borderColor: erroresCrear.id_region_destino ? '#f87171' : '#1e293b' }}
                    onFocus={focus} onBlur={blur}>
                    <option value="">Seleccionar...</option>
                    {regiones.map((r) => <option key={r.id_region} value={r.id_region}>{r.nombre}</option>)}
                  </select>
                  {erroresCrear.id_region_destino && <span style={{ fontSize: 11, color: '#f87171' }}>{erroresCrear.id_region_destino}</span>}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Dirección de origen *</label>
                <input type="text" value={formCrear.direccion_origen} onChange={setCrearField('direccion_origen')}
                  placeholder="Zona 10, Guatemala City"
                  style={{ ...inputStyle, borderColor: erroresCrear.direccion_origen ? '#f87171' : '#1e293b' }}
                  onFocus={focus} onBlur={blur} />
                {erroresCrear.direccion_origen && <span style={{ fontSize: 11, color: '#f87171' }}>{erroresCrear.direccion_origen}</span>}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Nombre destinatario *</label>
                <input type="text" value={formCrear.nombre_destinatario} onChange={setCrearField('nombre_destinatario')}
                  placeholder="María López"
                  style={{ ...inputStyle, borderColor: erroresCrear.nombre_destinatario ? '#f87171' : '#1e293b' }}
                  onFocus={focus} onBlur={blur} />
                {erroresCrear.nombre_destinatario && <span style={{ fontSize: 11, color: '#f87171' }}>{erroresCrear.nombre_destinatario}</span>}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Dirección de destino *</label>
                <input type="text" value={formCrear.direccion_destino} onChange={setCrearField('direccion_destino')}
                  placeholder="Zona 1, Quetzaltenango"
                  style={{ ...inputStyle, borderColor: erroresCrear.direccion_destino ? '#f87171' : '#1e293b' }}
                  onFocus={focus} onBlur={blur} />
                {erroresCrear.direccion_destino && <span style={{ fontSize: 11, color: '#f87171' }}>{erroresCrear.direccion_destino}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Peso (kg) *</label>
                  <input type="number" step="0.1" min="0.1" value={formCrear.peso_kg} onChange={setCrearField('peso_kg')}
                    placeholder="2.5"
                    style={{ ...inputStyle, borderColor: erroresCrear.peso_kg ? '#f87171' : '#1e293b' }}
                    onFocus={focus} onBlur={blur} />
                  {erroresCrear.peso_kg && <span style={{ fontSize: 11, color: '#f87171' }}>{erroresCrear.peso_kg}</span>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Descripción del paquete</label>
                  <input type="text" value={formCrear.descripcion_paquete} onChange={setCrearField('descripcion_paquete')}
                    placeholder="Documentos, ropa..." style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => { setModalCrear(false); setFormCrear(initialForm); setErroresCrear({}) }}
                  style={{ flex: 1, padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #1e293b', color: '#94a3b8' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={creando}
                  style={{ flex: 2, padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 700, border: 'none', cursor: creando ? 'not-allowed' : 'pointer', backgroundColor: creando ? '#1e293b' : '#38bdf8', color: creando ? '#64748b' : '#080d1a' }}>
                  {creando ? 'Creando...' : 'Crear envío'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmación eliminar */}
      {confirmEliminar && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: '32px', maxWidth: 400, width: '90%' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>¿Eliminar envío?</h3>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
              Esta acción eliminará permanentemente el envío{' '}
              <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{confirmEliminar}</strong>{' '}
              y todo su historial. No se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmEliminar(null)}
                style={{ flex: 1, padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #1e293b', color: '#94a3b8' }}>
                Cancelar
              </button>
              <button onClick={() => eliminar(confirmEliminar)}
                style={{ flex: 1, padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: '#f87171', color: '#fff' }}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}