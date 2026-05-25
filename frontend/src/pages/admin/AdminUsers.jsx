import { useState, useEffect } from 'react'
import { Users, Search, Edit2, UserX, UserCheck, X, Save, Plus, Eye, EyeOff } from 'lucide-react'
import AdminLayout from './AdminLayout'
import api from '../../services/api'

const inputStyle = {
  width: '100%', padding: '10px 14px',
  backgroundColor: '#0d1628', border: '1px solid #1e293b',
  borderRadius: 8, color: '#f1f5f9', fontSize: 14,
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}

const initialForm = {
  nombre_completo: '', correo: '', telefono: '',
  direccion: '', contrasena: '', id_rol: '',
}

export default function AdminUsers() {
  const [usuarios, setUsuarios]       = useState([])
  const [roles, setRoles]             = useState([])
  const [cargando, setCargando]       = useState(true)
  const [busqueda, setBusqueda]       = useState('')
  const [editando, setEditando]       = useState(null)
  const [formEdit, setFormEdit]       = useState({})
  const [guardando, setGuardando]     = useState(false)
  const [modalCrear, setModalCrear]   = useState(false)
  const [formCrear, setFormCrear]     = useState(initialForm)
  const [erroresCrear, setErroresCrear] = useState({})
  const [creando, setCreando]         = useState(false)
  const [verContrasena, setVerContrasena] = useState(false)

  const cargar = async () => {
    try {
      const [resUsers, resRoles] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/roles'),
      ])
      setUsuarios(resUsers.data.usuarios)
      setRoles(resRoles.data.roles)
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const filtrados = usuarios.filter((u) =>
    u.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.correo.toLowerCase().includes(busqueda.toLowerCase())
  )

  // ── Edición inline ──────────────────────────────────────
  const abrirEdicion = (usuario) => {
    setEditando(usuario.id_usuario)
    setFormEdit({
      nombre_completo: usuario.nombre_completo,
      correo:          usuario.correo,
      telefono:        usuario.telefono,
      direccion:       usuario.direccion,
    })
  }

  const guardarEdicion = async (id) => {
    setGuardando(true)
    try {
      await api.put(`/admin/users/${id}`, formEdit)
      setEditando(null)
      cargar()
    } catch (err) {
      console.error(err)
    } finally {
      setGuardando(false)
    }
  }

  const toggleActivo = async (usuario) => {
    if (usuario.rol === 'Administrador') return
    try {
      if (usuario.activo) {
        await api.delete(`/admin/users/${usuario.id_usuario}`)
      } else {
        await api.put(`/admin/users/${usuario.id_usuario}`, { activo: true })
      }
      cargar()
    } catch (err) {
      console.error(err)
    }
  }

  // ── Crear usuario ───────────────────────────────────────
  const validarCrear = () => {
    const errs = {}
    if (!formCrear.nombre_completo.trim()) errs.nombre_completo = 'Requerido'
    if (!formCrear.correo.trim()) errs.correo = 'Requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formCrear.correo)) errs.correo = 'Correo inválido'
    if (!formCrear.telefono.trim()) errs.telefono = 'Requerido'
    if (!formCrear.direccion.trim()) errs.direccion = 'Requerido'
    if (!formCrear.contrasena) errs.contrasena = 'Requerido'
    else if (formCrear.contrasena.length < 8) errs.contrasena = 'Mínimo 8 caracteres'
    if (!formCrear.id_rol) errs.id_rol = 'Selecciona un rol'
    return errs
  }

  const handleCrear = async (e) => {
    e.preventDefault()
    const errs = validarCrear()
    if (Object.keys(errs).length) { setErroresCrear(errs); return }

    setCreando(true)
    try {
      await api.post('/admin/users', {
        ...formCrear,
        id_rol: parseInt(formCrear.id_rol),
      })
      setModalCrear(false)
      setFormCrear(initialForm)
      setErroresCrear({})
      cargar()
    } catch (err) {
      setErroresCrear({ general: err.response?.data?.error || 'Error al crear el usuario' })
    } finally {
      setCreando(false)
    }
  }

  const setCrearField = (field) => (e) => {
    setFormCrear((f) => ({ ...f, [field]: e.target.value }))
    if (erroresCrear[field]) setErroresCrear((er) => ({ ...er, [field]: undefined }))
    if (erroresCrear.general) setErroresCrear((er) => ({ ...er, general: undefined }))
  }

  const focus = (e) => e.target.style.borderColor = '#38bdf8'
  const blur  = (e) => e.target.style.borderColor = '#1e293b'

  const COLS = '1.5fr 2fr 130px 100px 80px'

  return (
    <AdminLayout>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Usuarios
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
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
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      {/* Buscador */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
        <Search size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text" value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o correo..."
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

      {/* Tabla */}
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
            <span>Usuario</span>
            <span>Contacto</span>
            <span>Rol</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>

          {filtrados.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <Users size={40} color="#1e293b" style={{ marginBottom: 12 }} />
              <p style={{ margin: 0 }}>No se encontraron usuarios</p>
            </div>
          ) : (
            filtrados.map((u) => (
              <div key={u.id_usuario}>
                {editando !== u.id_usuario ? (
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
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#f1f5f9' }}>{u.nombre_completo}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{u.correo}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: '#94a3b8' }}>{u.telefono}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{u.direccion}</div>
                    </div>
                    <div>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                        backgroundColor: u.rol === 'Administrador' ? 'rgba(168,85,247,0.15)' : 'rgba(56,189,248,0.1)',
                        color: u.rol === 'Administrador' ? '#a855f7' : '#38bdf8',
                      }}>
                        {u.rol}
                      </span>
                    </div>
                    <div>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                        backgroundColor: u.activo ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                        color: u.activo ? '#4ade80' : '#f87171',
                      }}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => abrirEdicion(u)} title="Editar"
                        style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #1e293b', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.color = '#38bdf8' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b' }}
                      >
                        <Edit2 size={13} />
                      </button>
                      {u.rol !== 'Administrador' && (
                        <button onClick={() => toggleActivo(u)} title={u.activo ? 'Desactivar' : 'Activar'}
                          style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #1e293b', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = u.activo ? '#f87171' : '#4ade80'; e.currentTarget.style.color = u.activo ? '#f87171' : '#4ade80' }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b' }}
                        >
                          {u.activo ? <UserX size={13} /> : <UserCheck size={13} />}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '20px', borderBottom: '1px solid #1e293b', backgroundColor: 'rgba(56,189,248,0.04)', borderLeft: '2px solid #38bdf8' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      {[
                        { label: 'Nombre', field: 'nombre_completo' },
                        { label: 'Correo',  field: 'correo' },
                        { label: 'Teléfono', field: 'telefono' },
                        { label: 'Dirección', field: 'direccion' },
                      ].map(({ label, field }) => (
                        <div key={field}>
                          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>{label}</label>
                          <input style={inputStyle} value={formEdit[field]}
                            onChange={(e) => setFormEdit((f) => ({ ...f, [field]: e.target.value }))}
                            onFocus={focus} onBlur={blur} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => guardarEdicion(u.id_usuario)} disabled={guardando}
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
            ))
          )}
        </div>
      )}

      {/* Modal crear usuario */}
      {modalCrear && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={20} color="#38bdf8" />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Nuevo usuario</h2>
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

            <form onSubmit={handleCrear} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Nombre completo *</label>
                  <input type="text" value={formCrear.nombre_completo} onChange={setCrearField('nombre_completo')}
                    placeholder="Juan García" style={{ ...inputStyle, borderColor: erroresCrear.nombre_completo ? '#f87171' : '#1e293b' }}
                    onFocus={focus} onBlur={blur} />
                  {erroresCrear.nombre_completo && <span style={{ fontSize: 11, color: '#f87171' }}>{erroresCrear.nombre_completo}</span>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Correo electrónico *</label>
                  <input type="email" value={formCrear.correo} onChange={setCrearField('correo')}
                    placeholder="juan@email.com" style={{ ...inputStyle, borderColor: erroresCrear.correo ? '#f87171' : '#1e293b' }}
                    onFocus={focus} onBlur={blur} />
                  {erroresCrear.correo && <span style={{ fontSize: 11, color: '#f87171' }}>{erroresCrear.correo}</span>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Teléfono *</label>
                  <input type="tel" value={formCrear.telefono} onChange={setCrearField('telefono')}
                    placeholder="55551234" style={{ ...inputStyle, borderColor: erroresCrear.telefono ? '#f87171' : '#1e293b' }}
                    onFocus={focus} onBlur={blur} />
                  {erroresCrear.telefono && <span style={{ fontSize: 11, color: '#f87171' }}>{erroresCrear.telefono}</span>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Rol *</label>
                  <select value={formCrear.id_rol} onChange={setCrearField('id_rol')}
                    style={{ ...inputStyle, cursor: 'pointer', borderColor: erroresCrear.id_rol ? '#f87171' : '#1e293b' }}
                    onFocus={focus} onBlur={blur}>
                    <option value="">Seleccionar...</option>
                    {roles.map((r) => (
                      <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
                    ))}
                  </select>
                  {erroresCrear.id_rol && <span style={{ fontSize: 11, color: '#f87171' }}>{erroresCrear.id_rol}</span>}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Dirección *</label>
                <input type="text" value={formCrear.direccion} onChange={setCrearField('direccion')}
                  placeholder="Zona 10, Guatemala City" style={{ ...inputStyle, borderColor: erroresCrear.direccion ? '#f87171' : '#1e293b' }}
                  onFocus={focus} onBlur={blur} />
                {erroresCrear.direccion && <span style={{ fontSize: 11, color: '#f87171' }}>{erroresCrear.direccion}</span>}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Contraseña *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={verContrasena ? 'text' : 'password'}
                    value={formCrear.contrasena} onChange={setCrearField('contrasena')}
                    placeholder="Mínimo 8 caracteres"
                    style={{ ...inputStyle, paddingRight: 44, borderColor: erroresCrear.contrasena ? '#f87171' : '#1e293b' }}
                    onFocus={focus} onBlur={blur}
                  />
                  <button type="button" onClick={() => setVerContrasena((v) => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                    {verContrasena ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {erroresCrear.contrasena && <span style={{ fontSize: 11, color: '#f87171' }}>{erroresCrear.contrasena}</span>}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => { setModalCrear(false); setFormCrear(initialForm); setErroresCrear({}) }}
                  style={{ flex: 1, padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #1e293b', color: '#94a3b8' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={creando}
                  style={{ flex: 2, padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 700, border: 'none', cursor: creando ? 'not-allowed' : 'pointer', backgroundColor: creando ? '#1e293b' : '#38bdf8', color: creando ? '#64748b' : '#080d1a' }}>
                  {creando ? 'Creando...' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}