import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/mongodb'
import Shortcut from '@/models/Shortcut'
import UserSetting from '@/models/UserSetting'
import { requireUser } from '@/lib/apiAuth'
import { DEFAULT_SHORTCUTS } from '@/lib/defaultShortcuts'

const createSchema = z.object({
  name: z.string().trim().min(1),
  siteUrl: z.string().trim().min(1),
  iconUrl: z.string().trim().optional(),
})

export async function GET() {
  const { user, error } = await requireUser()
  if (error) return error

  await connectDB()
  const settings = await UserSetting.findOne({ userId: user.id })
  if (!settings) {
    await UserSetting.create({ userId: user.id, defaultsSeeded: true })
    await Shortcut.insertMany(DEFAULT_SHORTCUTS.map((s) => ({ ...s, userId: user.id })))
  }
  const shortcuts = await Shortcut.find({ userId: user.id }).sort({ createdAt: 1 })
  return NextResponse.json(shortcuts)
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireUser()
  if (error) return error

  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  await connectDB()
  const shortcut = await Shortcut.create({ ...parsed.data, userId: user.id })
  return NextResponse.json(shortcut, { status: 201 })
}
