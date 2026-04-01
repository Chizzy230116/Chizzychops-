'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  supabase, fetchMenu, upsertItem, deleteItem, uploadImage,
  fetchOrders, updateOrderStatus, deleteOrder,
} from '@/app/lib/supabase'
import type { MenuItem, Order, OrderStatus } from '@/app/lib/supabase'

// ─────────────────────────────────────────────
const OWNER_WA   = '2348094946923'
const CATS       = ['Soups','Stews','Rice & Pottage','Pasta & Rice','Food Boxes']
const SUBCATS    = ['','Pasta','Rice']
const TABS       = ['📋 Orders','🍽️ Menu','📊 Stats'] as const
type Tab         = typeof TABS[number]

const STATUS: Record<OrderStatus,{label:string;color:string;bg:string;next?:OrderStatus}> = {
  new:       {label:'🆕 New',       color:'#60A5FA',bg:'rgba(96,165,250,0.15)', next:'confirmed'},
  confirmed: {label:'✅ Confirmed', color:'#4ADE80',bg:'rgba(74,222,128,0.15)', next:'preparing'},
  preparing: {label:'👩‍🍳 Preparing',color:'#FBBF24',bg:'rgba(251,191,36,0.15)', next:'ready'},
  ready:     {label:'📦 Ready',     color:'#F97316',bg:'rgba(249,115,22,0.15)',  next:'delivered'},
  delivered: {label:'🎉 Delivered', color:'#A3E635',bg:'rgba(163,230,53,0.15)'},
  cancelled: {label:'❌ Cancelled', color:'#F87171',bg:'rgba(248,113,113,0.15)'},
}

const EMPTY: Omit<MenuItem,'updated_at'> = {
  id:'',name:'',price:0,category:'Soups',subcat:null,
  description:'',badge:null,badge_color:null,note:null,
  img_url:'',img2_url:null,sort_order:99,
}

const fmt     = (n:number) => '₦'+n.toLocaleString('en-NG')
const slug    = (s:string) => s.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
const timeAgo = (d:string) => {
  const s=(Date.now()-new Date(d).getTime())/1000
  if(s<60)    return 'just now'
  if(s<3600)  return Math.floor(s/60)+'m ago'
  if(s<86400) return Math.floor(s/3600)+'h ago'
  return new Date(d).toLocaleDateString('en-NG',{day:'numeric',month:'short'})
}

// ══════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════
export default function AdminPage() {
  const [session,setSession] = useState<any>(null)
  const [loading,setLoading] = useState(true)
  const [mounted,setMounted] = useState(false)

  useEffect(()=>{
    setMounted(true)
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)})
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_e,s)=>setSession(s))
    return ()=>subscription.unsubscribe()
  },[])

  if(!mounted) return null
  if(loading)  return <Loader text="Loading…" fullPage />
  if(!session) return <LoginScreen />
  return <Dashboard />
}

