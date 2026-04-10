'use client'

const services = [
  {
    icon: '📦',
    title: 'Takeaway / Pick-Up',
    desc: 'Prefer to collect? Place your order via WhatsApp and we\'ll have it freshly packed and ready for pick-up at the agreed time.',
    badge: null,
    badgeColor: '',
  },
  {
    icon: '🎉',
    title: 'Event Catering',
    desc: 'Birthdays, corporate events, weddings and more — we bring the full Chizzychops experience to your event with full staff service.',
    badge: 'Book Now',
    badgeColor: '#8B5CF6',
  },
  {
    icon: '🛒',
    title: 'Bulk Orders',
    desc: 'Feeding a large team, a family gathering, or a whole office? We offer special pricing and priority handling for bulk orders.',
    badge: null,
    badgeColor: '',
  },
  {
    icon: '🎁',
    title: 'Gift Boxes',
    desc: 'Send someone a curated, beautifully packaged food gift box — a thoughtful, delicious surprise delivered with love.',
    badge: null,
    badgeColor: '',
  },
]

const reasons = [
  { icon: '⭐', text: '4.9-star rated by 500+ happy customers' },
  { icon: '🏡', text: 'Authentic home-cooked Nigerian meals' },
  { icon: '🌿', text: 'Fresh, locally-sourced ingredients daily' },
  { icon: '🔥', text: 'Every meal cooked from scratch to order' },
  { icon: '🚀', text: 'Lagos-wide delivery to your door' },
  { icon: '📱', text: 'Easy ordering — just WhatsApp us' },
  { icon: '💬', text: 'Friendly, fast customer support' },
  { icon: '✅', text: 'Consistent quality, every single time' },
]

const WA = 'https://wa.me/2348094946923?text=Hi!%20I%27d%20like%20to%20enquire%20about%20event%20catering%20%F0%9F%8D%BD%EF%B8%8F'

