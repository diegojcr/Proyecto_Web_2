import { ArrowRight, TrendingUp, Shield, Clock } from 'lucide-react'

const stats = [
  { value: '+50K', label: 'Paquetes entregados' },
  { value: '99.2%', label: 'Tasa de éxito' },
  { value: '120+', label: 'Destinos nacionales' },
  { value: '24/7', label: 'Soporte disponible' },
]

export default function Hero() {
  const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section
      id="home"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '120px 24px 80px',
      }}
    >
      {/* Background gradient blobs */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 800, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '20%', right: '-10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative' }}>
        {/* Badge */}
        <div style={{ display: 'flex', marginBottom: 32 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            backgroundColor: 'rgba(56,189,248,0.1)',
            border: '1px solid rgba(56,189,248,0.25)',
            color: '#38bdf8', fontSize: 12, fontWeight: 600,
            padding: '6px 14px', borderRadius: 20, letterSpacing: '0.8px',
            textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#38bdf8', display: 'inline-block' }} />
            Logística de nueva generación
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 76px)',
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: '-2px',
          color: '#f1f5f9',
          margin: '0 0 24px',
          maxWidth: 800,
        }}>
          Tu paquete, <br />
          <span style={{ color: '#38bdf8' }}>donde necesite llegar.</span>
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: '#94a3b8',
          maxWidth: 560,
          lineHeight: 1.7,
          margin: '0 0 48px',
        }}>
          SkyShip Express conecta empresas y personas con soluciones de envío confiables,
          rápidas y transparentes. Rastrea cada movimiento de tu paquete en tiempo real.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 80 }}>
          <button
            onClick={() => scrollTo('#contact')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              backgroundColor: '#38bdf8', color: '#080d1a',
              padding: '14px 28px', borderRadius: 8, fontSize: 15,
              fontWeight: 700, border: 'none', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#7dd3fc'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#38bdf8'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Solicitar un envío <ArrowRight size={16} />
          </button>
          <button
            onClick={() => scrollTo('#services')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              backgroundColor: 'transparent', color: '#f1f5f9',
              padding: '14px 28px', borderRadius: 8, fontSize: 15,
              fontWeight: 600, border: '1px solid #1e293b', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.color = '#38bdf8' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#f1f5f9' }}
          >
            Ver servicios
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 32,
          paddingTop: 48,
          borderTop: '1px solid #1e293b',
          maxWidth: 600,
        }}>
          {stats.map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#38bdf8', letterSpacing: '-1px' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
