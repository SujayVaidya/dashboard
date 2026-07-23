import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/mongodb'
import ChecklistItem from '@/models/ChecklistItem'
import { requireUser } from '@/lib/apiAuth'

const createSchema = z.object({
  text: z.string().trim().min(1),
})

export async function GET() {
  const { user, error } = await requireUser()
  if (error) return error

  await connectDB()
  const items = await ChecklistItem.find({ userId: user.id }).sort({ createdAt: 1 })
  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireUser()
  if (error) return error

  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  await connectDB()
  const item = await ChecklistItem.create({ ...parsed.data, userId: user.id })
  return NextResponse.json(item, { status: 201 })
}