// ══════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════
function LoginScreen() {
  const [email,setEmail]     = useState('')
  const [pass,setPass]       = useState('')
  const [err,setErr]         = useState('')
  const [busy,setBusy]       = useState(false)

  const login = async () => {
    setBusy(true);setErr('')
    const {error:e} = await supabase.auth.signInWithPassword({email,password:pass})
    if(e) setErr(e.message)
    setBusy(false)
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0A0300',padding:'1.5rem'}}>
      <div style={{width:'100%',maxWidth:'380px',background:'#1A0800',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'1.25rem',padding:'2.5rem'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>🍽️</div>
          <h1 style={{color:'#fff',fontFamily:'Georgia,serif',fontSize:'1.5rem',fontWeight:700}}>Chizzychops Admin</h1>
          <p style={{color:'rgba(255,255,255,0.4)',fontSize:'0.875rem',marginTop:'0.25rem'}}>Owner access only</p>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} style={IS} />
          <input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} style={IS} />
          {err&&<p style={{color:'#F87171',fontSize:'0.8125rem',textAlign:'center'}}>{err}</p>}
          <button onClick={login} disabled={busy} style={{...BP,opacity:busy?0.7:1}}>{busy?'Signing in…':'Sign In'}</button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════
function Dashboard() {
  const [tab,setTab]         = useState<Tab>('📋 Orders')
  const [orders,setOrders]   = useState<Order[]>([])
  const [menu,setMenu]       = useState<MenuItem[]>([])
  const [loadO,setLoadO]     = useState(true)
  const [loadM,setLoadM]     = useState(true)
  const [toast,setToast]     = useState('')
  const [newCnt,setNewCnt]   = useState(0)

  const showToast = (msg:string) => {setToast(msg);setTimeout(()=>setToast(''),4000)}

  const loadOrders = useCallback(async()=>{
    setLoadO(true)
    try{const o=await fetchOrders();setOrders(o);setNewCnt(o.filter((x:Order)=>x.status==='new').length)}
    catch(e:any){showToast('❌ '+e.message)}
    setLoadO(false)
  },[])

  const loadMenu = useCallback(async()=>{
    setLoadM(true)
    try{setMenu(await fetchMenu())}
    catch(e:any){showToast('❌ '+e.message)}
    setLoadM(false)
  },[])

  useEffect(()=>{loadOrders();loadMenu()},[])

  // Realtime
  useEffect(()=>{
    const ch = supabase.channel('admin-rt')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'orders'},p=>{
        const o=p.new as Order
        setOrders(prev=>[o,...prev]);setNewCnt(n=>n+1)
        showToast(`🆕 New order! ${o.id}`)
        notifyWA(o)
        try{new Audio('/notification.mp3').play()}catch{}
      })
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'orders'},p=>{
        setOrders(prev=>prev.map((x:Order)=>x.id===p.new.id?p.new as Order:x))
      })
      .subscribe()
    return ()=>{supabase.removeChannel(ch)}
  },[])

  const notifyWA = (o:Order) => {
    const lines=(o.items as any[]).map(i=>`• ${i.name} x${i.qty} — ${fmt(i.price*i.qty)}`)
    const msg=[`🆕 *NEW ORDER — ${o.id}*`,'',`👤 ${o.customer_name||'Unknown'}`,o.customer_phone?`📞 ${o.customer_phone}`:'','',...lines,'',`💰 *Total: ${fmt(o.total)}*`,o.note?`📝 ${o.note}`:'',o.address?`📍 ${o.address}`:'','',`⏰ ${new Date(o.created_at).toLocaleString('en-NG')}`,'',`https://chizzychops.vercel.app/admin`].filter(Boolean).join('\n')
    window.open(`https://wa.me/${OWNER_WA}?text=${encodeURIComponent(msg)}`,'_blank')
  }

  const onStatusChange = async(id:string,status:OrderStatus)=>{
    try{await updateOrderStatus(id,status);showToast(`✅ ${id} → ${status}`)}
    catch(e:any){showToast('❌ '+e.message)}
  }
  const onDeleteOrder = async(id:string)=>{
    if(!confirm(`Delete order ${id}?`))return
    try{await deleteOrder(id);setOrders(p=>p.filter((o:Order)=>o.id!==id));showToast('🗑 Deleted')}
    catch(e:any){showToast('❌ '+e.message)}
  }

  const today    = orders.filter((o:Order)=>new Date(o.created_at).toDateString()===new Date().toDateString())
  const active   = orders.filter((o:Order)=>!['delivered','cancelled'].includes(o.status))
  const revenue  = orders.filter((o:Order)=>o.status==='delivered').reduce((s:number,o:Order)=>s+o.total,0)

  return (
    <div style={{minHeight:'100vh',background:'#0A0300',color:'#fff',fontFamily:'system-ui,sans-serif'}}>

      {/* TOP BAR */}
      <div style={{background:'#120600',borderBottom:'1px solid rgba(255,255,255,0.07)',padding:'0.75rem 1rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'0.75rem',position:'sticky',top:0,zIndex:50,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.625rem'}}>
          <span style={{fontSize:'1.375rem'}}>🍽️</span>
          <div>
            <h1 style={{fontSize:'0.9375rem',fontWeight:800,color:'#fff',lineHeight:1}}>Chizzychops Admin</h1>
            <div style={{display:'flex',gap:'0.5rem',marginTop:'2px',alignItems:'center'}}>
              {newCnt>0&&<span style={{background:'#DC2626',color:'#fff',fontSize:'0.5625rem',fontWeight:800,padding:'0.1rem 0.5rem',borderRadius:'9999px',animation:'pulse2 1.5s infinite'}}>{newCnt} NEW</span>}
              <span style={{color:'rgba(255,255,255,0.3)',fontSize:'0.6875rem'}}>{orders.length} orders · {menu.length} items</span>
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:'0.5rem'}}>
          <a href="/" target="_blank" style={{...BS,fontSize:'0.75rem',padding:'0.375rem 0.75rem',textDecoration:'none'}}>🌐 Site</a>
          <button onClick={()=>supabase.auth.signOut()} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.4)',padding:'0.375rem 0.75rem',borderRadius:'0.5rem',cursor:'pointer',fontSize:'0.75rem'}}>Sign Out</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{background:'#0f0400',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'0 1rem',display:'flex',gap:'0',overflowX:'auto'}}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{padding:'0.75rem 1rem',background:'none',border:'none',cursor:'pointer',fontWeight:700,fontSize:'0.8125rem',color:tab===t?'#F97316':'rgba(255,255,255,0.4)',borderBottom:tab===t?'2px solid #F97316':'2px solid transparent',transition:'all 0.2s',position:'relative',whiteSpace:'nowrap'}}>
            {t}
            {t==='📋 Orders'&&newCnt>0&&<span style={{position:'absolute',top:'5px',right:'2px',background:'#DC2626',color:'#fff',width:'14px',height:'14px',borderRadius:'50%',fontSize:'0.5rem',fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center'}}>{newCnt}</span>}
          </button>
        ))}
      </div>

      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'1rem'}}>
        {tab==='📋 Orders'&&<OrdersPanel orders={orders} loading={loadO} onStatusChange={onStatusChange} onDelete={onDeleteOrder} onNotify={notifyWA} onRefresh={loadOrders} todayCount={today.length} activeCount={active.length} revenue={revenue}/>}
        {tab==='🍽️ Menu'  &&<MenuPanel items={menu} loading={loadM} onRefresh={loadMenu} showToast={showToast}/>}
        {tab==='📊 Stats' &&<StatsPanel orders={orders} menuItems={menu}/>}
      </div>

      {toast&&(
        <div style={{position:'fixed',bottom:'1.25rem',left:'50%',transform:'translateX(-50%)',background:'#1A0800',border:'1px solid rgba(249,115,22,0.4)',color:'#fff',padding:'0.625rem 1.25rem',borderRadius:'9999px',fontWeight:700,fontSize:'0.875rem',zIndex:999,boxShadow:'0 8px 32px rgba(0,0,0,0.6)',whiteSpace:'nowrap',maxWidth:'calc(100vw - 2rem)',textAlign:'center'}}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes pulse2{0%,100%{opacity:1}50%{opacity:0.5}}
        select option{background:#1A0800;color:#fff}
        @media(max-width:600px){.desktop-only{display:none!important}}
      `}</style>
    </div>
  )
}

// ══════════════════════════════════════════════
// ORDERS PANEL
// ══════════════════════════════════════════════
function OrdersPanel({orders,loading,onStatusChange,onDelete,onNotify,onRefresh,todayCount,activeCount,revenue}:{
  orders:Order[];loading:boolean;
  onStatusChange:(id:string,s:OrderStatus)=>void;
  onDelete:(id:string)=>void;
  onNotify:(o:Order)=>void;
  onRefresh:()=>void;
  todayCount:number;activeCount:number;revenue:number
}) {
  const [filter,setFilter]     = useState<OrderStatus|'all'>('all')
  const [expanded,setExpanded] = useState<string|null>(null)
  const shown = filter==='all'?orders:orders.filter((o:Order)=>o.status===filter)

  return (
    <div>
      {/* Stats cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',gap:'0.625rem',marginBottom:'1rem'}}>
        {[{l:'Today',v:todayCount,i:'📅',c:'#60A5FA'},{l:'Active',v:activeCount,i:'🔥',c:'#F97316'},{l:'New',v:orders.filter((o:Order)=>o.status==='new').length,i:'🆕',c:'#DC2626'},{l:'Done',v:orders.filter((o:Order)=>o.status==='delivered').length,i:'✅',c:'#4ADE80'},{l:'Revenue',v:fmt(revenue),i:'💰',c:'#FBBF24'}].map(s=>(
          <div key={s.l} style={{background:'#120600',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'0.75rem',padding:'0.75rem'}}>
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'0.625rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{s.i} {s.l}</p>
            <p style={{color:s.c,fontWeight:900,fontSize:'1.25rem',lineHeight:1.2,marginTop:'0.2rem'}}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:'0.375rem',flexWrap:'wrap',marginBottom:'0.875rem',alignItems:'center'}}>
        {(['all','new','confirmed','preparing','ready','delivered','cancelled'] as const).map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{padding:'0.3rem 0.75rem',borderRadius:'9999px',fontSize:'0.75rem',fontWeight:700,border:'1px solid transparent',cursor:'pointer',whiteSpace:'nowrap',
            background:filter===s?(s==='all'?'linear-gradient(135deg,#F97316,#DC2626)':(STATUS[s as OrderStatus]?.bg||'rgba(255,255,255,0.1)')):'rgba(255,255,255,0.04)',
            color:filter===s?(s==='all'?'#fff':(STATUS[s as OrderStatus]?.color||'#fff')):'rgba(255,255,255,0.5)'}}>
            {s==='all'?`All (${orders.length})`:STATUS[s as OrderStatus].label}
          </button>
        ))}
        <button onClick={onRefresh} style={{...BS,fontSize:'0.75rem',padding:'0.3rem 0.75rem',marginLeft:'auto'}}>🔄</button>
      </div>

      {loading?<Loader text="Loading orders…"/>:shown.length===0?(
        <div style={{textAlign:'center',padding:'3rem',color:'rgba(255,255,255,0.3)'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>📭</div>
          <p style={{fontSize:'0.875rem'}}>No orders yet.</p>
        </div>
      ):(
        <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
          {shown.map((order:Order)=>{
            const cfg=STATUS[order.status]; const isExp=expanded===order.id
            return (
              <div key={order.id} style={{background:'#120600',border:`1px solid ${order.status==='new'?'rgba(96,165,250,0.35)':'rgba(255,255,255,0.07)'}`,borderRadius:'0.875rem',overflow:'hidden'}}>
                {/* Row header */}
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.75rem 0.875rem',cursor:'pointer',flexWrap:'wrap'}} onClick={()=>setExpanded(isExp?null:order.id)}>
                  <span style={{background:cfg.bg,color:cfg.color,fontSize:'0.625rem',fontWeight:800,padding:'0.2rem 0.5rem',borderRadius:'9999px',whiteSpace:'nowrap'}}>{cfg.label}</span>
                  <span style={{color:'#fff',fontWeight:800,fontSize:'0.8125rem',fontFamily:'monospace'}}>{order.id}</span>
                  {order.customer_name&&<span style={{color:'rgba(255,255,255,0.55)',fontSize:'0.8125rem',flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{order.customer_name}</span>}
                  <span style={{color:'#FBBF24',fontWeight:900,fontSize:'0.9375rem',whiteSpace:'nowrap',marginLeft:'auto'}}>{fmt(order.total)}</span>
                  <span style={{color:'rgba(255,255,255,0.3)',fontSize:'0.6875rem',whiteSpace:'nowrap'}}>{timeAgo(order.created_at)}</span>
                  <span style={{color:'rgba(255,255,255,0.3)',fontSize:'0.75rem'}}>{isExp?'▲':'▼'}</span>
                </div>

                {isExp&&(
                  <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'0.875rem'}}>
                    {/* Items list */}
                    <div style={{marginBottom:'0.75rem',background:'rgba(255,255,255,0.02)',borderRadius:'0.625rem',padding:'0.625rem'}}>
                      {(order.items as any[]).map((item:any,i:number)=>(
                        <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'0.25rem 0',borderBottom:i<order.items.length-1?'1px solid rgba(255,255,255,0.04)':'none'}}>
                          <span style={{color:'#fff',fontSize:'0.875rem'}}>{item.name} <span style={{color:'rgba(255,255,255,0.35)'}}>×{item.qty}</span></span>
                          <span style={{color:'#FBBF24',fontWeight:700,fontSize:'0.875rem'}}>{fmt(item.price*item.qty)}</span>
                        </div>
                      ))}
                      <div style={{display:'flex',justifyContent:'space-between',paddingTop:'0.375rem',borderTop:'1px solid rgba(255,255,255,0.1)',marginTop:'0.25rem'}}>
                        <span style={{color:'rgba(255,255,255,0.5)',fontWeight:700,fontSize:'0.875rem'}}>Total</span>
                        <span style={{color:'#FBBF24',fontWeight:900,fontSize:'1rem'}}>{fmt(order.total)}</span>
                      </div>
                    </div>

                    {/* Meta info */}
                    {order.customer_phone&&<p style={{color:'#25D366',fontSize:'0.8125rem',marginBottom:'0.375rem'}}>📞 {order.customer_phone}</p>}
                    {order.note&&<p style={{color:'rgba(255,255,255,0.6)',fontSize:'0.8125rem',marginBottom:'0.375rem'}}>📝 {order.note}</p>}
                    {order.address&&<p style={{color:'rgba(255,255,255,0.6)',fontSize:'0.8125rem',marginBottom:'0.75rem'}}>📍 {order.address}</p>}

                    {/* Actions */}
                    <div style={{display:'flex',gap:'0.375rem',flexWrap:'wrap',alignItems:'center'}}>
                      {cfg.next&&<button onClick={()=>onStatusChange(order.id,cfg.next!)} style={{...BP,fontSize:'0.75rem',padding:'0.4375rem 0.875rem'}}>→ {STATUS[cfg.next].label}</button>}
                      {!['delivered','cancelled'].includes(order.status)&&<button onClick={()=>onStatusChange(order.id,'cancelled')} style={{background:'rgba(220,38,38,0.1)',border:'1px solid rgba(220,38,38,0.2)',color:'#F87171',padding:'0.4375rem 0.875rem',borderRadius:'9999px',cursor:'pointer',fontSize:'0.75rem',fontWeight:700}}>Cancel</button>}
                      {order.customer_phone&&<a href={`https://wa.me/${order.customer_phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi! Your Chizzychops order ${order.id} is now ${order.status}. 🍽️`)}`} target="_blank" rel="noopener noreferrer" style={{background:'rgba(37,211,102,0.1)',border:'1px solid rgba(37,211,102,0.2)',color:'#4ADE80',padding:'0.4375rem 0.875rem',borderRadius:'9999px',fontSize:'0.75rem',fontWeight:700,textDecoration:'none'}}>📲 WA Customer</a>}
                      <button onClick={()=>onNotify(order)} style={{...BS,fontSize:'0.75rem',padding:'0.4375rem 0.875rem'}}>🔔 Notify Me</button>
                      <button onClick={()=>onDelete(order.id)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.2)',cursor:'pointer',fontSize:'0.875rem',marginLeft:'auto'}}>🗑</button>
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

// ══════════════════════════════════════════════
// MENU PANEL — with inline price edit + image preview
// ══════════════════════════════════════════════
function MenuPanel({items,loading,onRefresh,showToast}:{items:MenuItem[];loading:boolean;onRefresh:()=>void;showToast:(m:string)=>void}) {
  const [search,setSearch]       = useState('')
  const [catF,setCatF]           = useState('All')
  const [editing,setEditing]     = useState<Omit<MenuItem,'updated_at'>|null>(null)
  const [preview,setPreview]     = useState<{src:string;name:string}|null>(null)
  // inline price edit state: { [itemId]: draftPrice }
  const [prices,setPrices]       = useState<Record<string,string>>({})
  const [savingP,setSavingP]     = useState<Record<string,boolean>>({})

  const filtered = items.filter((i:MenuItem)=>(catF==='All'||i.category===catF)&&i.name.toLowerCase().includes(search.toLowerCase()))

  const handleDelete = async(id:string,name:string) => {
    if(!confirm(`Delete "${name}"?`))return
    try{await deleteItem(id);showToast('🗑 Deleted '+name);onRefresh()}
    catch(e:any){showToast('❌ '+e.message)}
  }

  // Save inline price change
  const savePrice = async(item:MenuItem) => {
    const raw = prices[item.id]
    if(raw===undefined) return
    const newPrice = parseInt(raw.replace(/[^\d]/g,''),10)
    if(isNaN(newPrice)||newPrice<=0){showToast('❌ Invalid price');return}
    setSavingP(p=>({...p,[item.id]:true}))
    try{
      await upsertItem({...item,price:newPrice})
      showToast(`✅ ${item.name} → ${fmt(newPrice)}`)
      onRefresh()
      setPrices(p=>{const n={...p};delete n[item.id];return n})
    }catch(e:any){showToast('❌ '+e.message)}
    setSavingP(p=>({...p,[item.id]:false}))
  }

  return (
    <div>
      {/* Category summary */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',gap:'0.625rem',marginBottom:'1rem'}}>
        {CATS.map(c=>(
          <div key={c} style={{background:'#120600',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'0.75rem',padding:'0.75rem',cursor:'pointer'}} onClick={()=>setCatF(c==='All'?'All':c)}>
            <p style={{color:'rgba(255,255,255,0.35)',fontSize:'0.625rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',lineHeight:1.3}}>{c}</p>
            <p style={{color:'#F97316',fontWeight:900,fontSize:'1.375rem',lineHeight:1.2,marginTop:'0.2rem'}}>{items.filter((i:MenuItem)=>i.category===c).length}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'0.875rem',alignItems:'center'}}>
        <input type="search" placeholder="🔍 Search items…" value={search} onChange={e=>setSearch(e.target.value)} style={{...IS,maxWidth:'200px',padding:'0.5rem 0.75rem',fontSize:'0.8125rem'}} />
        <div style={{display:'flex',gap:'0.375rem',flexWrap:'wrap'}}>
          {['All',...CATS].map(c=>(
            <button key={c} onClick={()=>setCatF(c)} style={{padding:'0.3rem 0.75rem',borderRadius:'9999px',fontSize:'0.75rem',fontWeight:700,border:'1px solid transparent',cursor:'pointer',
              background:catF===c?'linear-gradient(135deg,#F97316,#DC2626)':'rgba(255,255,255,0.04)',
              color:catF===c?'#fff':'rgba(255,255,255,0.5)'}}>
              {c==='All'?`All (${items.length})`:c}
            </button>
          ))}
        </div>
        <button onClick={()=>setEditing({...EMPTY,id:slug(Date.now().toString()),sort_order:items.length+1})} style={{...BP,fontSize:'0.8125rem',padding:'0.5rem 1rem',marginLeft:'auto'}}>+ Add Item</button>
      </div>

      {loading?<Loader text="Loading menu…"/>:(
        <>
          {/* ── MOBILE CARD VIEW ── */}
          <div className="mobile-cards" style={{display:'none'}}>
            {filtered.map((item:MenuItem)=>(
              <MobileMenuCard
                key={item.id} item={item}
                priceVal={prices[item.id]??String(item.price)}
                onPriceChange={v=>setPrices(p=>({...p,[item.id]:v}))}
                onSavePrice={()=>savePrice(item)}
                saving={!!savingP[item.id]}
                onEdit={()=>setEditing({...item})}
                onDelete={()=>handleDelete(item.id,item.name)}
                onPreview={()=>setPreview({src:item.img_url,name:item.name})}
              />
            ))}
          </div>

          {/* ── DESKTOP TABLE VIEW ── */}
          <div className="desktop-table" style={{background:'#120600',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'1rem',overflow:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:'680px'}}>
              <thead>
                <tr style={{background:'rgba(255,255,255,0.03)',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                  {['Image','Name / ID','Category','Price','Badge','Actions'].map((h,i)=>(
                    <th key={i} style={{padding:'0.75rem 1rem',textAlign:'left',color:'rgba(255,255,255,0.35)',fontSize:'0.625rem',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.08em',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item:MenuItem)=>(
                  <tr key={item.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)',transition:'background 0.15s'}}
                    onMouseEnter={e=>(e.currentTarget.style.background='rgba(249,115,22,0.04)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>

                    {/* Image — clickable preview */}
                    <td style={{padding:'0.625rem 1rem'}}>
                      <div style={{position:'relative',width:'52px',height:'52px',cursor:'pointer'}} onClick={()=>setPreview({src:item.img_url,name:item.name})}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.img_url} alt="" style={{width:'52px',height:'52px',objectFit:'cover',borderRadius:'0.5rem',border:'1px solid rgba(255,255,255,0.1)',display:'block'}} onError={e=>{(e.target as HTMLImageElement).src='https://placehold.co/52x52/1A0800/F97316?text=?'}} />
                        <div style={{position:'absolute',inset:0,borderRadius:'0.5rem',background:'rgba(0,0,0,0)',display:'flex',alignItems:'center',justifyContent:'center',transition:'background 0.2s'}}
                          onMouseEnter={e=>(e.currentTarget.style.background='rgba(0,0,0,0.45)')}
                          onMouseLeave={e=>(e.currentTarget.style.background='rgba(0,0,0,0)')}>
                          <span style={{color:'#fff',fontSize:'0.875rem',opacity:0}} className="preview-eye">👁</span>
                        </div>
                      </div>
                    </td>

                    {/* Name */}
                    <td style={{padding:'0.625rem 1rem'}}>
                      <p style={{color:'#fff',fontWeight:700,fontSize:'0.875rem',maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</p>
                      <p style={{color:'rgba(255,255,255,0.25)',fontSize:'0.6875rem'}}>{item.id}</p>
                    </td>

                    {/* Category */}
                    <td style={{padding:'0.625rem 1rem',color:'rgba(255,255,255,0.5)',fontSize:'0.8125rem',whiteSpace:'nowrap'}}>
                      {item.category}
                      {item.subcat&&<span style={{color:'#F97316',display:'block',fontSize:'0.6875rem'}}>{item.subcat}</span>}
                    </td>

                    {/* ── INLINE PRICE EDIT ── */}
                    <td style={{padding:'0.625rem 1rem'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'0.375rem'}}>
                        <span style={{color:'rgba(255,255,255,0.35)',fontSize:'0.75rem'}}>₦</span>
                        <input
                          type="number"
                          value={prices[item.id]??item.price}
                          onChange={e=>setPrices(p=>({...p,[item.id]:e.target.value}))}
                          style={{width:'90px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#FBBF24',borderRadius:'0.5rem',padding:'0.3125rem 0.5rem',fontSize:'0.875rem',fontWeight:800,outline:'none',fontFamily:'monospace'}}
                          onFocus={e=>(e.target.style.borderColor='rgba(249,115,22,0.6)')}
                          onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.1)')}
                        />
                        {prices[item.id]!==undefined&&String(prices[item.id])!==String(item.price)&&(
                          <button onClick={()=>savePrice(item)} disabled={!!savingP[item.id]}
                            style={{background:'rgba(74,222,128,0.15)',border:'1px solid rgba(74,222,128,0.3)',color:'#4ADE80',borderRadius:'0.375rem',padding:'0.25rem 0.5rem',cursor:'pointer',fontSize:'0.6875rem',fontWeight:800,whiteSpace:'nowrap'}}>
                            {savingP[item.id]?'…':'Save ✓'}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Badge */}
                    <td style={{padding:'0.625rem 1rem'}}>
                      {item.badge&&<span style={{background:item.badge_color||'#F97316',color:'#fff',fontSize:'0.5625rem',fontWeight:800,padding:'0.2rem 0.5rem',borderRadius:'9999px',textTransform:'uppercase'}}>{item.badge}</span>}
                    </td>

                    {/* Actions */}
                    <td style={{padding:'0.625rem 1rem'}}>
                      <div style={{display:'flex',gap:'0.375rem',alignItems:'center'}}>
                        <button onClick={()=>setPreview({src:item.img_url,name:item.name})} title="Preview image" style={{padding:'0.3rem 0.5rem',borderRadius:'0.375rem',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)',cursor:'pointer',fontSize:'0.75rem'}}>👁</button>
                        <button onClick={()=>setEditing({...item})} style={{padding:'0.3rem 0.625rem',borderRadius:'0.375rem',background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.2)',color:'#F97316',cursor:'pointer',fontSize:'0.75rem',fontWeight:700}}>✏️</button>
                        <button onClick={()=>handleDelete(item.id,item.name)} style={{padding:'0.3rem 0.625rem',borderRadius:'0.375rem',background:'rgba(220,38,38,0.1)',border:'1px solid rgba(220,38,38,0.15)',color:'#F87171',cursor:'pointer',fontSize:'0.75rem',fontWeight:700}}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length===0&&<tr><td colSpan={6} style={{padding:'2.5rem',textAlign:'center',color:'rgba(255,255,255,0.3)',fontSize:'0.875rem'}}>No items found</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editing&&<EditModal item={editing} onClose={()=>setEditing(null)} onSaved={()=>{setEditing(null);onRefresh();showToast('✅ Saved!')}} />}

      {/* IMAGE PREVIEW MODAL */}
      {preview&&(
        <>
          <div onClick={()=>setPreview(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',zIndex:400,backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem'}} >
            <div style={{position:'relative',maxWidth:'min(600px,calc(100vw - 3rem))',width:'100%'}} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setPreview(null)} style={{position:'absolute',top:'-2.5rem',right:0,background:'rgba(255,255,255,0.1)',border:'none',color:'#fff',width:'32px',height:'32px',borderRadius:'50%',cursor:'pointer',fontSize:'1.125rem',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.src} alt={preview.name} style={{width:'100%',borderRadius:'1rem',border:'1px solid rgba(255,255,255,0.1)',display:'block',maxHeight:'70vh',objectFit:'contain'}} onError={e=>{(e.target as HTMLImageElement).src='https://placehold.co/600x400/1A0800/F97316?text=Image+Not+Found'}} />
              <p style={{color:'rgba(255,255,255,0.7)',textAlign:'center',marginTop:'0.75rem',fontWeight:700,fontSize:'0.9375rem'}}>{preview.name}</p>
              <p style={{color:'rgba(255,255,255,0.3)',textAlign:'center',fontSize:'0.75rem',marginTop:'0.25rem',wordBreak:'break-all'}}>{preview.src}</p>
            </div>
          </div>
        </>
      )}

      <style>{`
        .preview-eye{opacity:0!important}
        tr:hover .preview-eye{opacity:1!important}
        @media(max-width:700px){.mobile-cards{display:flex!important;flex-direction:column;gap:0.625rem}.desktop-table{display:none!important}}
      `}</style>
    </div>
  )
}

// ── Mobile menu card ──────────────────────────
function MobileMenuCard({item,priceVal,onPriceChange,onSavePrice,saving,onEdit,onDelete,onPreview}:{
  item:MenuItem;priceVal:string;onPriceChange:(v:string)=>void;
  onSavePrice:()=>void;saving:boolean;
  onEdit:()=>void;onDelete:()=>void;onPreview:()=>void
}) {
  const isDirty = priceVal!==String(item.price)
  return (
    <div style={{background:'#120600',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'0.875rem',padding:'0.875rem',display:'flex',gap:'0.75rem',alignItems:'flex-start'}}>
      {/* Image */}
      <div style={{flexShrink:0,cursor:'pointer'}} onClick={onPreview}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.img_url} alt={item.name} style={{width:'60px',height:'60px',objectFit:'cover',borderRadius:'0.625rem',border:'1px solid rgba(255,255,255,0.1)'}} onError={e=>{(e.target as HTMLImageElement).src='https://placehold.co/60x60/1A0800/F97316?text=?'}} />
      </div>
      {/* Info */}
      <div style={{flex:1,minWidth:0}}>
        <p style={{color:'#fff',fontWeight:700,fontSize:'0.9rem',marginBottom:'0.125rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</p>
        <p style={{color:'rgba(255,255,255,0.35)',fontSize:'0.6875rem',marginBottom:'0.5rem'}}>{item.category}{item.subcat?` · ${item.subcat}`:''}</p>
        {/* Inline price */}
        <div style={{display:'flex',alignItems:'center',gap:'0.375rem',marginBottom:'0.5rem'}}>
          <span style={{color:'rgba(255,255,255,0.4)',fontSize:'0.75rem'}}>₦</span>
          <input type="number" value={priceVal} onChange={e=>onPriceChange(e.target.value)}
            style={{width:'100px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'#FBBF24',borderRadius:'0.5rem',padding:'0.3rem 0.5rem',fontSize:'0.875rem',fontWeight:800,outline:'none',fontFamily:'monospace'}} />
          {isDirty&&<button onClick={onSavePrice} disabled={saving} style={{background:'rgba(74,222,128,0.15)',border:'1px solid rgba(74,222,128,0.3)',color:'#4ADE80',borderRadius:'0.375rem',padding:'0.25rem 0.5rem',cursor:'pointer',fontSize:'0.6875rem',fontWeight:800}}>{saving?'…':'Save ✓'}</button>}
        </div>
        {/* Actions */}
        <div style={{display:'flex',gap:'0.375rem'}}>
          <button onClick={onPreview} style={{padding:'0.3rem 0.625rem',borderRadius:'0.375rem',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)',cursor:'pointer',fontSize:'0.75rem'}}>👁 View</button>
          <button onClick={onEdit} style={{padding:'0.3rem 0.625rem',borderRadius:'0.375rem',background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.2)',color:'#F97316',cursor:'pointer',fontSize:'0.75rem',fontWeight:700}}>✏️ Edit</button>
          <button onClick={onDelete} style={{padding:'0.3rem 0.625rem',borderRadius:'0.375rem',background:'rgba(220,38,38,0.1)',border:'1px solid rgba(220,38,38,0.15)',color:'#F87171',cursor:'pointer',fontSize:'0.75rem',fontWeight:700}}>🗑</button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
// STATS PANEL
// ══════════════════════════════════════════════
function StatsPanel({orders,menuItems}:{orders:Order[];menuItems:MenuItem[]}) {
  const topItems = orders.flatMap((o:Order)=>o.items as any[]).reduce((acc:Record<string,any>,item:any)=>{
    if(!acc[item.id])acc[item.id]={name:item.name,qty:0,revenue:0}
    acc[item.id].qty+=item.qty;acc[item.id].revenue+=item.price*item.qty
    return acc
  },{})
  const topList = Object.values(topItems).sort((a:any,b:any)=>b.qty-a.qty).slice(0,8)

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
      <div>
        <h3 style={{color:'#fff',fontWeight:700,fontSize:'0.9375rem',marginBottom:'0.75rem'}}>Orders by Status</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:'0.625rem'}}>
          {(Object.entries(STATUS) as [OrderStatus, typeof STATUS[OrderStatus]][]).map(([k,v])=>(
            <div key={k} style={{background:v.bg,border:`1px solid ${v.color}25`,borderRadius:'0.875rem',padding:'0.875rem'}}>
              <p style={{color:v.color,fontWeight:900,fontSize:'1.875rem',lineHeight:1}}>{orders.filter((o:Order)=>o.status===k).length}</p>
              <p style={{color:v.color,fontSize:'0.75rem',fontWeight:700,marginTop:'0.25rem'}}>{v.label}</p>
            </div>
          ))}
        </div>
      </div>
      {topList.length>0&&(
        <div>
          <h3 style={{color:'#fff',fontWeight:700,fontSize:'0.9375rem',marginBottom:'0.75rem'}}>Top Selling Items</h3>
          <div style={{background:'#120600',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'1rem',overflow:'hidden'}}>
            {topList.map((item:any,i:number)=>(
              <div key={item.name} style={{display:'flex',gap:'0.75rem',alignItems:'center',padding:'0.75rem 1rem',borderBottom:i<topList.length-1?'1px solid rgba(255,255,255,0.05)':'none'}}>
                <span style={{color:'#F97316',fontWeight:900,minWidth:'22px',fontSize:'0.9375rem'}}>#{i+1}</span>
                <span style={{color:'#fff',fontWeight:700,flex:1,fontSize:'0.875rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</span>
                <span style={{color:'rgba(255,255,255,0.4)',fontSize:'0.8125rem',whiteSpace:'nowrap'}}>{item.qty}×</span>
                <span style={{color:'#FBBF24',fontWeight:800,fontSize:'0.875rem',whiteSpace:'nowrap'}}>{fmt(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════
// EDIT MODAL (full item edit)
// ══════════════════════════════════════════════
function EditModal({item,onClose,onSaved}:{item:Omit<MenuItem,'updated_at'>;onClose:()=>void;onSaved:()=>void}) {
  const [form,setForm]   = useState({...item})
  const [saving,setSave] = useState(false)
  const [err,setErr]     = useState('')
  const [upImg,setUpI]   = useState(false)
  const [upImg2,setUpI2] = useState(false)
  const r1=useRef<HTMLInputElement>(null); const r2=useRef<HTMLInputElement>(null)

  const set=(k:keyof typeof form,v:any)=>setForm(f=>({...f,[k]:v||null}))

  const handleUpload=async(file:File,field:'img_url'|'img2_url')=>{
    const setU=field==='img_url'?setUpI:setUpI2;setU(true)
    try{const url=await uploadImage(file);set(field,url)}
    catch(e:any){setErr('Upload failed: '+e.message)}
    setU(false)
  }

  const save=async()=>{
    if(!form.id.trim())return setErr('ID required')
    if(!form.name.trim())return setErr('Name required')
    if(form.price<=0)return setErr('Price must be > 0')
    if(!form.img_url?.trim())return setErr('Main image required')
    setSave(true);setErr('')
    try{
      await upsertItem({...form,id:form.id.trim().toLowerCase(),subcat:form.subcat||null,badge:form.badge||null,badge_color:form.badge_color||null,note:form.note||null,img2_url:form.img2_url||null})
      onSaved()
    }catch(e:any){setErr(e.message);setSave(false)}
  }

  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:300,backdropFilter:'blur(6px)'}} />
      <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'min(700px,calc(100vw - 1.5rem))',maxHeight:'92vh',overflowY:'auto',background:'#1A0800',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'1.25rem',zIndex:301,padding:'clamp(1.25rem,4vw,2rem)',boxShadow:'0 24px 80px rgba(0,0,0,0.7)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
          <h2 style={{color:'#fff',fontFamily:'Georgia,serif',fontSize:'clamp(1rem,3vw,1.25rem)',fontWeight:700}}>{item.name?`Edit: ${item.name}`:'New Item'}</h2>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.07)',border:'none',color:'#fff',width:'32px',height:'32px',borderRadius:'50%',cursor:'pointer',fontSize:'1.125rem',flexShrink:0}}>×</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'0.875rem'}}>
          <F label="Item ID *"><input value={form.id} onChange={e=>set('id',e.target.value)} style={IS} placeholder="s15" /></F>
          <F label="Sort Order"><input type="number" value={form.sort_order} onChange={e=>set('sort_order',+e.target.value)} style={IS} /></F>
          <F label="Name *" span><input value={form.name} onChange={e=>set('name',e.target.value)} style={IS} /></F>
          <F label="Price (₦) *"><input type="number" value={form.price||''} onChange={e=>set('price',+e.target.value)} style={IS} placeholder="35000" /></F>
          <F label="Category *">
            <select value={form.category} onChange={e=>set('category',e.target.value)} style={IS}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
          </F>
          <F label="Sub-category">
            <select value={form.subcat||''} onChange={e=>set('subcat',e.target.value)} style={IS}>{SUBCATS.map(s=><option key={s} value={s}>{s||'— None —'}</option>)}</select>
          </F>
          <F label="Description *" span><textarea value={form.description} onChange={e=>set('description',e.target.value)} style={{...IS,minHeight:'68px',resize:'vertical'}} /></F>
          <F label="Badge"><input value={form.badge||''} onChange={e=>set('badge',e.target.value)} style={IS} placeholder="2L Bowl" /></F>
          <F label="Badge Colour">
            <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
              <input value={form.badge_color||''} onChange={e=>set('badge_color',e.target.value)} style={{...IS,flex:1}} placeholder="#F97316" />
              {form.badge_color&&<div style={{width:'28px',height:'28px',borderRadius:'0.375rem',background:form.badge_color,border:'1px solid rgba(255,255,255,0.15)',flexShrink:0}} />}
            </div>
          </F>
          <F label="Note" span><input value={form.note||''} onChange={e=>set('note',e.target.value)} style={IS} placeholder="Includes 5pcs…" /></F>

          {/* Main image */}
          <F label="Main Image *" span>
            <div style={{display:'flex',gap:'0.75rem',alignItems:'flex-start'}}>
              <div style={{flex:1}}>
                <input value={form.img_url||''} onChange={e=>set('img_url',e.target.value)} style={{...IS,marginBottom:'0.5rem'}} placeholder="/soup/egusi.jpg or https://…" />
                <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                  <input ref={r1} type="file" accept="image/*" style={{display:'none'}} onChange={e=>e.target.files?.[0]&&handleUpload(e.target.files[0],'img_url')} />
                  <button onClick={()=>r1.current?.click()} disabled={upImg} style={{...BS,fontSize:'0.8rem',padding:'0.375rem 0.75rem',opacity:upImg?0.7:1}}>{upImg?'⏳ Uploading…':'📁 Upload'}</button>
                </div>
              </div>
              {form.img_url&&<img src={form.img_url} alt="p" style={{width:'72px',height:'72px',objectFit:'cover',borderRadius:'0.625rem',border:'1px solid rgba(255,255,255,0.1)',flexShrink:0}} onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />}
            </div>
          </F>

          {/* Second image */}
          <F label="Second Image" hint="optional — auto-crossfades" span>
            <div style={{display:'flex',gap:'0.75rem',alignItems:'flex-start'}}>
              <div style={{flex:1}}>
                <input value={form.img2_url||''} onChange={e=>set('img2_url',e.target.value)} style={{...IS,marginBottom:'0.5rem'}} placeholder="/soup/oha-2.jpg (optional)" />
                <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                  <input ref={r2} type="file" accept="image/*" style={{display:'none'}} onChange={e=>e.target.files?.[0]&&handleUpload(e.target.files[0],'img2_url')} />
                  <button onClick={()=>r2.current?.click()} disabled={upImg2} style={{...BS,fontSize:'0.8rem',padding:'0.375rem 0.75rem',opacity:upImg2?0.7:1}}>{upImg2?'⏳ Uploading…':'📁 Upload'}</button>
                  {form.img2_url&&<button onClick={()=>set('img2_url','')} style={{background:'rgba(220,38,38,0.1)',border:'1px solid rgba(220,38,38,0.2)',color:'#F87171',padding:'0.375rem 0.5rem',borderRadius:'0.375rem',cursor:'pointer',fontSize:'0.75rem'}}>Remove</button>}
                </div>
              </div>
              {form.img2_url&&<img src={form.img2_url} alt="p2" style={{width:'72px',height:'72px',objectFit:'cover',borderRadius:'0.625rem',border:'1px solid rgba(255,255,255,0.1)',flexShrink:0}} onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />}
            </div>
          </F>
        </div>

        {err&&<p style={{color:'#F87171',fontSize:'0.875rem',marginTop:'1rem',textAlign:'center'}}>{err}</p>}

        <div style={{display:'flex',gap:'0.75rem',marginTop:'1.25rem',justifyContent:'flex-end',flexWrap:'wrap'}}>
          <button onClick={onClose} style={{...BS,padding:'0.75rem 1.5rem'}}>Cancel</button>
          <button onClick={save} disabled={saving} style={{...BP,padding:'0.75rem 1.75rem',opacity:saving?0.7:1}}>{saving?'Saving…':'💾 Save Item'}</button>
        </div>
      </div>
    </>
  )
}

// ── Tiny helpers ──────────────────────────────
function F({label,children,hint,span}:{label:string;children:React.ReactNode;hint?:string;span?:boolean}) {
  return (
    <div style={{gridColumn:span?'1 / -1':undefined}}>
      <label style={{display:'block',color:'rgba(255,255,255,0.45)',fontSize:'0.625rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'0.3rem'}}>
        {label}{hint&&<span style={{color:'rgba(255,255,255,0.25)',fontWeight:400,textTransform:'none',marginLeft:'0.3rem'}}>({hint})</span>}
      </label>
      {children}
    </div>
  )
}

function Loader({text,fullPage}:{text:string;fullPage?:boolean}) {
  return (
    <div style={fullPage?{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#0A0300',color:'rgba(255,255,255,0.4)',gap:'0.75rem'}:{display:'flex',alignItems:'center',justifyContent:'center',padding:'3rem',color:'rgba(255,255,255,0.4)',gap:'0.5rem'}}>
      <span style={{fontSize:'1.75rem',animation:'spin 1s linear infinite',display:'inline-block'}}>⏳</span>
      <span style={{fontSize:'0.875rem'}}>{text}</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── Shared style tokens ───────────────────────
const IS: React.CSSProperties = {width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',borderRadius:'0.625rem',padding:'0.625rem 0.875rem',fontSize:'0.9rem',outline:'none',fontFamily:'system-ui,sans-serif',boxSizing:'border-box'}
const BP: React.CSSProperties = {background:'linear-gradient(135deg,#F97316,#DC2626)',color:'#fff',fontWeight:800,fontSize:'0.9375rem',padding:'0.8125rem 1.75rem',borderRadius:'9999px',border:'none',cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'0.4rem'}
const BS: React.CSSProperties = {background:'rgba(255,255,255,0.06)',color:'#fff',fontWeight:700,fontSize:'0.9375rem',padding:'0.8125rem 1.75rem',borderRadius:'9999px',border:'1px solid rgba(255,255,255,0.12)',cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center'}