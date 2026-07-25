'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/dashboardUtils'

const MANU_TEAM_ID = '133612'

type SportsDbEvent = {
  strEvent: string
  strHomeTeam: string
  strAwayTeam: string
  intHomeScore: string | null
  intAwayScore: string | null
  dateEvent: string
  strTimeLocal: string
  strLeague: string
}

export function useManUtdMatch() {
  const [nextMatch, setNextMatch] = useState<SportsDbEvent | null>(null)
  const [lastMatch, setLastMatch] = useState<SportsDbEvent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [next, past] = await Promise.all([
          apiFetch<SportsDbEvent[]>(`/api/fixtures?teamId=${MANU_TEAM_ID}&mode=next`),
          apiFetch<SportsDbEvent[]>(`/api/fixtures?teamId=${MANU_TEAM_ID}&mode=past`),
        ])
        if (cancelled) return
        setNextMatch(next?.[0] ?? null)
        setLastMatch(past?.[0] ?? null)
      } catch {
        if (!cancelled) {
          setNextMatch(null)
          setLastMatch(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { nextMatch, lastMatch, loading }
}
