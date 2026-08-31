import { useState } from 'react'
import { X } from 'lucide-react'
import Card from '../components/ui/Card'
import StreakBadge from '../components/ui/StreakBadge'
import WeekStrip from '../components/ui/WeekStrip'
import { punkte, spiele, stimmungscheck } from '../data/mock'

/* Kleines Tacho-Symbol für die Stimmungscheck-Karte (als SVG nachgebaut) */
function TachoSymbol() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden>
      <g fill="none" strokeWidth="7" strokeLinecap="round">
        <path d="M 9 34 A 18 18 0 0 1 17 19" stroke="#E8483F" />
        <path d="M 21 16.5 A 18 18 0 0 1 31 16.5" stroke="#F5A623" />
        <path d="M 35 19 A 18 18 0 0 1 43 34" stroke="#5BB85C" />
      </g>
      {/* Zeiger */}
      <line x1="26" y1="34" x2="15" y2="26" stroke="#C0392B" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="26" cy="34" r="4" fill="#C0392B" />
    </svg>
  )
}

export default function Dashboard() {
  // Sichtbarkeit der Stimmungscheck-Karte (Wegwisch-Animation folgt in Meilenstein 5)
  const [checkSichtbar, setCheckSichtbar] = useState(true)

  return (
    <div className="min-h-full bg-surface pb-32">
      {/* 1. Kopfbereich mit orangem Verlauf, unten stark abgerundet */}
      <header
        className="rounded-b-[44px] px-6 pb-7 pt-14"
        style={{ background: 'var(--grad-header)' }}
      >
        <div className="relative flex items-center justify-center">
          <h1 className="text-[20px] font-bold">Heute</h1>
          <div className="absolute right-0">
            <StreakBadge />
          </div>
        </div>
        <div className="mt-7">
          <WeekStrip />
        </div>
      </header>

      {/* 2. Stimmungscheck-Karte */}
      {checkSichtbar && (
        <Card className="relative mx-6 mt-6 flex items-center gap-4 p-4">
          <TachoSymbol />
          <div className="min-w-0 pr-6">
            <h2 className="text-[16px] font-bold leading-snug">{stimmungscheck.frage}</h2>
            <p className="mt-0.5 text-[13px] leading-snug text-ink-muted">
              {stimmungscheck.erklaerung}
            </p>
          </div>
          <button
            type="button"
            aria-label="Stimmungscheck schließen"
            onClick={() => setCheckSichtbar(false)}
            className="absolute right-4 top-4 text-ink"
          >
            <X size={16} />
          </button>
        </Card>
      )}

      {/* 3. Punktekarte mit sehr großer Zahl */}
      <Card
        className="mx-6 mt-5 flex h-[340px] items-center justify-center"
        style={{ background: 'var(--grad-points)' }}
      >
        <span className="text-[120px] font-black leading-none tracking-tight">{punkte}</span>
      </Card>

      {/* 4. Verfügbare Spiele */}
      <section className="mx-6 mt-8">
        <h2 className="text-[16px] font-bold">Verfügbare Spiele</h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {spiele.map((spiel) => (
            <Card key={spiel.id} className="flex h-36 items-center justify-center">
              <span className="text-[13px] font-semibold text-ink-muted">{spiel.name}</span>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
