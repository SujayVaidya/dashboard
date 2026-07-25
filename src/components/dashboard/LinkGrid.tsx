'use client'

import type { ShortcutItem } from '@/types/dashboard'
import { LinkTile } from './LinkTile'

export function LinkGrid({
  items,
  onEdit,
  onDelete,
  onAdd,
}: {
  items: ShortcutItem[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onAdd: () => void
}) {
  return (
    <div className="linkgrid-wrap">
      <div className="linkgrid">
        {items.map((item) => (
          <LinkTile key={item._id} item={item} onEdit={() => onEdit(item._id)} onDelete={() => onDelete(item._id)} />
        ))}
        <div className="addcard-tile" onClick={onAdd}>
          <div className="addcard">+</div>
          <span className="lbl">Add</span>
        </div>
      </div>
    </div>
  )
}
