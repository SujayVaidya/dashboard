import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'
import { requireUser } from '@/lib/apiAuth'

export const runtime = 'nodejs'

const MAX_SIZE = 2 * 1024 * 1024

export async function POST(request: NextRequest) {
  const { error } = await requireUser()
  if (error) return error

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'no file provided' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'file must be an image' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'image must be 2MB or smaller' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const uploaded = await uploadImage(buffer, 'shortcut-icons')

  return NextResponse.json({ url: uploaded.secure_url }, { status: 201 })
}
