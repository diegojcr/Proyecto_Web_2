import { Truck, Zap, Globe, Package, ShieldCheck, BarChart3 } from 'lucide-react'

const services = [
  {
    icon: Zap,
    title: 'Envío Express',
    description:
      'Entrega el mismo día o al día siguiente dentro del área metropolitana. Ideal para documentos urgentes y paquetes críticos.',
    tag: 'Más popular',
  },
  {
    icon: Truck,
    title: 'Envío Estándar',
    description:
      'Cobertura nacional con tiempos de entrega de 2 a 5 días hábiles. La mejor relación costo-beneficio para envíos regulares.',
    tag: null,
  },
  {
    icon: Globe,
    title: 'Envío Internacional',
    description:
      'Conectamos tu negocio con el mundo. Enviamos a más de 40 países con seguimiento en cada etapa del trayecto.',
    tag: 'Nuevo',
  },
  {
    icon: Package,
    title: 'Carga Especial',
    description:
      'Soluciones para objetos de gran tamaño, frágiles o de alto valor. Embalaje profesional incluido bajo solicitud.',
    tag: null,
  },
  {
    icon: ShieldCheck,
    title: 'Seguro de Envío',
    description:
      'Protección completa para tus paquetes. Coberturas desde básicas hasta premium para mercancía de alto valor.',
    tag: null,
  },
  {
    icon: BarChart3,
    title: 'Soluciones Empresariales',
    description:
      'Planes corporativos con tarifas preferenciales, integración API y gestión centralizada para grandes volúmenes.',
    tag: null,
  },
]

export default function Services() {
  return (
    <section id="services" style={{ padding: '100px 24px', backgroundColor: '#0d1628' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <span style={{
            color: '#38bdf8', fontSize: 12, fontWeight: 700,
            letterSpacing: '2px', textTransform: 'uppercase',
          }}>
            Nuestros servicios
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800,
            color: '#f1f5f9', margin: '12px 0 16px',
            letterSpacing: '-1px', lineHeight: 1.1,
          }}>
            Todo lo que necesitas para enviar
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 17, maxWidth: 520, lineHeight: 1.7 }}>
            Desde envíos locales express hasta logística internacional, tenemos la solución
            adaptada a cada necesidad.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
        }}>
          {services.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.title}
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e293b',
                  borderRadius: 12,
                  padding: '32px',
                  position: 'relative',
                  transition: 'all 0.25s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(56,189,248,0.4)'
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(56,189,248,0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1e293b'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {s.tag && (
                  <span style={{
                    position: 'absolute', top: 20, right: 20,
                    backgroundColor: s.tag === 'Nuevo' ? 'rgba(34,197,94,0.15)' : 'rgba(56,189,248,0.15)',
                    color: s.tag === 'Nuevo' ? '#4ade80' : '#38bdf8',
                    fontSize: 11, fontWeight: 700, padding: '3px 10px',
                    borderRadius: 20, letterSpacing: '0.5px',
                    border: `1px solid ${s.tag === 'Nuevo' ? 'rgba(34,197,94,0.3)' : 'rgba(56,189,248,0.3)'}`,
                  }}>
                    {s.tag}
                  </span>
                )}
                <div style={{
                  width: 48, height: 48, borderRadius: 10,
                  backgroundColor: 'rgba(56,189,248,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <Icon size={22} color="#38bdf8" />
                </div>
                <h3 style={{
                  fontSize: 18, fontWeight: 700, color: '#f1f5f9',
                  margin: '0 0 12px', letterSpacing: '-0.3px',
                }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
                  {s.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
