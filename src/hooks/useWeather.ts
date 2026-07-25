'use client'

import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { apiFetch, storeGet, storeSet } from '@/lib/dashboardUtils'
import type { Prefs } from '@/types/dashboard'

const DEFAULT_LOCATION = 'Pune, India'

export function useWeather(user: User | null | undefined) {
  const [tempC, setTempC] = useState<number | null>(null)
  const [wIcon, setWIcon] = useState('⏳')
  const [wDesc, setWDesc] = useState('fetching…')
  const [wCity, setWCity] = useState('set location')
  const [weatherEditOpen, setWeatherEditOpen] = useState(false)
  const [cityInput, setCityInput] = useState('')
  const [prefs, setPrefs] = useState<Prefs>({})

  useEffect(() => {
    setPrefs(storeGet<Prefs>('dashboard-prefs') || {})
  }, [])

  const fetchWeather = useCallback(async (lat: number, lon: number, label: string) => {
    setWDesc('fetching…')
    try {
      const data = await apiFetch<{ tempC: number; icon: string; desc: string }>(`/api/weather?lat=${lat}&lon=${lon}`)
      setWIcon(data.icon)
      setTempC(data.tempC)
      setWDesc(data.desc)
      setWCity(label)
    } catch {
      setWDesc('unavailable')
      setWIcon('⚠️')
    }
  }, [])

  const geocodeCity = useCallback(async (name: string) => {
    try {
      return await apiFetch<{ lat: number; lon: number; label: string }>(`/api/geocode?name=${encodeURIComponent(name)}`)
    } catch {
      return null
    }
  }, [])

  // initial weather
  useEffect(() => {
    if (user === undefined) return

    // guests always default to Pune, India — no geolocation prompt, no saved prefs
    if (!user) {
      geocodeCity(DEFAULT_LOCATION).then((g) => {
        if (g) fetchWeather(g.lat, g.lon, g.label)
      })
      return
    }

    if (prefs.lat != null && prefs.lon != null) {
      fetchWeather(prefs.lat, prefs.lon, prefs.label || 'saved location')
      return
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lon = pos.coords.longitude
          fetchWeather(lat, lon, 'current location')
          const next = { ...prefs, lat, lon, label: 'current location' }
          setPrefs(next)
          storeSet('dashboard-prefs', next)
        },
        async () => {
          const g = await geocodeCity(DEFAULT_LOCATION)
          if (g) fetchWeather(g.lat, g.lon, g.label)
        },
        { timeout: 5000 },
      )
    } else {
      geocodeCity(DEFAULT_LOCATION).then((g) => {
        if (g) fetchWeather(g.lat, g.lon, g.label)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleCitySave = useCallback(async () => {
    const name = cityInput.trim()
    if (!name) return
    const g = await geocodeCity(name)
    if (g) {
      fetchWeather(g.lat, g.lon, g.label)
      const next = { ...prefs, lat: g.lat, lon: g.lon, label: g.label }
      setPrefs(next)
      storeSet('dashboard-prefs', next)
    } else {
      setWDesc('city not found')
    }
    setWeatherEditOpen(false)
    setCityInput('')
  }, [cityInput, prefs, geocodeCity, fetchWeather])

  const handleRefresh = useCallback(() => {
    if (prefs.lat != null && prefs.lon != null) {
      fetchWeather(prefs.lat, prefs.lon, prefs.label || 'saved location')
    } else {
      geocodeCity(DEFAULT_LOCATION).then((g) => {
        if (g) fetchWeather(g.lat, g.lon, g.label)
      })
    }
  }, [prefs, fetchWeather, geocodeCity])

  return {
    tempC,
    wIcon,
    wDesc,
    wCity,
    weatherEditOpen,
    setWeatherEditOpen,
    cityInput,
    setCityInput,
    handleCitySave,
    handleRefresh,
  }
}
