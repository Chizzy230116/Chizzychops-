'use client'
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import {
  fetchMenu,
  upsertItem,
  deleteItem,
  uploadImage,
  fetchOrders,
  updateOrderStatus,
  deleteOrder,
} from '@/app/lib/supabase-queries'
import type { MenuItem, Order, OrderStatus } from '@/app/lib/supabase'

const OWNER_WA   = '2348094946923'
const CATEGORIES = ['Soups', 'Stews', 'Rice & Pottage', 'Pasta & Rice', 'Food Boxes']
const SUBCATS    = ['', 'Pasta', 'Rice']
const TABS       = ['📋 Orders', '🍽️ Menu', '📊 Stats'] as const
type Tab         = typeof TABS[number]

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; next?: OrderStatus }> = {
  new:       { label: '🆕 New',        color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  next: 'confirmed'  },
  confirmed: { label: '✅ Confirmed',  color: '#4ADE80', bg: 'rgba(74,222,128,0.12)',  next: 'preparing'  },
  preparing: { label: '👩‍🍳 Preparing', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)', next: 'ready'      },
  ready:     { label: '📦 Ready',      color: '#F97316', bg: 'rgba(249,115,22,0.12)',  next: 'delivered'  },
  delivered: { label: '🎉 Delivered',  color: '#A3E635', bg: 'rgba(163,230,53,0.12)',  next: undefined    },
  cancelled: { label: '❌ Cancelled',  color: '#F87171', bg: 'rgba(248,113,113,0.12)', next: undefined    },
}

const EMPTY_ITEM: Omit<MenuItem, 'updated_at'> = {
  id: '', name: '', price: 0, category: 'Soups', subcat: null,
  description: '', badge: null, badge_color: null, note: null,
  img_url: '', img2_url: null, sort_order: 99,
}

const fmt     = (n: number) => '₦' + n.toLocaleString('en-NG')
const slug    = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
const timeAgo = (d: string) => {
  const s = (Date.now() - new Date(d).getTime()) / 1000
  if (s < 60)    return 'just now'
  if (s < 3600)  return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

export default function AdminPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (!mounted) return null
  if (loading)  return <Loader text="Loading…" fullPage />
  if (!session) return <LoginScreen />
  return <Dashboard />
}

