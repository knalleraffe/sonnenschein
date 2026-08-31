import { useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import Card from '../ui/Card'
import { modi, modusListe } from '../../data/modes'
import type { TagesEintrag } from '../../data/mock'
import { glatterPfad, flaechenPfad, kurzDatum, type Punkt } from '../../lib/chart'
import { spring, zeichnen, flaecheEinblenden } from '../../lib/motion'

/*
  Verlaufs-Karte: zwei weich interpolierte Linien mit Farbverlauf darunter.
  Die Linien zeichnen sich beim Aufbau (pathLength 0 → 1, 900 ms),
  die Flächen blenden 200 ms verzögert nach.
  Scrubber: Mit dem Finger waagerecht ziehen — eine dünne Linie rastet
  auf dem nächstgelegenen Tag ein, darüber federt eine Blase mit
  Datum und beiden Werten (läuft am Rand nicht heraus).
*/

const CHART_BREITE = 345
const CHART_HOEHE = 208
const RAND = { oben: 54, unten: 26, links: 6, rechts: 6 }
const GRUNDLINIE = CHART_HOEHE - RAND.unten
const BLASE_BREITE = 104
const BLASE_HOEHE = 38

function berechnePunkte(eintraege: TagesEintrag[]) {
  const innenBreite = CHART_BREITE - RAND.links - RAND.rechts
  const innenHoehe = GRUNDLINIE - RAND.oben
  const erster = new Date(eintraege[0].datum).getTime()
  const letzter = new Date(eintraege[eintraege.length - 1].datum).getTime()
  const spanne = Math.max(1, letzter - erster)

  const zuXY = (eintrag: TagesEintrag, wert: number): Punkt => ({
    x: RAND.links + ((new Date(eintrag.datum).getTime() - erster) / spanne) * innenBreite,
    y: RAND.oben + (1 - wert / 100) * innenHoehe,
  })

  return {
    langsam: eintraege.map((t) => zuXY(t, t.wertLangsam)),
    schnell: eintraege.map((t) => zuXY(t, t.wertSchnell)),
  }
}

/** Legende mit Farbe UND Form (Farbsehschwäche: nie nur Farbe) */
function Legende() {
  return (
    <div className="flex gap-4">
      {modusListe.map((modus) => (
        <div key={modus.id} className="flex items-center gap-1.5 text-[12px] font-medium text-ink-muted">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            {modus.punktForm === 'quadrat' ? (
              <rect x="3" y="3" width="8" height="8" fill={modus.farbe} />
            ) : (
              <circle cx="7" cy="7" r="4.5" fill={modus.farbe} />
            )}
          </svg>
          {modus.name}
        </div>
      ))}
    </div>
  )
}

export default function VerlaufsChart({
  eintraege,
  zeitraum,
}: {
  eintraege: TagesEintrag[]
  zeitraum: string
}) {
  const reduziert = useReducedMotion()
  const svgRef = useRef<SVGSVGElement>(null)
  const [gewaehlt, setGewaehlt] = useState<number | null>(null)

  const punkte = useMemo(() => berechnePunkte(eintraege), [eintraege])
  const wenigePunkte = eintraege.length <= 31
  const mitte = eintraege[Math.floor(eintraege.length / 2)]

  // Auswahl absichern, falls der Zeitraum weniger Tage hat
  const index = gewaehlt === null ? null : Math.min(gewaehlt, eintraege.length - 1)
  const aktiverTag = index === null ? null : eintraege[index]
  const aktivX = index === null ? 0 : punkte.langsam[index].x
  const blaseX = Math.min(Math.max(aktivX - BLASE_BREITE / 2, 2), CHART_BREITE - BLASE_BREITE - 2)
  const feder = reduziert ? { duration: 0 } : spring

  /** Fingerposition → nächstgelegener Tag */
  function waehleTag(clientX: number) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * CHART_BREITE
    let bester = 0
    let abstand = Infinity
    punkte.langsam.forEach((p, i) => {
      const d = Math.abs(p.x - x)
      if (d < abstand) {
        abstand = d
        bester = i
      }
    })
    setGewaehlt(bester)
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold">Verlauf</h2>
        <Legende />
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${CHART_BREITE} ${CHART_HOEHE}`}
        className="mt-3 w-full select-none"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          waehleTag(e.clientX)
        }}
        onPointerMove={(e) => {
          if (e.buttons > 0) waehleTag(e.clientX)
        }}
      >
        <defs>
          <linearGradient id="grad-langsam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={modi.langsam.farbe} stopOpacity="0.22" />
            <stop offset="100%" stopColor={modi.langsam.farbe} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="grad-schnell" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={modi.schnell.farbe} stopOpacity="0.22" />
            <stop offset="100%" stopColor={modi.schnell.farbe} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Flächen blenden verzögert nach; key erzwingt Neuaufbau je Zeitraum */}
        <motion.path
          key={`fl-${zeitraum}`}
          d={flaechenPfad(punkte.langsam, GRUNDLINIE)}
          fill="url(#grad-langsam)"
          initial={reduziert ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={flaecheEinblenden}
        />
        <motion.path
          key={`fs-${zeitraum}`}
          d={flaechenPfad(punkte.schnell, GRUNDLINIE)}
          fill="url(#grad-schnell)"
          initial={reduziert ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={flaecheEinblenden}
        />

        {/* Linien zeichnen sich über pathLength */}
        <motion.path
          key={`ll-${zeitraum}`}
          d={glatterPfad(punkte.langsam)}
          fill="none"
          stroke={modi.langsam.farbe}
          strokeWidth={modi.langsam.linienStaerke}
          strokeLinecap="round"
          initial={reduziert ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={zeichnen}
        />
        <motion.path
          key={`ls-${zeitraum}`}
          d={glatterPfad(punkte.schnell)}
          fill="none"
          stroke={modi.schnell.farbe}
          strokeWidth={modi.schnell.linienStaerke}
          strokeLinecap="round"
          initial={reduziert ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={zeichnen}
        />

        {/* Datenpunkte nur bei kurzen Zeiträumen */}
        {wenigePunkte &&
          punkte.langsam.map((p, i) => (
            <rect key={`pl-${i}`} x={p.x - 3} y={p.y - 3} width="6" height="6" fill={modi.langsam.farbe} />
          ))}
        {wenigePunkte &&
          punkte.schnell.map((p, i) => (
            <circle key={`ps-${i}`} cx={p.x} cy={p.y} r="3" fill={modi.schnell.farbe} />
          ))}

        {/* Scrubber: Linie, Marker und Blase folgen federnd */}
        {aktiverTag && index !== null && (
          <g>
            <motion.g animate={{ x: aktivX }} transition={feder}>
              <line
                x1="0"
                y1={BLASE_HOEHE + 8}
                x2="0"
                y2={GRUNDLINIE}
                stroke="var(--ink-muted)"
                strokeWidth="1"
              />
            </motion.g>
            <motion.g
              animate={{ x: punkte.langsam[index].x, y: punkte.langsam[index].y }}
              transition={feder}
            >
              <rect x="-4.5" y="-4.5" width="9" height="9" fill={modi.langsam.farbe} stroke="#fff" strokeWidth="1.5" />
            </motion.g>
            <motion.g
              animate={{ x: punkte.schnell[index].x, y: punkte.schnell[index].y }}
              transition={feder}
            >
              <circle r="5" fill={modi.schnell.farbe} stroke="#fff" strokeWidth="1.5" />
            </motion.g>
            {/* Blase: stößt am Rand an, statt herauszulaufen */}
            <motion.g animate={{ x: blaseX }} transition={feder}>
              <rect
                width={BLASE_BREITE}
                height={BLASE_HOEHE}
                rx="12"
                fill="var(--surface-card)"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(180,120,20,0.18))' }}
              />
              <text x={BLASE_BREITE / 2} y="15" textAnchor="middle" fontSize="10" fill="var(--ink-muted)">
                {kurzDatum(aktiverTag.datum)}
              </text>
              <text x={BLASE_BREITE / 2} y="30" textAnchor="middle" fontSize="12" fontWeight="700">
                <tspan fill={modi.langsam.farbe}>{aktiverTag.wertLangsam}</tspan>
                <tspan fill="var(--ink-muted)" dx="6">
                  ·
                </tspan>
                <tspan fill={modi.schnell.farbe} dx="6">
                  {aktiverTag.wertSchnell}
                </tspan>
              </text>
            </motion.g>
          </g>
        )}

        {/* Datumsbeschriftung: Anfang, Mitte, Ende */}
        <g fill="var(--ink-muted)" fontSize="10">
          <text x={RAND.links} y={CHART_HOEHE - 8}>
            {kurzDatum(eintraege[0].datum)}
          </text>
          <text x={CHART_BREITE / 2} y={CHART_HOEHE - 8} textAnchor="middle">
            {kurzDatum(mitte.datum)}
          </text>
          <text x={CHART_BREITE - RAND.rechts} y={CHART_HOEHE - 8} textAnchor="end">
            {kurzDatum(eintraege[eintraege.length - 1].datum)}
          </text>
        </g>
      </svg>
    </Card>
  )
}
