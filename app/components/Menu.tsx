'use client'

import { useState, useEffect, useRef } from 'react'

// ── Types (matches exactly what /api/menu returns) ─────────
type Item = {
  id: string
  name: string
  price: number
  priceLabel: string
  category: string
  subcat?: string
  description: string
  badge?: string
  badge_color?: string
  note?: string
  img_url: string
  img2_url?: string
  sort_order: number
  updated_at: string
}

type CartItem = Item & { qty: number }

function formatPrice(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

const CATS = ['All', 'Soups', 'Stews', 'Rice & Pottage', 'Pasta & Rice', 'Food Boxes']

export default function Menu() {
  const [MENU, setMENU]         = useState<Item[]>([])
  const [loading, setLoading]   = useState(true)
  const [cat, setCat]           = useState('All')
  const [cart, setCart]         = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [showAll, setShowAll]   = useState(false)

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then((data: Item[]) => {
        setMENU(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // ✅ Fixed: was i.cat === cat (always undefined), now i.category === cat
  const filtered  = cat === 'All' ? MENU : MENU.filter(i => i.category === cat)
  const displayed = showAll ? filtered : filtered.slice(0, 9)

  const addToCart = (item: Item) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id)
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { ...item, qty: 1 }]
    })
    setCartOpen(true)
  }

  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id))
  const changeQty = (id: string, d: number) => setCart(prev =>
    prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + d) } : c)
  )

  const total      = cart.reduce((s, c) => s + c.price * c.qty, 0)
  const totalItems = cart.reduce((s, c) => s + c.qty, 0)

  const sendWhatsApp = () => {
    const lines = cart.map(c => `• ${c.name} x${c.qty} — ${formatPrice(c.price * c.qty)}`)
    const msg   = `🍽️ *Order from Chizzychops & Grillz*\n\n${lines.join('\n')}\n\n💰 *Total: ${formatPrice(total)}*\n\n📦 I understand delivery takes up to 6 hours as every meal is freshly home-cooked to order.\n\nPlease confirm my order and provide delivery details. Thank you!`
    window.open(`https://wa.me/2348094946923?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <section id="menu" className="section" style={{ background: 'var(--brand-surface)', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient orbs */}
      <div aria-hidden style={{ position:'absolute', top:'-160px', right:'-120px', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(249,115,22,0.07) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div aria-hidden style={{ position:'absolute', bottom:'-100px', left:'-80px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle,rgba(220,38,38,0.06) 0%,transparent 70%)', pointerEvents:'none' }} />

      <div className="container" style={{ position:'relative', zIndex:1 }}>

        {/* ── Section Header ── */}
        <div style={{ marginBottom:'2.5rem' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem' }}>
                <div style={{ width:'28px', height:'2px', background:'linear-gradient(90deg,#F97316,#DC2626)', borderRadius:'2px' }} />
                <span className="section-label" style={{ margin:0 }}>What We Serve</span>
              </div>
              <h2 className="section-title" style={{ marginBottom:'1rem' }}>Our <span className="flame-text">Menu</span></h2>
              <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.9375rem', maxWidth:'28rem', lineHeight:1.8, margin:0 }}>
                Every dish cooked fresh from scratch, made with love right in our home kitchen.
              </p>
            </div>

            {totalItems > 0 && (
              <button onClick={() => setCartOpen(true)} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1.375rem', borderRadius:'9999px', background:'linear-gradient(135deg,#F97316,#DC2626)', border:'none', color:'#fff', fontWeight:800, fontSize:'0.9375rem', cursor:'pointer', boxShadow:'0 8px 32px rgba(249,115,22,0.35)', transition:'transform 0.2s', whiteSpace:'nowrap', flexShrink:0 }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)'}}>
                <span style={{ fontSize:'1.125rem' }}>🛒</span>
                View Order
                <span style={{ background:'rgba(255,255,255,0.2)', borderRadius:'9999px', padding:'0.15rem 0.6rem', fontSize:'0.875rem', fontWeight:900 }}>{totalItems}</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Delivery Notice ── */}
        <div className="delivery-notice" style={{ marginBottom:'2.5rem', borderRadius:'1.25rem', background:'linear-gradient(135deg,rgba(249,115,22,0.08) 0%,rgba(220,38,38,0.04) 100%)', border:'1px solid rgba(249,115,22,0.18)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'3px', background:'linear-gradient(180deg,#F97316,#DC2626)', borderRadius:'3px 0 0 3px' }} />
          <div className="delivery-inner">
            <div style={{ width:'48px', height:'48px', minWidth:'48px', borderRadius:'0.875rem', background:'rgba(249,115,22,0.12)', border:'1px solid rgba(249,115,22,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.375rem', flexShrink:0 }}>🏡</div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:'#fff', fontWeight:800, fontSize:'clamp(0.9375rem,2.5vw,1rem)', marginBottom:'0.375rem', fontFamily:'var(--font-playfair)' }}>
                Freshly Home-Cooked, Worth Every Minute
              </p>
              <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'clamp(0.8125rem,2vw,0.875rem)', lineHeight:1.75, margin:0 }}>
                Every order cooked from scratch — no shortcuts, no reheated meals.
                Please allow <strong style={{ color:'#FBBF24', fontWeight:800 }}>up to 6 hours</strong> for delivery.
              </p>
              <div className="delivery-badges-inline" style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginTop:'0.875rem' }}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:'0.375rem', padding:'0.375rem 0.75rem', borderRadius:'0.5rem', background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.2)', color:'#FBBF24', fontWeight:800, fontSize:'0.75rem', whiteSpace:'nowrap' }}>⏱️ Up to 6hrs</span>
                <span style={{ display:'inline-flex', alignItems:'center', gap:'0.375rem', padding:'0.375rem 0.75rem', borderRadius:'0.5rem', background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.18)', color:'#4ADE80', fontWeight:800, fontSize:'0.75rem', whiteSpace:'nowrap' }}>✅ Always fresh</span>
              </div>
            </div>
            <div className="delivery-badges-side" style={{ display:'flex', flexDirection:'column', gap:'0.5rem', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 0.875rem', borderRadius:'0.625rem', background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.2)' }}>
                <span style={{ fontSize:'0.875rem' }}>⏱️</span>
                <span style={{ color:'#FBBF24', fontWeight:800, fontSize:'0.8125rem', whiteSpace:'nowrap' }}>Up to 6hrs</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 0.875rem', borderRadius:'0.625rem', background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.18)' }}>
                <span style={{ fontSize:'0.875rem' }}>✅</span>
                <span style={{ color:'#4ADE80', fontWeight:800, fontSize:'0.8125rem', whiteSpace:'nowrap' }}>Always fresh</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Category Filter ── */}
        <div style={{ overflowX:'auto', paddingBottom:'0.25rem', marginBottom:'2.5rem', WebkitOverflowScrolling:'touch' }}>
          <div style={{ display:'flex', gap:'0.5rem', padding:'0.5rem', background:'rgba(255,255,255,0.03)', borderRadius:'1rem', border:'1px solid rgba(255,255,255,0.06)', width:'max-content', minWidth:'100%' }}>
            {CATS.map(c => (
              <button key={c} onClick={() => { setCat(c); setShowAll(false) }}
                style={{ padding:'0.5rem 1.125rem', borderRadius:'0.625rem', fontSize:'0.875rem', fontWeight:700, border:'none', cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap', background:cat===c?'linear-gradient(135deg,#F97316,#DC2626)':'transparent', color:cat===c?'#fff':'rgba(255,255,255,0.45)', boxShadow:cat===c?'0 4px 16px rgba(249,115,22,0.3)':'none' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* ── Loading skeleton ── */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap:'1.25rem', marginBottom:'2rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius:'1.25rem', background:'var(--brand-card)', border:'1px solid rgba(255,255,255,0.06)', height:'320px', animation:'menuPulse 1.5s ease-in-out infinite', animationDelay:`${i*0.1}s` }} />
            ))}
            <style>{`@keyframes menuPulse{0%,100%{opacity:0.6}50%{opacity:0.25}}`}</style>
          </div>
        ) : (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap:'1.25rem', marginBottom:'2rem' }}>
              {displayed.map(item => (
                <MenuCard key={item.id} item={item} inCart={cart.find(c=>c.id===item.id)?.qty||0} onAdd={()=>addToCart(item)} />
              ))}
            </div>

            {filtered.length > 9 && (
              <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
                <button onClick={()=>setShowAll(!showAll)} className="btn-secondary">
                  {showAll ? 'Show Less ↑' : `View All ${filtered.length} Items ↓`}
                </button>
              </div>
            )}

            {filtered.length === 0 && (
              <div style={{ textAlign:'center', padding:'4rem 2rem' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🍽️</div>
                <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.9375rem' }}>No items in this category yet.</p>
              </div>
            )}
          </>
        )}

        {/* Footer note */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', paddingTop:'0.5rem' }}>
          <div style={{ height:'1px', flex:1, background:'rgba(255,255,255,0.06)' }} />
          <p style={{ color:'rgba(249,115,22,0.5)', fontSize:'0.8125rem', fontStyle:'italic', whiteSpace:'nowrap' }}>💬 All items can be customised — WhatsApp us!</p>
          <div style={{ height:'1px', flex:1, background:'rgba(255,255,255,0.06)' }} />
        </div>
      </div>

      {cartOpen && (
        <CartDrawer cart={cart} total={total} onClose={()=>setCartOpen(false)} onRemove={removeFromCart} onQty={changeQty} onOrder={sendWhatsApp} />
      )}

      <style>{`
        .delivery-inner {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.375rem 1.5rem 1.375rem 1.875rem;
        }
        .delivery-badges-side   { display: flex; }
        .delivery-badges-inline { display: none; }
        @media (max-width: 860px) {
          .delivery-badges-side   { display: none !important; }
          .delivery-badges-inline { display: flex !important; }
        }
        @media (max-width: 500px) {
          .delivery-inner { padding: 1.125rem 1rem 1.125rem 1.375rem; gap: 0.75rem; }
        }
      `}</style>
    </section>
  )
}

// ══════════════════════════════════════════════════════════
// MENU CARD
// ══════════════════════════════════════════════════════════
function MenuCard({ item, inCart, onAdd }: { item: Item; inCart: number; onAdd: () => void }) {
  // ✅ Fixed: was item.badgeColor, API returns badge_color
  const badgeColor = item.badge_color || '#F97316'
  // ✅ Fixed: was item.img2, API returns img2_url
  const hasTwo     = !!item.img2_url
  const [showSecond, setShowSecond] = useState(false)
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!hasTwo) return
    timerRef.current = setInterval(() => setShowSecond(p => !p), 3000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [hasTwo])

  const handleMouseEnter = () => {
    if (!hasTwo) return
    if (timerRef.current) clearInterval(timerRef.current)
    setShowSecond(true)
  }
  const handleMouseLeave = () => {
    if (!hasTwo) return
    setShowSecond(false)
    timerRef.current = setInterval(() => setShowSecond(p => !p), 3000)
  }

  return (
    <div style={{ borderRadius:'1.25rem', overflow:'hidden', background:'var(--brand-card)', border:`1px solid ${inCart>0?'rgba(249,115,22,0.5)':'rgba(255,255,255,0.06)'}`, display:'flex', flexDirection:'column', transition:'all 0.3s ease', boxShadow:inCart>0?'0 0 0 1px rgba(249,115,22,0.15),0 8px 32px rgba(249,115,22,0.12)':'0 2px 16px rgba(0,0,0,0.25)' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)'; if(inCart===0){e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.35)'}}}
      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=inCart>0?'0 0 0 1px rgba(249,115,22,0.15),0 8px 32px rgba(249,115,22,0.12)':'0 2px 16px rgba(0,0,0,0.25)'}}>

      <div style={{ position:'relative', height:'190px', overflow:'hidden', flexShrink:0, cursor:hasTwo?'pointer':'default' }}
        onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {/* ✅ Fixed: was item.img, API returns img_url */}
        <img src={item.img_url} alt={item.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transition:'opacity 0.65s ease,transform 0.55s ease', opacity:showSecond?0:1, transform:showSecond?'scale(1.06)':'scale(1)' }}
          onError={e=>{(e.target as HTMLImageElement).src='https://placehold.co/280x190/1A0800/F97316?text=No+Image'}} />
        {hasTwo && (
          // eslint-disable-next-line @next/next/no-img-element
          // ✅ Fixed: was item.img2, API returns img2_url
          <img src={item.img2_url} alt={`${item.name} 2`} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transition:'opacity 0.65s ease,transform 0.55s ease', opacity:showSecond?1:0, transform:showSecond?'scale(1)':'scale(1.06)' }}
            onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />
        )}
        {hasTwo && (
          <div style={{ position:'absolute', bottom:'12px', right:'12px', display:'flex', gap:'4px', zIndex:2 }}>
            {[0,1].map(i=><span key={i} style={{ width:'5px', height:'5px', borderRadius:'50%', background:(i===0&&!showSecond)||(i===1&&showSecond)?'#fff':'rgba(255,255,255,0.35)', transition:'background 0.3s' }} />)}
          </div>
        )}
        <div style={{ position:'absolute', inset:0, zIndex:1, background:'linear-gradient(to top,rgba(10,3,0,0.92) 0%,rgba(10,3,0,0.4) 45%,transparent 75%)' }} />
        {item.badge && (
          <span style={{ position:'absolute', top:'12px', left:'12px', zIndex:3, background:badgeColor, color:'#fff', fontSize:'0.625rem', fontWeight:900, padding:'0.2rem 0.625rem', borderRadius:'9999px', letterSpacing:'0.07em', textTransform:'uppercase', boxShadow:`0 2px 10px ${badgeColor}55` }}>{item.badge}</span>
        )}
        {inCart > 0 && (
          <span style={{ position:'absolute', top:'12px', right:'12px', zIndex:3, background:'linear-gradient(135deg,#F97316,#DC2626)', color:'#fff', fontSize:'0.75rem', fontWeight:900, width:'26px', height:'26px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 10px rgba(249,115,22,0.5)' }}>{inCart}</span>
        )}
        <div style={{ position:'absolute', bottom:'12px', left:'14px', zIndex:2 }}>
          <span style={{ color:'#FBBF24', fontWeight:900, fontSize:'1.125rem', textShadow:'0 1px 8px rgba(0,0,0,0.9)' }}>{item.priceLabel}</span>
        </div>
      </div>

      <div style={{ padding:'1.125rem 1.125rem 1rem', display:'flex', flexDirection:'column', gap:'0.375rem', flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.5rem', marginBottom:'0.125rem' }}>
          {/* ✅ Fixed: was item.cat, API returns category */}
          <span style={{ fontSize:'0.625rem', fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(249,115,22,0.6)' }}>{item.category}</span>
          {item.subcat && <span style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)' }}>{item.subcat}</span>}
        </div>
        <h3 style={{ color:'#fff', fontFamily:'var(--font-playfair)', fontWeight:700, fontSize:'1rem', lineHeight:1.3, margin:0 }}>{item.name}</h3>
        {item.note && (
          <div style={{ display:'flex', alignItems:'center', gap:'0.375rem', padding:'0.375rem 0.625rem', borderRadius:'0.5rem', background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.15)' }}>
            <span style={{ fontSize:'0.75rem' }}>ℹ️</span>
            <p style={{ color:'#F97316', fontSize:'0.6875rem', fontWeight:700, margin:0 }}>{item.note}</p>
          </div>
        )}
        {/* ✅ Fixed: was item.desc, API returns description */}
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.8125rem', lineHeight:1.65, flex:1, margin:0 }}>{item.description}</p>
        <button onClick={onAdd}
          style={{ marginTop:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', padding:'0.75rem', borderRadius:'0.75rem', border:`1px solid ${inCart>0?'rgba(249,115,22,0.45)':'rgba(255,255,255,0.1)'}`, cursor:'pointer', fontWeight:800, fontSize:'0.875rem', transition:'all 0.2s', background:inCart>0?'linear-gradient(135deg,rgba(249,115,22,0.18),rgba(220,38,38,0.12))':'rgba(255,255,255,0.04)', color:inCart>0?'#F97316':'rgba(255,255,255,0.6)' }}
          onMouseEnter={e=>{e.currentTarget.style.background='linear-gradient(135deg,rgba(249,115,22,0.25),rgba(220,38,38,0.18))';e.currentTarget.style.color='#F97316';e.currentTarget.style.border='1px solid rgba(249,115,22,0.5)'}}
          onMouseLeave={e=>{e.currentTarget.style.background=inCart>0?'linear-gradient(135deg,rgba(249,115,22,0.18),rgba(220,38,38,0.12))':'rgba(255,255,255,0.04)';e.currentTarget.style.color=inCart>0?'#F97316':'rgba(255,255,255,0.6)';e.currentTarget.style.border=`1px solid ${inCart>0?'rgba(249,115,22,0.45)':'rgba(255,255,255,0.1)'}`}}>
          {inCart > 0 ? <><span style={{fontSize:'0.875rem'}}>✓</span> Added ({inCart}) · Add More</> : <><span style={{fontSize:'1rem',lineHeight:1}}>+</span> Add to Order</>}
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// CART DRAWER
// ══════════════════════════════════════════════════════════
function CartDrawer({ cart, total, onClose, onRemove, onQty, onOrder }: {
  cart: CartItem[]; total: number; onClose: () => void
  onRemove: (id: string) => void; onQty: (id: string, d: number) => void; onOrder: () => void
}) {
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)' }} />
      <div style={{ position:'fixed', top:0, right:0, bottom:0, width:'min(440px,100vw)', background:'#120800', zIndex:301, display:'flex', flexDirection:'column', boxShadow:'-16px 0 64px rgba(0,0,0,0.7)', animation:'slideInRight 0.32s cubic-bezier(0.22,1,0.36,1)', borderLeft:'1px solid rgba(249,115,22,0.12)' }}>

        <div style={{ padding:'1.25rem', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0, background:'rgba(249,115,22,0.04)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
            <div>
              <h3 style={{ color:'#fff', fontFamily:'var(--font-playfair)', fontWeight:700, fontSize:'1.125rem', margin:'0 0 0.125rem' }}>Your Order</h3>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.8125rem', margin:0 }}>{cart.reduce((s,c)=>s+c.qty,0)} item(s) selected</p>
            </div>
            <button onClick={onClose} style={{ display:'flex', alignItems:'center', gap:'0.375rem', padding:'0.5rem 0.875rem', borderRadius:'0.5rem', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontSize:'0.8125rem', fontWeight:700, transition:'all 0.2s', flexShrink:0 }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.12)';e.currentTarget.style.color='#fff'}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.07)';e.currentTarget.style.color='rgba(255,255,255,0.55)'}}>
              ← Back to Menu
            </button>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 0.75rem', borderRadius:'0.625rem', background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.18)' }}>
            <span style={{ fontSize:'0.875rem' }}>👆</span>
            <p style={{ color:'rgba(249,115,22,0.85)', fontSize:'0.75rem', fontWeight:700, margin:0 }}>You can still add more items — go back and keep browsing!</p>
          </div>
        </div>

        <div style={{ margin:'0.875rem 1.25rem 0', padding:'0.75rem 0.875rem', borderRadius:'0.75rem', background:'rgba(251,191,36,0.07)', border:'1px solid rgba(251,191,36,0.18)', display:'flex', gap:'0.625rem', alignItems:'flex-start' }}>
          <span style={{ fontSize:'0.875rem', flexShrink:0, marginTop:'1px' }}>🏡</span>
          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.75rem', lineHeight:1.7, margin:0 }}>
            <strong style={{ color:'#FBBF24', fontWeight:800 }}>Freshly cooked to order.</strong>{' '}
            Allow up to <strong style={{ color:'#FBBF24', fontWeight:800 }}>6 hours</strong> for delivery.
          </p>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'0.875rem 1.25rem', WebkitOverflowScrolling:'touch' }}>
          {cart.map((item, idx) => (
            <div key={item.id} style={{ display:'flex', gap:'0.75rem', padding:'0.875rem 0', borderBottom:idx<cart.length-1?'1px solid rgba(255,255,255,0.05)':'none', alignItems:'center' }}>
              <div style={{ width:'52px', height:'52px', borderRadius:'0.75rem', overflow:'hidden', flexShrink:0, border:'1px solid rgba(255,255,255,0.08)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {/* ✅ Fixed: was item.img, API returns img_url */}
                <img src={item.img_url} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                  onError={e=>{(e.target as HTMLImageElement).src='https://placehold.co/52x52/1A0800/F97316?text=?'}} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ color:'#fff', fontWeight:700, fontSize:'0.875rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:'0 0 0.25rem' }}>{item.name}</p>
                <p style={{ color:'#FBBF24', fontWeight:800, fontSize:'0.875rem', margin:0 }}>{formatPrice(item.price*item.qty)}</p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.375rem', flexShrink:0 }}>
                <button onClick={()=>item.qty===1?onRemove(item.id):onQty(item.id,-1)}
                  style={{ width:'28px', height:'28px', borderRadius:'50%', border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.05)', color:item.qty===1?'rgba(220,38,38,0.8)':'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {item.qty===1?'🗑':'−'}
                </button>
                <span style={{ color:'#fff', fontWeight:900, fontSize:'0.9375rem', minWidth:'1.25rem', textAlign:'center' }}>{item.qty}</span>
                <button onClick={()=>onQty(item.id,1)}
                  style={{ width:'28px', height:'28px', borderRadius:'50%', border:'1px solid rgba(249,115,22,0.35)', background:'rgba(249,115,22,0.1)', color:'#F97316', cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding:'1.125rem 1.25rem', borderTop:'1px solid rgba(255,255,255,0.06)', flexShrink:0, background:'rgba(0,0,0,0.25)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', padding:'0.875rem 1rem', borderRadius:'0.875rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.6875rem', fontWeight:600, margin:'0 0 0.125rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>Order Total</p>
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.6875rem', margin:0 }}>excl. delivery fee</p>
            </div>
            <span style={{ color:'#FBBF24', fontWeight:900, fontSize:'1.375rem', fontFamily:'var(--font-playfair)' }}>{formatPrice(total)}</span>
          </div>
          <button onClick={onOrder}
            style={{ width:'100%', padding:'0.9375rem 1.5rem', borderRadius:'0.875rem', background:'#25D366', border:'none', color:'#fff', fontWeight:800, fontSize:'1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.625rem', boxShadow:'0 6px 28px rgba(37,211,102,0.3)', transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#20c05c';e.currentTarget.style.transform='translateY(-1px)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='#25D366';e.currentTarget.style.transform='translateY(0)'}}>
            <WAIcon /> Send Order on WhatsApp
          </button>
          <p style={{ textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:'0.6875rem', marginTop:'0.625rem', lineHeight:1.5 }}>
            We&apos;ll confirm your order and arrange delivery via WhatsApp.
          </p>
        </div>
      </div>
      <style>{`@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </>
  )
}

function WAIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
}