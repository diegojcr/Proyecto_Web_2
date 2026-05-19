import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: '¿Cómo puedo rastrear mi paquete?',
    a: 'Una vez generada tu solicitud de envío, recibirás un código de rastreo por correo electrónico y/o WhatsApp. Puedes ingresar ese código en nuestra sección de rastreo para ver el estado en tiempo real de tu paquete.',
  },
  {
    q: '¿Cuáles son los tiempos de entrega según el servicio?',
    a: 'El servicio Express entrega el mismo día o al día siguiente (área metropolitana). El servicio Estándar tarda entre 2 y 5 días hábiles a nivel nacional. Para envíos internacionales, los tiempos varían entre 5 y 15 días dependiendo del destino.',
  },
  {
    q: '¿Qué hago si mi paquete llegó dañado?',
    a: 'Contáctanos dentro de las primeras 24 horas de recibido el paquete a través de nuestro formulario de contacto o al teléfono de atención al cliente. Si contrataste seguro de envío, iniciaremos el proceso de reclamación de inmediato.',
  },
  {
    q: '¿Puedo programar una recolección a domicilio?',
    a: 'Sí. Puedes solicitar una recolección a través de nuestra plataforma web, por WhatsApp o llamando a nuestro centro de atención. Contamos con horarios de recolección de lunes a sábado en la mayoría de las ciudades.',
  },
  {
    q: '¿Existen restricciones sobre qué se puede enviar?',
    a: 'Existen artículos prohibidos por razones legales y de seguridad, como materiales peligrosos, artículos ilegales, sustancias controladas y dinero en efectivo. Para mercancías especiales como artículos frágiles o de alto valor, ofrecemos servicios específicos con embalaje adecuado.',
  },
  {
    q: '¿Cómo se calcula el costo de un envío?',
    a: 'El costo depende del peso real o volumétrico del paquete (el que sea mayor), el origen y destino, y el tipo de servicio elegido. Puedes obtener una cotización instantánea en nuestra sección de contacto o directamente con un asesor.',
  },
  {
    q: '¿Ofrecen planes para empresas con alto volumen de envíos?',
    a: 'Sí. Tenemos planes empresariales con tarifas preferenciales, facturación consolidada, integración con sistemas ERP y un ejecutivo de cuenta dedicado. Contáctanos para diseñar una solución personalizada para tu empresa.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Aceptamos transferencias bancarias, tarjetas de crédito/débito, efectivo en sucursales y pagos en línea a través de nuestra plataforma. Las empresas con contrato pueden acceder a crédito con facturación mensual.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section id="faq" style={{ padding: '100px 24px', backgroundColor: '#0d1628' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{
            color: '#38bdf8', fontSize: 12, fontWeight: 700,
            letterSpacing: '2px', textTransform: 'uppercase',
          }}>
            Preguntas frecuentes
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800,
            color: '#f1f5f9', margin: '12px 0 16px',
            letterSpacing: '-1px', lineHeight: 1.1,
          }}>
            Resolvemos tus dudas
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7 }}>
            ¿No encuentras lo que buscas? Escríbenos directamente desde el formulario de contacto.
          </p>
        </div>

        {/* Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((f, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#111827',
                border: '1px solid',
                borderColor: open === i ? 'rgba(56,189,248,0.35)' : '#1e293b',
                borderRadius: 10,
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 16,
                  padding: '20px 24px', background: 'none', border: 'none',
                  color: '#f1f5f9', fontSize: 15, fontWeight: 600,
                  textAlign: 'left', cursor: 'pointer',
                }}
              >
                <span>{f.q}</span>
                <ChevronDown
                  size={18}
                  color="#38bdf8"
                  style={{
                    flexShrink: 0,
                    transition: 'transform 0.25s',
                    transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
              {open === i && (
                <div style={{ padding: '0 24px 24px' }}>
                  <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.75, margin: 0 }}>
                    {f.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
