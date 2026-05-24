import { useState } from 'react'

const tabs = ['Historia', 'Misión', 'Visión', 'Valores']

const content = {
  Historia: {
    title: 'Nuestra historia',
    body: `SkyShip Express nació en 2010 con una misión clara: transformar la manera en que los paquetes se mueven a través del país. Lo que comenzó como una pequeña empresa con tres vehículos y un puñado de clientes locales, se convirtió en una red logística que hoy conecta cientos de ciudades.

Durante la última década, superamos desafíos de infraestructura, ampliamos nuestra flota, adoptamos tecnologías de rastreo en tiempo real y construimos un equipo de más de 800 personas comprometidas con la excelencia operativa. Cada paquete que entregamos lleva consigo años de aprendizaje y mejora continua.`,
  },
  Misión: {
    title: 'Nuestra misión',
    body: `Conectar personas y empresas a través de soluciones logísticas confiables, eficientes y tecnológicamente avanzadas, garantizando que cada envío llegue a su destino de forma segura y a tiempo.

Nos comprometemos a ser el socio estratégico de nuestros clientes, ofreciendo transparencia en cada etapa del proceso, desde la recolección hasta la entrega final, con un servicio que supere constantemente sus expectativas.`,
  },
  Visión: {
    title: 'Nuestra visión',
    body: `Ser la empresa de mensajería y logística de referencia en la región para 2030, reconocida por nuestra innovación tecnológica, la calidad de nuestro servicio y el impacto positivo que generamos en las comunidades donde operamos.

Aspiramos a liderar la transformación digital del sector logístico, integrando inteligencia artificial, automatización y prácticas sostenibles en cada uno de nuestros procesos operativos.`,
  },
  Valores: {
    title: 'Nuestros valores',
    list: [
      { label: 'Confiabilidad', desc: 'Cumplimos lo que prometemos, siempre.' },
      { label: 'Transparencia', desc: 'Información clara y accesible en cada paso del envío.' },
      { label: 'Innovación', desc: 'Adoptamos tecnología para mejorar constantemente.' },
      { label: 'Compromiso', desc: 'Con nuestros clientes, equipo y comunidades.' },
      { label: 'Sostenibilidad', desc: 'Operamos con responsabilidad ambiental y social.' },
    ],
  },
}

export default function About() {
  const [active, setActive] = useState('Historia')
  const c = content[active]

  return (
    <section id="about" style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 64,
          alignItems: 'start',
        }}>
          {/* Left col */}
          <div>
            <span style={{
              color: '#38bdf8', fontSize: 12, fontWeight: 700,
              letterSpacing: '2px', textTransform: 'uppercase',
            }}>
              Quiénes somos
            </span>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800,
              color: '#f1f5f9', margin: '12px 0 24px',
              letterSpacing: '-1px', lineHeight: 1.1,
            }}>
              Más de 15 años <br />moviendo el país
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
              Somos una empresa con ADN logístico, construida sobre la confianza de miles
              de clientes que nos eligen día a día para mover lo que más les importa.
            </p>

            {/* Tab buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setActive(t)}
                  style={{
                    padding: '8px 20px', borderRadius: 6, fontSize: 13,
                    fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    border: '1px solid',
                    borderColor: active === t ? '#38bdf8' : '#1e293b',
                    backgroundColor: active === t ? 'rgba(56,189,248,0.12)' : 'transparent',
                    color: active === t ? '#38bdf8' : '#94a3b8',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Right col - content */}
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1e293b',
              borderRadius: 16,
              padding: '40px',
              minHeight: 280,
            }}
          >
            <h3 style={{
              fontSize: 22, fontWeight: 700, color: '#f1f5f9',
              margin: '0 0 20px', letterSpacing: '-0.5px',
            }}>
              {c.title}
            </h3>

            {c.body && (
              <div>
                {c.body.split('\n\n').map((p, i) => (
                  <p key={i} style={{
                    color: '#94a3b8', fontSize: 15, lineHeight: 1.75,
                    marginBottom: 16,
                  }}>
                    {p}
                  </p>
                ))}
              </div>
            )}

            {c.list && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {c.list.map((v) => (
                  <div key={v.label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      backgroundColor: '#38bdf8', flexShrink: 0, marginTop: 6,
                    }} />
                    <div>
                      <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 15 }}>{v.label}: </span>
                      <span style={{ color: '#94a3b8', fontSize: 15 }}>{v.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
