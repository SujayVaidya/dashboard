import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/mongodb'
import Shortcut from '@/models/Shortcut'
import { requireUser } from '@/lib/apiAuth'

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  siteUrl: z.string().trim().min(1).optional(),
  iconUrl: z.string().trim().optional(),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser()
  if (error) return error

  const parsed = updateSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { id } = await params
  await connectDB()
  const shortcut = await Shortcut.findOneAndUpdate({ _id: id, userId: user.id }, parsed.data, { new: true })
  if (!shortcut) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(shortcut)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser()
  if (error) return error

  const { id } = await params
  await connectDB()
  const shortcut = await Shortcut.findOneAndDelete({ _id: id, userId: user.id })
  if (!shortcut) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}
