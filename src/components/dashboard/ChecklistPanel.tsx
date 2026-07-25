'use client'

import type { ChecklistItem } from '@/types/dashboard'

export function ChecklistPanel({
  items,
  doneCount,
  checkInput,
  onCheckInputChange,
  onAdd,
  onToggle,
  onDelete,
}: {
  items: ChecklistItem[]
  doneCount: number
  checkInput: string
  onCheckInputChange: (value: string) => void
  onAdd: () => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title">
          Checklist <span className="sub">today's tasks</span>
        </div>
      </div>
      <div className="panel-body">
        <div className="checklist-progress">
          {doneCount}/{items.length} done
        </div>
        <div className="checklist">
          {items.map((item) => (
            <div className={'check-item' + (item.done ? ' done' : '')} key={item._id}>
              <input type="checkbox" id={`chk-${item._id}`} checked={item.done} onChange={() => onToggle(item._id)} />
              <label htmlFor={`chk-${item._id}`}>{item.text}</label>
              <button className="del-btn" onClick={() => onDelete(item._id)}>
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
            onChange={(e) => onCheckInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAdd()}
          />
          <button onClick={onAdd}>add</button>
        </div>
      </div>
    </div>
  )
}
