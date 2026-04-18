/**
 * app/api/orders/route.ts
 *
 * GET    /api/orders     → list all orders (newest first)
 * PATCH  /api/orders     → { id, status } update status
 * DELETE /api/orders?id= → delete order
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const mapped = orders.map(o => ({
      id:             o.id,
      customer_name:  o.customerName,
      customer_phone: o.customerPhone,
      items:          o.items,
      total:          o.total,
      status:         o.status,
      note:           o.note,
      address:        o.address,
      created_at:     o.createdAt.toISOString(),
      updated_at:     o.updatedAt.toISOString(),
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
    const { id, status } = await req.json() as { id: string; status: string }

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status required' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id },
      data:  { status },
    })

    return NextResponse.json({
      id:             order.id,
      customer_name:  order.customerName,
      customer_phone: order.customerPhone,
      items:          order.items,
      total:          order.total,
      status:         order.status,
      note:           order.note,
      address:        order.address,
      created_at:     order.createdAt.toISOString(),
      updated_at:     order.updatedAt.toISOString(),
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