'use client'

import { useEffect, useState } from 'react'
import './NukeLoader.css'

const LOAD_DURATION = 1200
const FADE_OUT_DURATION = 500

export function NukeLoader({ onDone }: { onDone: () => void }) {
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setHiding(true), LOAD_DURATION)
    const t2 = setTimeout(onDone, LOAD_DURATION + FADE_OUT_DURATION)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  return (
    <div className={`nuke-loader-overlay${hiding ? ' hiding' : ''}`}>
      <div className="nuke-rig">
        <div className="nuke-console">
          <div className="nuke-grid-bg" />
          <div className="nuke-sweep" />

          <div className="nuke-particle" style={{ left: '8%', animationDelay: '0s' }} />
          <div className="nuke-particle" style={{ left: '22%', animationDelay: '1.1s' }} />
          <div className="nuke-particle" style={{ left: '40%', animationDelay: '2s' }} />
          <div className="nuke-particle" style={{ left: '58%', animationDelay: '0.6s' }} />
          <div className="nuke-particle" style={{ left: '74%', animationDelay: '2.6s' }} />
          <div className="nuke-particle" style={{ left: '88%', animationDelay: '1.7s' }} />

          <div className="nuke-title">☢ NUKERC ☢</div>

          <div className="nuke-trefoil-wrap">
            <div className="nuke-trefoil">
              <div className="nuke-blade b1" />
              <div className="nuke-blade b2" />
              <div className="nuke-blade b3" />
              <div className="nuke-core" />
            </div>
          </div>

          <div className="nuke-status">{hiding ? 'SYSTEM ONLINE' : 'ARMING PAYLOAD...'}</div>
        </div>
      </div>
    </div>
  )
}
