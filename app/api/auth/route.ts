/**
 * app/api/auth/route.ts
 *
 * POST /api/auth        → { password } → sets cookie on success
 * DELETE /api/auth      → clears cookie (sign out)
 * GET /api/auth         → returns { ok: true/false } (session check)
 */

import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE, AUTH_TOKEN } from '@/app/lib/auth'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'chizzyadmin'

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path:     '/',
  maxAge:   60 * 60 * 24 * 7, // 7 days
}

// ─── GET — check session ──────────────────────────────────────────────────────
export function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value
  return NextResponse.json({ ok: token === AUTH_TOKEN })
}

// ─── POST — login ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { password } = await req.json() as { password?: string }

  if (!password || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(AUTH_COOKIE, AUTH_TOKEN, COOKIE_OPTS)
  return res
}

// ─── DELETE — logout ──────────────────────────────────────────────────────────
export function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(AUTH_COOKIE, '', { ...COOKIE_OPTS, maxAge: 0 })
  return res
}