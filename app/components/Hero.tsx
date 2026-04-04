'use client'

import { useState, useEffect } from 'react'

const WA = 'https://wa.me/2348094946923?text=Hi%20Chizzychops%20%26%20Grillz!%20I%27d%20like%20to%20place%20an%20order%20%F0%9F%8D%BD%EF%B8%8F'

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1600&q=85',
    tag: '🔥 Grilled to Perfection',
    headline: 'Bold Grills.',
    sub: 'Rich Flavours.',
    accent: 'Straight to Your Door.',
  },
  {
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1600&q=85',
    tag: '🍲 Authentic Nigerian Cuisine',
    headline: 'Taste of Home,',
    sub: 'Made with Love.',
    accent: 'Every single plate.',
  },
  {
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=1600&q=85',
    tag: '🏡 Online Home Kitchen',
    headline: 'Fresh. Soulful.',
    sub: 'Home-Cooked.',
    accent: 'No shortcuts. Ever.',
  },
  {
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600&q=85',
    tag: '✨ Lagos Finest',
    headline: 'Order Now.',
    sub: 'Delivered Hot.',
    accent: 'Anywhere in Lagos.',
  },
]

const floatingDishes = [
  { emoji: '🍲', label: 'Egusi Soup',    delay: '0s'   },
  { emoji: '🍛', label: 'Jollof Rice',   delay: '0.8s' },
  { emoji: '🥘', label: 'Ofada Stew',    delay: '1.6s' },
  { emoji: '🍝', label: 'Shrimp Pasta',  delay: '2.4s' },
]

