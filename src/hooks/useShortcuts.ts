'use client'

import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { DEFAULT_SHORTCUTS } from '@/lib/defaultShortcuts'
import { apiFetch } from '@/lib/dashboardUtils'
import type { ShortcutItem } from '@/types/dashboard'

const GUEST_SHORTCUTS: ShortcutItem[] = DEFAULT_SHORTCUTS.map((s) => ({ _id: `guest-${s.name}`, ...s }))

export function useShortcuts(user: User | null | undefined, requireAuth: () => boolean) {
  const [linksData, setLinksData] = useState<ShortcutItem[] | null>(null)
  const [addFormOpen, setAddFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [linkName, setLinkName] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkIcon, setLinkIcon] = useState('')
  const [iconUploading, setIconUploading] = useState(false)
  const [iconUploadError, setIconUploadError] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    if (user === undefined) return
    if (!user) {
      setLinksData(GUEST_SHORTCUTS)
      return
    }
    apiFetch<ShortcutItem[]>('/api/shortcuts')
      .then(setLinksData)
      .catch(() => setLinksData(GUEST_SHORTCUTS))
  }, [user])

  const openAddForm = useCallback(() => {
    if (!requireAuth()) return
    setEditId(null)
    setAddFormOpen(true)
  }, [requireAuth])

  const handleEditLink = useCallback(
    (id: string) => {
      if (!requireAuth()) return
      if (!linksData) return
      const item = linksData.find((l) => l._id === id)
      if (!item) return
      setEditId(id)
      setLinkName(item.name)
      setLinkUrl(item.siteUrl)
      setLinkIcon(item.iconUrl || '')
      setAddFormOpen(true)
    },
    [linksData, requireAuth],
  )

  const handleCancelForm = useCallback(() => {
    setAddFormOpen(false)
    setEditId(null)
    setLinkIcon('')
    setLinkName('')
    setLinkUrl('')
    setIconUploadError(null)
  }, [])

  const handleSaveLink = useCallback(async () => {
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
  }, [linkName, linkUrl, linkIcon, linksData, editId])

  const handleIconFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [])

  const requestDeleteLink = useCallback(
    (id: string) => {
      if (!requireAuth()) return
      setDeleteConfirmId(id)
    },
    [requireAuth],
  )

  const cancelDeleteLink = useCallback(() => setDeleteConfirmId(null), [])

  const confirmDeleteLink = useCallback(async () => {
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
  }, [linksData, deleteConfirmId, editId, handleCancelForm])

  return {
    linksData,
    addFormOpen,
    editId,
    linkName,
    setLinkName,
    linkUrl,
    setLinkUrl,
    linkIcon,
    setLinkIcon,
    iconUploading,
    iconUploadError,
    deleteConfirmId,
    openAddForm,
    handleEditLink,
    handleCancelForm,
    handleSaveLink,
    handleIconFileChange,
    requestDeleteLink,
    cancelDeleteLink,
    confirmDeleteLink,
  }
}
