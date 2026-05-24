import { useState, useEffect } from 'react'
import { Users, Package, MessageSquare, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer
} from 'recharts'
import AdminLayout from './AdminLayout'
import api from '../../services/api'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const COLORES_ESTADO  = ['#38bdf8','#fbbf24','#a855f7','#22c55e','#4ade80','#f87171']
const COLORES_REGION  = ['#38bdf8','#0ea5e9','#7dd3fc','#bae6fd','#e0f2fe','#f0f9ff']

export default function AdminDashboard() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/admin/dashboard')
        setDatos(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  if (cargando) return (
    <AdminLayout>
      <div style={{ color: '#64748b', textAlign: 'center', padding: '80px 0' }}>Cargando...</div>
    </AdminLayout>
  )

  const dataBarras = datos.envios_por_mes.map((r) => ({
    name:  `${MESES[r.mes - 1]} ${r.anio}`,
    total: r.total,
  }))

  const dataEstado = datos.envios_por_estado.map((r) => ({
    name:  r.estado,
    value: r.total,
  }))

  const dataRegion = datos.envios_por_region.map((r) => ({
    name:  r.region,
    value: r.total,
  }))

  const tarjetas = [
    { label: 'Usuarios activos',   value: datos.totales.usuarios,            icon: Users,         color: '#38bdf8' },
    { label: 'Total de envíos',    value: datos.totales.envios,              icon: Package,       color: '#a855f7' },
    { label: 'Mensajes no leídos', value: datos.totales.mensajes_no_leidos,  icon: MessageSquare, color: '#fbbf24' },
    { label: 'Envíos este mes',    value: dataBarras[dataBarras.length - 1]?.total || 0, icon: TrendingUp, color: '#4ade80' },
  ]

  const tooltipStyle = {
    contentStyle: { backgroundColor: '#0d1628', border: '1px solid #1e293b', borderRadius: 8 },
    labelStyle:   { color: '#f1f5f9' },
    itemStyle:    { color: '#f1f5f9' },
  }

  return (
    <AdminLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          Resumen general de la plataforma
        </p>
      </div>

      {/* Tarjetas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {tarjetas.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{
            backgroundColor: '#111827', border: '1px solid #1e293b',
            borderRadius: 12, padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1px' }}>{value}</div>
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                backgroundColor: `${color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fila de graficas superiores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Envios por mes */}
        <div style={{
          backgroundColor: '#111827', border: '1px solid #1e293b',
          borderRadius: 12, padding: '24px',
        }}>
          <h3 style={{ margin: '0 0 24px', fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>
            Envíos por mes
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dataBarras} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="total" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Envios por estado */}
        <div style={{
          backgroundColor: '#111827', border: '1px solid #1e293b',
          borderRadius: 12, padding: '24px',
        }}>
          <h3 style={{ margin: '0 0 24px', fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>
            Envíos por estado
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dataEstado} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {dataEstado.map((_, i) => (
                  <Cell key={i} fill={COLORES_ESTADO[i % COLORES_ESTADO.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Envios por region */}
      <div style={{
        backgroundColor: '#111827', border: '1px solid #1e293b',
        borderRadius: 12, padding: '24px',
      }}>
        <h3 style={{ margin: '0 0 24px', fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>
          Envíos por región
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dataRegion} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} width={90} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {dataRegion.map((_, i) => (
                <Cell key={i} fill={COLORES_REGION[i % COLORES_REGION.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AdminLayout>
  )
}