'use client'

import { useState, useEffect } from 'react'
import Link     from 'next/link'
import Image    from 'next/image'
import { usePathname } from 'next/navigation'

const WA = 'https://wa.me/2348094946923?text=Hi%20Chizzychops%20%26%20Grillz!%20I%27d%20like%20to%20place%20an%20order%20%F0%9F%8D%BD%EF%B8%8F'

const links = [
  { href: '/',          label: 'Home'     },
  { href: '/menu',      label: 'Menu'     },
  { href: '/services',  label: 'Services' },
  { href: '/#about',    label: 'About'    },
  { href: '/#contact',  label: 'Contact'  },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // On inner pages navbar is always solid
  const isHome   = pathname === '/'
  const isSolid  = scrolled || !isHome

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'all 0.3s ease',
        background: isSolid ? 'rgba(10,3,0,0.97)' : 'transparent',
        backdropFilter: isSolid ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: isSolid ? 'blur(20px)' : 'none',
        borderBottom: isSolid ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>

            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', flexShrink: 0 }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(249,115,22,0.5)', flexShrink: 0 }}>
                <Image src="/logo.jpg" alt="Chizzychops" width={42} height={42} style={{ objectFit: 'cover' }} priority />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontFamily: 'var(--font-playfair)', color: '#fff', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>Chizzychops</span>
                <span style={{ color: '#F97316', fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' }}>&amp; Grillz</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }} className="desktop-nav">
              {links.map(l => {
                const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href.split('#')[0]) && !l.href.includes('#'))
                return (
                  <Link key={l.href} href={l.href}
                    style={{ color: active ? '#F97316' : 'rgba(255,255,255,0.6)', fontSize: '0.875rem', fontWeight: active ? 700 : 600, textDecoration: 'none', transition: 'color 0.2s', whiteSpace: 'nowrap', letterSpacing: '0.01em' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#F97316')}
                    onMouseLeave={e => (e.currentTarget.style.color = active ? '#F97316' : 'rgba(255,255,255,0.6)')}>
                    {l.label}
                  </Link>
                )
              })}
            </div>

            {/* Desktop CTA — Order Now only */}
            <a href={WA} target="_blank" rel="noopener noreferrer"
              className="desktop-cta"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg,#F97316,#DC2626)',
                color: '#fff', fontWeight: 800, fontSize: '0.875rem',
                padding: '0.625rem 1.25rem', borderRadius: '9999px',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
                transition: 'all 0.2s ease', whiteSpace: 'nowrap', flexShrink: 0,
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform='translateY(-1px)'; el.style.boxShadow='0 6px 20px rgba(249,115,22,0.5)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform='translateY(0)'; el.style.boxShadow='0 4px 16px rgba(249,115,22,0.35)' }}>
              <WAIconSm /> Order Now
            </a>

            {/* Hamburger */}
            <button onClick={() => setOpen(!open)} className="hamburger" aria-label="Toggle menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
              <span style={{ display: 'block', width: '22px', height: '2px', background: '#fff', borderRadius: '2px', transition: 'all 0.3s', transform: open ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
              <span style={{ display: 'block', width: '22px', height: '2px', background: '#fff', borderRadius: '2px', transition: 'all 0.3s', opacity: open ? 0 : 1 }} />
              <span style={{ display: 'block', width: '22px', height: '2px', background: '#fff', borderRadius: '2px', transition: 'all 0.3s', transform: open ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(10,3,0,0.98)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', paddingTop: '80px', overflowY: 'auto' }}
          className="mobile-menu">
          <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '2rem' }}>
              {links.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                  style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', fontWeight: 700, textDecoration: 'none', padding: '0.875rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {l.label}
                  <span style={{ color: 'rgba(249,115,22,0.6)', fontSize: '1rem' }}>→</span>
                </Link>
              ))}
            </div>
            {/* Mobile: 2 CTAs max */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href={WA} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem', width: '100%', padding: '1rem', borderRadius: '0.875rem', background: 'linear-gradient(135deg,#F97316,#DC2626)', color: '#fff', fontWeight: 800, fontSize: '1.0625rem', textDecoration: 'none', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}>
                <WAIconSm /> Order on WhatsApp
              </a>
              <Link href="/menu" onClick={() => setOpen(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.875rem', borderRadius: '0.875rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}>
                🍽️ View Full Menu
              </Link>
            </div>
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8125rem' }}>🏡 Online Home Kitchen, Lagos</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>⏰ Mon–Sat 6AM–8PM · Sun 12PM–6PM</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .hamburger   { display: none !important; }
          .mobile-menu { display: none !important; }
        }
        @media (max-width: 1023px) {
          .desktop-nav { display: none !important; }
          .desktop-cta { display: none !important; }
        }
      `}</style>
    </>
  )
}

function WAIconSm() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}