import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name')?.trim()
  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const url = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(name) + '&count=1'

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('upstream error')
    const data = await res.json()
    if (data.results && data.results.length) {
      const r = data.results[0]
      return NextResponse.json({ lat: r.latitude, lon: r.longitude, label: r.name + (r.country ? ', ' + r.country : '') })
    }
    return NextResponse.json({ error: 'city not found' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'geocoding unavailable' }, { status: 502 })
  }
}
