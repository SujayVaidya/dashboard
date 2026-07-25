'use client'

import { useEffect } from 'react'

export function useTileTilt() {
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
}
