import Card from '../ui/Card'
import { modi } from '../../data/modes'
import type { Tageszeit } from '../../data/mock'
import type { ModusWerte } from '../../data/mock'

/*
  Tagesrhythmus: Balkendiagramm in vier Blöcken (Morgen bis Abend).
  Das Langsame als breiter Balken, das Schnelle als schmaler —
  so bleiben die Modi auch ohne Farbe unterscheidbar.
*/

const BREITE = 345
const HOEHE = 150
const RAND_UNTEN = 22
const RAND_OBEN = 14
const GRUNDLINIE = HOEHE - RAND_UNTEN

export default function TagesrhythmusChart({
  bloecke,
  text,
}: {
  bloecke: { id: Tageszeit; label: string; werte: ModusWerte }[]
  text: string
}) {
  const blockBreite = BREITE / bloecke.length
  const hoeheFuer = (wert: number) => ((GRUNDLINIE - RAND_OBEN) * wert) / 100

  return (
    <Card className="p-5">
      <h2 className="text-[16px] font-bold">Tagesrhythmus</h2>

      <svg viewBox={`0 0 ${BREITE} ${HOEHE}`} className="mt-3 w-full">
        {bloecke.map((block, i) => {
          const mitteX = i * blockBreite + blockBreite / 2
          const hLangsam = hoeheFuer(block.werte.langsam)
          const hSchnell = hoeheFuer(block.werte.schnell)
          return (
            <g key={block.id}>
              {/* Elefanten-Modus: breiter Balken */}
              <rect
                x={mitteX - 21}
                y={GRUNDLINIE - hLangsam}
                width="18"
                height={hLangsam}
                rx="5"
                fill={modi.langsam.farbe}
              />
              {/* Hasen-Modus: schmaler Balken */}
              <rect
                x={mitteX + 3}
                y={GRUNDLINIE - hSchnell}
                width="11"
                height={hSchnell}
                rx="5"
                fill={modi.schnell.farbe}
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
