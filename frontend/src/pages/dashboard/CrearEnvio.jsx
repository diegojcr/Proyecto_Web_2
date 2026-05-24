import { useState, useEffect } from 'react'
import { X, Package } from 'lucide-react'
import api from '../../services/api'

const inputStyle = {
  width: '100%', padding: '11px 14px',
  backgroundColor: '#0d1628', border: '1px solid #1e293b',
  borderRadius: 8, color: '#f1f5f9', fontSize: 14,
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}

const focus = (e) => e.target.style.borderColor = '#38bdf8'
const blur  = (e) => e.target.style.borderColor = '#1e293b'

export default function CrearEnvio({ onClose, onCreado }) {
  const [form, setForm] = useState({
    id_tipo_servicio: '', id_region_destino: '',
    direccion_origen: '', nombre_destinatario: '',
    direccion_destino: '', peso_kg: '',
    descripcion_paquete: '',
  })
  const [tipos, setTipos] = useState([])
  const [regiones, setRegiones] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      const [t, r] = await Promise.all([
        api.get('/shipments/tipos'),
        api.get('/shipments/regiones'),
      ])
      setTipos(t.data.tipos)
      setRegiones(r.data.regiones)
    }
    cargar()
  }, [])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const campos = ['id_tipo_servicio', 'id_region_destino', 'direccion_origen',
                    'nombre_destinatario', 'direccion_destino', 'peso_kg']
    for (const c of campos) {
      if (!form[c]) { setError('Completa todos los campos requeridos'); return }
    }

    setCargando(true)
    try {
      await api.post('/shipments', {
        ...form,
        id_tipo_servicio:  parseInt(form.id_tipo_servicio),
        id_region_destino: parseInt(form.id_region_destino),
        peso_kg:           parseFloat(form.peso_kg),
      })
      onCreado()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el envío')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        backgroundColor: '#111827', border: '1px solid #1e293b',
        borderRadius: 16, padding: '32px', width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Package size={20} color="#38bdf8" />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
              Nuevo envío
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                Tipo de servicio *
              </label>
              <select value={form.id_tipo_servicio} onChange={set('id_tipo_servicio')}
                style={{ ...inputStyle, cursor: 'pointer' }} onFocus={focus} onBlur={blur}>
                <option value="">Seleccionar...</option>
                {tipos.map((t) => (
                  <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                Región destino *
              </label>
              <select value={form.id_region_destino} onChange={set('id_region_destino')}
                style={{ ...inputStyle, cursor: 'pointer' }} onFocus={focus} onBlur={blur}>
                <option value="">Seleccionar...</option>
                {regiones.map((r) => (
                  <option key={r.id_region} value={r.id_region}>{r.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
              Dirección de origen *
            </label>
            <input type="text" value={form.direccion_origen} onChange={set('direccion_origen')}
              placeholder="Zona 10, Guatemala City" style={inputStyle} onFocus={focus} onBlur={blur} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
              Nombre del destinatario *
            </label>
            <input type="text" value={form.nombre_destinatario} onChange={set('nombre_destinatario')}
              placeholder="María López" style={inputStyle} onFocus={focus} onBlur={blur} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
              Dirección de destino *
            </label>
            <input type="text" value={form.direccion_destino} onChange={set('direccion_destino')}
              placeholder="Zona 1, Quetzaltenango" style={inputStyle} onFocus={focus} onBlur={blur} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                Peso (kg) *
              </label>
              <input type="number" step="0.1" min="0.1" value={form.peso_kg} onChange={set('peso_kg')}
                placeholder="2.5" style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                Descripción del paquete
              </label>
              <input type="text" value={form.descripcion_paquete} onChange={set('descripcion_paquete')}
                placeholder="Documentos, ropa..." style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" onClick={onClose}
              style={{
                flex: 1, padding: '12px', borderRadius: 8, fontSize: 14,
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: 'transparent', border: '1px solid #1e293b', color: '#94a3b8',
              }}>
              Cancelar
            </button>
            <button type="submit" disabled={cargando}
              style={{
                flex: 2, padding: '12px', borderRadius: 8, fontSize: 14,
                fontWeight: 700, cursor: cargando ? 'not-allowed' : 'pointer',
                border: 'none', transition: 'all 0.2s',
                backgroundColor: cargando ? '#1e293b' : '#38bdf8',
                color: cargando ? '#64748b' : '#080d1a',
              }}>
              {cargando ? 'Creando...' : 'Crear envío'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}