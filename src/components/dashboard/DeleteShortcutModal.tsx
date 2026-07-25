'use client'

import type { ShortcutItem } from '@/types/dashboard'

export function DeleteShortcutModal({
  item,
  onCancel,
  onConfirm,
}: {
  item: ShortcutItem | null
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!item) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Delete shortcut?</div>
        <p className="modal-text">
          Remove <strong>{item.name}</strong> from your dashboard? This can't be undone.
        </p>
        <div className="modal-actions">
          <button className="cancel" onClick={onCancel}>
            cancel
          </button>
          <button className="danger" onClick={onConfirm}>
            delete
          </button>
        </div>
      </div>
    </div>
  )
}
