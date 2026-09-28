import { motion, useReducedMotion } from 'motion/react'
import type { Sitzung } from '../../lib/sitzungen'
import { kurve } from '../start/stil'

/*
  Diagramme der Statistiken als SVG (kein Figma-Design). Linien zeichnen
  sich per stroke-dashoffset, Punkte blenden gestaffelt ein (nur opacity
  und transform). Bewegung und Ruhe unterscheiden sich nicht nur über die
  Farbe, sondern auch über die Form: Bewegung = Kreis, Ruhe = Quadrat.
*/

export const AKZENT = '#ffba3a'
const NEUTRAL = '#6a6a6a'
const LINIE = '#dddddd'
const B = 329
const H = 180
const RAND = { links: 28, rechts: 8, oben: 12, unten: 24 }

type Skala = { min: number; max: number }
const skalaAus = (werte: number[], puffer = 0.5): Skala => {
  const min = Math.min(...werte)
  const max = Math.max(...werte)
  return min === max ? { min: min - 1, max: max + 1 } : { min: min - puffer, max: max + puffer }
}
const xAuf = (anteil: number) => RAND.links + anteil * (B - RAND.links - RAND.rechts)
const yAuf = (wert: number, s: Skala) => H - RAND.unten - ((wert - s.min) / (s.max - s.min)) * (H - RAND.oben - RAND.unten)

function Linie({ punkte, verzoegerung = 0, farbe = AKZENT }: { punkte: { x: number; y: number }[]; verzoegerung?: number; farbe?: string }) {
  const reduziert = useReducedMotion()
  if (punkte.length < 2) return null
  return (
    <motion.path
      d={punkte.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
      fill="none"
      stroke={farbe}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray="1 1"
      initial={{ strokeDashoffset: reduziert ? 0 : 1 }}
      animate={{ strokeDashoffset: 0 }}
      transition={{ duration: reduziert ? 0 : 0.9, delay: verzoegerung, ease: kurve }}
    />
  )
}

/** Punkt als Knopf: Kreis (Bewegung, Standard) oder Quadrat (Ruhe); antippbar mit 44-px-Trefferfläche */
function Punkt({
  x,
  y,
  form = 'kreis',
  farbe = AKZENT,
  index,
  label,
  onTippen,
}: {
  x: number
  y: number
  form?: 'kreis' | 'quadrat'
  farbe?: string
  index: number
  label: string
  onTippen?: () => void
}) {
  const reduziert = useReducedMotion()
  return (
    <motion.g
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      initial={reduziert ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: reduziert ? 0 : 0.5 + index * 0.04, ease: kurve }}
      role={onTippen ? 'button' : undefined}
      tabIndex={onTippen ? 0 : undefined}
      aria-label={label}
      onClick={onTippen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onTippen?.()}
      className={onTippen ? 'cursor-pointer outline-none' : undefined}
    >
      <circle cx={x} cy={y} r={22} fill="transparent" />
      {form === 'kreis' ? (
        <circle cx={x} cy={y} r={5.5} fill={farbe} stroke="white" strokeWidth={1.5} />
      ) : (
        <rect x={x - 5} y={y - 5} width={10} height={10} rx={1.5} fill={farbe} stroke="white" strokeWidth={1.5} />
      )}
    </motion.g>
  )
}

function Achse({ s, beschriftung }: { s: Skala; beschriftung: (w: number) => string }) {
  const werte = [s.min, (s.min + s.max) / 2, s.max].map((w) => Math.round(w * 10) / 10)
  return (
    <g aria-hidden>
      <line x1={RAND.links} x2={B - RAND.rechts} y1={H - RAND.unten} y2={H - RAND.unten} stroke={LINIE} strokeWidth={1} />
      {werte.map((w) => (
        <text key={w} x={RAND.links - 6} y={yAuf(w, s) + 4} textAnchor="end" fontSize={11} fill={NEUTRAL}>
          {beschriftung(w)}
        </text>
      ))}
    </g>
  )
}

const svgProps = { viewBox: `0 0 ${B} ${H}`, className: 'block w-full overflow-visible' }

/* ── Verlauf: Vor-Werte Sitzung für Sitzung ── */

export function VerlaufsDiagramm({ sitzungen, zahl, onTippen }: { sitzungen: Sitzung[]; zahl: (w: number) => string; onTippen: (s: Sitzung) => void }) {
  const s = skalaAus(sitzungen.map((x) => x.vor))
  const punkte = sitzungen.map((x, i) => ({ x: xAuf(sitzungen.length === 1 ? 0.5 : i / (sitzungen.length - 1)), y: yAuf(x.vor, s), sitzung: x }))
  return (
    <svg {...svgProps} role="img">
      <Achse s={s} beschriftung={zahl} />
      <Linie punkte={punkte} />
      {punkte.map((p, i) => (
        <Punkt key={p.sitzung.id} x={p.x} y={p.y} index={i} label={`${zahl(p.sitzung.vor)} am ${p.sitzung.zeitpunkt.toLocaleDateString('de-DE')}`} onTippen={() => onTippen(p.sitzung)} />
      ))}
    </svg>
  )
}

/* ── Sitzung Wolkensammeln: Stufe je Durchgang, Pause markiert ── */

