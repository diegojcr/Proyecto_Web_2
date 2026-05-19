import { Package, X, Globe, MessageSquare, AtSign } from 'lucide-react'

const cols = [
  {
    title: 'Servicios',
    links: ['Envío Express', 'Envío Estándar', 'Internacional', 'Carga Especial', 'Empresas'],
  },
  {
    title: 'Empresa',
    links: ['Historia', 'Misión y visión', 'Trabaja con nosotros', 'Prensa', 'Sostenibilidad'],
  },
  {
    title: 'Soporte',
    links: ['Centro de ayuda', 'Rastrear paquete', 'Reclamaciones', 'Términos de uso', 'Privacidad'],
  },
]

const socials = [
  { icon: X, label: 'X / Twitter' },
  { icon: Globe, label: 'Web' },
  { icon: MessageSquare, label: 'WhatsApp' },
  { icon: AtSign, label: 'Instagram' },
]

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #1e293b', backgroundColor: '#080d1a' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 40,
          marginBottom: 56,
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Package size={18} color="#fff" />
              </div>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9' }}>
                Sky<span style={{ color: '#38bdf8' }}>Ship</span>
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, maxWidth: 200 }}>
              Logística confiable para empresas y personas desde 2010.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {socials.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    backgroundColor: '#111827', border: '1px solid #1e293b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.backgroundColor = 'rgba(56,189,248,0.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.backgroundColor = '#111827' }}
                >
                  <Icon size={14} color="#94a3b8" />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
                {col.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((l) => (
                  <a
                    key={l}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#94a3b8'}
                    onMouseLeave={(e) => e.target.style.color = '#64748b'}
                  >
                    {l}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: 28,
          display: 'flex', flexWrap: 'wrap', gap: 16,
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, color: '#475569' }}>
            © {new Date().getFullYear()} SkyShip Express. Todos los derechos reservados.
          </span>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Términos', 'Privacidad', 'Cookies'].map((l) => (
              <a
                key={l}
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{ fontSize: 12, color: '#475569', textDecoration: 'none' }}
                onMouseEnter={(e) => e.target.style.color = '#94a3b8'}
                onMouseLeave={(e) => e.target.style.color = '#475569'}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
