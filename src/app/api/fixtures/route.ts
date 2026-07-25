import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const teamId = request.nextUrl.searchParams.get('teamId')
  const mode = request.nextUrl.searchParams.get('mode')

  if (!teamId) {
    return NextResponse.json({ error: 'teamId is required' }, { status: 400 })
  }
  if (mode !== 'next' && mode !== 'past') {
    return NextResponse.json({ error: 'mode must be "next" or "past"' }, { status: 400 })
  }

  const endpoint =
    mode === 'next'
      ? `https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${teamId}`
      : `https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=${teamId}`

  try {
    const res = await fetch(endpoint)
    if (!res.ok) throw new Error('upstream error')
    const data = await res.json()
    const events: unknown[] = data.events || data.results || []
    return NextResponse.json(events.slice(0, 5))
  } catch {
    return NextResponse.json({ error: 'fixtures unavailable' }, { status: 502 })
  }
}
