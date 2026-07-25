'use client'

type SportsDbEvent = {
  strEvent: string
  strHomeTeam: string
  strAwayTeam: string
  intHomeScore: string | null
  intAwayScore: string | null
  dateEvent: string
  strTimeLocal: string
  strLeague: string
}

function opponentOf(match: SportsDbEvent) {
  return match.strHomeTeam.includes('Manchester United') ? match.strAwayTeam : match.strHomeTeam
}

function isHome(match: SportsDbEvent) {
  return match.strHomeTeam.includes('Manchester United')
}

function formatDate(dateEvent: string) {
  const d = new Date(dateEvent)
  if (Number.isNaN(d.getTime())) return dateEvent
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function resultBadge(match: SportsDbEvent) {
  const home = Number(match.intHomeScore)
  const away = Number(match.intAwayScore)
  if (Number.isNaN(home) || Number.isNaN(away)) return null
  const manScore = isHome(match) ? home : away
  const oppScore = isHome(match) ? away : home
  if (manScore > oppScore) return { letter: 'W', className: 'result-win' }
  if (manScore < oppScore) return { letter: 'L', className: 'result-loss' }
  return { letter: 'D', className: 'result-draw' }
}

export function MatchPill({ nextMatch, lastMatch, loading }: { nextMatch: SportsDbEvent | null; lastMatch: SportsDbEvent | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="header-pill match-pill">
        <div className="pill-seg pill-match">
          <span className="pill-sub">loading man utd fixtures…</span>
        </div>
      </div>
    )
  }

  if (!nextMatch && !lastMatch) return null

  const result = lastMatch ? resultBadge(lastMatch) : null

  return (
    <div className="header-pill match-pill">
      {nextMatch && (
        <div className="pill-seg pill-match">
          <img src="/man-utd-logo.svg" alt="Manchester United" className="pill-icon pill-icon-logo" />
          <div className="pill-match-text">
            <span className="pill-primary">vs {opponentOf(nextMatch)}</span>
            <span className="pill-sub">
              next · {formatDate(nextMatch.dateEvent)} {nextMatch.strTimeLocal?.slice(0, 5)}
            </span>
          </div>
        </div>
      )}

      {lastMatch && nextMatch && <div className="pill-divider" />}

      {lastMatch && (
        <div className="pill-seg pill-match">
          {result && <span className={`pill-result-badge ${result.className}`}>{result.letter}</span>}
          <div className="pill-match-text">
            <span className="pill-primary">
              {isHome(lastMatch) ? lastMatch.intHomeScore : lastMatch.intAwayScore}-
              {isHome(lastMatch) ? lastMatch.intAwayScore : lastMatch.intHomeScore} vs {opponentOf(lastMatch)}
            </span>
            <span className="pill-sub">last match · {formatDate(lastMatch.dateEvent)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
