/**
 * app/api/review/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, dish, overall, taste, portion, delivery, packaging, value, recommend, review_text } = body

    if (!name || !dish || !overall || !review_text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

   const submission = await prisma.reviewSubmission.create({
  data: {
    id:         `REV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    name,
    dish,
    overall:    Number(overall),
    taste:      Number(taste)     || 0,
    portion:    Number(portion)   || 0,
    delivery:   Number(delivery)  || 0,
    packaging:  Number(packaging) || 0,
    value:      Number(value)     || 0,
    recommend:  recommend ?? true,
    reviewText: review_text,
    type:       'review',
  },
})

    return NextResponse.json({ success: true, id: submission.id })
  } catch (err) {
    console.error('POST /api/review error:', err)
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
  }
}