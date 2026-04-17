/**
 * app/api/upload/route.ts
 *
 * POST /api/upload  (multipart/form-data, field: "file")
 * → uploads to Supabase Storage bucket "menu-images"
 * → returns { url: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service-role key keeps uploads server-side and bypasses RLS.
// Add SUPABASE_SERVICE_ROLE_KEY to .env.local (never expose to browser).
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BUCKET = 'menu-images'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const ext    = file.name.split('.').pop() ?? 'jpg'
    const path   = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (error) throw error

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (err) {
    console.error('POST /api/upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}