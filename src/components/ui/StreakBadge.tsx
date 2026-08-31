import { serie } from '../../data/mock'

/** Pill-Badge mit Flammen-Symbol und Serien-Zahl (oben rechts im Kopfbereich) */
export default function StreakBadge() {
  return (
    <div className="flex items-center gap-1.5 rounded-pill bg-surface-card px-4 py-2 shadow-card">
      <span aria-hidden className="text-[17px] leading-none">
        🔥
      </span>
      <span className="text-[17px] font-bold leading-none">{serie}</span>
    </div>
  )
}
