import { motion, useReducedMotion } from 'motion/react'
import { kurve } from '../components/start/stil'
import { einfuehrungsTexte as t } from './texte'

/*
  Fortschritt im Onboarding: senkrechte, gestrichelte Route am rechten Rand
  mit einem Wegpunkt je Schritt. Besuchte Punkte in Akzentfarbe, der aktuelle
  größer. Jeder Punkt ist ein 44 px großes Ziel. Aus der Startsequenz
  herausgelöst, damit die Konzeptseite sie zeigen kann.
*/
export default function Fortschrittsroute({
  wegpunkte,
  schritt,
  onGehe,
}: {
  wegpunkte: { x: number; y: number }[]
  schritt: number
  onGehe: (i: number) => void
}) {
  const reduziert = useReducedMotion()
  return (
    <>
      <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
        <polyline points={wegpunkte.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="white" strokeOpacity={0.7} strokeWidth={2} strokeDasharray="4 6" strokeLinecap="round" />
      </svg>
      <nav aria-label="Fortschritt" className="pointer-events-auto" onPointerDown={(e) => e.stopPropagation()}>
        {wegpunkte.map((p, i) => {
          const besucht = i <= schritt
          const aktuell = i === schritt
          const g = aktuell ? 18 : 10
          return (
            <button
              key={i}
              type="button"
              onClick={() => onGehe(i)}
              aria-label={`Schritt ${i + 1}: ${t.schritte[i].titel}`}
              aria-current={aktuell ? 'step' : undefined}
              className="absolute flex size-11 items-center justify-center"
              style={{ left: p.x - 22, top: p.y - 22 }}
            >
              <motion.span
                className="block rounded-full border-2 border-white"
                style={{ width: 18, height: 18, background: besucht ? '#ffba3a' : 'rgba(255,255,255,0.5)' }}
                initial={false}
                animate={{ scale: g / 18 }}
                transition={{ duration: reduziert ? 0 : 0.3, ease: kurve }}
              />
            </button>
          )
        })}
      </nav>
    </>
  )
}
