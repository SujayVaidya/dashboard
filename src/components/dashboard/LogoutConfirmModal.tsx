'use client'

export function LogoutConfirmModal({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Log out?</div>
        <p className="modal-text">You'll need to log back in to manage your shortcuts and tasks.</p>
        <div className="modal-actions">
          <button className="cancel" onClick={onCancel}>
            cancel
          </button>
          <button className="danger" onClick={onConfirm}>
            log out
          </button>
        </div>
      </div>
    </div>
  )
}
