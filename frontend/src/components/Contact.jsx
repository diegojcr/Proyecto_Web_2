import { useState } from 'react'
import { Send, CheckCircle, MapPin, Phone, Mail } from 'lucide-react'
import api from '../services/api'

const initialForm = {
  name: '', email: '', phone: '', subject: '', message: '',
}

const subjectOptions = [
  'Cotización de envío',
  'Rastreo de paquete',
  'Reclamación / daño',
  'Planes empresariales',
  'Otro',
]

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'El nombre es requerido'
  if (!form.email.trim()) errors.email = 'El correo es requerido'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Correo inválido'
  if (form.phone && !/^[\d\s\+\-\(\)]{7,15}$/.test(form.phone)) errors.phone = 'Teléfono inválido'
  if (!form.subject) errors.subject = 'Selecciona un asunto'
  if (!form.message.trim()) errors.message = 'El mensaje es requerido'
  else if (form.message.trim().length < 20) errors.message = 'El mensaje debe tener al menos 20 caracteres'
  return errors
}

function Field({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.3px' }}>
        {label}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: 12, color: '#f87171', marginTop: 2 }}>{error}</span>
      )}
    </div>
  )
}

const inputStyle = (error) => ({
  backgroundColor: '#0d1628',
  border: `1px solid ${error ? '#f87171' : '#1e293b'}`,
  borderRadius: 8,
  padding: '12px 16px',
  color: '#f1f5f9',
  fontSize: 14,
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit',
})

export default function Contact() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }))
    if (errors.general) setErrors((er) => ({ ...er, general: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await api.post('/shipments/contact', {
        nombre_remitente: form.name,
        correo_remitente: form.email,
        telefono:         form.phone,
        asunto:           form.subject,
        mensaje:          form.message,
      })
      setSubmitted(true)
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'Error al enviar el mensaje. Intenta de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{
            color: '#38bdf8', fontSize: 12, fontWeight: 700,
            letterSpacing: '2px', textTransform: 'uppercase',
          }}>
            Contacto
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800,
            color: '#f1f5f9', margin: '12px 0 16px',
            letterSpacing: '-1px', lineHeight: 1.1,
          }}>
            Hablemos de tu envío
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7 }}>
            Nuestro equipo responde en menos de 2 horas en días hábiles.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 40,
          alignItems: 'start',
        }}>
          {/* Info */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginBottom: 48 }}>
              {[
                { icon: MapPin, label: 'Oficina principal', value: 'Oakland Mall Zona 10 Ciudad de Guatemala' },
                { icon: Phone, label: 'Teléfono', value: '+(502) 2221-4523' },
                { icon: Mail, label: 'Correo', value: 'contacto@skyshipexpress.com' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    backgroundColor: 'rgba(56,189,248,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} color="#38bdf8" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                    <div style={{ fontSize: 14, color: '#f1f5f9' }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hours */}
            <div style={{
              backgroundColor: '#111827', border: '1px solid #1e293b',
              borderRadius: 12, padding: '24px',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
                Horario de atención
              </div>
              {[
                ['Lunes – Viernes', '8:00 AM – 7:00 PM'],
                ['Sábados', '9:00 AM – 3:00 PM'],
                ['Domingos', 'Cerrado'],
              ].map(([day, hours]) => (
                <div key={day} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 13, padding: '8px 0',
                  borderBottom: '1px solid #1e293b',
                  color: day === 'Domingos' ? '#475569' : '#94a3b8',
                }}>
                  <span>{day}</span>
                  <span style={{ fontWeight: 600 }}>{hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #1e293b',
            borderRadius: 16,
            padding: '40px',
          }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircle size={56} color="#4ade80" style={{ marginBottom: 20 }} />
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 12px' }}>
                  ¡Mensaje enviado!
                </h3>
                <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.6 }}>
                  Gracias por contactarnos. Un asesor se comunicará contigo en las próximas 2 horas.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm(initialForm) }}
                  style={{
                    marginTop: 28, backgroundColor: 'rgba(56,189,248,0.12)',
                    border: '1px solid rgba(56,189,248,0.3)',
                    color: '#38bdf8', padding: '10px 24px', borderRadius: 8,
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Error general de API */}
                {errors.general && (
                  <div style={{
                    backgroundColor: 'rgba(248,113,113,0.1)',
                    border: '1px solid rgba(248,113,113,0.3)',
                    borderRadius: 8, padding: '12px 16px',
                    color: '#f87171', fontSize: 13,
                  }}>
                    {errors.general}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-grid">
                  <Field label="Nombre completo *" error={errors.name}>
                    <input
                      type="text"
                      value={form.name}
                      onChange={set('name')}
                      placeholder="Juan García"
                      style={inputStyle(errors.name)}
                      onFocus={(e) => { if (!errors.name) e.target.style.borderColor = '#38bdf8' }}
                      onBlur={(e) => { e.target.style.borderColor = errors.name ? '#f87171' : '#1e293b' }}
                    />
                  </Field>
                  <Field label="Correo electrónico *" error={errors.email}>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="juan@empresa.com"
                      style={inputStyle(errors.email)}
                      onFocus={(e) => { if (!errors.email) e.target.style.borderColor = '#38bdf8' }}
                      onBlur={(e) => { e.target.style.borderColor = errors.email ? '#f87171' : '#1e293b' }}
                    />
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-grid">
                  <Field label="Teléfono" error={errors.phone}>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="+1 (555) 000-0000"
                      style={inputStyle(errors.phone)}
                      onFocus={(e) => { if (!errors.phone) e.target.style.borderColor = '#38bdf8' }}
                      onBlur={(e) => { e.target.style.borderColor = errors.phone ? '#f87171' : '#1e293b' }}
                    />
                  </Field>
                  <Field label="Asunto *" error={errors.subject}>
                    <select
                      value={form.subject}
                      onChange={set('subject')}
                      style={{ ...inputStyle(errors.subject), appearance: 'none', cursor: 'pointer' }}
                      onFocus={(e) => { if (!errors.subject) e.target.style.borderColor = '#38bdf8' }}
                      onBlur={(e) => { e.target.style.borderColor = errors.subject ? '#f87171' : '#1e293b' }}
                    >
                      <option value="" disabled>Seleccionar...</option>
                      {subjectOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Mensaje *" error={errors.message}>
                  <textarea
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Cuéntanos cómo podemos ayudarte..."
                    rows={5}
                    style={{ ...inputStyle(errors.message), resize: 'vertical', minHeight: 120 }}
                    onFocus={(e) => { if (!errors.message) e.target.style.borderColor = '#38bdf8' }}
                    onBlur={(e) => { e.target.style.borderColor = errors.message ? '#f87171' : '#1e293b' }}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    backgroundColor: loading ? '#1e293b' : '#38bdf8',
                    color: loading ? '#64748b' : '#080d1a',
                    padding: '14px', borderRadius: 8, fontSize: 15,
                    fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#7dd3fc' }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#38bdf8' }}
                >
                  {loading ? 'Enviando...' : (<><Send size={15} /> Enviar mensaje</>)}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}