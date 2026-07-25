'use client'

export function AuthModal({
  open,
  message,
  mode,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  error,
  info,
  loading,
  onSubmit,
  onToggleMode,
  onClose,
}: {
  open: boolean
  message: string | null
  mode: 'login' | 'signup'
  email: string
  onEmailChange: (value: string) => void
  password: string
  onPasswordChange: (value: string) => void
  error: string | null
  info: string | null
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onToggleMode: () => void
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal auth-modal" onSubmit={onSubmit} onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{mode === 'login' ? 'Log in' : 'Sign up'}</div>
        {message && <div className="auth-modal-message">{message}</div>}
        <div className="modal-form">
          <input type="email" placeholder="email" value={email} onChange={(e) => onEmailChange(e.target.value)} autoFocus required />
          <input type="password" placeholder="password" value={password} onChange={(e) => onPasswordChange(e.target.value)} minLength={6} required />
        </div>
        {error && <div className="auth-error">{error}</div>}
        {info && <div className="auth-info">{info}</div>}
        <div className="modal-actions auth-modal-actions">
          <button type="button" className="cancel auth-switch" onClick={onToggleMode}>
            {mode === 'login' ? "don't have an account? sign up" : 'already have an account? log in'}
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'please wait…' : mode === 'login' ? 'log in' : 'sign up'}
          </button>
        </div>
      </form>
    </div>
  )
}
