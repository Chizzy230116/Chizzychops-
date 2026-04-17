/**
 * app/api/orders/route.ts
 *
 * GET    /api/orders          → list all orders (newest first) — admin panel
 * PATCH  /api/orders          → { id, status } update status   — admin panel
 * DELETE /api/orders?id=      → delete order                   — admin panel
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { OrderStatus } from '@prisma/client'

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const mapped = orders.map(o => ({
      id:               o.id,
      reference:        o.reference,
      customer_name:    o.customerName,
      customer_email:   o.customerEmail,
      customer_phone:   o.customerPhone,
      delivery_address: o.deliveryAddress,
      items:            o.items,
      subtotal:         o.subtotal,
      delivery_fee:     o.deliveryFee,
      total:            o.total,
      status:           o.status,
      paystack_data:    o.paystackData,
      whatsapp_sent:    o.whatsappSent,
      created_at:       o.createdAt.toISOString(),
      updated_at:       o.updatedAt.toISOString(),
    }))

    return NextResponse.json(mapped)
  } catch (err) {
    console.error('GET /api/orders error:', err)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// ─── PATCH (status update) ───────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json() as { id: string; status: OrderStatus }

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status required' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id },
      data:  { status },
    })

    return NextResponse.json({
      id:               order.id,
      reference:        order.reference,
      customer_name:    order.customerName,
      customer_email:   order.customerEmail,
      customer_phone:   order.customerPhone,
      delivery_address: order.deliveryAddress,
      items:            order.items,
      subtotal:         order.subtotal,
      delivery_fee:     order.deliveryFee,
      total:            order.total,
      status:           order.status,
      paystack_data:    order.paystackData,
      whatsapp_sent:    order.whatsappSent,
      created_at:       order.createdAt.toISOString(),
      updated_at:       order.updatedAt.toISOString(),
    })
  } catch (err) {
    console.error('PATCH /api/orders error:', err)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    await prisma.order.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('DELETE /api/orders error:', err)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}