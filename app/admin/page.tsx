'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  checkSession, loginWithPassword, logout,
  fetchMenu, upsertItem, deleteItem, uploadImage,
  fetchOrders, updateOrderStatus, deleteOrder, fetchInbox,
} from '@/app/lib/api'
import type { MenuItem, Order, OrderStatus, InboxItem } from '@/app/lib/api'

const OWNER_WA = '2348094946923'
const CATS     = ['Soups','Stews','Rice & Pottage','Pasta & Rice','Food Boxes']
const SUBCATS  = ['','Pasta','Rice']
const TABS     = ['Orders','Menu','Inbox','Stats'] as const
type Tab       = typeof TABS[number]

const STATUS: Record<string, { label: string; color: string; dot: string; next?: OrderStatus }> = {
  new:       { label: 'New',       color: '#3B82F6', dot: '#60A5FA', next: 'confirmed' },
  confirmed: { label: 'Confirmed', color: '#10B981', dot: '#34D399', next: 'preparing' },
  preparing: { label: 'Preparing', color: '#F59E0B', dot: '#FBBF24', next: 'ready'     },
  ready:     { label: 'Ready',     color: '#F97316', dot: '#FB923C', next: 'delivered'  },
  delivered: { label: 'Delivered', color: '#22C55E', dot: '#4ADE80'                    },
  cancelled: { label: 'Cancelled', color: '#EF4444', dot: '#F87171'                    },
  pending:   { label: 'Pending',   color: '#6B7280', dot: '#9CA3AF'                    },
  paid:      { label: 'Paid',      color: '#8B5CF6', dot: '#A78BFA'                    },
  failed:    { label: 'Failed',    color: '#EF4444', dot: '#F87171'                    },
}

// EMPTY uses number id=0 to signal "new item"
const EMPTY: Omit<MenuItem, 'updated_at'> = {
  id: 0, name: '', price: 0, category: 'Soups', subcat: null,
  description: '', badge: null, badge_color: null, note: null,
  img_url: null, img2_url: null, sort_order: 99,
}

const PLACEHOLDER = 'https://placehold.co/48x48/0F1420/F97316?text=?'
const imgSrc = (url: string | null | undefined) => url || PLACEHOLDER