function LoginScreen() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)

  const login = async () => {
    setBusy(true); setError('')
    const { error: e } = await supabase.auth.signInWithPassword({ email, password })
    if (e) setError(e.message)
    setBusy(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0A0300', padding:'1.5rem' }}>
      <div style={{ width:'100%', maxWidth:'380px', background:'#1A0800', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'1.25rem', padding:'2.5rem' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>🍽️</div>
          <h1 style={{ color:'#fff', fontFamily:'Georgia,serif', fontSize:'1.5rem', fontWeight:700 }}>Chizzychops Admin</h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.875rem', marginTop:'0.25rem' }}>Owner access only</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} style={inputStyle} />
          {error && <p style={{ color:'#F87171', fontSize:'0.8125rem', textAlign:'center' }}>{error}</p>}
          <button onClick={login} disabled={busy} style={{ ...btnPrimary, opacity:busy?0.7:1 }}>{busy?'Signing in…':'Sign In'}</button>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const [tab, setTab]           = useState<Tab>('📋 Orders')
  const [orders, setOrders]     = useState<Order[]>([])
  const [menuItems, setMenu]    = useState<MenuItem[]>([])
  const [loadingO, setLoadO]    = useState(true)
  const [loadingM, setLoadM]    = useState(true)
  const [toast, setToast]       = useState('')
  const [newCount, setNewCount] = useState(0)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 4000) }

  const loadOrders = async () => {
    setLoadO(true)
    try { const o = await fetchOrders(); setOrders(o); setNewCount(o.filter((x: Order) => x.status === 'new').length) }
    catch (e: any) { showToast('❌ ' + e.message) }
    setLoadO(false)
  }

  const loadMenu = async () => {
    setLoadM(true)
    try { setMenu(await fetchMenu()) }
    catch (e: any) { showToast('❌ ' + e.message) }
    setLoadM(false)
  }

  useEffect(() => { loadOrders(); loadMenu() }, [])

  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
        const o = payload.new as Order
        setOrders(prev => [o, ...prev])
        setNewCount(n => n + 1)
        showToast(`🆕 New order! ${o.id}`)
        notifyOwnerWA(o)
        try { new Audio('/notification.mp3').play() } catch {}
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, payload => {
        setOrders(prev => prev.map((x: Order) => x.id === payload.new.id ? payload.new as Order : x))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const notifyOwnerWA = (o: Order) => {
    const lines = (o.items as any[]).map(i => `• ${i.name} x${i.qty} — ${fmt(i.price * i.qty)}`)
    const msg = [`🆕 *NEW ORDER — ${o.id}*`, '', `👤 ${o.customer_name||'Unknown'}`, o.customer_phone?`📞 ${o.customer_phone}`:'', '', ...lines, '', `💰 *Total: ${fmt(o.total)}*`, o.note?`📝 ${o.note}`:'', o.address?`📍 ${o.address}`:'', '', `⏰ ${new Date(o.created_at).toLocaleString('en-NG')}`, '', `Manage: https://chizzychops.vercel.app/admin`].filter(Boolean).join('\n')
    window.open(`https://wa.me/${OWNER_WA}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try { await updateOrderStatus(id, status); showToast(`✅ ${id} → ${status}`) }
    catch (e: any) { showToast('❌ ' + e.message) }
  }

  const handleDeleteOrder = async (id: string) => {
    if (!confirm(`Delete order ${id}?`)) return
    try { await deleteOrder(id); setOrders(p => p.filter((o: Order) => o.id !== id)); showToast('🗑 Deleted') }
    catch (e: any) { showToast('❌ ' + e.message) }
  }

  const todayOrders  = orders.filter((o: Order) => new Date(o.created_at).toDateString() === new Date().toDateString())
  const activeOrders = orders.filter((o: Order) => !['delivered','cancelled'].includes(o.status))
  const revenue      = orders.filter((o: Order) => o.status === 'delivered').reduce((s: number, o: Order) => s + o.total, 0)

  return (
    <div style={{ minHeight:'100vh', background:'#0A0300', color:'#fff', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ background:'#120600', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0.875rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <span style={{ fontSize:'1.5rem' }}>🍽️</span>
          <div>
            <h1 style={{ fontSize:'1rem', fontWeight:800, color:'#fff', lineHeight:1 }}>Chizzychops Admin</h1>
            <div style={{ display:'flex', gap:'0.5rem', marginTop:'2px', alignItems:'center' }}>
              {newCount > 0 && <span style={{ background:'#DC2626', color:'#fff', fontSize:'0.625rem', fontWeight:800, padding:'0.15rem 0.5rem', borderRadius:'9999px', animation:'adminPulse 1.5s infinite' }}>{newCount} NEW</span>}
              <span style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.75rem' }}>{orders.length} orders</span>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <a href="/" target="_blank" style={{ ...btnSecondary, fontSize:'0.8rem', padding:'0.4rem 0.875rem', textDecoration:'none' }}>🌐 Site</a>
          <button onClick={() => supabase.auth.signOut()} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', padding:'0.4rem 0.75rem', borderRadius:'0.5rem', cursor:'pointer', fontSize:'0.8rem' }}>Sign Out</button>
        </div>
      </div>

      <div style={{ background:'#0f0400', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 1.25rem', display:'flex', gap:'0.25rem', overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:'0.75rem 1.25rem', background:'none', border:'none', cursor:'pointer', fontWeight:700, fontSize:'0.875rem', color:tab===t?'#F97316':'rgba(255,255,255,0.45)', borderBottom:tab===t?'2px solid #F97316':'2px solid transparent', transition:'all 0.2s', position:'relative', whiteSpace:'nowrap' }}>
            {t}
            {t==='📋 Orders'&&newCount>0&&<span style={{ position:'absolute', top:'6px', right:'4px', background:'#DC2626', color:'#fff', width:'16px', height:'16px', borderRadius:'50%', fontSize:'0.6rem', fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center' }}>{newCount}</span>}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'1.25rem' }}>
        {tab==='📋 Orders' && <OrdersPanel orders={orders} loading={loadingO} onStatusChange={handleStatusChange} onDelete={handleDeleteOrder} onNotify={notifyOwnerWA} onRefresh={loadOrders} todayCount={todayOrders.length} activeCount={activeOrders.length} revenue={revenue} />}
        {tab==='🍽️ Menu'   && <MenuPanel items={menuItems} loading={loadingM} onRefresh={loadMenu} showToast={showToast} />}
        {tab==='📊 Stats'  && <StatsPanel orders={orders} menuItems={menuItems} />}
      </div>

      {toast && (
        <div style={{ position:'fixed', bottom:'1.5rem', left:'50%', transform:'translateX(-50%)', background:'#1A0800', border:'1px solid rgba(249,115,22,0.4)', color:'#fff', padding:'0.75rem 1.5rem', borderRadius:'9999px', fontWeight:700, fontSize:'0.875rem', zIndex:999, boxShadow:'0 8px 32px rgba(0,0,0,0.6)', whiteSpace:'nowrap', maxWidth:'calc(100vw - 2rem)', textAlign:'center' }}>
          {toast}
        </div>
      )}
      <style>{`@keyframes adminPulse{0%,100%{opacity:1}50%{opacity:0.5}} select option{background:#1A0800;color:#fff}`}</style>
    </div>
  )
}

function OrdersPanel({ orders, loading, onStatusChange, onDelete, onNotify, onRefresh, todayCount, activeCount, revenue }: { orders:Order[]; loading:boolean; onStatusChange:(id:string,s:OrderStatus)=>void; onDelete:(id:string)=>void; onNotify:(o:Order)=>void; onRefresh:()=>void; todayCount:number; activeCount:number; revenue:number }) {
  const [filter, setFilter]     = useState<OrderStatus|'all'>('all')
  const [expanded, setExpanded] = useState<string|null>(null)
  const displayed = filter==='all' ? orders : orders.filter((o:Order)=>o.status===filter)

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:'0.75rem', marginBottom:'1.25rem' }}>
        {[{label:'Today',value:todayCount,icon:'📅',color:'#60A5FA'},{label:'Active',value:activeCount,icon:'🔥',color:'#F97316'},{label:'New',value:orders.filter((o:Order)=>o.status==='new').length,icon:'🆕',color:'#DC2626'},{label:'Delivered',value:orders.filter((o:Order)=>o.status==='delivered').length,icon:'✅',color:'#4ADE80'},{label:'Revenue',value:fmt(revenue),icon:'💰',color:'#FBBF24'}].map(s=>(
          <div key={s.label} style={{ background:'#120600', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'0.75rem', padding:'0.875rem' }}>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.6875rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.icon} {s.label}</p>
            <p style={{ color:s.color, fontWeight:900, fontSize:'1.375rem', lineHeight:1.2, marginTop:'0.25rem' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1rem', alignItems:'center' }}>
        {(['all','new','confirmed','preparing','ready','delivered','cancelled'] as const).map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{ padding:'0.375rem 0.875rem', borderRadius:'9999px', fontSize:'0.8125rem', fontWeight:700, border:'1px solid transparent', cursor:'pointer', whiteSpace:'nowrap', background:filter===s?(s==='all'?'linear-gradient(135deg,#F97316,#DC2626)':(STATUS_CONFIG[s as OrderStatus]?.bg||'rgba(255,255,255,0.1)')):'rgba(255,255,255,0.04)', color:filter===s?(s==='all'?'#fff':(STATUS_CONFIG[s as OrderStatus]?.color||'#fff')):'rgba(255,255,255,0.5)' }}>
            {s==='all'?'All':STATUS_CONFIG[s as OrderStatus].label}
          </button>
        ))}
        <button onClick={onRefresh} style={{ ...btnSecondary, fontSize:'0.8rem', padding:'0.375rem 0.875rem', marginLeft:'auto' }}>🔄 Refresh</button>
      </div>

      {loading ? <Loader text="Loading orders…" /> : displayed.length===0 ? (
        <div style={{ textAlign:'center', padding:'4rem', color:'rgba(255,255,255,0.3)' }}><div style={{ fontSize:'3rem', marginBottom:'0.75rem' }}>📭</div><p>No orders yet.</p></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
          {displayed.map((order:Order)=>{
            const cfg=STATUS_CONFIG[order.status]; const isExp=expanded===order.id
            return (
              <div key={order.id} style={{ background:'#120600', border:`1px solid ${order.status==='new'?'rgba(96,165,250,0.3)':'rgba(255,255,255,0.07)'}`, borderRadius:'0.875rem', overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', padding:'0.875rem 1rem', cursor:'pointer', flexWrap:'wrap' }} onClick={()=>setExpanded(isExp?null:order.id)}>
                  <span style={{ background:cfg.bg, color:cfg.color, fontSize:'0.6875rem', fontWeight:800, padding:'0.2rem 0.625rem', borderRadius:'9999px', whiteSpace:'nowrap' }}>{cfg.label}</span>
                  <span style={{ color:'#fff', fontWeight:800, fontSize:'0.875rem', fontFamily:'monospace' }}>{order.id}</span>
                  {order.customer_name&&<span style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.8125rem' }}>{order.customer_name}</span>}
                  {order.customer_phone&&<span style={{ color:'#25D366', fontSize:'0.8125rem' }}>📞 {order.customer_phone}</span>}
                  <span style={{ color:'#FBBF24', fontWeight:900, marginLeft:'auto', fontSize:'0.9375rem', whiteSpace:'nowrap' }}>{fmt(order.total)}</span>
                  <span style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.75rem', whiteSpace:'nowrap' }}>{timeAgo(order.created_at)}</span>
                  <span style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.75rem' }}>{isExp?'▲':'▼'}</span>
                </div>
                {isExp&&(
                  <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'1rem' }}>
                    <div style={{ marginBottom:'0.875rem' }}>
                      {(order.items as any[]).map((item:any,i:number)=>(
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'0.3rem 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                          <span style={{ color:'#fff', fontSize:'0.875rem' }}>{item.name} <span style={{ color:'rgba(255,255,255,0.4)' }}>x{item.qty}</span></span>
                          <span style={{ color:'#FBBF24', fontWeight:700 }}>{fmt(item.price*item.qty)}</span>
                        </div>
                      ))}
                      <div style={{ display:'flex', justifyContent:'space-between', paddingTop:'0.5rem', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
                        <span style={{ color:'rgba(255,255,255,0.5)', fontWeight:700 }}>Total</span>
                        <span style={{ color:'#FBBF24', fontWeight:900, fontSize:'1.0625rem' }}>{fmt(order.total)}</span>
                      </div>
                    </div>
                    {(order.note||order.address)&&(
                      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.875rem', flexWrap:'wrap' }}>
                        {order.note&&<div style={{ background:'rgba(255,255,255,0.04)', borderRadius:'0.5rem', padding:'0.5rem 0.75rem', fontSize:'0.8125rem', color:'rgba(255,255,255,0.65)' }}><strong style={{ color:'#F97316' }}>Note:</strong> {order.note}</div>}
                        {order.address&&<div style={{ background:'rgba(255,255,255,0.04)', borderRadius:'0.5rem', padding:'0.5rem 0.75rem', fontSize:'0.8125rem', color:'rgba(255,255,255,0.65)' }}><strong style={{ color:'#4ADE80' }}>📍</strong> {order.address}</div>}
                      </div>
                    )}
                    <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
                      {cfg.next&&<button onClick={()=>onStatusChange(order.id,cfg.next!)} style={{ ...btnPrimary, fontSize:'0.8125rem', padding:'0.5rem 1rem' }}>→ {STATUS_CONFIG[cfg.next].label}</button>}
                      {!['delivered','cancelled'].includes(order.status)&&<button onClick={()=>onStatusChange(order.id,'cancelled')} style={{ background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.2)', color:'#F87171', padding:'0.5rem 1rem', borderRadius:'9999px', cursor:'pointer', fontSize:'0.8125rem', fontWeight:700 }}>Cancel</button>}
                      {order.customer_phone&&<a href={`https://wa.me/${order.customer_phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi! Your Chizzychops order ${order.id} is now ${order.status}. 🍽️`)}`} target="_blank" rel="noopener noreferrer" style={{ background:'rgba(37,211,102,0.1)', border:'1px solid rgba(37,211,102,0.2)', color:'#4ADE80', padding:'0.5rem 1rem', borderRadius:'9999px', fontSize:'0.8125rem', fontWeight:700, textDecoration:'none' }}>📲 WhatsApp Customer</a>}
                      <button onClick={()=>onNotify(order)} style={{ ...btnSecondary, fontSize:'0.8125rem', padding:'0.5rem 1rem' }}>🔔 Notify Me</button>
                      <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'0.75rem', marginLeft:'auto' }}>{new Date(order.created_at).toLocaleString('en-NG')}</span>
                      <button onClick={()=>onDelete(order.id)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:'0.875rem' }}>🗑</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MenuPanel({ items, loading, onRefresh, showToast }: { items:MenuItem[]; loading:boolean; onRefresh:()=>void; showToast:(m:string)=>void }) {
  const [search, setSearch] = useState('')
  const [catF, setCatF]     = useState('All')
  const [editing, setEditing] = useState<Omit<MenuItem,'updated_at'>|null>(null)
  const filtered = items.filter((i:MenuItem)=>(catF==='All'||i.category===catF)&&i.name.toLowerCase().includes(search.toLowerCase()))

  const handleDelete = async (id:string, name:string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try { await deleteItem(id); showToast('🗑 Deleted '+name); onRefresh() } catch(e:any){showToast('❌ '+e.message)}
  }

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:'0.75rem', marginBottom:'1.25rem' }}>
        {CATEGORIES.map(c=><div key={c} style={{ background:'#120600', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'0.75rem', padding:'0.875rem' }}><p style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.6875rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>{c}</p><p style={{ color:'#F97316', fontWeight:900, fontSize:'1.5rem', lineHeight:1.2, marginTop:'0.25rem' }}>{items.filter((i:MenuItem)=>i.category===c).length}</p></div>)}
      </div>
      <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1rem', alignItems:'center' }}>
        <input type="search" placeholder="🔍 Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inputStyle, maxWidth:'200px', padding:'0.5rem 0.875rem', fontSize:'0.875rem' }} />
        {['All',...CATEGORIES].map(c=><button key={c} onClick={()=>setCatF(c)} style={{ padding:'0.375rem 0.875rem', borderRadius:'9999px', fontSize:'0.8125rem', fontWeight:700, border:'1px solid transparent', cursor:'pointer', background:catF===c?'linear-gradient(135deg,#F97316,#DC2626)':'rgba(255,255,255,0.04)', color:catF===c?'#fff':'rgba(255,255,255,0.5)' }}>{c}</button>)}
        <button onClick={()=>setEditing({...EMPTY_ITEM, id:slug(Date.now().toString()), sort_order:items.length+1})} style={{ ...btnPrimary, fontSize:'0.8125rem', padding:'0.5rem 1.125rem', marginLeft:'auto' }}>+ Add Item</button>
      </div>
      {loading?<Loader text="Loading menu…"/>:(
        <div style={{ background:'#120600', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'1rem', overflow:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'600px' }}>
            <thead><tr style={{ background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>{['Img','Name','Category','Price','Badge',''].map((h,i)=><th key={i} style={{ padding:'0.75rem 1rem', textAlign:'left', color:'rgba(255,255,255,0.35)', fontSize:'0.6875rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((item:MenuItem)=>(
                <tr key={item.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', transition:'background 0.15s' }} onMouseEnter={e=>(e.currentTarget.style.background='rgba(249,115,22,0.04)')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                  <td style={{ padding:'0.625rem 1rem' }}><img src={item.img_url} alt="" style={{ width:'44px', height:'44px', objectFit:'cover', borderRadius:'0.5rem', border:'1px solid rgba(255,255,255,0.08)' }} onError={e=>{(e.target as HTMLImageElement).src='https://placehold.co/44x44/1A0800/F97316?text=?'}} /></td>
                  <td style={{ padding:'0.625rem 1rem' }}><p style={{ color:'#fff', fontWeight:700, fontSize:'0.875rem' }}>{item.name}</p><p style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.6875rem' }}>{item.id}</p></td>
                  <td style={{ padding:'0.625rem 1rem', color:'rgba(255,255,255,0.5)', fontSize:'0.8125rem', whiteSpace:'nowrap' }}>{item.category}{item.subcat&&<span style={{ color:'#F97316', display:'block', fontSize:'0.75rem' }}>{item.subcat}</span>}</td>
                  <td style={{ padding:'0.625rem 1rem', color:'#FBBF24', fontWeight:800, whiteSpace:'nowrap' }}>{fmt(item.price)}</td>
                  <td style={{ padding:'0.625rem 1rem' }}>{item.badge&&<span style={{ background:item.badge_color||'#F97316', color:'#fff', fontSize:'0.6rem', fontWeight:800, padding:'0.2rem 0.5rem', borderRadius:'9999px', textTransform:'uppercase' }}>{item.badge}</span>}</td>
                  <td style={{ padding:'0.625rem 1rem' }}><div style={{ display:'flex', gap:'0.375rem' }}><button onClick={()=>setEditing({...item})} style={{ padding:'0.3rem 0.625rem', borderRadius:'0.375rem', background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', cursor:'pointer', fontSize:'0.75rem', fontWeight:700 }}>✏️</button><button onClick={()=>handleDelete(item.id,item.name)} style={{ padding:'0.3rem 0.625rem', borderRadius:'0.375rem', background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.15)', color:'#F87171', cursor:'pointer', fontSize:'0.75rem', fontWeight:700 }}>🗑</button></div></td>
                </tr>
              ))}
              {filtered.length===0&&<tr><td colSpan={6} style={{ padding:'2.5rem', textAlign:'center', color:'rgba(255,255,255,0.3)' }}>No items found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {editing&&<EditModal item={editing} onClose={()=>setEditing(null)} onSaved={()=>{setEditing(null);onRefresh();showToast('✅ Saved!')}} />}
    </div>
  )
}

function StatsPanel({ orders, menuItems }: { orders:Order[]; menuItems:MenuItem[] }) {
  const topItems = orders.flatMap((o:Order)=>o.items as any[]).reduce((acc:Record<string,any>,item:any)=>{if(!acc[item.id])acc[item.id]={name:item.name,qty:0,revenue:0};acc[item.id].qty+=item.qty;acc[item.id].revenue+=item.price*item.qty;return acc},{})
  const topList = Object.values(topItems).sort((a:any,b:any)=>b.qty-a.qty).slice(0,8)
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      <div>
        <h3 style={{ color:'#fff', fontWeight:700, fontSize:'1rem', marginBottom:'0.875rem' }}>Orders by Status</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:'0.75rem' }}>
          {(Object.entries(STATUS_CONFIG) as [OrderStatus, typeof STATUS_CONFIG[OrderStatus]][]).map(([k,v])=>(
            <div key={k} style={{ background:v.bg, border:`1px solid ${v.color}25`, borderRadius:'0.875rem', padding:'1rem' }}>
              <p style={{ color:v.color, fontWeight:900, fontSize:'2rem', lineHeight:1 }}>{orders.filter((o:Order)=>o.status===k).length}</p>
              <p style={{ color:v.color, fontSize:'0.8125rem', fontWeight:700, marginTop:'0.25rem' }}>{v.label}</p>
            </div>
          ))}
        </div>
      </div>
      {topList.length>0&&(
        <div>
          <h3 style={{ color:'#fff', fontWeight:700, fontSize:'1rem', marginBottom:'0.875rem' }}>Top Selling Items</h3>
          <div style={{ background:'#120600', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'1rem', overflow:'hidden' }}>
            {topList.map((item:any,i:number)=>(
              <div key={item.name} style={{ display:'flex', gap:'1rem', alignItems:'center', padding:'0.875rem 1.25rem', borderBottom:i<topList.length-1?'1px solid rgba(255,255,255,0.05)':'none' }}>
                <span style={{ color:'#F97316', fontWeight:900, minWidth:'24px' }}>#{i+1}</span>
                <span style={{ color:'#fff', fontWeight:700, flex:1 }}>{item.name}</span>
                <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.875rem' }}>{item.qty} orders</span>
                <span style={{ color:'#FBBF24', fontWeight:800 }}>{fmt(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EditModal({ item, onClose, onSaved }: { item:Omit<MenuItem,'updated_at'>; onClose:()=>void; onSaved:()=>void }) {
  const [form, setForm]   = useState({...item})
  const [saving,setSaving]= useState(false)
  const [error,setError]  = useState('')
  const [upImg,setUpImg]  = useState(false)
  const [upImg2,setUpImg2]= useState(false)
  const img1=useRef<HTMLInputElement>(null); const img2=useRef<HTMLInputElement>(null)
  const set=(k:keyof typeof form,v:any)=>setForm(f=>({...f,[k]:v||null}))
  const handleUpload=async(file:File,field:'img_url'|'img2_url')=>{const setU=field==='img_url'?setUpImg:setUpImg2;setU(true);try{const url=await uploadImage(file);set(field,url)}catch(e:any){setError('Upload failed: '+e.message)};setU(false)}
  const save=async()=>{
    if(!form.id.trim())return setError('ID required');if(!form.name.trim())return setError('Name required');if(form.price<=0)return setError('Price must be > 0');if(!form.img_url?.trim())return setError('Main image required')
    setSaving(true);setError('')
    try{await upsertItem({...form,id:form.id.trim().toLowerCase(),subcat:form.subcat||null,badge:form.badge||null,badge_color:form.badge_color||null,note:form.note||null,img2_url:form.img2_url||null});onSaved()}catch(e:any){setError(e.message);setSaving(false)}
  }
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:200, backdropFilter:'blur(4px)' }} />
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'min(680px,calc(100vw - 2rem))', maxHeight:'90vh', overflowY:'auto', background:'#1A0800', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'1.25rem', zIndex:201, padding:'2rem', boxShadow:'0 24px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h2 style={{ color:'#fff', fontFamily:'Georgia,serif', fontSize:'1.25rem', fontWeight:700 }}>{item.name?`Edit: ${item.name}`:'Add New Item'}</h2>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.07)', border:'none', color:'#fff', width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer', fontSize:'1.125rem' }}>×</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          <Field label="Item ID *"><input value={form.id} onChange={e=>set('id',e.target.value)} style={inputStyle} placeholder="s15" /></Field>
          <Field label="Sort Order"><input type="number" value={form.sort_order} onChange={e=>set('sort_order',+e.target.value)} style={inputStyle} /></Field>
          <Field label="Name *" span><input value={form.name} onChange={e=>set('name',e.target.value)} style={inputStyle} /></Field>
          <Field label="Price (₦) *"><input type="number" value={form.price||''} onChange={e=>set('price',+e.target.value)} style={inputStyle} /></Field>
          <Field label="Category *"><select value={form.category} onChange={e=>set('category',e.target.value)} style={inputStyle}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></Field>
          <Field label="Sub-category"><select value={form.subcat||''} onChange={e=>set('subcat',e.target.value)} style={inputStyle}>{SUBCATS.map(s=><option key={s} value={s}>{s||'— None —'}</option>)}</select></Field>
          <Field label="Description *" span><textarea value={form.description} onChange={e=>set('description',e.target.value)} style={{ ...inputStyle, minHeight:'72px', resize:'vertical' }} /></Field>
          <Field label="Badge"><input value={form.badge||''} onChange={e=>set('badge',e.target.value)} style={inputStyle} placeholder="2L Bowl" /></Field>
          <Field label="Badge Colour"><div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}><input value={form.badge_color||''} onChange={e=>set('badge_color',e.target.value)} style={{ ...inputStyle, flex:1 }} placeholder="#F97316" />{form.badge_color&&<div style={{ width:'28px', height:'28px', borderRadius:'0.375rem', background:form.badge_color, border:'1px solid rgba(255,255,255,0.15)', flexShrink:0 }} />}</div></Field>
          <Field label="Note" span><input value={form.note||''} onChange={e=>set('note',e.target.value)} style={inputStyle} placeholder="Includes 5pcs…" /></Field>
          <Field label="Main Image *" span>
            <div style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start' }}>
              <div style={{ flex:1 }}><input value={form.img_url||''} onChange={e=>set('img_url',e.target.value)} style={{ ...inputStyle, marginBottom:'0.5rem' }} placeholder="/soup/egusi.jpg or https://…" /><div style={{ display:'flex', gap:'0.5rem' }}><input ref={img1} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>e.target.files?.[0]&&handleUpload(e.target.files[0],'img_url')} /><button onClick={()=>img1.current?.click()} disabled={upImg} style={{ ...btnSecondary, fontSize:'0.8rem', padding:'0.375rem 0.75rem', opacity:upImg?0.7:1 }}>{upImg?'⏳ Uploading…':'📁 Upload'}</button></div></div>
              {form.img_url&&<img src={form.img_url} alt="p" style={{ width:'64px', height:'64px', objectFit:'cover', borderRadius:'0.5rem', border:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }} onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />}
            </div>
          </Field>
          <Field label="Second Image" hint="optional" span>
            <div style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start' }}>
              <div style={{ flex:1 }}><input value={form.img2_url||''} onChange={e=>set('img2_url',e.target.value)} style={{ ...inputStyle, marginBottom:'0.5rem' }} placeholder="optional" /><div style={{ display:'flex', gap:'0.5rem' }}><input ref={img2} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>e.target.files?.[0]&&handleUpload(e.target.files[0],'img2_url')} /><button onClick={()=>img2.current?.click()} disabled={upImg2} style={{ ...btnSecondary, fontSize:'0.8rem', padding:'0.375rem 0.75rem', opacity:upImg2?0.7:1 }}>{upImg2?'⏳ Uploading…':'📁 Upload'}</button>{form.img2_url&&<button onClick={()=>set('img2_url','')} style={{ background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.2)', color:'#F87171', padding:'0.375rem 0.5rem', borderRadius:'0.375rem', cursor:'pointer', fontSize:'0.75rem' }}>Remove</button>}</div></div>
              {form.img2_url&&<img src={form.img2_url} alt="p2" style={{ width:'64px', height:'64px', objectFit:'cover', borderRadius:'0.5rem', border:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }} onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />}
            </div>
          </Field>
        </div>
        {error&&<p style={{ color:'#F87171', fontSize:'0.875rem', marginTop:'1rem', textAlign:'center' }}>{error}</p>}
        <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem', justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ ...btnSecondary, padding:'0.75rem 1.5rem' }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ ...btnPrimary, padding:'0.75rem 1.75rem', opacity:saving?0.7:1 }}>{saving?'Saving…':'💾 Save Item'}</button>
        </div>
      </div>
    </>
  )
}

function Field({ label, children, hint, span }: { label:string; children:React.ReactNode; hint?:string; span?:boolean }) {
  return (
    <div style={{ gridColumn:span?'span 2':undefined }}>
      <label style={{ display:'block', color:'rgba(255,255,255,0.5)', fontSize:'0.6875rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.375rem' }}>
        {label}{hint&&<span style={{ color:'rgba(255,255,255,0.25)', fontWeight:400, textTransform:'none', marginLeft:'0.375rem' }}>({hint})</span>}
      </label>
      {children}
    </div>
  )
}

function Loader({ text, fullPage }: { text:string; fullPage?:boolean }) {
  return (
    <div style={fullPage?{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#0A0300',color:'rgba(255,255,255,0.4)',gap:'0.75rem'}:{display:'flex',alignItems:'center',justifyContent:'center',padding:'4rem',color:'rgba(255,255,255,0.4)',gap:'0.5rem'}}>
      <span style={{ fontSize:'2rem', animation:'spin 1s linear infinite', display:'inline-block' }}>⏳</span>
      <span>{text}</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const inputStyle: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', borderRadius:'0.625rem', padding:'0.6875rem 0.875rem', fontSize:'0.9rem', outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' }
const btnPrimary: React.CSSProperties = { background:'linear-gradient(135deg,#F97316,#DC2626)', color:'#fff', fontWeight:800, fontSize:'0.9375rem', padding:'0.8125rem 1.75rem', borderRadius:'9999px', border:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'0.4rem' }
const btnSecondary: React.CSSProperties = { background:'rgba(255,255,255,0.06)', color:'#fff', fontWeight:700, fontSize:'0.9375rem', padding:'0.8125rem 1.75rem', borderRadius:'9999px', border:'1px solid rgba(255,255,255,0.12)', cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center' }