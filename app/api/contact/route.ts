/**
 * app/api/contact/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, email, message } = body

    if (!name || !phone || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

  const submission = await prisma.contactSubmission.create({
  data: {
    id:      `MSG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    name:    name.trim(),
    phone:   phone.trim(),
    email:   email?.trim() || null,
    message: message.trim(),
    type:    'contact',
  },
})

    return NextResponse.json({ success: true, id: submission.id })
  } catch (err) {
    console.error('POST /api/contact error:', err)
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }
}