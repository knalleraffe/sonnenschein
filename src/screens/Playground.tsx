import { useState } from 'react'
import Sonnenschein from '../components/avatar/Sonnenschein'
import { emotionListe, type Emotion } from '../components/avatar/emotions'

/*
  Testseite (nur zum Ausprobieren, kein schönes Layout):
  alle Stimmungen per Knopfdruck, dazu ein Regler für die Vitalität.
*/
export default function Playground() {
  const [emotion, setEmotion] = useState<Emotion>('froehlich')
  const [vitality, setVitality] = useState(1)

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--grad-avatar)' }}>
      <div className="z-10 flex flex-wrap gap-2 p-4">
        {emotionListe.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setEmotion(e.id)}
            className={`rounded-pill border border-ink/20 px-3 py-1.5 text-[13px] font-semibold ${
              emotion === e.id ? 'bg-ink text-white' : 'bg-surface-card'
            }`}
          >
            {e.label}
          </button>
        ))}
        <label className="flex w-full items-center gap-2 text-[13px] font-semibold">
          Vitalität
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={vitality}
            onChange={(e) => setVitality(Number(e.target.value))}
            className="flex-1"
          />
          {vitality.toFixed(2)}
        </label>
      </div>
      <div className="min-h-0 flex-1">
        <Sonnenschein emotion={emotion} vitality={vitality} size="full" />
      </div>
    </div>
  )
}
