/**
 * app/api/menu/route.ts
 *
 * GET    /api/menu       → list all items (sorted)
 * POST   /api/menu       → upsert item
 * DELETE /api/menu?id=   → delete item
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
      id:          r.id,                              // number
      name:        r.name,
      price:       r.price,
      priceLabel:  '₦' + r.price.toLocaleString('en-NG'),
      category:    r.category,
      subcat:      r.subcat      ?? null,
      description: r.description,
      badge:       r.badge       ?? null,
      badge_color: r.badgeColor  ?? null,
      note:        r.note        ?? null,
      img_url:     r.imgUrl      ?? null,             // nullable
      img2_url:    r.img2Url     ?? null,
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

    const data = {
      name:        body.name,
      price:       Number(body.price),
      category:    body.category,
      subcat:      body.subcat      ?? null,
      description: body.description ?? '',
      badge:       body.badge       ?? null,
      badgeColor:  body.badge_color ?? null,
      note:        body.note        ?? null,
      imgUrl:      body.img_url     ?? null,
      img2Url:     body.img2_url    ?? null,
      sortOrder:   Number(body.sort_order) || 99,
    }

    // id is Int — parse it if provided, otherwise create new
    const numericId = body.id ? Number(body.id) : undefined

    const item = numericId
      ? await prisma.menuItem.upsert({
          where:  { id: numericId },
          create: { ...data },
          update: data,
        })
      : await prisma.menuItem.create({ data })

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
      img_url:     item.imgUrl      ?? null,
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
  const idParam = req.nextUrl.searchParams.get('id')
  if (!idParam) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const id = Number(idParam)
  if (isNaN(id)) return NextResponse.json({ error: 'id must be a number' }, { status: 400 })

  try {
    await prisma.menuItem.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('DELETE /api/menu error:', err)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}