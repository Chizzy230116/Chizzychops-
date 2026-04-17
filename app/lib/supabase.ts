/**
 * app/lib/supabase.ts
 *
 * Supabase JS client  → auth, realtime, storage, direct table queries
 * Data mutations      → Prisma via internal API routes (no supabase-js SDK needed for data)
 *
 * Drop-in replacement: all exports match what page.tsx already imports.
 */

import { createClient } from '@supabase/supabase-js'

// ─── Supabase client (auth / realtime / storage) ────────────────────────────

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Types (mirror Prisma schema exactly) ───────────────────────────────────

export type OrderStatus =
  | 'new' | 'pending' | 'paid' | 'failed' | 'confirmed'
  | 'preparing' | 'ready' | 'delivered' | 'cancelled'

export interface MenuItem {
  id:          string
  name:        string
  price:       number
  category:    string
  subcat:      string | null
  description: string
  badge:       string | null
  badge_color: string | null
  note:        string | null
  img_url:     string
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
  status:           OrderStatus
  paystack_data:    unknown | null
  whatsapp_sent:    boolean
  created_at:       string
  updated_at:       string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Menu ─────────────────────────────────────────────────────────────────────

export function fetchMenu(): Promise<MenuItem[]> {
  return api<MenuItem[]>('/api/menu')
}

export function upsertItem(item: Partial<MenuItem>): Promise<MenuItem> {
  return api<MenuItem>('/api/menu', {
    method: 'POST',
    body: JSON.stringify(item),
  })
}

export function deleteItem(id: string): Promise<void> {
  return api<void>(`/api/menu?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function fetchOrders(): Promise<Order[]> {
  return api<Order[]>('/api/orders')
}

export function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return api<Order>('/api/orders', {
    method: 'PATCH',
    body: JSON.stringify({ id, status }),
  })
}

export function deleteOrder(id: string): Promise<void> {
  return api<void>(`/api/orders?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// ─── Image upload (Supabase Storage) ─────────────────────────────────────────

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