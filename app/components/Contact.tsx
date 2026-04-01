'use client'

import { useState } from 'react'
import { saveContact } from '@/app/lib/supabase'

const WA = 'https://wa.me/2348094946923'
const IG = 'https://www.instagram.com/chizzychops1/'

export default function Contact() {
  const [name,setName]       = useState('')
  const [phone,setPhone]     = useState('')
  const [email,setEmail]     = useState('')
  const [message,setMessage] = useState('')
  const [busy,setBusy]       = useState(false)
  const [done,setDone]       = useState(false)
  const [err,setErr]         = useState('')

  const handleSubmit = async () => {
    if(!name.trim()||!phone.trim()||!message.trim()) { setErr('Please fill in Name, Phone and Message'); return }
    setBusy(true); setErr('')
    // 1. Save to database first
    try {
      await saveContact({ name:name.trim(), phone:phone.trim(), email:email.trim()||undefined, message:message.trim(), type:'contact' })
    } catch(e) {
      // Don't block WhatsApp if DB fails — still open WA
      console.error('DB save failed:', e)
    }
    // 2. Open WhatsApp
    const lines = [
      `💬 *Contact Message — Chizzychops & Grillz*`, ``,
      `👤 *Name:* ${name}`,
      `📞 *Phone:* ${phone}`,
      email ? `📧 *Email:* ${email}` : null,
      ``, `✍️ *Message:*`, message,
    ].filter(v=>v!==null).join('\n')
    window.open(`${WA}?text=${encodeURIComponent(lines as string)}`, '_blank')
    setDone(true)
    setBusy(false)
  }

  return (
    <section id="contact" className="section" style={{ background: 'var(--brand-dark)' }}>
      <div className="container">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-label">Get In Touch</span>
          <h2 className="section-title">Let&apos;s <span className="flame-text">Connect</span></h2>
          <div className="divider divider-center" />
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9375rem', maxWidth: '30rem', margin: '0 auto', lineHeight: 1.75 }}>
            We&apos;re an online home kitchen — reach us via WhatsApp or send a message below.
          </p>
        </div>

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { icon: <PhoneIcon />, accent: '#25D366', label: 'Call / WhatsApp', lines: ['0809 494 6923'], sub: 'Fastest way to order or ask questions', action: { label: 'Chat on WhatsApp', href: WA } },
            { icon: <ClockIcon />, accent: '#FBBF24', label: 'Delivery Hours', lines: ['Mon – Sat: 6:00 AM – 8:00 PM', 'Sunday: 12:00 PM – 6:00 PM'], sub: 'Orders outside hours processed next day', action: null },
            { icon: <IGIconSvg />, accent: '#E1306C', label: 'Follow Us', lines: ['@chizzychops1'], sub: 'Tag us when you eat — we love seeing your faces!', action: { label: 'View Instagram', href: IG } },
          ].map(c => (
            <div key={c.label} className="card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${c.accent}, transparent)` }} />
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', background: `${c.accent}18`, color: c.accent, border: `1px solid ${c.accent}28` }}>
                {c.icon}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{c.label}</p>
              {c.lines.map(l => <p key={l} style={{ color: '#fff', fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.55 }}>{l}</p>)}
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8125rem', marginTop: '0.375rem', lineHeight: 1.55 }}>{c.sub}</p>
              {c.action && <a href={c.action.href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.875rem', fontSize: '0.8125rem', fontWeight: 700, color: c.accent, textDecoration: 'none' }}>{c.action.label} →</a>}
            </div>
          ))}
        </div>

        {/* Contact form — saves to DB + opens WhatsApp */}
        <div style={{ borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: '#fff', fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1.125rem' }}>Send Us a Message</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>Your message is saved securely — we&apos;ll also open WhatsApp for a faster reply.</p>
          </div>

          {done ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>Message Sent!</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>Your message has been saved and WhatsApp opened. We&apos;ll reply shortly.</p>
              <button onClick={()=>{setDone(false);setName('');setPhone('');setEmail('');setMessage('')}} style={{ color: '#F97316', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Send Another Message →</button>
            </div>
          ) : (
            <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
              <div>
                <label style={LBL}>Your Name *</label>
                <input className="form-input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Amaka Obi" />
              </div>
              <div>
                <label style={LBL}>WhatsApp Number *</label>
                <input className="form-input" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="0809 494 6923" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LBL}>Email Address (optional)</label>
                <input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LBL}>Your Message *</label>
                <textarea className="form-input" rows={4} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Ask about orders, catering, anything..." style={{ resize: 'none' }} />
              </div>
              {err && <p style={{ gridColumn: '1/-1', color: '#F87171', fontSize: '0.875rem' }}>{err}</p>}
              <div style={{ gridColumn: '1 / -1' }}>
                <button onClick={handleSubmit} disabled={busy}
                  style={{ width: '100%', padding: '1rem', borderRadius: '0.875rem', background: '#25D366', border: 'none', color: '#fff', fontWeight: 800, fontSize: '1.0625rem', cursor: busy ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem', opacity: busy ? 0.7 : 1, boxShadow: '0 4px 20px rgba(37,211,102,0.3)' }}>
                  <WAIconSvg size={20} /> {busy ? 'Sending…' : 'Send Message via WhatsApp'}
                </button>
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', marginTop: '0.625rem' }}>Your message is saved securely before opening WhatsApp</p>
              </div>
            </div>
          )}
        </div>

        {/* Delivery strip */}
        <div style={{ borderRadius: '1rem', padding: '1.5rem', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '2rem', flexShrink: 0 }}>🚀</span>
          <div style={{ flex: 1, minWidth: '14rem' }}>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>Lagos-Wide Delivery — Straight to Your Door</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.7 }}>
              We deliver all across Lagos. Since everything is freshly home-cooked to order, please allow <strong style={{ color: '#FBBF24' }}>up to 6 hours</strong> from the time we confirm your order.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
            <span style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24', fontSize: '0.75rem', fontWeight: 700, padding: '0.375rem 0.875rem', borderRadius: '9999px', border: '1px solid rgba(251,191,36,0.2)', whiteSpace: 'nowrap' }}>⏱️ Max 6hrs</span>
            <span style={{ background: 'rgba(74,222,128,0.1)', color: '#4ADE80', fontSize: '0.75rem', fontWeight: 700, padding: '0.375rem 0.875rem', borderRadius: '9999px', border: '1px solid rgba(74,222,128,0.2)', whiteSpace: 'nowrap' }}>📍 All Lagos</span>
          </div>
        </div>

        {/* Instagram CTA */}
        <div style={{ borderRadius: '0.875rem', background: 'rgba(225,48,108,0.06)', border: '1px solid rgba(225,48,108,0.15)', padding: '1rem 1.5rem' }}>
          <a href={IG} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <IGIconSvg />
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>Follow on Instagram</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>@chizzychops1 · See our daily specials &amp; behind the scenes</p>
            </div>
          </a>
        </div>

      </div>
    </section>
  )
}

const LBL: React.CSSProperties = { color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }

function WAIconSvg({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
}
function PhoneIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 5.9 5.9l.95-.95a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 21.4 16l.52.92z"/></svg> }
function ClockIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
function IGIconSvg() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> }