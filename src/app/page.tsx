'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { LEAGUES } from '@/lib/leagues'
import { DEFAULT_SHORTCUTS } from '@/lib/defaultShortcuts'
import './Home.css'

const DEFAULT_LOCATION = 'Pune, India'
const GUEST_SHORTCUTS: ShortcutItem[] = DEFAULT_SHORTCUTS.map((s) => ({ _id: `guest-${s.name}`, ...s }))

interface ShortcutItem {
  _id: string
  name: string
  siteUrl: string
  iconUrl?: string
}

interface Prefs {
  lat?: number
  lon?: number
  label?: string
}
interface ChecklistItem {
  _id: string
  text: string
  done: boolean
}
interface MatchEvent {
  strHomeTeam: string
  strAwayTeam: string
  intHomeScore: string | null
  intAwayScore: string | null
  dateEvent: string
  strTime: string
}
interface TeamItem {
  idTeam: string
  strTeam: string
}

function storeGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}
function storeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('storage set failed', e)
  }
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) throw new Error(`request failed: ${res.status}`)
  return res.json()
}

function hashHue(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360
  return h
}
function faviconFor(url: string) {
  try {
    const u = new URL(url)
    return 'https://www.google.com/s2/favicons?sz=64&domain=' + u.hostname
  } catch {
    return ''
  }
}
function fmtMatchDate(dateStr: string, timeStr: string) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr + 'T' + (timeStr || '00:00:00'))
    return (
      d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      (timeStr ? ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')
    )
  } catch {
    return dateStr
  }
}

function PenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function LinkTile({ item, onEdit, onDelete }: { item: ShortcutItem; onEdit: () => void; onDelete: () => void }) {
  const iconSrc = item.iconUrl || faviconFor(item.siteUrl)
  return <LinkTileIcon key={iconSrc} item={item} iconSrc={iconSrc} onEdit={onEdit} onDelete={onDelete} />
}

function LinkTileIcon({
  item,
  iconSrc,
  onEdit,
  onDelete,
}: {
  item: ShortcutItem
  iconSrc: string
  onEdit: () => void
  onDelete: () => void
}) {
  const [broken, setBroken] = useState(false)
  const [retryTick, setRetryTick] = useState(0)
  const retriesRef = useRef(0)
  const handleError = useCallback(() => {
    // first fetch of a favicon domain can fail while the connection is cold (fresh DNS/TLS);
    // retry once before giving up and falling back to the letter avatar
    if (retriesRef.current < 1) {
      retriesRef.current += 1
      setTimeout(() => setRetryTick((n) => n + 1), 600)
      return
    }
    setBroken(true)
  }, [])
  return (
    <div className="linkcard-wrap">
      <div className="tile-actions">
        <button
          className="tile-btn edit-btn"
          title="Edit"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onEdit()
          }}
        >
          <PenIcon />
        </button>
        <button
          className="tile-btn del-btn"
          title="Delete"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete()
          }}
        >
          <TrashIcon />
        </button>
      </div>
      <a className="linkcard" href={item.siteUrl} target="_blank" rel="noopener noreferrer">
        <div className={'icon-badge' + (broken ? ' letter' : '')} style={broken ? { background: `hsl(${hashHue(item.name)} 60% 38%)` } : undefined}>
          {broken ? (
            item.name.charAt(0).toUpperCase()
          ) : (
            <img key={retryTick} src={iconSrc} alt="" onError={handleError} />
          )}
        </div>
        <span className="lbl">{item.name}</span>
      </a>
    </div>
  )
}

