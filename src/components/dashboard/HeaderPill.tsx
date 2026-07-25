'use client'

import type { User } from '@supabase/supabase-js'
import { LoginIcon } from '@/components/icons'

export function HeaderPill({
  time,
  date,
  weekday,
  wCity,
  onLocationClick,
  weatherEditOpen,
  cityInput,
  onCityInputChange,
  onCitySave,
  onWeatherEditCancel,
  wIcon,
  tempC,
  wDesc,
  onRefresh,
  user,
  onLogout,
  onLogin,
}: {
  time: string
  date: string
  weekday: string
  wCity: string
  onLocationClick: () => void
  weatherEditOpen: boolean
  cityInput: string
  onCityInputChange: (value: string) => void
  onCitySave: () => void
  onWeatherEditCancel: () => void
  wIcon: string
  tempC: number | null
  wDesc: string
  onRefresh: () => void
  user: User | null | undefined
  onLogout: () => void
  onLogin: () => void
}) {
  return (
    <div className="header-pill">
      <div className="pill-seg pill-time">
        <span className="pill-primary">{time}</span>
        <span className="pill-sep">|</span>
        <span className="pill-primary">{date}</span>
        <span className="pill-sub">{weekday}</span>
      </div>

      <div className="pill-divider" />

      <div className="pill-seg pill-location">
        <span className="pill-sub pill-location-label" onClick={onLocationClick}>
          {wCity}
        </span>
        <div className={'weather-edit' + (weatherEditOpen ? ' active' : '')}>
          <input
            type="text"
            placeholder="city name"
            value={cityInput}
            onChange={(e) => onCityInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onCitySave()}
          />
          <button onClick={onCitySave}>save</button>
          <button className="cancel" onClick={onWeatherEditCancel}>
            x
          </button>
        </div>
      </div>

      <div className="pill-divider" />

      <div className="pill-seg pill-weather">
        <span className="pill-icon">{wIcon}</span>
        <span className="pill-primary">{tempC === null ? '--°' : `${tempC}°C`}</span>
        <span className="pill-sub">{wDesc}</span>
      </div>

      <div className="pill-divider" />

      <button className="pill-action-btn" title="refresh weather" onClick={onRefresh}>
        ⟳
      </button>

      {user ? (
        <button className="pill-action-btn" title="log out" onClick={onLogout}>
          ⏻
        </button>
      ) : user === null ? (
        <button className="pill-action-btn" title="log in" onClick={onLogin}>
          <LoginIcon />
        </button>
      ) : null}
    </div>
  )
}