const fmtNaira = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG')
const timeAgo  = (d: string) => {
  const s = (Date.now() - new Date(d).getTime()) / 1000
  if (s < 60)    return 'Just now'
  if (s < 3600)  return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

// ─────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────
export default function AdminPage() {
  const [authed,  setAuthed]  = useState(false)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkSession()
      .then(({ ok }) => setAuthed(ok))
      .catch(() => setAuthed(false))
      .finally(() => setLoading(false))
  }, [])

  if (!mounted || loading) return <FullLoader />
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />
  return <Dashboard onLogout={() => setAuthed(false)} />
}

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pass, setPass] = useState('')
  const [err,  setErr]  = useState('')
  const [busy, setBusy] = useState(false)

  const login = async () => {
    if (!pass) return setErr('Enter your password')
    setBusy(true); setErr('')
    try {
      const { ok } = await loginWithPassword(pass)
      if (ok) onLogin()
      else setErr('Incorrect password')
    } catch { setErr('Login failed — try again') }
    setBusy(false)
  }

  return (
    <div className="login-bg">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080B14; }
        .login-bg { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249,115,22,0.12) 0%, transparent 70%), #080B14; padding: 1.5rem; font-family: 'DM Sans', system-ui, sans-serif; }
        .login-card { width: 100%; max-width: 400px; background: #0F1420; border: 1px solid rgba(255,255,255,0.07); border-radius: 1.5rem; padding: 2.5rem; box-shadow: 0 40px 80px rgba(0,0,0,0.6); }
        .login-logo { font-size: 2.75rem; margin-bottom: 0.75rem; }
        .login-title { color: #fff; font-size: 1.625rem; font-weight: 800; letter-spacing: -0.03em; }
        .login-sub { color: rgba(255,255,255,0.35); font-size: 0.875rem; margin-top: 0.25rem; }
        .field-label { color: rgba(255,255,255,0.4); font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.4rem; display: block; }
        .input-base { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 0.75rem; padding: 0.75rem 1rem; font-size: 0.9375rem; outline: none; transition: border-color 0.2s; }
        .input-base:focus { border-color: rgba(249,115,22,0.6); }
        .btn-primary { width: 100%; background: linear-gradient(135deg, #F97316, #DC2626); color: #fff; font-weight: 800; font-size: 0.9375rem; padding: 0.875rem; border-radius: 0.75rem; border: none; cursor: pointer; transition: opacity 0.2s, transform 0.1s; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .error-msg { color: #F87171; font-size: 0.8125rem; text-align: center; }
      `}</style>
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="login-logo">🍽️</div>
          <h1 className="login-title">Chizzychops</h1>
          <p className="login-sub">Admin Dashboard · Owner Access Only</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="field-label">Password</label>
            <input type="password" placeholder="Enter admin password" value={pass} className="input-base"
              onChange={e => { setPass(e.target.value); setErr('') }}
              onKeyDown={e => e.key === 'Enter' && login()}
              autoComplete="current-password" autoFocus />
          </div>
          {err && <p className="error-msg">{err}</p>}
          <button onClick={login} disabled={busy} className="btn-primary" style={{ opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Signing in…' : 'Sign In →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab,      setTab]      = useState<Tab>('Orders')
  const [orders,   setOrders]   = useState<Order[]>([])
  const [menu,     setMenu]     = useState<MenuItem[]>([])
  const [inbox,    setInbox]    = useState<InboxItem[]>([])
  const [loadO,    setLoadO]    = useState(true)
  const [loadM,    setLoadM]    = useState(true)
  const [loadI,    setLoadI]    = useState(true)
  const [toast,    setToast]    = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [newCnt,   setNewCnt]   = useState(0)
  const [inboxCnt, setInboxCnt] = useState(0)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadOrders = useCallback(async () => {
    setLoadO(true)
    try {
      const o = await fetchOrders()
      setOrders(o)
      setNewCnt(o.filter(x => x.status === 'new').length)
    } catch (e: any) { showToast('Failed to load orders: ' + e.message, 'err') }
    setLoadO(false)
  }, [])

  const loadMenu = useCallback(async () => {
    setLoadM(true)
    try { setMenu(await fetchMenu()) }
    catch (e: any) { showToast('Failed to load menu: ' + e.message, 'err') }
    setLoadM(false)
  }, [])

  const loadInbox = useCallback(async () => {
    setLoadI(true)
    try {
      const all = await fetchInbox()
      setInbox(all); setInboxCnt(all.length)
    } catch (e: any) { showToast('Failed to load inbox: ' + e.message, 'err') }
    setLoadI(false)
  }, [])

  useEffect(() => { loadOrders(); loadMenu(); loadInbox() }, [])

  useEffect(() => {
    const id = setInterval(() => { loadOrders(); loadInbox() }, 30_000)
    return () => clearInterval(id)
  }, [loadOrders, loadInbox])

  const onStatusChange = async (id: string, status: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(id, status)
      setOrders(prev => prev.map(o => o.id === id ? updated : o))
      showToast(`Order ${id} → ${status}`)
    } catch (e: any) { showToast(e.message, 'err') }
  }

  const onDeleteOrder = async (id: string) => {
    if (!confirm(`Delete order ${id}?`)) return
    try {
      await deleteOrder(id)
      setOrders(p => p.filter(o => o.id !== id))
      showToast('Order deleted')
    } catch (e: any) { showToast(e.message, 'err') }
  }

  const notifyWA = (o: Order) => {
    const lines = (o.items as any[]).map(i => `• ${i.name} ×${i.qty} — ${fmtNaira(i.price * i.qty)}`)
    const msg = [
      `🆕 *NEW ORDER — ${o.id}*`, '',
      `👤 ${o.customer_name || 'Unknown'}`,
      o.customer_phone ? `📞 ${o.customer_phone}` : '',
      '', ...lines, '',
      `💰 *Total: ${fmtNaira(o.total)}*`,
      o.note ? `📝 ${o.note}` : '',
      o.address ? `📍 ${o.address}` : '',
    ].filter(Boolean).join('\n')
    window.open(`https://wa.me/${OWNER_WA}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const today   = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString())
  const active  = orders.filter(o => !['delivered','cancelled'].includes(o.status))
  const revenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#080B14', color: '#fff', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { background: #080B14; margin: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 9999px; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
        .tab-btn { padding: 0.875rem 1.25rem; background: none; border: none; cursor: pointer; font-weight: 600; font-size: 0.875rem; color: rgba(255,255,255,0.35); border-bottom: 2px solid transparent; transition: all 0.2s; white-space: nowrap; position: relative; font-family: inherit; letter-spacing: 0.01em; }
        .tab-btn.active { color: #F97316; border-bottom-color: #F97316; }
        .tab-btn:hover:not(.active) { color: rgba(255,255,255,0.7); }
        .stat-card { background: #0F1420; border: 1px solid rgba(255,255,255,0.06); border-radius: 1rem; padding: 1.125rem 1.25rem; }
        .btn-ghost { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.65); padding: 0.4rem 0.875rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.8125rem; font-weight: 600; transition: all 0.15s; font-family: inherit; }
        .btn-ghost:hover { background: rgba(255,255,255,0.09); color: #fff; }
        .btn-primary { background: linear-gradient(135deg, #F97316, #DC2626); color: #fff; font-weight: 700; padding: 0.5rem 1.125rem; border-radius: 0.625rem; border: none; cursor: pointer; font-size: 0.875rem; transition: opacity 0.2s, transform 0.1s; font-family: inherit; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .filter-pill { padding: 0.3125rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; border: 1px solid transparent; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .input-field { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); color: #fff; border-radius: 0.625rem; padding: 0.625rem 0.875rem; font-size: 0.9rem; outline: none; transition: border-color 0.2s; font-family: inherit; }
        .input-field:focus { border-color: rgba(249,115,22,0.5); }
        select.input-field option { background: #0F1420; }
        .card-row { background: #0F1420; border: 1px solid rgba(255,255,255,0.06); border-radius: 1rem; overflow: hidden; transition: border-color 0.15s; }
        .card-row:hover { border-color: rgba(255,255,255,0.12); }
        @keyframes fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulsedot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pulse-dot { animation: pulsedot 1.6s ease-in-out infinite; }
        .badge-pill { display: inline-flex; align-items: center; gap: 4px; padding: 0.2rem 0.55rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
        table { border-collapse: collapse; }
      `}</style>

      {/* TOPBAR */}
      <div style={{ background: '#0C1019', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '58px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '1.375rem' }}>🍽️</span>
          <div>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.9375rem', letterSpacing: '-0.02em' }}>Chizzychops</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>{orders.length} orders · {menu.length} items</span>
          </div>
          {newCnt > 0 && <span className="pulse-dot badge-pill" style={{ background: 'rgba(220,38,38,0.15)', color: '#F87171', border: '1px solid rgba(220,38,38,0.3)', marginLeft: '0.375rem' }}>{newCnt} NEW</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a href="/" target="_blank" className="btn-ghost" style={{ textDecoration: 'none' }}>↗ Site</a>
          <button onClick={async () => { await logout(); onLogout() }} className="btn-ghost">Sign Out</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: '#0C1019', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1rem', display: 'flex', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'Orders' ? '📋 Orders' : t === 'Menu' ? '🍽 Menu' : t === 'Inbox' ? '💬 Inbox' : '📊 Stats'}
            {t === 'Orders' && newCnt > 0   && <span style={{ position: 'absolute', top: '8px', right: '4px', background: '#DC2626', color: '#fff', width: '15px', height: '15px', borderRadius: '50%', fontSize: '0.5rem', fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{newCnt}</span>}
            {t === 'Inbox'  && inboxCnt > 0 && <span style={{ position: 'absolute', top: '8px', right: '4px', background: '#7C3AED', color: '#fff', width: '15px', height: '15px', borderRadius: '50%', fontSize: '0.5rem', fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{inboxCnt}</span>}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '1.5rem 1.25rem' }}>
        {tab === 'Orders' && <OrdersPanel orders={orders} loading={loadO} onStatusChange={onStatusChange} onDelete={onDeleteOrder} onNotify={notifyWA} onRefresh={loadOrders} todayCount={today.length} activeCount={active.length} revenue={revenue} />}
        {tab === 'Menu'   && <MenuPanel   items={menu}   loading={loadM} onRefresh={loadMenu}   showToast={showToast} />}
        {tab === 'Inbox'  && <InboxPanel  items={inbox}  loading={loadI} onRefresh={loadInbox} />}
        {tab === 'Stats'  && <StatsPanel  orders={orders} menuItems={menu} inbox={inbox} />}
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: toast.type === 'err' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${toast.type === 'err' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`, backdropFilter: 'blur(12px)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.875rem', zIndex: 999, boxShadow: '0 8px 40px rgba(0,0,0,0.5)', whiteSpace: 'nowrap', maxWidth: 'calc(100vw - 2rem)', textAlign: 'center', animation: 'fadein 0.25s ease' }}>
          {toast.type === 'ok' ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// ORDERS PANEL
// ─────────────────────────────────────────────
function OrdersPanel({ orders, loading, onStatusChange, onDelete, onNotify, onRefresh, todayCount, activeCount, revenue }: {
  orders: Order[]; loading: boolean
  onStatusChange: (id: string, s: OrderStatus) => void
  onDelete: (id: string) => void
  onNotify: (o: Order) => void
  onRefresh: () => void
  todayCount: number; activeCount: number; revenue: number
}) {
  const [filter,   setFilter]   = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const shown = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const stats = [
    { l: 'Today',   v: todayCount,                                          c: '#60A5FA', icon: '📅' },
    { l: 'Active',  v: activeCount,                                         c: '#F97316', icon: '🔥' },
    { l: 'New',     v: orders.filter(o => o.status === 'new').length,       c: '#EF4444', icon: '🆕' },
    { l: 'Done',    v: orders.filter(o => o.status === 'delivered').length, c: '#22C55E', icon: '✅' },
    { l: 'Revenue', v: fmtNaira(revenue),                                   c: '#FBBF24', icon: '💰' },
  ]

  return (
    <div style={{ animation: 'fadein 0.3s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {stats.map(s => (
          <div key={s.l} className="stat-card">
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.icon} {s.l}</p>
            <p style={{ color: s.c, fontWeight: 900, fontSize: '1.625rem', letterSpacing: '-0.03em', lineHeight: 1.2, marginTop: '0.3rem' }}>{s.v}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        {(['all','new','confirmed','preparing','ready','delivered','cancelled'] as const).map(s => {
          const cfg = s !== 'all' ? STATUS[s] : null
          const active = filter === s
          return (
            <button key={s} className="filter-pill" onClick={() => setFilter(s)}
              style={{ background: active ? (s === 'all' ? 'linear-gradient(135deg,#F97316,#DC2626)' : `rgba(${hexToRgb(cfg!.color)},0.18)`) : 'rgba(255,255,255,0.04)', color: active ? (s === 'all' ? '#fff' : cfg!.dot) : 'rgba(255,255,255,0.4)', borderColor: active && s !== 'all' ? `rgba(${hexToRgb(cfg!.color)},0.4)` : 'transparent' }}>
              {s === 'all' ? `All (${orders.length})` : cfg!.label}
            </button>
          )
        })}
        <button className="btn-ghost" onClick={onRefresh} style={{ marginLeft: 'auto', padding: '0.3125rem 0.75rem' }}>↺ Refresh</button>
      </div>
      {loading ? <SpinLoader text="Loading orders…" /> : shown.length === 0 ? <EmptyState icon="📭" text="No orders yet" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {shown.map(order => {
            const cfg = STATUS[order.status] ?? STATUS.pending
            const isExp = expanded === order.id
            return (
              <div key={order.id} className="card-row" style={{ borderColor: order.status === 'new' ? 'rgba(96,165,250,0.3)' : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.875rem 1.125rem', cursor: 'pointer', flexWrap: 'wrap' }} onClick={() => setExpanded(isExp ? null : order.id)}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} className={order.status === 'new' ? 'pulse-dot' : ''} />
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.875rem', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{order.id}</span>
                  {order.customer_name && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.customer_name}</span>}
                  <span className="badge-pill" style={{ background: `rgba(${hexToRgb(cfg.color)},0.12)`, color: cfg.dot, border: `1px solid rgba(${hexToRgb(cfg.color)},0.25)` }}>{cfg.label}</span>
                  <span style={{ color: '#FBBF24', fontWeight: 800, fontSize: '0.9375rem', marginLeft: 'auto', whiteSpace: 'nowrap' }}>{fmtNaira(order.total)}</span>
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{timeAgo(order.created_at)}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{isExp ? '▲' : '▼'}</span>
                </div>
                {isExp && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.125rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', padding: '0.75rem', marginBottom: '0.875rem' }}>
                      {(order.items as any[]).map((item: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3125rem 0', borderBottom: i < (order.items as any[]).length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>{item.name} <span style={{ color: 'rgba(255,255,255,0.3)' }}>×{item.qty}</span></span>
                          <span style={{ color: '#FBBF24', fontWeight: 700, fontSize: '0.875rem' }}>{fmtNaira(item.price * item.qty)}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '0.25rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.8125rem' }}>Total</span>
                        <span style={{ color: '#FBBF24', fontWeight: 900, fontSize: '1.0625rem' }}>{fmtNaira(order.total)}</span>
                      </div>
                    </div>
                    {order.customer_phone && <p style={{ color: '#4ADE80', fontSize: '0.8125rem', marginBottom: '0.3125rem' }}>📞 {order.customer_phone}</p>}
                    {order.note          && <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8125rem', marginBottom: '0.3125rem' }}>📝 {order.note}</p>}
                    {order.address       && <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8125rem', marginBottom: '0.875rem' }}>📍 {order.address}</p>}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      {cfg.next && <button className="btn-primary" onClick={() => onStatusChange(order.id, cfg.next!)}>→ {STATUS[cfg.next].label}</button>}
                      {!['delivered','cancelled'].includes(order.status) && <button className="btn-ghost" onClick={() => onStatusChange(order.id, 'cancelled')} style={{ color: '#F87171', borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)' }}>Cancel</button>}
                      {order.customer_phone && (
                        <a href={`https://wa.me/${order.customer_phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi! Your Chizzychops order ${order.id} is now ${order.status} 🍽️`)}`}
                          target="_blank" rel="noopener noreferrer" className="btn-ghost"
                          style={{ textDecoration: 'none', color: '#4ADE80', borderColor: 'rgba(74,222,128,0.2)', background: 'rgba(74,222,128,0.06)' }}>
                          📲 WA Customer
                        </a>
                      )}
                      <button className="btn-ghost" onClick={() => onNotify(order)}>🔔 Notify Me</button>
                      <button onClick={() => onDelete(order.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '1rem', marginLeft: 'auto', padding: '0.25rem', transition: 'color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#F87171')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}>🗑</button>
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

// ─────────────────────────────────────────────
// MENU PANEL
// ─────────────────────────────────────────────
function MenuPanel({ items, loading, onRefresh, showToast }: { items: MenuItem[]; loading: boolean; onRefresh: () => void; showToast: (m: string, t?: 'ok'|'err') => void }) {
  const [search,  setSearch]  = useState('')
  const [catF,    setCatF]    = useState('All')
  const [editing, setEditing] = useState<Omit<MenuItem,'updated_at'> | null>(null)
  const [preview, setPreview] = useState<{ src: string; name: string } | null>(null)
  const [prices,  setPrices]  = useState<Record<number, string>>({})
  const [savingP, setSavingP] = useState<Record<number, boolean>>({})

  const filtered = items.filter(i => (catF === 'All' || i.category === catF) && i.name.toLowerCase().includes(search.toLowerCase()))

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try { await deleteItem(id); showToast('Deleted ' + name); onRefresh() }
    catch (e: any) { showToast(e.message, 'err') }
  }

  const savePrice = async (item: MenuItem) => {
    const raw = prices[item.id]; if (raw === undefined) return
    const p = parseInt(raw.replace(/[^\d]/g, ''), 10)
    if (isNaN(p) || p <= 0) return showToast('Invalid price', 'err')
    setSavingP(s => ({ ...s, [item.id]: true }))
    try {
      await upsertItem({ ...item, price: p })
      showToast(`${item.name} price updated`)
      onRefresh()
      setPrices(s => { const n = { ...s }; delete n[item.id]; return n })
    } catch (e: any) { showToast(e.message, 'err') }
    setSavingP(s => ({ ...s, [item.id]: false }))
  }

  return (
    <div style={{ animation: 'fadein 0.3s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {CATS.map(c => (
          <div key={c} className="stat-card" style={{ cursor: 'pointer', borderColor: catF === c ? 'rgba(249,115,22,0.4)' : undefined }} onClick={() => setCatF(c)}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.4 }}>{c}</p>
            <p style={{ color: catF === c ? '#F97316' : '#fff', fontWeight: 900, fontSize: '1.75rem', letterSpacing: '-0.03em', lineHeight: 1.1, marginTop: '0.3rem' }}>{items.filter(i => i.category === c).length}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <input type="search" placeholder="Search menu…" value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ maxWidth: '200px' }} />
        {['All', ...CATS].map(c => (
          <button key={c} className="filter-pill" onClick={() => setCatF(c)}
            style={{ background: catF === c ? 'linear-gradient(135deg,#F97316,#DC2626)' : 'rgba(255,255,255,0.04)', color: catF === c ? '#fff' : 'rgba(255,255,255,0.4)' }}>
            {c === 'All' ? `All (${items.length})` : c}
          </button>
        ))}
        <button className="btn-primary" onClick={() => setEditing({ ...EMPTY })} style={{ marginLeft: 'auto' }}>+ Add Item</button>
      </div>
      {loading ? <SpinLoader text="Loading menu…" /> : (
        <div style={{ background: '#0F1420', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Image','Name / ID','Category','Price (₦)','Badge','Actions'].map((h,i) => (
                  <th key={i} style={{ padding: '0.875rem 1.125rem', textAlign: 'left', color: 'rgba(255,255,255,0.25)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '0.75rem 1.125rem' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgSrc(item.img_url)} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '0.625rem', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'block' }}
                      onClick={() => item.img_url && setPreview({ src: item.img_url, name: item.name })}
                      onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER }} />
                  </td>
                  <td style={{ padding: '0.75rem 1.125rem' }}>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6875rem', fontFamily: 'monospace', marginTop: '2px' }}>#{item.id}</p>
                  </td>
                  <td style={{ padding: '0.75rem 1.125rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                    {item.category}
                    {item.subcat && <span style={{ color: '#F97316', display: 'block', fontSize: '0.6875rem' }}>{item.subcat}</span>}
                  </td>
                  <td style={{ padding: '0.75rem 1.125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <input type="number" value={prices[item.id] ?? item.price} className="input-field"
                        onChange={e => setPrices(p => ({ ...p, [item.id]: e.target.value }))}
                        style={{ width: '96px', padding: '0.3125rem 0.5rem', color: '#FBBF24', fontWeight: 800, fontFamily: 'monospace', fontSize: '0.875rem' }} />
                      {prices[item.id] !== undefined && String(prices[item.id]) !== String(item.price) && (
                        <button onClick={() => savePrice(item)} disabled={!!savingP[item.id]}
                          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ADE80', borderRadius: '0.375rem', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.6875rem', fontWeight: 800, whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                          {savingP[item.id] ? '…' : 'Save ✓'}
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1.125rem' }}>
                    {item.badge && <span className="badge-pill" style={{ background: `${item.badge_color || '#F97316'}22`, color: item.badge_color || '#F97316', border: `1px solid ${item.badge_color || '#F97316'}44` }}>{item.badge}</span>}
                  </td>
                  <td style={{ padding: '0.75rem 1.125rem' }}>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button className="btn-ghost" onClick={() => item.img_url && setPreview({ src: item.img_url, name: item.name })} style={{ padding: '0.3125rem 0.5rem', fontSize: '0.8125rem' }}>👁</button>
                      <button className="btn-ghost" onClick={() => setEditing({ ...item })} style={{ padding: '0.3125rem 0.625rem', fontSize: '0.8125rem', color: '#F97316', borderColor: 'rgba(249,115,22,0.2)', background: 'rgba(249,115,22,0.06)' }}>Edit</button>
                      <button className="btn-ghost" onClick={() => handleDelete(item.id, item.name)} style={{ padding: '0.3125rem 0.625rem', fontSize: '0.8125rem', color: '#F87171', borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.875rem' }}>No items match</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {editing && <EditModal item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onRefresh(); showToast('Item saved') }} />}
      {preview && (
        <div onClick={() => setPreview(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 400, backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ position: 'relative', maxWidth: 'min(580px, calc(100vw - 3rem))', width: '100%' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} style={{ position: 'absolute', top: '-3rem', right: 0, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.src} alt={preview.name} style={{ width: '100%', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', display: 'block', maxHeight: '70vh', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/580x400/0F1420/F97316?text=Not+Found' }} />
            <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: '0.875rem', fontWeight: 700 }}>{preview.name}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// INBOX PANEL
// ─────────────────────────────────────────────
function InboxPanel({ items, loading, onRefresh }: { items: InboxItem[]; loading: boolean; onRefresh: () => void }) {
  const [filter, setFilter] = useState<'all'|'contact'|'review'|'catering'>('all')
  const shown = filter === 'all' ? items : items.filter(i => i._type === filter)
  const typeConf: Record<string,{label:string;color:string;icon:string}> = {
    contact:  { label:'Message',  color:'#60A5FA', icon:'💬' },
    review:   { label:'Review',   color:'#FBBF24', icon:'⭐' },
    catering: { label:'Catering', color:'#A78BFA', icon:'🎉' },
  }
  return (
    <div style={{ animation: 'fadein 0.3s ease' }}>
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        {(['all','contact','review','catering'] as const).map(f => (
          <button key={f} className="filter-pill" onClick={() => setFilter(f)}
            style={{ background: filter === f ? 'linear-gradient(135deg,#F97316,#DC2626)' : 'rgba(255,255,255,0.04)', color: filter === f ? '#fff' : 'rgba(255,255,255,0.4)' }}>
            {f === 'all' ? `All (${items.length})` : `${typeConf[f].icon} ${typeConf[f].label}s (${items.filter(i => i._type === f).length})`}
          </button>
        ))}
        <button className="btn-ghost" onClick={onRefresh} style={{ marginLeft: 'auto', padding: '0.3125rem 0.75rem' }}>↺ Refresh</button>
      </div>
      {loading ? <SpinLoader text="Loading inbox…" /> : shown.length === 0 ? <EmptyState icon="📭" text="No submissions yet" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {shown.map((item: any) => {
            const cfg = typeConf[item._type]
            return (
              <div key={item.id} className="card-row" style={{ padding: '1rem 1.125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.625rem' }}>
                  <span className="badge-pill" style={{ background: `rgba(${hexToRgb(cfg.color)},0.12)`, color: cfg.color, border: `1px solid rgba(${hexToRgb(cfg.color)},0.25)` }}>{cfg.icon} {cfg.label}</span>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9375rem' }}>{item.name}</span>
                  {item.phone && <a href={`tel:${item.phone}`} style={{ color: '#4ADE80', fontSize: '0.8125rem', textDecoration: 'none' }}>📞 {item.phone}</a>}
                  {item.email && <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>{item.email}</span>}
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.6875rem', marginLeft: 'auto' }}>{timeAgo(item.created_at)}</span>
                </div>
                {item._type === 'contact' && <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', lineHeight: 1.75, background: 'rgba(255,255,255,0.02)', borderRadius: '0.625rem', padding: '0.75rem' }}>{item.message}</p>}
                {item._type === 'review' && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '0.625rem', padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem' }}>Dish: <strong style={{ color: '#F97316' }}>{item.dish}</strong></span>
                      <span style={{ color: '#FBBF24', fontWeight: 700, fontSize: '0.8125rem' }}>{'★'.repeat(item.overall)}{'☆'.repeat(5-item.overall)} {item.overall}/5</span>
                      <span style={{ color: item.recommend ? '#4ADE80' : '#F87171', fontSize: '0.8125rem', fontWeight: 700 }}>{item.recommend ? '👍 Recommends' : '👎 Does not recommend'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      {[['Taste',item.taste],['Portion',item.portion],['Delivery',item.delivery],['Packaging',item.packaging],['Value',item.value]].map(([k,v]) => (
                        <span key={k as string} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.45)' }}>{k}: {v}/5</span>
                      ))}
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', fontStyle: 'italic', lineHeight: 1.7 }}>"{item.review_text}"</p>
                  </div>
                )}
                {item._type === 'catering' && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '0.625rem', padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: item.notes ? '0.5rem' : 0 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem' }}>📅 <strong style={{ color: '#fff' }}>{item.event_date}</strong></span>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem' }}>👥 <strong style={{ color: '#fff' }}>{item.guests} guests</strong></span>
                      {item.event_type && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem' }}>🎊 <strong style={{ color: '#fff' }}>{item.event_type}</strong></span>}
                    </div>
                    {item.notes && <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8125rem', lineHeight: 1.7 }}>📝 {item.notes}</p>}
                  </div>
                )}
                {item.phone && (
                  <a href={`https://wa.me/${item.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${item.name}! Thanks for reaching out to Chizzychops & Grillz 🍽️`)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ADE80', padding: '0.375rem 0.875rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', marginTop: '0.75rem' }}>
                    📲 Reply on WhatsApp
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// STATS PANEL
// ─────────────────────────────────────────────
function StatsPanel({ orders, menuItems, inbox }: { orders: Order[]; menuItems: MenuItem[]; inbox: InboxItem[] }) {
  const topItems = orders.flatMap(o => o.items as any[]).reduce((acc: Record<string,any>, item: any) => {
    if (!acc[item.id]) acc[item.id] = { name: item.name, qty: 0, revenue: 0 }
    acc[item.id].qty += item.qty
    acc[item.id].revenue += item.price * item.qty
    return acc
  }, {})
  const topList = Object.values(topItems).sort((a:any,b:any) => b.qty - a.qty).slice(0, 8)
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s,o) => s + o.total, 0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadein 0.3s ease' }}>
      <div>
        <SectionTitle>Overview</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
          {[
            { l:'Total Orders',   v:orders.length,                                       c:'#60A5FA' },
            { l:'Total Revenue',  v:fmtNaira(totalRevenue),                              c:'#FBBF24' },
            { l:'Delivered',      v:orders.filter(o => o.status==='delivered').length,   c:'#22C55E' },
            { l:'Cancelled',      v:orders.filter(o => o.status==='cancelled').length,   c:'#EF4444' },
            { l:'Menu Items',     v:menuItems.length,                                    c:'#F97316' },
            { l:'Inbox Messages', v:inbox.length,                                        c:'#A78BFA' },
          ].map(s => (
            <div key={s.l} className="stat-card">
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.625rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>{s.l}</p>
              <p style={{ color:s.c, fontWeight:900, fontSize:'1.625rem', letterSpacing:'-0.03em', lineHeight:1.2, marginTop:'0.3rem' }}>{s.v}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Orders by Status</SectionTitle>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:'0.625rem' }}>
          {Object.entries(STATUS).filter(([k]) => !['pending','paid','failed'].includes(k)).map(([k,v]) => (
            <div key={k} className="stat-card" style={{ borderColor:`rgba(${hexToRgb(v.color)},0.2)` }}>
              <p style={{ color:v.dot, fontWeight:900, fontSize:'1.875rem', letterSpacing:'-0.03em', lineHeight:1 }}>{orders.filter(o => o.status===k).length}</p>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.75rem', fontWeight:700, marginTop:'0.375rem' }}>{v.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Inbox Breakdown</SectionTitle>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:'0.625rem' }}>
          {[{l:'Messages',v:inbox.filter(i=>i._type==='contact').length, c:'#60A5FA',i:'💬'},
            {l:'Reviews', v:inbox.filter(i=>i._type==='review').length,  c:'#FBBF24',i:'⭐'},
            {l:'Catering',v:inbox.filter(i=>i._type==='catering').length,c:'#A78BFA',i:'🎉'}].map(s => (
            <div key={s.l} className="stat-card">
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.625rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>{s.i} {s.l}</p>
              <p style={{ color:s.c, fontWeight:900, fontSize:'1.875rem', letterSpacing:'-0.03em', lineHeight:1.2, marginTop:'0.3rem' }}>{s.v}</p>
            </div>
          ))}
        </div>
      </div>
      {topList.length > 0 && (
        <div>
          <SectionTitle>Top Selling Items</SectionTitle>
          <div style={{ background:'#0F1420', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'1rem', overflow:'hidden' }}>
            {topList.map((item:any, i:number) => (
              <div key={item.name} style={{ display:'flex', alignItems:'center', gap:'0.875rem', padding:'0.875rem 1.125rem', borderBottom: i<topList.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <span style={{ color:i===0?'#FBBF24':'rgba(255,255,255,0.3)', fontWeight:900, minWidth:'24px', fontSize:'0.9375rem', fontFamily:'monospace' }}>#{i+1}</span>
                <span style={{ color:'#fff', fontWeight:600, flex:1, fontSize:'0.9375rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</span>
                <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.875rem', whiteSpace:'nowrap' }}>{item.qty}×</span>
                <span style={{ color:'#FBBF24', fontWeight:800, fontSize:'0.9375rem', whiteSpace:'nowrap' }}>{fmtNaira(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// EDIT MODAL
// ─────────────────────────────────────────────
function EditModal({ item, onClose, onSaved }: { item: Omit<MenuItem,'updated_at'>; onClose: () => void; onSaved: () => void }) {
  const [form,   setForm]  = useState({ ...item })
  const [saving, setSave]  = useState(false)
  const [err,    setErr]   = useState('')
  const [upImg,  setUpI]   = useState(false)
  const [upImg2, setUpI2]  = useState(false)
  const r1 = useRef<HTMLInputElement>(null)
  const r2 = useRef<HTMLInputElement>(null)

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v || null }))

  const handleUpload = async (file: File, field: 'img_url'|'img2_url') => {
    const setU = field === 'img_url' ? setUpI : setUpI2
    setU(true)
    try { const url = await uploadImage(file); set(field, url) }
    catch (e: any) { setErr('Upload failed: ' + e.message) }
    setU(false)
  }

  const save = async () => {
    if (!form.name.trim())   return setErr('Name is required')
    if (form.price <= 0)     return setErr('Price must be greater than 0')
    setSave(true); setErr('')
    try {
      // id=0 means new item, pass undefined so the API creates it
      const payload = {
        ...form,
        id:         form.id === 0 ? undefined : form.id,
        subcat:     form.subcat     || null,
        badge:      form.badge      || null,
        badge_color:form.badge_color|| null,
        note:       form.note       || null,
        img_url:    form.img_url    || null,
        img2_url:   form.img2_url   || null,
      }
      await upsertItem(payload)
      onSaved()
    } catch (e: any) { setErr(e.message); setSave(false) }
  }

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:300, backdropFilter:'blur(8px)' }} />
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'min(720px, calc(100vw - 1.5rem))', maxHeight:'92vh', overflowY:'auto', background:'#0F1420', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'1.5rem', zIndex:301, padding:'clamp(1.25rem,4vw,2rem)', boxShadow:'0 32px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h2 style={{ color:'#fff', fontSize:'clamp(1rem,3vw,1.25rem)', fontWeight:800, letterSpacing:'-0.02em' }}>{item.id === 0 ? 'New Menu Item' : `Edit: ${item.name}`}</h2>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', width:'34px', height:'34px', borderRadius:'50%', cursor:'pointer', fontSize:'1.125rem', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'1rem' }}>
          <MF label="Sort Order"><input type="number" value={form.sort_order} onChange={e => set('sort_order', +e.target.value)} className="input-field" /></MF>
          <MF label="Name *" span><input value={form.name} onChange={e => set('name', e.target.value)} className="input-field" /></MF>
          <MF label="Price (₦) *"><input type="number" value={form.price || ''} onChange={e => set('price', +e.target.value)} className="input-field" placeholder="35000" /></MF>
          <MF label="Category *"><select value={form.category} onChange={e => set('category', e.target.value)} className="input-field">{CATS.map(c => <option key={c}>{c}</option>)}</select></MF>
          <MF label="Sub-category"><select value={form.subcat || ''} onChange={e => set('subcat', e.target.value)} className="input-field">{SUBCATS.map(s => <option key={s} value={s}>{s || '— None —'}</option>)}</select></MF>
          <MF label="Description" span><textarea value={form.description} onChange={e => set('description', e.target.value)} className="input-field" style={{ minHeight:'72px', resize:'vertical' }} /></MF>
          <MF label="Badge"><input value={form.badge || ''} onChange={e => set('badge', e.target.value)} className="input-field" placeholder="2L Bowl" /></MF>
          <MF label="Badge Colour">
            <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
              <input value={form.badge_color || ''} onChange={e => set('badge_color', e.target.value)} className="input-field" style={{ flex:1 }} placeholder="#F97316" />
              {form.badge_color && <div style={{ width:'30px', height:'30px', borderRadius:'0.375rem', background:form.badge_color, border:'1px solid rgba(255,255,255,0.15)', flexShrink:0 }} />}
            </div>
          </MF>
          <MF label="Note" span><input value={form.note || ''} onChange={e => set('note', e.target.value)} className="input-field" placeholder="Includes 5pcs…" /></MF>
          <MF label="Main Image" span>
            <div style={{ display:'flex', gap:'0.875rem', alignItems:'flex-start' }}>
              <div style={{ flex:1 }}>
                <input value={form.img_url || ''} onChange={e => set('img_url', e.target.value)} className="input-field" style={{ marginBottom:'0.5rem' }} placeholder="/soup/egusi.jpg or https://…" />
                <input ref={r1} type="file" accept="image/*" style={{ display:'none' }} onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'img_url')} />
                <button onClick={() => r1.current?.click()} disabled={upImg} className="btn-ghost" style={{ fontSize:'0.8125rem' }}>{upImg ? '⏳ Uploading…' : '📁 Upload Image'}</button>
              </div>
              {form.img_url && <img src={form.img_url} alt="preview" style={{ width:'72px', height:'72px', objectFit:'cover', borderRadius:'0.75rem', border:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />}
            </div>
          </MF>
          <MF label="Second Image" hint="optional" span>
            <div style={{ display:'flex', gap:'0.875rem', alignItems:'flex-start' }}>
              <div style={{ flex:1 }}>
                <input value={form.img2_url || ''} onChange={e => set('img2_url', e.target.value)} className="input-field" style={{ marginBottom:'0.5rem' }} placeholder="optional second image" />
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  <input ref={r2} type="file" accept="image/*" style={{ display:'none' }} onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'img2_url')} />
                  <button onClick={() => r2.current?.click()} disabled={upImg2} className="btn-ghost" style={{ fontSize:'0.8125rem' }}>{upImg2 ? '⏳ Uploading…' : '📁 Upload'}</button>
                  {form.img2_url && <button onClick={() => set('img2_url', '')} className="btn-ghost" style={{ color:'#F87171', fontSize:'0.8125rem' }}>Remove</button>}
                </div>
              </div>
              {form.img2_url && <img src={form.img2_url} alt="preview2" style={{ width:'72px', height:'72px', objectFit:'cover', borderRadius:'0.75rem', border:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />}
            </div>
          </MF>
        </div>
        {err && <p style={{ color:'#F87171', fontSize:'0.875rem', marginTop:'1rem', textAlign:'center', background:'rgba(239,68,68,0.08)', borderRadius:'0.625rem', padding:'0.625rem' }}>{err}</p>}
        <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem', justifyContent:'flex-end' }}>
          <button onClick={onClose} className="btn-ghost" style={{ padding:'0.75rem 1.5rem' }}>Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary" style={{ padding:'0.75rem 1.875rem', fontSize:'0.9375rem', opacity:saving?0.7:1 }}>{saving ? 'Saving…' : '💾 Save Item'}</button>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────
function MF({ label, children, hint, span }: { label: string; children: React.ReactNode; hint?: string; span?: boolean }) {
  return (
    <div style={{ gridColumn: span ? '1 / -1' : undefined }}>
      <label style={{ display:'block', color:'rgba(255,255,255,0.35)', fontSize:'0.625rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.375rem' }}>
        {label}{hint && <span style={{ color:'rgba(255,255,255,0.2)', fontWeight:400, textTransform:'none', marginLeft:'0.3rem' }}>({hint})</span>}
      </label>
      {children}
    </div>
  )
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ color:'rgba(255,255,255,0.6)', fontWeight:700, fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.875rem' }}>{children}</h3>
}
function SpinLoader({ text }: { text: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'3.5rem', color:'rgba(255,255,255,0.3)', gap:'0.625rem' }}>
      <span style={{ width:'18px', height:'18px', border:'2px solid rgba(255,255,255,0.1)', borderTopColor:'#F97316', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
      <span style={{ fontSize:'0.875rem' }}>{text}</span>
    </div>
  )
}
function FullLoader() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080B14' }}>
      <span style={{ width:'28px', height:'28px', border:'2px solid rgba(255,255,255,0.08)', borderTopColor:'#F97316', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign:'center', padding:'4rem 2rem', color:'rgba(255,255,255,0.25)' }}>
      <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem', opacity:0.5 }}>{icon}</div>
      <p style={{ fontSize:'0.875rem', fontWeight:500 }}>{text}</p>
    </div>
  )
}
function hexToRgb(hex: string): string {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '255,255,255'
}