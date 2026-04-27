/**
 * app/lib/api.ts
 * All types matching Prisma schema exactly + fetch helpers.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'new' | 'pending' | 'paid' | 'failed' | 'confirmed'
  | 'preparing' | 'ready' | 'delivered' | 'cancelled'

export interface MenuItem {
  id:          number        // ← Int (SERIAL) not string
  name:        string
  price:       number
  category:    string
  subcat:      string | null
  description: string
  badge:       string | null
  badge_color: string | null
  note:        string | null
  img_url:     string | null // ← nullable now
  img2_url:    string | null
  sort_order:  number
  updated_at:  string
}

export interface Order {
  id:               string
  reference:        string
  customer_name:    string
  customer_email:   string
  customer_phone:   string
  delivery_address: string
  items:            unknown
  subtotal:         number
  delivery_fee:     number
  total:            number
  status:           string
  whatsapp_sent:    boolean
  note:             string | null
  address:          string | null
  created_at:       string
  updated_at:       string
}

export interface ContactSubmission {
  id:         number
  name:       string
  phone:      string
  email:      string | null
  message:    string
  type:       string
  created_at: string
  _type:      'contact'
}

export interface ReviewSubmission {
  id:          number
  name:        string
  dish:        string
  overall:     number
  taste:       number
  portion:     number
  delivery:    number
  packaging:   number
  value:       number
  recommend:   boolean
  review_text: string
  type:        string
  created_at:  string
  _type:       'review'
}

export interface CateringSubmission {
  id:         number
  name:       string
  phone:      string
  event_date: string
  guests:     string
  event_type: string
  notes:      string
  type:       string
  created_at: string
  _type:      'catering'
}

export type InboxItem = ContactSubmission | ReviewSubmission | CateringSubmission

// ─── Internal helper ──────────────────────────────────────────────────────────

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText)
    throw new Error(`API ${url} → ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const checkSession      = ()                      => api<{ ok: boolean }>('/api/auth')
export const loginWithPassword = (password: string)      => api<{ ok: boolean }>('/api/auth', { method: 'POST', body: JSON.stringify({ password }) })
export const logout            = ()                      => api<{ ok: boolean }>('/api/auth', { method: 'DELETE' })

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const fetchMenu  = ()                          => api<MenuItem[]>('/api/menu')
export const upsertItem = (item: Partial<MenuItem>)   => api<MenuItem>('/api/menu', { method: 'POST', body: JSON.stringify(item) })
export const deleteItem = (id: number)                => api<void>(`/api/menu?id=${id}`, { method: 'DELETE' })  // ← number not string

// ─── Orders ───────────────────────────────────────────────────────────────────

export const fetchOrders       = ()                                 => api<Order[]>('/api/orders')
export const updateOrderStatus = (id: string, status: OrderStatus)  => api<Order>('/api/orders', { method: 'PATCH', body: JSON.stringify({ id, status }) })
export const deleteOrder       = (id: string)                       => api<void>(`/api/orders?id=${encodeURIComponent(id)}`, { method: 'DELETE' })

// ─── Inbox ────────────────────────────────────────────────────────────────────

export const fetchInbox = () => api<InboxItem[]>('/api/inbox')

// ─── Image upload ─────────────────────────────────────────────────────────────

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText)
    throw new Error(`Upload failed: ${body}`)
  }
  const { url } = await res.json() as { url: string }
  return url
}