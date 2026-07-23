import { NextRequest, NextResponse } from 'next/server'
import { LEAGUES } from '@/lib/leagues'

export async function GET(request: NextRequest) {
  const leagueId = request.nextUrl.searchParams.get('leagueId')
  const teamId = request.nextUrl.searchParams.get('teamId')
  const mode = request.nextUrl.searchParams.get('mode')

  if (!teamId && (!leagueId || !LEAGUES.some((l) => l.id === leagueId))) {
    return NextResponse.json({ error: 'invalid leagueId' }, { status: 400 })
  }
  if (mode !== 'next' && mode !== 'past') {
    return NextResponse.json({ error: 'mode must be "next" or "past"' }, { status: 400 })
  }

  const endpoint = teamId
    ? mode === 'next'
      ? `https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${teamId}`
      : `https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=${teamId}`
    : mode === 'next'
      ? `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${leagueId}`
      : `https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=${leagueId}`

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
