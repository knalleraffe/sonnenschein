import { motion, useReducedMotion } from 'motion/react'
import Card from '../ui/Card'
import { modi } from '../../data/modes'
import type { Tageszeit } from '../../data/mock'
import type { ModusWerte } from '../../data/mock'
import { springSoft } from '../../lib/motion'

/*
  Tagesrhythmus: Balkendiagramm in vier Blöcken (Morgen bis Abend).
  Die Balken wachsen aus der Grundlinie, versetzt um 30 ms —
  animiert wird nur transform (scaleY), nie die Höhe selbst.
*/

const BREITE = 345
const HOEHE = 150
const RAND_UNTEN = 22
const RAND_OBEN = 14
const GRUNDLINIE = HOEHE - RAND_UNTEN
const MAX_HOEHE = GRUNDLINIE - RAND_OBEN

function Balken({
  x,
  breite,
  wert,
  farbe,
  verzoegerung,
}: {
  x: number
  breite: number
  wert: number
  farbe: string
  verzoegerung: number
}) {
  const reduziert = useReducedMotion()
  return (
    <motion.rect
      x={x}
      y={RAND_OBEN}
      width={breite}
      height={MAX_HOEHE}
      rx="5"
      fill={farbe}
      style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }}
      initial={reduziert ? false : { scaleY: 0 }}
      animate={{ scaleY: Math.max(0.04, wert / 100) }}
      transition={reduziert ? { duration: 0 } : { ...springSoft, delay: verzoegerung }}
    />
  )
}

export default function TagesrhythmusChart({
  bloecke,
  text,
}: {
  bloecke: { id: Tageszeit; label: string; werte: ModusWerte }[]
  text: string
}) {
  const blockBreite = BREITE / bloecke.length

  return (
    <Card className="p-5">
      <h2 className="text-[16px] font-bold">Tagesrhythmus</h2>

      <svg viewBox={`0 0 ${BREITE} ${HOEHE}`} className="mt-3 w-full">
        {bloecke.map((block, i) => {
          const mitteX = i * blockBreite + blockBreite / 2
          return (
            <g key={block.id}>
              {/* Elefanten-Modus: breiter Balken, Hasen-Modus: schmaler */}
              <Balken
                x={mitteX - 21}
                breite={18}
                wert={block.werte.langsam}
                farbe={modi.langsam.farbe}
                verzoegerung={i * 2 * 0.03}
              />
              <Balken
                x={mitteX + 3}
                breite={11}
                wert={block.werte.schnell}
                farbe={modi.schnell.farbe}
                verzoegerung={(i * 2 + 1) * 0.03}
              />
              <text
                x={mitteX}
                y={HOEHE - 6}
                textAnchor="middle"
                fontSize="11"
                fill="var(--ink-muted)"
              >
                {block.label}
              </text>
            </g>
          )
        })}
      </svg>

      <p className="mt-2 text-[13px] leading-snug text-ink-muted">{text}</p>
    </Card>
  )
}
