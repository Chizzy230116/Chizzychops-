/**
 * app/api/catering/route.ts
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, event_date, guests, event_type, notes } = body

    if (!name || !phone || !event_date || !guests) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const submission = await prisma.cateringSubmission.create({
      data: {
        // id is SERIAL — auto-generated, do NOT pass it
        name,
        phone,
        eventDate: event_date,
        guests,
        eventType: event_type || '',
        notes:     notes      || '',
        type:      'catering',
      },
    })

    return NextResponse.json({ success: true, id: submission.id })
  } catch (err) {
    console.error('POST /api/catering error:', err)
    return NextResponse.json({ error: 'Failed to save catering request' }, { status: 500 })
  }
}