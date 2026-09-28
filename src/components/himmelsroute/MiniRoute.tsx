import EchooMini from './EchooMini'
import { konfig } from '../../games/himmelsroute/config'
import { oeffentlich } from '../../lib/pfad'

/*
  Mini-Route für das Endergebnis (statt des Pokals aus 460:347): Erde als
  Bogen unten, `bestSpan` Wegpunkte in Akzentfarbe mit Linie verbunden,
  Echoo oben. Bei 0 nur Erde und Echoo. Gleiche Fläche wie der Pokal (148 × 127).
*/

const B = 148
const H = 127
const ECHOO_Y = 22
const ERDE_OBEN = 104
const PUNKT = 5

export default function MiniRoute({ wegpunkte, className = 'mx-auto mt-8' }: { wegpunkte: number; className?: string }) {
  const { akzent } = konfig.farben
  const unten = ERDE_OBEN - 8
  const oben = ECHOO_Y + 26
  const abstand = wegpunkte > 1 ? (unten - oben) / (wegpunkte - 1) : 0
  const punkte = Array.from({ length: wegpunkte }, (_, i) => ({
    x: B / 2 + (i % 2 === 0 ? -1 : 1) * 16,
    y: wegpunkte > 1 ? unten - i * abstand : (unten + oben) / 2,
  }))
  const linie = [{ x: B / 2, y: ERDE_OBEN }, ...punkte, ...(wegpunkte > 0 ? [{ x: B / 2, y: ECHOO_Y }] : [])]

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width: B, height: H }}
      role="img"
      aria-label={wegpunkte > 0 ? `Mini-Route mit ${wegpunkte} Wegpunkten von der Erde bis zu Echoo` : 'Erde und Echoo'}
    >
      {/* Erde: Ausschnitt der Szenen-Erde, nur der Bogen ist zu sehen */}
      <img
        src={oeffentlich('/himmelsroute/spielfeld/erde.svg')}
        alt=""
        className="absolute block max-w-none"
        style={{ left: (B - 200) / 2, top: ERDE_OBEN - 12, width: 200, height: 200 * (595 / 508) }}
      />
      {wegpunkte > 0 && (
        <svg className="absolute inset-0" width={B} height={H} aria-hidden>
          <polyline
            points={linie.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={akzent}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {punkte.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={PUNKT} fill={akzent} stroke="white" strokeWidth={1.5} />
          ))}
        </svg>
      )}
      <div className="absolute left-0 top-0" style={{ transform: `translate(${B / 2}px, ${ECHOO_Y}px)` }}>
        <EchooMini groesse={24} />
      </div>
    </div>
  )
}
