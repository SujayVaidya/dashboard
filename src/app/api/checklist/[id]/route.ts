import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/mongodb'
import ChecklistItem from '@/models/ChecklistItem'
import { requireUser } from '@/lib/apiAuth'

const updateSchema = z.object({
  text: z.string().trim().min(1).optional(),
  done: z.boolean().optional(),
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
  const item = await ChecklistItem.findOneAndUpdate({ _id: id, userId: user.id }, parsed.data, { new: true })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(item)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser()
  if (error) return error

  const { id } = await params
  await connectDB()
  const item = await ChecklistItem.findOneAndDelete({ _id: id, userId: user.id })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}
