import { useMemo } from 'react'
import Card from '../ui/Card'
import { modi, modusListe } from '../../data/modes'
import type { TagesEintrag } from '../../data/mock'
import { glatterPfad, flaechenPfad, kurzDatum, type Punkt } from '../../lib/chart'

/*
  Verlaufs-Karte: Liniendiagramm über den gewählten Zeitraum,
  zwei weich interpolierte Linien mit Farbverlauf darunter.
  Handgebautes SVG — die Scrubber-Interaktion folgt in Meilenstein 3.
*/

export const CHART_BREITE = 345
export const CHART_HOEHE = 170
const RAND = { oben: 12, unten: 26, links: 6, rechts: 6 }
const GRUNDLINIE = CHART_HOEHE - RAND.unten

/** Rechnet die Einträge in Diagramm-Koordinaten um (x nach Datum, y nach Wert 0–100) */
export function berechnePunkte(eintraege: TagesEintrag[]) {
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

export default function VerlaufsChart({ eintraege }: { eintraege: TagesEintrag[] }) {
  const punkte = useMemo(() => berechnePunkte(eintraege), [eintraege])
  const wenigePunkte = eintraege.length <= 31
  const mitte = eintraege[Math.floor(eintraege.length / 2)]

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold">Verlauf</h2>
        <Legende />
      </div>

      <svg viewBox={`0 0 ${CHART_BREITE} ${CHART_HOEHE}`} className="mt-3 w-full">
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

        {/* Flächen unter den Linien */}
        <path d={flaechenPfad(punkte.langsam, GRUNDLINIE)} fill="url(#grad-langsam)" />
        <path d={flaechenPfad(punkte.schnell, GRUNDLINIE)} fill="url(#grad-schnell)" />

        {/* Linien — unterschiedliche Stärke zur Unterscheidung ohne Farbe */}
        <path
          d={glatterPfad(punkte.langsam)}
          fill="none"
          stroke={modi.langsam.farbe}
          strokeWidth={modi.langsam.linienStaerke}
          strokeLinecap="round"
        />
        <path
          d={glatterPfad(punkte.schnell)}
          fill="none"
          stroke={modi.schnell.farbe}
          strokeWidth={modi.schnell.linienStaerke}
          strokeLinecap="round"
        />

        {/* Datenpunkte nur bei kurzen Zeiträumen (Quadrat/Kreis je Modus) */}
        {wenigePunkte &&
          punkte.langsam.map((p, i) => (
            <rect key={`l-${i}`} x={p.x - 3} y={p.y - 3} width="6" height="6" fill={modi.langsam.farbe} />
          ))}
        {wenigePunkte &&
          punkte.schnell.map((p, i) => (
            <circle key={`s-${i}`} cx={p.x} cy={p.y} r="3" fill={modi.schnell.farbe} />
          ))}

        {/* Datumsbeschriftung: Anfang, Mitte, Ende */}
        <g fill="var(--ink-muted)" fontSize="10" fontFamily="inherit">
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
