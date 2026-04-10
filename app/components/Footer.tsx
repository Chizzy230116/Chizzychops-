'use client'

import Image from 'next/image'
import Link  from 'next/link'

const WA = 'https://wa.me/2348094946923?text=Hi%20Chizzychops%20%26%20Grillz!%20I%27d%20like%20to%20order%20%F0%9F%8D%BD%EF%B8%8F'
const IG = 'https://www.instagram.com/chizzychops1/'

const quickLinks = [
  { href: '/',          label: 'Home'         },
  { href: '/#about',    label: 'About'        },
  { href: '/menu',      label: 'Menu'         },
  { href: '/services',  label: 'Services'     },
  { href: '/services#write-review', label: 'Write Review' },
  { href: '/#contact',  label: 'Contact'      },
]

export default function Footer() {
  return (
    <>
      {/* CTA BANNER */}
      <section style={{ position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#1C0800 0%,#7C2D12 45%,#991B1B 100%)', padding:'5rem 1.25rem' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize:'28px 28px' }} />
        <div style={{ position:'absolute', top:'-5rem', right:'-5rem', width:'22rem', height:'22rem', borderRadius:'50%', background:'radial-gradient(circle,rgba(251,191,36,0.12),transparent 70%)', filter:'blur(40px)', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1, maxWidth:'48rem', margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1.25rem', display:'inline-block', animation:'float 3.5s ease-in-out infinite' }}>🍽️</div>
          <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(1.875rem,5vw,3rem)', fontWeight:700, color:'#fff', lineHeight:1.1, marginBottom:'1rem' }}>
            Craving Something <span style={{ color:'#FCD34D' }}>Delicious?</span>
          </h2>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'1rem', lineHeight:1.8, maxWidth:'30rem', margin:'0 auto 0.75rem' }}>
            Real home-cooked Nigerian food, made from scratch with love and delivered right to your door across Lagos.
          </p>
          <p style={{ color:'rgba(251,191,36,0.75)', fontSize:'0.875rem', fontWeight:600, marginBottom:'2rem', fontStyle:'italic' }}>
            ⏱️ Please allow up to 6 hours — good food takes time, and yours deserves the best.
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.875rem', justifyContent:'center', marginBottom:'1.5rem' }}>
            <a href={WA} target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'#25D366', color:'#fff', fontWeight:800, fontSize:'1rem', padding:'0.9375rem 2rem', borderRadius:'9999px', textDecoration:'none', boxShadow:'0 4px 20px rgba(37,211,102,0.35)', transition:'all 0.2s' }}
              onMouseEnter={e => { const el=e.currentTarget as HTMLAnchorElement; el.style.background='#1fba58'; el.style.transform='translateY(-2px)' }}
              onMouseLeave={e => { const el=e.currentTarget as HTMLAnchorElement; el.style.background='#25D366'; el.style.transform='translateY(0)' }}>
              <WAIcon /> Order via WhatsApp
            </a>
            <Link href="/menu"
              style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', fontWeight:700, fontSize:'1rem', padding:'0.9375rem 2rem', borderRadius:'9999px', textDecoration:'none', transition:'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background='rgba(255,255,255,0.1)')}>
              🍽️ View Menu
            </Link>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', justifyContent:'center' }}>
            {['🏡 Home Kitchen, Lagos','⏰ Mon–Sat 6AM–8PM · Sun 12PM–6PM','⭐ 4.9 Rated','✅ Always Fresh'].map(t => (
              <span key={t} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', fontSize:'0.75rem', fontWeight:600, padding:'0.375rem 0.875rem', borderRadius:'9999px' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN FOOTER */}
      <footer style={{ background:'#060100', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ paddingTop:'3rem', paddingBottom:'2rem' }}>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap:'2.5rem 2rem', marginBottom:'2.5rem' }}>

            {/* Brand */}
            <div style={{ gridColumn:'span 2', minWidth:0 }} className="footer-brand">
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem' }}>
                <div style={{ width:'3rem', height:'3rem', borderRadius:'50%', overflow:'hidden', border:'2px solid rgba(249,115,22,0.4)', flexShrink:0 }}>
                  <Image src="/logo.jpg" alt="Chizzychops & Grillz" width={48} height={48} style={{ objectFit:'cover', width:'100%', height:'100%' }} />
                </div>
                <div>
                  <p style={{ fontFamily:'var(--font-playfair)', color:'#fff', fontWeight:700, fontSize:'1rem', lineHeight:1.2 }}>Chizzychops &amp; Grillz</p>
                  <p style={{ color:'#F97316', fontSize:'0.5875rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase' }}>Deliciously Made, Lovingly Served</p>
                </div>
              </div>
              <p style={{ color:'rgba(255,255,255,0.38)', fontSize:'0.875rem', lineHeight:1.75, maxWidth:'22rem', marginBottom:'1.25rem' }}>
                An online home kitchen in Lagos bringing you authentic Nigerian dishes, smoky grills, and soul-warming meals — all freshly cooked to order and delivered to you.
              </p>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                {[
                  { href:IG,  title:'Instagram', icon:<IGIcon />    },
                  { href:WA,  title:'WhatsApp',  icon:<WAIconSm /> },
                ].map(s => (
                  <a key={s.title} href={s.href} target="_blank" rel="noopener noreferrer" title={s.title}
                    style={{ width:'2.125rem', height:'2.125rem', borderRadius:'50%', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.4)', textDecoration:'none', transition:'all 0.2s' }}
                    onMouseEnter={e => { const el=e.currentTarget as HTMLAnchorElement; el.style.borderColor='#F97316'; el.style.color='#F97316'; el.style.background='rgba(249,115,22,0.08)' }}
                    onMouseLeave={e => { const el=e.currentTarget as HTMLAnchorElement; el.style.borderColor='rgba(255,255,255,0.1)'; el.style.color='rgba(255,255,255,0.4)'; el.style.background='transparent' }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <p style={{ color:'rgba(255,255,255,0.9)', fontWeight:700, fontSize:'0.75rem', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'1.25rem' }}>Quick Links</p>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'0.625rem' }}>
                {quickLinks.map(l => (
                  <li key={l.href+l.label}>
                    <Link href={l.href}
                      style={{ color:'rgba(255,255,255,0.38)', fontSize:'0.875rem', fontWeight:500, textDecoration:'none', display:'flex', alignItems:'center', gap:'0.375rem', transition:'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color='#F97316')}
                      onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.38)')}>
                      <span style={{ width:'4px', height:'4px', borderRadius:'50%', background:'#F97316', flexShrink:0 }} />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact info */}
            <div>
              <p style={{ color:'rgba(255,255,255,0.9)', fontWeight:700, fontSize:'0.75rem', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'1.25rem' }}>Get In Touch</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
                {[
                  { icon:'📞', lines:['0809 494 6923'] },
                  { icon:'⏰', lines:['Mon–Sat: 6AM–8PM','Sunday: 12PM–6PM'] },
                  { icon:'🚀', lines:['Lagos-wide delivery','Allow up to 6 hours'] },
                  { icon:'📸', lines:['@chizzychops1 on Instagram'] },
                ].map(c => (
                  <div key={c.icon} style={{ display:'flex', gap:'0.625rem', alignItems:'flex-start' }}>
                    <span style={{ fontSize:'0.875rem', flexShrink:0, marginTop:'1px' }}>{c.icon}</span>
                    <div>{c.lines.map(l => <p key={l} style={{ color:'rgba(255,255,255,0.38)', fontSize:'0.8125rem', lineHeight:1.6 }}>{l}</p>)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'1.5rem', display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center', gap:'0.5rem' }}>
            <p style={{ color:'rgba(255,255,255,0.2)', fontSize:'0.75rem' }}>© 2025 Chizzychops &amp; Grillz · All rights reserved.</p>
            <p style={{ color:'rgba(255,255,255,0.2)', fontSize:'0.75rem' }}>Made with ❤️ in Lagos, Nigeria</p>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 640px) { .footer-brand { grid-column: span 1 !important; } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </>
  )
}

function WAIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> }
function WAIconSm() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> }
function IGIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> }