export default function Services() {
  return (
    <section id="services" className="section" style={{ background:'var(--brand-surface)' }}>
      <div className="container">

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <span className="section-label">What We Offer</span>
          <h2 className="section-title">Our <span className="flame-text">Services</span></h2>
          <div className="divider divider-center" />
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.9375rem', maxWidth:'32rem', margin:'0 auto', lineHeight:1.75 }}>
            We are a proudly <strong style={{ color:'rgba(255,255,255,0.8)' }}>online home kitchen</strong> — no dine-in, just great food made with love and brought right to you.
          </p>
        </div>

        {/* Online badge */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:'3rem' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.625rem', padding:'0.625rem 1.25rem', borderRadius:'9999px', background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.25)', flexWrap:'wrap', justifyContent:'center' }}>
            <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#4ADE80', display:'inline-block', flexShrink:0 }} />
            <span style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.8125rem', fontWeight:700, textAlign:'center' }}>100% Online · Order via WhatsApp · Delivered Across Lagos</span>
          </div>
        </div>

        {/* ── Featured delivery card — MOBILE FIXED ── */}
        <div className="delivery-featured" style={{ borderRadius:'1.25rem', border:'1.5px solid rgba(249,115,22,0.4)', background:'linear-gradient(135deg,rgba(249,115,22,0.1),rgba(220,38,38,0.05))', marginBottom:'1.25rem', position:'relative', overflow:'hidden' }}>
          {/* Glow orb */}
          <div style={{ position:'absolute', top:'-3rem', right:'-3rem', width:'10rem', height:'10rem', borderRadius:'50%', background:'radial-gradient(circle,rgba(249,115,22,0.15),transparent 70%)', pointerEvents:'none' }} />

          <div className="delivery-featured-inner">
            {/* Icon + title row */}
            <div className="delivery-featured-top">
              <div style={{ fontSize:'clamp(2.25rem,6vw,3.5rem)', flexShrink:0 }}>🚚</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
                  <h3 style={{ color:'#fff', fontFamily:'var(--font-playfair)', fontWeight:700, fontSize:'clamp(1.125rem,3vw,1.375rem)', margin:0 }}>Home Delivery</h3>
                  <span style={{ background:'#F97316', color:'#fff', fontSize:'0.625rem', fontWeight:800, padding:'0.25rem 0.75rem', borderRadius:'9999px', letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}>Most Popular</span>
                </div>
              </div>
            </div>

            {/* Body text */}
            <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'clamp(0.875rem,2.5vw,0.9375rem)', lineHeight:1.8, margin:0 }}>
              Your freshly home-cooked meal, delivered straight to your door anywhere across Lagos.
              Every single order is cooked from scratch — <strong style={{ color:'#FBBF24' }}>please allow up to 6 hours</strong> from order confirmation. Worth every minute.
            </p>

            {/* Chips */}
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
              <span style={{ background:'rgba(251,191,36,0.12)', color:'#FBBF24', fontSize:'0.75rem', fontWeight:700, padding:'0.375rem 0.875rem', borderRadius:'9999px', border:'1px solid rgba(251,191,36,0.2)', whiteSpace:'nowrap' }}>⏱️ Up to 6hrs</span>
              <span style={{ background:'rgba(74,222,128,0.1)', color:'#4ADE80', fontSize:'0.75rem', fontWeight:700, padding:'0.375rem 0.875rem', borderRadius:'9999px', border:'1px solid rgba(74,222,128,0.2)', whiteSpace:'nowrap' }}>📍 All Lagos</span>
              <span style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)', fontSize:'0.75rem', fontWeight:700, padding:'0.375rem 0.875rem', borderRadius:'9999px', border:'1px solid rgba(255,255,255,0.1)', whiteSpace:'nowrap' }}>✅ Always Fresh</span>
            </div>

            {/* CTA */}
            <div>
              <a href={WA} target="_blank" rel="noopener noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.875rem 1.75rem', borderRadius:'9999px', background:'linear-gradient(135deg,#F97316,#DC2626)', color:'#fff', fontWeight:800, fontSize:'0.9375rem', textDecoration:'none', whiteSpace:'nowrap', boxShadow:'0 4px 20px rgba(249,115,22,0.35)', transition:'transform 0.2s' }}
                onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-2px)')}
                onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>
                <WAIcon /> Order Now
              </a>
            </div>
          </div>
        </div>

        {/* Other 4 services */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap:'1rem', marginBottom:'4rem' }}>
          {services.map(s => (
            <div key={s.title} style={{ borderRadius:'1rem', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.02)', padding:'1.5rem', display:'flex', gap:'1rem', alignItems:'flex-start', transition:'border-color 0.25s,background 0.25s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(249,115,22,0.3)';e.currentTarget.style.background='rgba(249,115,22,0.04)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.08)';e.currentTarget.style.background='rgba(255,255,255,0.02)'}}>
              <div style={{ width:'2.75rem', height:'2.75rem', borderRadius:'0.75rem', background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem', flexShrink:0 }}>{s.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.375rem', flexWrap:'wrap' }}>
                  <h3 style={{ color:'#fff', fontFamily:'var(--font-playfair)', fontWeight:700, fontSize:'1rem', margin:0 }}>{s.title}</h3>
                  {s.badge && <span style={{ background:s.badgeColor, color:'#fff', fontSize:'0.5625rem', fontWeight:800, padding:'0.2rem 0.5rem', borderRadius:'9999px', letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{s.badge}</span>}
                </div>
                <p style={{ color:'rgba(255,255,255,0.48)', fontSize:'0.875rem', lineHeight:1.7, margin:0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Why choose us */}
        <div style={{ borderRadius:'1.25rem', border:'1px solid rgba(249,115,22,0.15)', overflow:'hidden', background:'rgba(249,115,22,0.04)' }}>
          <div className="why-grid">
            <div className="why-left" style={{ padding:'clamp(1.75rem,5vw,3rem) clamp(1.5rem,4vw,2.5rem)', borderRight:'1px solid rgba(255,255,255,0.06)' }}>
              <span className="section-label">Why Choose Us</span>
              <h2 className="section-title" style={{ marginBottom:'0.75rem' }}>Lagos&apos; Most Loved<br /><span className="flame-text">Home Kitchen</span></h2>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.9375rem', lineHeight:1.75, marginBottom:'2rem' }}>
                We don&apos;t just cook food — we create experiences. Every meal is an expression of care, quality, and a deep love for Nigerian cuisine, made right from our home kitchen.
              </p>
              <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display:'inline-flex' }}>
                <WAIcon /> Book Event Catering
              </a>
            </div>
            <div className="why-right" style={{ padding:'clamp(1.5rem,4vw,2.5rem)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.625rem', alignContent:'start' }}>
              {reasons.map(r => (
                <div key={r.text} style={{ display:'flex', gap:'0.625rem', alignItems:'flex-start', padding:'0.75rem 0.875rem', borderRadius:'0.75rem', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize:'1rem', flexShrink:0 }}>{r.icon}</span>
                  <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.8125rem', lineHeight:1.55, fontWeight:600 }}>{r.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        /* ── Featured delivery card ── */
        .delivery-featured-inner {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: clamp(1.25rem, 4vw, 2rem) clamp(1.25rem, 4vw, 2.5rem);
        }
        .delivery-featured-top {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        /* ── Why grid ── */
        .why-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .why-right { grid-template-columns: 1fr 1fr; }

        /* ── Tablet (768px) ── */
        @media (max-width: 860px) {
          .why-grid { grid-template-columns: 1fr; }
          .why-left { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.07); }
        }

        /* ── Mobile (500px) ── */
        @media (max-width: 500px) {
          .why-right { grid-template-columns: 1fr !important; }
          .delivery-featured-top { gap: 0.75rem; }
        }
      `}</style>
    </section>
  )
}

function WAIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
}