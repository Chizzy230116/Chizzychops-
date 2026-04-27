/**
 * app/api/orders/route.ts
 *
 * GET    /api/orders     → list all orders (newest first)
 * PATCH  /api/orders     → { id, status } update status
 * DELETE /api/orders?id= → delete order
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// ─── helper ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrder(o: any) {
  return {
    id:               o.id               as string,
    reference:        o.reference        as string,
    customer_name:    o.customerName     as string,
    customer_email:   o.customerEmail    as string,
    customer_phone:   o.customerPhone    as string,
    delivery_address: o.deliveryAddress  as string,
    items:            o.items,
    subtotal:         o.subtotal         as number,
    delivery_fee:     o.deliveryFee      as number,
    total:            o.total            as number,
    status:           o.status           as string,
    whatsapp_sent:    o.whatsappSent     as boolean,
    note:             o.note             as string | null,
    address:          o.deliveryAddress  as string | null,
    created_at:       (o.createdAt as Date).toISOString(),
    updated_at:       (o.updatedAt as Date).toISOString(),
  }
}

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders.map(mapOrder))
  } catch (err) {
    console.error('GET /api/orders error:', err)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// ─── PATCH (status update) ───────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json() as { id: string; status: string }

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status required' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id },
      data:  { status },
    })

    return NextResponse.json(mapOrder(order))
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