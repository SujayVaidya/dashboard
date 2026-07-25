'use client'

import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { apiFetch } from '@/lib/dashboardUtils'
import type { ChecklistItem } from '@/types/dashboard'

export function useChecklist(user: User | null | undefined, requireAuth: () => boolean) {
  const [checklistData, setChecklistData] = useState<ChecklistItem[]>([])
  const [checkInput, setCheckInput] = useState('')

  useEffect(() => {
    if (user === undefined) return
    if (!user) {
      setChecklistData([])
      return
    }
    apiFetch<ChecklistItem[]>('/api/checklist')
      .then(setChecklistData)
      .catch(() => setChecklistData([]))
  }, [user])

  const addCheckItem = useCallback(async () => {
    if (!requireAuth()) return
    const text = checkInput.trim()
    if (!text) return
    try {
      const created = await apiFetch<ChecklistItem>('/api/checklist', {
        method: 'POST',
        body: JSON.stringify({ text }),
      })
      setChecklistData((prev) => [...prev, created])
      setCheckInput('')
    } catch (e) {
      console.error('add checklist item failed', e)
    }
  }, [checkInput, requireAuth])

  const toggleCheckItem = useCallback(
    async (id: string) => {
      const item = checklistData.find((i) => i._id === id)
      if (!item) return
      try {
        const updated = await apiFetch<ChecklistItem>(`/api/checklist/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ done: !item.done }),
        })
        setChecklistData((prev) => prev.map((i) => (i._id === id ? updated : i)))
      } catch (e) {
        console.error('toggle checklist item failed', e)
      }
    },
    [checklistData],
  )

  const deleteCheckItem = useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/checklist/${id}`, { method: 'DELETE' })
      setChecklistData((prev) => prev.filter((i) => i._id !== id))
    } catch (e) {
      console.error('delete checklist item failed', e)
    }
  }, [])

  const doneCount = checklistData.filter((i) => i.done).length

  return {
    checklistData,
    checkInput,
    setCheckInput,
    addCheckItem,
    toggleCheckItem,
    deleteCheckItem,
    doneCount,
  }
}
