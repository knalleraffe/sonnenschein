import { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { glasPille, kurve } from '../start/stil'

/*
  Umschalter aus der Glas-Pille der Spiele (48 px hoch, weiß 20 %, weicher
  Schatten): die aktive Wahl liegt auf einer weißen Pille, die gleitet
  (nur transform). Für die Spiel-Tabs und „4 Wochen / Alle".
  `aktivFarbe` färbt die gleitende Pille, z. B. wie der Hintergrund der
  Schließen-Knöpfe (#fff8e6) für die deutlichere Spielwahl.
*/
export default function GlasUmschalter<T extends string>({
  optionen,
  wert,
  onChange,
  label,
  aktivFarbe = '#ffffff',
}: {
  optionen: { id: T; label: string }[]
  wert: T
  onChange: (neu: T) => void
  label: string
  aktivFarbe?: string
}) {
  const reduziert = useReducedMotion()
  const gruppe = useId()
  return (
    <div className={`flex h-12 items-center ${glasPille}`} role="tablist" aria-label={label}>
      {optionen.map((o) => {
        const aktiv = o.id === wert
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={aktiv}
            onClick={() => onChange(o.id)}
            className="relative flex h-12 flex-1 items-center justify-center px-4 text-[14px] font-medium leading-3 text-black"
          >
            {aktiv && (
              <motion.span
                layoutId={`glas-${gruppe}`}
                className="absolute inset-1 rounded-pill"
                style={{ background: aktivFarbe }}
                transition={{ duration: reduziert ? 0 : 0.35, ease: kurve }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
