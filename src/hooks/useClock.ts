'use client'

import { useEffect, useState } from 'react'

export function useClock() {
  const [time, setTime] = useState('--:--')
  const [date, setDate] = useState('')
  const [weekday, setWeekday] = useState('loading')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }))
      setDate(now.toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase())
      setWeekday(now.toLocaleDateString([], { weekday: 'long' }).toUpperCase())
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return { time, date, weekday }
}
