import { NextRequest, NextResponse } from 'next/server'
import { LEAGUES } from '@/lib/leagues'

export async function GET(request: NextRequest) {
  const leagueId = request.nextUrl.searchParams.get('leagueId')
  const league = LEAGUES.find((l) => l.id === leagueId)

  if (!league) {
    return NextResponse.json({ error: 'invalid leagueId' }, { status: 400 })
  }

  try {
    const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=${encodeURIComponent(league.apiName)}`)
    if (!res.ok) throw new Error('upstream error')
    const data = await res.json()
    const teams = (data.teams || [])
      .map((t: { idTeam: string; strTeam: string }) => ({ idTeam: t.idTeam, strTeam: t.strTeam }))
      .sort((a: { strTeam: string }, b: { strTeam: string }) => a.strTeam.localeCompare(b.strTeam))
    return NextResponse.json(teams)
  } catch {
    return NextResponse.json({ error: 'teams unavailable' }, { status: 502 })
  }
}
