'use client'

import { useCallback, useRef, useState } from 'react'
import { PenIcon, TrashIcon } from '@/components/icons'
import { faviconFor, hashHue } from '@/lib/dashboardUtils'
import type { ShortcutItem } from '@/types/dashboard'

export function LinkTile({ item, onEdit, onDelete }: { item: ShortcutItem; onEdit: () => void; onDelete: () => void }) {
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
