'use client'

export function Brand({ logoSrc }: { logoSrc: string }) {
  return (
    <div className="brand">
      <div className="brand-mark">
        <img src={logoSrc} alt="NukeRC" />
      </div>
    </div>
  )
}