export default function Home() {
  const supabase = createClient()
  const heroRef = useRef<HTMLDivElement>(null)

  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMessage, setAuthModalMessage] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authInfo, setAuthInfo] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  const [clockTime, setClockTime] = useState('--:--:--')
  const [clockDate, setClockDate] = useState('loading')

  const [linksData, setLinksData] = useState<ShortcutItem[] | null>(null)
  const [addFormOpen, setAddFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [linkName, setLinkName] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkIcon, setLinkIcon] = useState('')
  const [iconUploading, setIconUploading] = useState(false)
  const [iconUploadError, setIconUploadError] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const [tempC, setTempC] = useState<number | null>(null)
  const [wIcon, setWIcon] = useState('⏳')
  const [wDesc, setWDesc] = useState('fetching…')
  const [wCity, setWCity] = useState('set location')
  const [weatherEditOpen, setWeatherEditOpen] = useState(false)
  const [cityInput, setCityInput] = useState('')
  const [prefs, setPrefs] = useState<Prefs>({})

  const [leagueId, setLeagueId] = useState('4328')
  const [teamId, setTeamId] = useState('')
  const [teams, setTeams] = useState<TeamItem[]>([])
  const [footballMode, setFootballMode] = useState<'next' | 'past'>('next')
  const [matches, setMatches] = useState<MatchEvent[] | null>(null)
  const [matchError, setMatchError] = useState(false)

  const [checklistData, setChecklistData] = useState<ChecklistItem[]>([])
  const [checkInput, setCheckInput] = useState('')

  // close modals on escape
  useEffect(() => {
    if (!addFormOpen && deleteConfirmId === null && !authModalOpen && !logoutConfirmOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setAddFormOpen(false)
      setDeleteConfirmId(null)
      setAuthModalOpen(false)
      setLogoutConfirmOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [addFormOpen, deleteConfirmId, authModalOpen, logoutConfirmOpen])

  // clock
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setClockTime(now.toLocaleTimeString([], { hour12: false }))
      setClockDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // auth state
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser(null))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // load location prefs once on mount (not tied to auth)
  useEffect(() => {
    setPrefs(storeGet<Prefs>('dashboard-prefs') || {})
  }, [])

  // shortcuts & checklist: real data once authenticated, guest defaults otherwise
  useEffect(() => {
    if (user === undefined) return

    if (!user) {
      setLinksData(GUEST_SHORTCUTS)
      setChecklistData([])
      return
    }

    apiFetch<ShortcutItem[]>('/api/shortcuts')
      .then(setLinksData)
      .catch(() => setLinksData(GUEST_SHORTCUTS))

    apiFetch<ChecklistItem[]>('/api/checklist')
      .then(setChecklistData)
      .catch(() => setChecklistData([]))
  }, [user])

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

  const fetchFixtures = useCallback(async () => {
    setMatches(null)
    setMatchError(false)
    try {
      const query = teamId ? `teamId=${teamId}` : `leagueId=${leagueId}`
      const events = await apiFetch<MatchEvent[]>(`/api/fixtures?${query}&mode=${footballMode}`)
      setMatches(events)
    } catch {
      setMatchError(true)
    }
  }, [footballMode, leagueId, teamId])

  useEffect(() => {
    fetchFixtures()
  }, [fetchFixtures])

  // load teams for the selected league, reset team filter on league change
  useEffect(() => {
    setTeamId('')
    setTeams([])
    apiFetch<TeamItem[]>(`/api/teams?leagueId=${leagueId}`)
      .then(setTeams)
      .catch(() => setTeams([]))
  }, [leagueId])

  // link tile tilt
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return
    const onMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const card = target.closest ? (target.closest('.linkcard') as HTMLElement | null) : null
      if (!card) return
      const badge = card.querySelector<HTMLElement>('.icon-badge')
      const r = card.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      if (badge) badge.style.transform = `perspective(300px) rotateX(${(-py * 10).toFixed(1)}deg) rotateY(${(px * 10).toFixed(1)}deg) translateY(-2px)`
    }
    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const card = target.closest ? (target.closest('.linkcard') as HTMLElement | null) : null
      const badge = card ? card.querySelector<HTMLElement>('.icon-badge') : null
      if (badge) badge.style.transform = ''
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseout', onOut)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  const renderTemp = () => {
    if (tempC === null) return '--°'
    return `${tempC}°C`
  }

  const requireAuth = () => {
    if (user) return true
    setAuthMode('login')
    setAuthError(null)
    setAuthInfo(null)
    setAuthModalMessage('please login first')
    setAuthModalOpen(true)
    return false
  }

  const handleSaveLink = async () => {
    const name = linkName.trim()
    let siteUrl = linkUrl.trim()
    let iconUrl = linkIcon.trim()
    if (!name || !siteUrl || !linksData) return
    if (!/^https?:\/\//i.test(siteUrl)) siteUrl = 'https://' + siteUrl
    if (iconUrl && !/^https?:\/\//i.test(iconUrl)) iconUrl = 'https://' + iconUrl

    try {
      if (editId === null) {
        const created = await apiFetch<ShortcutItem>('/api/shortcuts', {
          method: 'POST',
          body: JSON.stringify({ name, siteUrl, iconUrl: iconUrl || undefined }),
        })
        setLinksData([...linksData, created])
      } else {
        const updated = await apiFetch<ShortcutItem>(`/api/shortcuts/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({ name, siteUrl, iconUrl: iconUrl || undefined }),
        })
        setLinksData(linksData.map((item) => (item._id === editId ? updated : item)))
      }
    } catch (e) {
      console.error('save shortcut failed', e)
    }

    setLinkName('')
    setLinkUrl('')
    setLinkIcon('')
    setIconUploadError(null)
    setEditId(null)
    setAddFormOpen(false)
  }

  const handleEditLink = (id: string) => {
    if (!requireAuth()) return
    if (!linksData) return
    const item = linksData.find((l) => l._id === id)
    if (!item) return
    setEditId(id)
    setLinkName(item.name)
    setLinkUrl(item.siteUrl)
    setLinkIcon(item.iconUrl || '')
    setAddFormOpen(true)
  }

  const handleCancelForm = () => {
    setAddFormOpen(false)
    setEditId(null)
    setLinkIcon('')
    setLinkName('')
    setLinkUrl('')
    setIconUploadError(null)
  }

  const handleIconFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setIconUploadError(null)
    setIconUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/upload-icon', { method: 'POST', body })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || `upload failed: ${res.status}`)
      }
      const { url } = (await res.json()) as { url: string }
      setLinkIcon(url)
    } catch (err) {
      console.error('icon upload failed', err)
      setIconUploadError(err instanceof Error ? err.message : 'upload failed')
    } finally {
      setIconUploading(false)
    }
  }

  const requestDeleteLink = (id: string) => {
    if (!requireAuth()) return
    setDeleteConfirmId(id)
  }

  const cancelDeleteLink = () => {
    setDeleteConfirmId(null)
  }

  const confirmDeleteLink = async () => {
    if (!linksData || deleteConfirmId === null) return
    const id = deleteConfirmId
    try {
      await apiFetch(`/api/shortcuts/${id}`, { method: 'DELETE' })
      setLinksData(linksData.filter((item) => item._id !== id))
    } catch (e) {
      console.error('delete shortcut failed', e)
    }
    setDeleteConfirmId(null)
    if (editId === id) handleCancelForm()
  }

  const handleCitySave = async () => {
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
  }

  const handleRefresh = () => {
    if (prefs.lat != null && prefs.lon != null) {
      fetchWeather(prefs.lat, prefs.lon, prefs.label || 'saved location')
    }
    fetchFixtures()
  }

  const openAuthModal = () => {
    setAuthMode('login')
    setAuthError(null)
    setAuthInfo(null)
    setAuthModalMessage(null)
    setAuthModalOpen(true)
  }

  const requestLogout = () => {
    setLogoutConfirmOpen(true)
  }

  const cancelLogout = () => {
    setLogoutConfirmOpen(false)
  }

  const confirmLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setLinksData(null)
    setChecklistData([])
    setLogoutConfirmOpen(false)
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthInfo(null)
    setAuthLoading(true)

    if (authMode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
      setAuthLoading(false)
      if (error) {
        setAuthError(error.message)
        return
      }
      setUser(data.user)
      setAuthPassword('')
      setAuthModalOpen(false)
    } else {
      const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword })
      setAuthLoading(false)
      if (error) {
        setAuthError(error.message)
        return
      }
      setAuthInfo('Check your email to confirm your account, then log in.')
    }
  }

  const addCheckItem = async () => {
    if (!requireAuth()) return
    const text = checkInput.trim()
    if (!text) return
    try {
      const created = await apiFetch<ChecklistItem>('/api/checklist', {
        method: 'POST',
        body: JSON.stringify({ text }),
      })
      setChecklistData([...checklistData, created])
      setCheckInput('')
    } catch (e) {
      console.error('add checklist item failed', e)
    }
  }
  const toggleCheckItem = async (id: string) => {
    const item = checklistData.find((i) => i._id === id)
    if (!item) return
    try {
      const updated = await apiFetch<ChecklistItem>(`/api/checklist/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ done: !item.done }),
      })
      setChecklistData(checklistData.map((i) => (i._id === id ? updated : i)))
    } catch (e) {
      console.error('toggle checklist item failed', e)
    }
  }
  const deleteCheckItem = async (id: string) => {
    try {
      await apiFetch(`/api/checklist/${id}`, { method: 'DELETE' })
      setChecklistData(checklistData.filter((i) => i._id !== id))
    } catch (e) {
      console.error('delete checklist item failed', e)
    }
  }

  const doneCount = checklistData.filter((i) => i.done).length

  return (
    <div className="home-root">
      {authModalOpen && (
        <div className="modal-overlay" onClick={() => setAuthModalOpen(false)}>
          <form className="modal auth-modal" onSubmit={handleAuthSubmit} onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{authMode === 'login' ? 'Log in' : 'Sign up'}</div>
            {authModalMessage && <div className="auth-modal-message">{authModalMessage}</div>}
            <div className="modal-form">
              <input
                type="email"
                placeholder="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                autoFocus
                required
              />
              <input
                type="password"
                placeholder="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            {authError && <div className="auth-error">{authError}</div>}
            {authInfo && <div className="auth-info">{authInfo}</div>}
            <div className="modal-actions auth-modal-actions">
              <button
                type="button"
                className="cancel auth-switch"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login')
                  setAuthError(null)
                  setAuthInfo(null)
                }}
              >
                {authMode === 'login' ? "don't have an account? sign up" : 'already have an account? log in'}
              </button>
              <button type="submit" disabled={authLoading}>
                {authLoading ? 'please wait…' : authMode === 'login' ? 'log in' : 'sign up'}
              </button>
            </div>
          </form>
        </div>
      )}

      {logoutConfirmOpen && (
        <div className="modal-overlay" onClick={cancelLogout}>
          <div className="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Log out?</div>
            <p className="modal-text">You'll need to log back in to manage your shortcuts and tasks.</p>
            <div className="modal-actions">
              <button className="cancel" onClick={cancelLogout}>
                cancel
              </button>
              <button className="danger" onClick={confirmLogout}>
                log out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="hero">
        <div className="bg-layer l-gradient" />
        <div className="bg-layer l-grain" />
        <div className="bg-layer l-halo" />
        <div className="bg-layer l-vignette" />

        <div className="hero-content">
          <div className="topbar">
            <div className="brand">
              <div className="brand-mark">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#210a0d" />
                </svg>
              </div>
              <h1 className="brand-name">NukeRC</h1>
            </div>

            <div className="readouts">
              <div className="chip">
                <span className="chip-icon">🕐</span>
                <span>{clockTime}</span>
                <span className="chip-sep">·</span>
                <span className="chip-muted">{clockDate}</span>
              </div>
              <div className="chip">
                <span className="chip-icon">{wIcon}</span>
                <span>{renderTemp()}</span>
                <span className="chip-sep">·</span>
                <span className="chip-muted">{wDesc}</span>
                <span className="chip-sep">·</span>
                <span className="chip-city" onClick={() => requireAuth() && setWeatherEditOpen(true)}>
                  {wCity}
                </span>
                <div className={'weather-edit' + (weatherEditOpen ? ' active' : '')}>
                  <input
                    type="text"
                    placeholder="city name"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCitySave()}
                  />
                  <button onClick={handleCitySave}>save</button>
                  <button className="cancel" onClick={() => setWeatherEditOpen(false)}>
                    x
                  </button>
                </div>
              </div>
            </div>

            <div className="top-actions">
              <button className="icon-btn" title="refresh weather & fixtures" onClick={handleRefresh}>
                ⟳
              </button>
              {user ? (
                <button className="icon-btn" title="log out" onClick={requestLogout}>
                  ⏻
                </button>
              ) : user === null ? (
                <button className="login-btn" onClick={openAuthModal}>
                  Log in
                </button>
              ) : null}
            </div>
          </div>

          <div className="content-row">
            <div className="content-left">
              <div className="linkgrid-wrap">
                <div className="linkgrid">
                  {(linksData || []).map((item) => (
                    <LinkTile key={item._id} item={item} onEdit={() => handleEditLink(item._id)} onDelete={() => requestDeleteLink(item._id)} />
                  ))}
                  <div
                    className="addcard-tile"
                    onClick={() => {
                      if (!requireAuth()) return
                      setEditId(null)
                      setAddFormOpen(true)
                    }}
                  >
                    <div className="addcard">+</div>
                    <span className="lbl">Add</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="content-right">
              <div className="panel">
                <div className="panel-head">
                  <div className="panel-title">
                    Football <span className="sub">next 5 fixtures &amp; results</span>
                  </div>
                </div>
                <div className="panel-body">
                  <div className="football-controls">
                    <select value={leagueId} onChange={(e) => setLeagueId(e.target.value)}>
                      {LEAGUES.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                    <select value={teamId} onChange={(e) => setTeamId(e.target.value)} disabled={teams.length === 0}>
                      <option value="">All teams</option>
                      {teams.map((t) => (
                        <option key={t.idTeam} value={t.idTeam}>
                          {t.strTeam}
                        </option>
                      ))}
                    </select>
                    <div className="toggle-group">
                      <button className={'toggle-btn' + (footballMode === 'next' ? ' active' : '')} onClick={() => setFootballMode('next')}>
                        upcoming
                      </button>
                      <button className={'toggle-btn' + (footballMode === 'past' ? ' active' : '')} onClick={() => setFootballMode('past')}>
                        results
                      </button>
                    </div>
                  </div>
                  <div className="matchlist">
                    {matchError ? (
                      <div className="error-note">could not load fixtures — check your connection.</div>
                    ) : matches === null ? (
                      <div className="empty-note">loading fixtures…</div>
                    ) : matches.length === 0 ? (
                      <div className="empty-note">no fixtures found right now.</div>
                    ) : (
                      matches.map((ev, i) => (
                        <div className="match" key={i}>
                          <div className="teams">
                            <span>{ev.strHomeTeam}</span>
                            <span>{ev.strAwayTeam}</span>
                          </div>
                          {footballMode === 'past' && ev.intHomeScore !== null && ev.intAwayScore !== null ? (
                            <div className="score">
                              {ev.intHomeScore} – {ev.intAwayScore}
                            </div>
                          ) : (
                            <div className="meta">{fmtMatchDate(ev.dateEvent, ev.strTime)}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <div className="panel-title">
                    Checklist <span className="sub">today's tasks</span>
                  </div>
                </div>
                <div className="panel-body">
                  <div className="checklist-progress">
                    {doneCount}/{checklistData.length} done
                  </div>
                  <div className="checklist">
                    {checklistData.map((item) => (
                      <div className={'check-item' + (item.done ? ' done' : '')} key={item._id}>
                        <input type="checkbox" id={`chk-${item._id}`} checked={item.done} onChange={() => toggleCheckItem(item._id)} />
                        <label htmlFor={`chk-${item._id}`}>{item.text}</label>
                        <button className="del-btn" onClick={() => deleteCheckItem(item._id)}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="checkform">
                    <input
                      type="text"
                      placeholder="add a task and press enter"
                      value={checkInput}
                      onChange={(e) => setCheckInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCheckItem()}
                    />
                    <button onClick={addCheckItem}>add</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {addFormOpen && (
        <div className="modal-overlay" onClick={handleCancelForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{editId === null ? 'Add shortcut' : 'Edit shortcut'}</div>
            <div className="modal-form">
              <input id="linkName" type="text" placeholder="name" value={linkName} onChange={(e) => setLinkName(e.target.value)} autoFocus />
              <input type="text" placeholder="https://…" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
              <input type="text" placeholder="icon image url (optional)" value={linkIcon} onChange={(e) => setLinkIcon(e.target.value)} />
              <label className="icon-upload-row">
                <span>{iconUploading ? 'uploading…' : 'or upload an image'}</span>
                <input type="file" accept="image/*" onChange={handleIconFileChange} disabled={iconUploading} />
              </label>
              {iconUploadError && <p className="icon-upload-error">{iconUploadError}</p>}
              {linkIcon && !iconUploading && (
                <div className="icon-upload-preview">
                  <img src={linkIcon} alt="icon preview" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="cancel" onClick={handleCancelForm}>
                cancel
              </button>
              <button onClick={handleSaveLink}>{editId === null ? 'add' : 'save'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId !== null && linksData && linksData.find((l) => l._id === deleteConfirmId) && (
        <div className="modal-overlay" onClick={cancelDeleteLink}>
          <div className="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Delete shortcut?</div>
            <p className="modal-text">
              Remove <strong>{linksData.find((l) => l._id === deleteConfirmId)?.name}</strong> from your dashboard? This can't be undone.
            </p>
            <div className="modal-actions">
              <button className="cancel" onClick={cancelDeleteLink}>
                cancel
              </button>
              <button className="danger" onClick={confirmDeleteLink}>
                delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="footnote">made by nukerc</div>
    </div>
  )
}
