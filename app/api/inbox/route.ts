/**
 * app/api/inbox/route.ts
 *
 * GET /api/inbox → returns all contact, review, and catering submissions
 * merged and sorted by created_at descending
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const [contacts, reviews, caterings] = await Promise.all([
      prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.reviewSubmission.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.cateringSubmission.findMany({ orderBy: { createdAt: 'desc' } }),
    ])

    const mapped = [
      ...contacts.map(c => ({
        id:         c.id,
        _type:      'contact',
        name:       c.name,
        phone:      c.phone,
        email:      c.email ?? null,
        message:    c.message,
        created_at: c.createdAt.toISOString(),
      })),
      ...reviews.map(r => ({
        id:          r.id,
        _type:       'review',
        name:        r.name,
        dish:        r.dish,
        overall:     r.overall,
        taste:       r.taste,
        portion:     r.portion,
        delivery:    r.delivery,
        packaging:   r.packaging,
        value:       r.value,
        recommend:   r.recommend,
        review_text: r.reviewText,
        created_at:  r.createdAt.toISOString(),
      })),
      ...caterings.map(c => ({
        id:         c.id,
        _type:      'catering',
        name:       c.name,
        phone:      c.phone,
        event_date: c.eventDate,
        guests:     c.guests,
        event_type: c.eventType,
        notes:      c.notes,
        created_at: c.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json(mapped)
  } catch (err) {
    console.error('GET /api/inbox error:', err)
    return NextResponse.json({ error: 'Failed to fetch inbox' }, { status: 500 })
  }
}