export function StufenDiagramm({ stufen, pauseNach, pauseLabel }: { stufen: number[]; pauseNach: number | null; pauseLabel: string }) {
  const s: Skala = { min: 2.5, max: Math.max(6, ...stufen) + 0.5 }
  const x = (i: number) => xAuf(stufen.length === 1 ? 0.5 : i / (stufen.length - 1))
  const punkte = stufen.map((w, i) => ({ x: x(i), y: yAuf(w, s) }))
  const pauseX = pauseNach !== null && pauseNach > 0 && pauseNach < stufen.length ? (x(pauseNach - 1) + x(pauseNach)) / 2 : null
  return (
    <svg {...svgProps} role="img">
      <Achse s={s} beschriftung={(w) => String(Math.round(w))} />
      {pauseX !== null && (
        <g>
          <line x1={pauseX} x2={pauseX} y1={RAND.oben} y2={H - RAND.unten} stroke={NEUTRAL} strokeWidth={1.5} strokeDasharray="4 5" />
          <text x={pauseX} y={H - 6} textAnchor="middle" fontSize={11} fill={NEUTRAL}>
            {pauseLabel}
          </text>
        </g>
      )}
      <Linie punkte={punkte} />
      {punkte.map((p, i) => (
        <Punkt key={i} x={p.x} y={p.y} index={i} label={`Durchgang ${i + 1}: ${stufen[i]}`} />
      ))}
    </svg>
  )
}

/* ── Bewegung oder Ruhe: zwei Spalten, ein Punkt pro Sitzung = Δ, Mittelwert-Linie ── */

export function SpaltenDiagramm({
  spalten,
  zahl,
  onTippen,
}: {
  spalten: { label: string; form: 'kreis' | 'quadrat'; farbe: string; sitzungen: Sitzung[]; mittel: number }[]
  zahl: (w: number) => string
  onTippen: (s: Sitzung) => void
}) {
  const alle = spalten.flatMap((sp) => sp.sitzungen.map((x) => x.delta ?? 0))
  const s = skalaAus([...alle, 0])
  const breite = (B - RAND.links - RAND.rechts) / spalten.length
  let index = 0
  return (
    <svg {...svgProps} role="img">
      <Achse s={s} beschriftung={zahl} />
      <line x1={RAND.links} x2={B - RAND.rechts} y1={yAuf(0, s)} y2={yAuf(0, s)} stroke={LINIE} strokeWidth={1} strokeDasharray="3 4" aria-hidden />
      {spalten.map((sp, si) => {
        const mitte = RAND.links + breite * (si + 0.5)
        return (
          <g key={sp.label}>
            <text x={mitte} y={H - 6} textAnchor="middle" fontSize={12} fontWeight={600} fill="#1a1a1a">
              {sp.label}
            </text>
            <Linie punkte={[{ x: mitte - breite * 0.32, y: yAuf(sp.mittel, s) }, { x: mitte + breite * 0.32, y: yAuf(sp.mittel, s) }]} farbe={sp.farbe} verzoegerung={0.3} />
            {sp.sitzungen.map((x, i) => {
              // leicht gestreut, damit gleiche Werte sichtbar bleiben
              const versatz = ((i % 5) - 2) * 9
              return (
                <Punkt
                  key={x.id}
                  x={mitte + versatz}
                  y={yAuf(x.delta ?? 0, s)}
                  form={sp.form}
                  farbe={sp.farbe}
                  index={index++}
                  label={`${sp.label}: ${zahl(x.delta ?? 0)}`}
                  onTippen={() => onTippen(x)}
                />
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

/* ── Streudiagramm (Pulsanstieg gegen Δ, Stimmung gegen Vor-Wert) ── */

export function StreuDiagramm({
  punkte,
  xBereich,
  xBeschriftung,
  yZahl,
  markierung,
  onTippen,
}: {
  punkte: { x: number; y: number; sitzung: Sitzung; label: string }[]
  xBereich: Skala
  xBeschriftung: number[]
  yZahl: (w: number) => string
  /** hervorgehobener x-Bereich (z. B. Pulsbereich) */
  markierung?: { von: number; bis: number } | null
  onTippen: (s: Sitzung) => void
}) {
  const s = skalaAus(punkte.map((p) => p.y))
  const x = (w: number) => xAuf((w - xBereich.min) / (xBereich.max - xBereich.min))
  return (
    <svg {...svgProps} role="img">
      {markierung && (
        <rect x={x(markierung.von)} width={x(markierung.bis) - x(markierung.von)} y={RAND.oben} height={H - RAND.oben - RAND.unten} fill={AKZENT} opacity={0.15} aria-hidden />
      )}
      <Achse s={s} beschriftung={yZahl} />
      {xBeschriftung.map((w) => (
        <text key={w} x={x(w)} y={H - 6} textAnchor="middle" fontSize={11} fill={NEUTRAL} aria-hidden>
          {w}
        </text>
      ))}
      {punkte.map((p, i) => (
        <Punkt key={p.sitzung.id} x={x(p.x)} y={yAuf(p.y, s)} index={i} label={p.label} onTippen={() => onTippen(p.sitzung)} />
      ))}
    </svg>
  )
}

/* ── Fortschritt bis zur ersten Auswertung ── */

export function FortschrittsBalken({ zeilen }: { zeilen: { label: string; anteil: number }[] }) {
  const reduziert = useReducedMotion()
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      {zeilen.map((z, i) => (
        <div key={z.label} className="flex items-center gap-3">
          <span className="w-20 text-[14px] font-medium text-[#6a6a6a]">{z.label}</span>
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[#dddddd]">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: AKZENT, transformOrigin: 'left center' }}
              initial={{ scaleX: reduziert ? z.anteil : 0 }}
              animate={{ scaleX: z.anteil }}
              transition={{ duration: reduziert ? 0 : 0.6, delay: i * 0.08, ease: kurve }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
