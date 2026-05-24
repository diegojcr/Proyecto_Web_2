import { useState, useEffect } from 'react'
import { Users, Search, Edit2, UserX, UserCheck, X, Save } from 'lucide-react'
import AdminLayout from './AdminLayout'
import api from '../../services/api'

const inputStyle = {
  width: '100%', padding: '10px 14px',
  backgroundColor: '#0d1628', border: '1px solid #1e293b',
  borderRadius: 8, color: '#f1f5f9', fontSize: 14,
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}

export default function AdminUsers() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState(null)
  const [formEdit, setFormEdit] = useState({})
  const [guardando, setGuardando] = useState(false)

  const cargar = async () => {
    try {
      const res = await api.get('/admin/users')
      setUsuarios(res.data.usuarios)
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

  const COLS = '1.5fr 2fr 130px 100px 80px'

  return (
    <AdminLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          Usuarios
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
        </p>
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
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#f1f5f9' }}>
                        {u.nombre_completo}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        {u.correo}
                      </div>
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
                      <button
                        onClick={() => abrirEdicion(u)}
                        title="Editar"
                        style={{
                          width: 32, height: 32, borderRadius: 6,
                          border: '1px solid #1e293b',
                          backgroundColor: 'transparent', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#64748b', transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.color = '#38bdf8' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b' }}
                      >
                        <Edit2 size={13} />
                      </button>

                      {u.rol !== 'Administrador' && (
                        <button
                          onClick={() => toggleActivo(u)}
                          title={u.activo ? 'Desactivar' : 'Activar'}
                          style={{
                            width: 32, height: 32, borderRadius: 6,
                            border: '1px solid #1e293b',
                            backgroundColor: 'transparent', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#64748b', transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = u.activo ? '#f87171' : '#4ade80'
                            e.currentTarget.style.color = u.activo ? '#f87171' : '#4ade80'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#1e293b'
                            e.currentTarget.style.color = '#64748b'
                          }}
                        >
                          {u.activo ? <UserX size={13} /> : <UserCheck size={13} />}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Fila de edicion inline */
                  <div style={{
                    padding: '20px', borderBottom: '1px solid #1e293b',
                    backgroundColor: 'rgba(56,189,248,0.04)',
                    borderLeft: '2px solid #38bdf8',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Nombre</label>
                        <input style={inputStyle} value={formEdit.nombre_completo}
                          onChange={(e) => setFormEdit((f) => ({ ...f, nombre_completo: e.target.value }))}
                          onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                          onBlur={(e) => e.target.style.borderColor = '#1e293b'} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Correo</label>
                        <input style={inputStyle} value={formEdit.correo}
                          onChange={(e) => setFormEdit((f) => ({ ...f, correo: e.target.value }))}
                          onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                          onBlur={(e) => e.target.style.borderColor = '#1e293b'} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Teléfono</label>
                        <input style={inputStyle} value={formEdit.telefono}
                          onChange={(e) => setFormEdit((f) => ({ ...f, telefono: e.target.value }))}
                          onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                          onBlur={(e) => e.target.style.borderColor = '#1e293b'} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Dirección</label>
                        <input style={inputStyle} value={formEdit.direccion}
                          onChange={(e) => setFormEdit((f) => ({ ...f, direccion: e.target.value }))}
                          onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                          onBlur={(e) => e.target.style.borderColor = '#1e293b'} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => guardarEdicion(u.id_usuario)}
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
            ))
          )}
        </div>
      )}
    </AdminLayout>
  )
}