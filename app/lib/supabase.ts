import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnon)) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(
  supabaseUrl  ?? 'https://placeholder.supabase.co',
  supabaseAnon ?? 'placeholder-key'
)

// ── Types ──────────────────────────────────────────────────
export type MenuItem = {
  id: string; name: string; price: number; category: string
  subcat: string | null; description: string; badge: string | null
  badge_color: string | null; note: string | null
  img_url: string; img2_url: string | null
  sort_order: number; updated_at: string
}

export type OrderStatus =
  | 'new' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

export type OrderItem = { id: string; name: string; qty: number; price: number }

export type Order = {
  id: string; customer_name: string | null; customer_phone: string | null
  items: OrderItem[]; total: number; status: OrderStatus
  note: string | null; address: string | null
  created_at: string; updated_at: string
}

export type ContactSubmission = {
  id?: string; name: string; phone: string; email?: string
  message: string; type: 'contact'; created_at?: string
}

export type ReviewSubmission = {
  id?: string; name: string; dish: string; overall: number
  taste: number; portion: number; delivery: number
  packaging: number; value: number
  recommend: boolean; review_text: string
  type: 'review'; created_at?: string
}

export type CateringSubmission = {
  id?: string; name: string; phone: string; event_date: string
  guests: string; event_type: string; notes: string
  type: 'catering'; created_at?: string
}

// ── Menu helpers ───────────────────────────────────────────
export async function fetchMenu(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function upsertItem(item: Omit<MenuItem, 'updated_at'>): Promise<void> {
  const { error } = await supabase
    .from('menu_items').upsert({ ...item, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from('menu_items').delete().eq('id', id)
  if (error) throw error
}

// ── Order helpers ──────────────────────────────────────────
export async function createOrder(order: {
  customer_name?: string; customer_phone?: string
  items: OrderItem[]; total: number; note?: string; address?: string
}): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert([{ ...order, status: 'new',
      customer_name: order.customer_name || null,
      customer_phone: order.customer_phone || null,
      note: order.note || null, address: order.address || null,
    }]).select().single()
  if (error) throw error
  return data as Order
}

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Order[]
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase.from('orders')
    .update({ status, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) throw error
}

// ── Contact submission ─────────────────────────────────────
export async function saveContact(data: Omit<ContactSubmission, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('contact_submissions').insert([data])
  if (error) throw error
}

// ── Review submission ──────────────────────────────────────
export async function saveReview(data: Omit<ReviewSubmission, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('review_submissions').insert([data])
  if (error) throw error
}

// ── Catering submission ────────────────────────────────────
export async function saveCatering(data: Omit<CateringSubmission, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('catering_submissions').insert([data])
  if (error) throw error
}

// ── Image upload ───────────────────────────────────────────
export async function uploadImage(file: File): Promise<string> {
  const ext  = file.name.split('.').pop()
  const path = `menu/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage
    .from('food-images').upload(path, file, { upsert: true })
  if (error) throw error
  return supabase.storage.from('food-images').getPublicUrl(path).data.publicUrl
}