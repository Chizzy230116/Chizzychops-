/**
 * app/api/menu/route.ts
 *
 * GET    /api/menu       → list all items (sorted) — public storefront + admin
 * POST   /api/menu       → upsert item             — admin panel
 * DELETE /api/menu?id=   → delete item             — admin panel
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    const mapped = items.map(r => ({
      id:          r.id,
      name:        r.name,
      price:       r.price,
      priceLabel:  '₦' + r.price.toLocaleString('en-NG'),
      category:    r.category,
      subcat:      r.subcat      ?? undefined,
      description: r.description,
      badge:       r.badge       ?? undefined,
      badge_color: r.badgeColor  ?? undefined,
      note:        r.note        ?? undefined,
      img_url:     r.imgUrl,
      img2_url:    r.img2Url     ?? undefined,
      sort_order:  r.sortOrder,
      updated_at:  r.updatedAt.toISOString(),
    }))

    return NextResponse.json(mapped)
  } catch (err) {
    console.error('GET /api/menu error:', err)
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 })
  }
}

// ─── POST (upsert) ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // snake_case in from admin panel → camelCase for Prisma
    const data = {
      name:        body.name,
      price:       Number(body.price),
      category:    body.category,
      subcat:      body.subcat      ?? null,
      description: body.description ?? '',
      badge:       body.badge       ?? null,
      badgeColor:  body.badge_color ?? null,
      note:        body.note        ?? null,
      imgUrl:      body.img_url     ?? '',
      img2Url:     body.img2_url    ?? null,
      sortOrder:   body.sort_order  ?? 0,
    }

    const item = await prisma.menuItem.upsert({
      where:  { id: body.id ?? '' },
      create: { id: body.id, ...data },
      update: data,
    })

    return NextResponse.json({
      id:          item.id,
      name:        item.name,
      price:       item.price,
      category:    item.category,
      subcat:      item.subcat      ?? null,
      description: item.description,
      badge:       item.badge       ?? null,
      badge_color: item.badgeColor  ?? null,
      note:        item.note        ?? null,
      img_url:     item.imgUrl,
      img2_url:    item.img2Url     ?? null,
      sort_order:  item.sortOrder,
      updated_at:  item.updatedAt.toISOString(),
    })
  } catch (err) {
    console.error('POST /api/menu error:', err)
    return NextResponse.json({ error: 'Failed to upsert item' }, { status: 500 })
  }
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    await prisma.menuItem.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('DELETE /api/menu error:', err)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}