/**
 * app/api/upload/route.ts
 *
 * POST /api/upload  (multipart/form-data, field: "file")
 * → saves image to public/uploads/
 * → returns { url: string }
 *
 * Zero Supabase. Files are served statically from /uploads/filename.
 * For production, swap writeFile for your cloud storage of choice (S3, R2, etc.)
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join }             from 'path'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filePath  = join(uploadDir, filename)

    // Ensure uploads directory exists
    await mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (err) {
    console.error('POST /api/upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}