export default function Hero() {
  const [cur, setCur] = useState(0)
  const [fade, setFade] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const t = setInterval(() => {
      setFade(false)
      setTimeout(() => { setCur(p => (p + 1) % slides.length); setFade(true) }, 600)
    }, 5500)
    return () => clearInterval(t)
  }, [])

  return (
    <section style={{ position: 'relative', minHeight: '100svh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>

      {/* BG SLIDES */}
      {slides.map((s, i) => (
        <div key={i} style={{ position: 'absolute', inset: 0, transition: 'opacity 0.8s ease', opacity: i === cur ? (fade ? 1 : 0) : 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: i === cur ? 'scale(1.05)' : 'scale(1)', transition: 'transform 7s ease' }} />
        </div>
      ))}

      {/* OVERLAYS */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(10,3,0,0.97) 0%, rgba(10,3,0,0.88) 45%, rgba(10,3,0,0.5) 72%, rgba(10,3,0,0.15) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,3,0,0.75) 0%, transparent 38%)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div style={{ position: 'absolute', top: '10%', left: '-8rem', width: '32rem', height: '32rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(48px)' }} />

      {/* MAIN CONTENT */}
      <div className="container" style={{ position: 'relative', zIndex: 10, width: '100%', paddingTop: 'clamp(5.5rem, 14vw, 8rem)', paddingBottom: 'clamp(5rem, 12vw, 7rem)' }}>

        <div style={{ maxWidth: '38rem', display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 2.5vw, 1.5rem)' }}>

          {/* Live pill tag */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem', borderRadius: '9999px', width: 'fit-content',
            background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)',
            backdropFilter: 'blur(8px)',
            opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ADE80', flexShrink: 0, boxShadow: '0 0 8px #4ADE80', animation: 'heroPulse 2s infinite' }} />
            <span style={{ color: '#fdba74', fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{slides[cur].tag}</span>
          </div>

          {/* Headline */}
          <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s' }}>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, lineHeight: 1.06, color: '#fff', margin: 0, fontSize: 'clamp(2.25rem, 7vw, 4.5rem)' }}>
              {slides[cur].headline}<br />
              <span style={{ background: 'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {slides[cur].sub}
              </span><br />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62em', fontStyle: 'italic', fontWeight: 600, WebkitTextFillColor: 'rgba(255,255,255,0.5)' }}>
                {slides[cur].accent}
              </span>
            </h1>
          </div>

          {/* Body copy */}
          <p style={{
            color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(0.9375rem, 2.5vw, 1.0625rem)', lineHeight: 1.8, maxWidth: '28rem', margin: 0,
            opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
          }}>
            Every dish cooked <strong style={{ color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em' }}> fresh from scratch </strong>     in our home kitchen —
            soups, grills, pastas &amp; more. Real Nigerian flavour, delivered with love.
          </p>

          {/* Stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="17" height="17" viewBox="0 0 20 20" fill="#FBBF24">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>4.9</span>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>500+ happy customers</span>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
            <span style={{ color: '#F97316', fontSize: '0.8125rem', fontWeight: 700 }}>Lagos-wide delivery</span>
          </div>

          {/* CTA BUTTONS */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem' }}>
            <a href={WA} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: 'clamp(0.8125rem, 2.5vw, 1rem) clamp(1.375rem, 4vw, 2rem)',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                color: '#fff', fontWeight: 800, fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                textDecoration: 'none', boxShadow: '0 6px 28px rgba(37,211,102,0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 10px 36px rgba(37,211,102,0.55)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 6px 28px rgba(37,211,102,0.4)' }}>
              <WAIcon /> Order on WhatsApp
            </a>

            <a href="#menu"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: 'clamp(0.8125rem, 2.5vw, 1rem) clamp(1.375rem, 4vw, 1.875rem)',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #F97316, #DC2626)',
                color: '#fff', fontWeight: 800, fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                textDecoration: 'none', boxShadow: '0 6px 28px rgba(249,115,22,0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 10px 36px rgba(249,115,22,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 6px 28px rgba(249,115,22,0.35)' }}>
              <MenuIcon /> View Our Menu
            </a>
          </div>

          {/* Delivery notice */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.75rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', width: 'fit-content' }}>
            <span style={{ fontSize: '0.875rem' }}>⏱️</span>
            <span style={{ color: '#FBBF24', fontSize: '0.8125rem', fontWeight: 700 }}>Allow up to 6hrs · Freshly cooked to order</span>
          </div>

          {/* Service chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['🚀 Fast Delivery', '📦 Takeaway', '🎉 Event Catering', '🎁 Gift Boxes'].map(b => (
              <span key={b} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600, padding: '0.375rem 0.875rem', borderRadius: '9999px' }}>{b}</span>
            ))}
          </div>
        </div>

        {/* FLOATING DISH CARDS — desktop only */}
        <div className="hero-float-cards" style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {floatingDishes.map(d => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 1rem', borderRadius: '0.875rem', background: 'rgba(10,3,0,0.65)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', animation: `heroFloat 3s ease-in-out infinite`, animationDelay: d.delay }}>
              <span style={{ fontSize: '1.375rem' }}>{d.emoji}</span>
              <span style={{ color: '#fff', fontSize: '0.8125rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{d.label}</span>
            </div>
          ))}
          <div style={{ padding: '0.875rem 1.125rem', borderRadius: '1rem', background: 'rgba(10,3,0,0.7)', border: '1px solid rgba(249,115,22,0.25)', backdropFilter: 'blur(12px)', marginTop: '0.5rem', textAlign: 'center', animation: 'heroFloat 3.5s ease-in-out infinite', animationDelay: '1s' }}>
            <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginBottom: '4px' }}>
              {[1,2,3,4,5].map(s => <svg key={s} width="12" height="12" viewBox="0 0 20 20" fill="#FBBF24"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
            </div>
            <p style={{ color: '#FBBF24', fontWeight: 900, fontSize: '1.375rem', margin: 0, lineHeight: 1 }}>4.9</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6875rem', margin: '2px 0 0' }}>500+ reviews</p>
          </div>
        </div>
      </div>

      {/* BOTTOM STATS BAR */}
      {/* <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, background: 'linear-gradient(to right, rgba(10,3,0,0.94), rgba(20,6,0,0.9))', borderTop: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.875rem', paddingBottom: '0.875rem', gap: '0.25rem' }}>
            {[
              { icon: '⭐', value: '4.9',   label: 'Rating'       },
              { icon: '👥', value: '500+',  label: 'Customers'    },
              { icon: '🍽️', value: '40+',   label: 'Dishes'       },
              { icon: '⏱️', value: '<6hrs', label: 'Delivery'     },
              { icon: '🏡', value: '100%',  label: 'Home-Cooked'  },
            ].map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flex: '1 1 0', justifyContent: 'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none', paddingLeft: i > 0 ? '0.25rem' : 0 }}>
                <span style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>{s.icon}</span>
                <div>
                  <p style={{ color: '#F97316', fontWeight: 900, fontSize: 'clamp(0.75rem, 2vw, 1rem)', margin: 0, lineHeight: 1.1 }}>{s.value}</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 'clamp(0.5rem, 1.2vw, 0.625rem)', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* SLIDE DOTS */}
      <div style={{ position: 'absolute', bottom: '4.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => { setCur(i); setFade(true) }}
            style={{ width: i === cur ? '2rem' : '0.5rem', height: '0.375rem', borderRadius: '9999px', background: i === cur ? '#F97316' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', padding: 0 }} />
        ))}
      </div>

      <style>{`
        @keyframes heroPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.3); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @media (max-width: 900px) {
          .hero-float-cards { display: none !important; }
        }
      `}</style>
    </section>
  )
}

function WAIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
}
function MenuIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="15" y2="18"/></svg>
}