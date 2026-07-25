'use client'

export function ShortcutFormModal({
  open,
  isEditing,
  name,
  onNameChange,
  url,
  onUrlChange,
  icon,
  onIconChange,
  iconUploading,
  iconUploadError,
  onIconFileChange,
  onCancel,
  onSave,
}: {
  open: boolean
  isEditing: boolean
  name: string
  onNameChange: (value: string) => void
  url: string
  onUrlChange: (value: string) => void
  icon: string
  onIconChange: (value: string) => void
  iconUploading: boolean
  iconUploadError: string | null
  onIconFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCancel: () => void
  onSave: () => void
}) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{isEditing ? 'Edit shortcut' : 'Add shortcut'}</div>
        <div className="modal-form">
          <input id="linkName" type="text" placeholder="name" value={name} onChange={(e) => onNameChange(e.target.value)} autoFocus />
          <input type="text" placeholder="https://…" value={url} onChange={(e) => onUrlChange(e.target.value)} />
          <input type="text" placeholder="icon image url (optional)" value={icon} onChange={(e) => onIconChange(e.target.value)} />
          <label className="icon-upload-row">
            <span>{iconUploading ? 'uploading…' : 'or upload an image'}</span>
            <input type="file" accept="image/*" onChange={onIconFileChange} disabled={iconUploading} />
          </label>
          {iconUploadError && <p className="icon-upload-error">{iconUploadError}</p>}
          {icon && !iconUploading && (
            <div className="icon-upload-preview">
              <img src={icon} alt="icon preview" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button className="cancel" onClick={onCancel}>
            cancel
          </button>
          <button onClick={onSave}>{isEditing ? 'save' : 'add'}</button>
        </div>
      </div>
    </div>
  )
}
