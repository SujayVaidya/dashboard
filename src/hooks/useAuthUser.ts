'use client'

import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export function useAuthUser() {
  const supabase = createClient()
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

  const requireAuth = useCallback(() => {
    if (user) return true
    setAuthMode('login')
    setAuthError(null)
    setAuthInfo(null)
    setAuthModalMessage('please login first')
    setAuthModalOpen(true)
    return false
  }, [user])

  const openAuthModal = useCallback(() => {
    setAuthMode('login')
    setAuthError(null)
    setAuthInfo(null)
    setAuthModalMessage(null)
    setAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => setAuthModalOpen(false), [])

  const toggleAuthMode = useCallback(() => {
    setAuthMode((m) => (m === 'login' ? 'signup' : 'login'))
    setAuthError(null)
    setAuthInfo(null)
  }, [])

  const requestLogout = useCallback(() => setLogoutConfirmOpen(true), [])
  const cancelLogout = useCallback(() => setLogoutConfirmOpen(false), [])

  const confirmLogout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setLogoutConfirmOpen(false)
  }, [supabase])

  const handleAuthSubmit = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [authMode, authEmail, authPassword, supabase],
  )

  return {
    user,
    requireAuth,
    authModalOpen,
    authModalMessage,
    authMode,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authError,
    authInfo,
    authLoading,
    openAuthModal,
    closeAuthModal,
    toggleAuthMode,
    handleAuthSubmit,
    logoutConfirmOpen,
    requestLogout,
    cancelLogout,
    confirmLogout,
  }
}
