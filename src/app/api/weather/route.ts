import { NextRequest, NextResponse } from 'next/server'
import { WEATHER_CODE_MAP } from '@/lib/weatherCodes'

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get('lat'))
  const lon = Number(request.nextUrl.searchParams.get('lon'))
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 })
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=celsius&timezone=auto`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('upstream error')
    const data = await res.json()
    const code = data.current.weather_code
    const [icon, desc] = WEATHER_CODE_MAP[code] || ['🌡️', '—']
    return NextResponse.json({
      tempC: Math.round(data.current.temperature_2m),
      icon,
      desc,
    })
  } catch {
    return NextResponse.json({ error: 'weather unavailable' }, { status: 502 })
  }
}
