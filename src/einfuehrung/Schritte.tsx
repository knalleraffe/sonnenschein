import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react'
import { HeartPulse } from 'lucide-react'
import { SpielBild, spielModus } from '../components/start/SpielKarte'
import { glasPille, karte, kurve } from '../components/start/stil'
import { modi } from '../data/modes'
import { spielNamen, type SpielId } from '../lib/startTexte'
import { konfig as wolken } from '../games/wolkensammeln/config'
import { einfuehrungsTexte, wegpunktTeile } from './texte'

/*
  Die interaktiven Elemente der Onboarding-Schritte (Master splash-onboarding,
  Abschnitt 4) — ohne Figma-Design, gebaut aus den Bausteinen der Spiele.
*/

const AKZENT = '#ffba3a'
const KLAPPEN = `grid-template-rows 350ms cubic-bezier(${kurve.join(', ')})`

/* ── Schritt 2: vier Wegpunkte, Antippen klappt den Text auf ── */

/** Kleine Route über der Karte, Wegpunkte im Stil der Himmelsroute */
export function SitzungsRoute({ offen, onTippen, breite, unten }: { offen: number | null; onTippen: (i: number) => void; breite: number; unten: number }) {
  const texte = einfuehrungsTexte.schritte[1].wegpunkte
  const punkte = texte.map((_, i) => ({ x: 48 + (i * (breite - 96)) / 3, y: unten - 60 - (i % 2 === 0 ? 0 : 36) - i * 14 }))
  return (
    <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
      <svg className="absolute inset-0 size-full" aria-hidden>
        <polyline points={punkte.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="white" strokeOpacity={0.8} strokeWidth={3} strokeDasharray="6 8" strokeLinecap="round" />
      </svg>
      {punkte.map((p, i) => {
        const aktiv = offen === i
        return (
          <button
            key={i}
            type="button"
            onClick={() => onTippen(i)}
            aria-expanded={aktiv}
            aria-label={wegpunktTeile(texte[i]).beschriftung}
            className="pointer-events-auto absolute flex size-11 items-center justify-center rounded-full border-2 text-[18px] font-semibold leading-5"
            style={{
              left: p.x - 22,
              top: p.y - 22,
              borderStyle: aktiv ? 'solid' : 'dashed',
              borderColor: aktiv ? AKZENT : 'white',
              background: aktiv ? 'white' : 'rgba(255,255,255,0.5)',
              color: aktiv ? 'black' : '#c0c0c0',
            }}
          >
            {i + 1}
          </button>
        )
      })}
      {punkte.map((p, i) => (
        <span key={i} className="absolute -translate-x-1/2 whitespace-nowrap text-[12px] font-medium leading-4 text-black" style={{ left: p.x, top: p.y + 26 }} aria-hidden>
          {wegpunktTeile(texte[i]).beschriftung}
        </span>
      ))}
    </div>
  )
}

/** Texte zu den Wegpunkten in der Karte — immer nur einer offen */
export function SitzungsTexte({ offen, onTippen }: { offen: number | null; onTippen: (i: number) => void }) {
  const texte = einfuehrungsTexte.schritte[1].wegpunkte
  return (
    <div className="mt-3 flex flex-col">
      {texte.map((t, i) => {
        const { beschriftung, text } = wegpunktTeile(t)
        return (
          <div key={i} className="border-b border-[#f2f2f2] last:border-0">
            <button type="button" onClick={() => onTippen(i)} aria-expanded={offen === i} className="flex min-h-11 w-full items-center gap-3 text-left">
              <span className="flex size-6 items-center justify-center rounded-full text-[12px] font-semibold" style={{ background: offen === i ? AKZENT : '#f2f2f2' }}>
                {i + 1}
              </span>
              <span className="text-[14px] font-semibold text-black">{beschriftung}</span>
            </button>
            <div className="grid" style={{ gridTemplateRows: offen === i ? '1fr' : '0fr', transition: KLAPPEN }}>
              <div className="min-h-0 overflow-hidden">
                <p className="pb-3 pl-9 text-[14px] leading-5 text-[#6a6a6a]">{text}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Schritt 3: Puls mittippen ── */

const MESSDAUER = 15000
const MIN_TIPPS = 3
const PLAUSIBEL = { min: 40, max: 200 }

/** Mittippen: der erste Tipp startet 15 s, danach Ergebnis aus den Tipp-Abständen — nichts wird gespeichert */
export function usePulsMessung() {
  const [tipps, setTipps] = useState<number[]>([])
  const [ergebnis, setErgebnis] = useState<number | null>(null)
  const [uhr, setUhr] = useState(false)
  const ring = useMotionValue(1)
  const lauf = useRef<{ stop: () => void } | null>(null)
  const zeitgeber = useRef(0)
  const tippsRef = useRef<number[]>([])
  useEffect(() => () => window.clearTimeout(zeitgeber.current), [])

  function auswerten() {
    const t = tippsRef.current
    // der nächste Tipp beginnt eine neue Messung
    tippsRef.current = []
    const abstaende = t.slice(1).map((z, i) => z - t[i])
    const bpm = abstaende.length > 0 ? Math.round(60000 / (abstaende.reduce((s, a) => s + a, 0) / abstaende.length)) : 0
    if (t.length < MIN_TIPPS || bpm < PLAUSIBEL.min || bpm > PLAUSIBEL.max) {
      // kein brauchbares Ergebnis: der Ring startet neu
      setTipps([])
      ring.set(1)
      return
    }
    setErgebnis(bpm)
  }

  function tippe() {
    const jetzt = performance.now()
    if (tippsRef.current.length === 0) {
      setErgebnis(null)
      ring.set(1)
      lauf.current?.stop()
      lauf.current = animate(ring, 0, { duration: MESSDAUER / 1000, ease: 'linear' })
      zeitgeber.current = window.setTimeout(auswerten, MESSDAUER)
    }
    tippsRef.current = [...tippsRef.current, jetzt]
    setTipps(tippsRef.current)
  }

  return { tipps, ergebnis, ring, uhr, zeigeUhr: () => setUhr(true), tippe, laeuft: tipps.length > 0 && ergebnis === null }
}

/** Großer runder Glas-Button mit Ring (stroke-dashoffset) — wächst pro Tipp kurz auf 106 % */
export function MittippKnopf({ ring, onTippen, laeuft, mitteY, mitteX }: { ring: ReturnType<typeof useMotionValue<number>>; onTippen: () => void; laeuft: boolean; mitteY: number; mitteX: number }) {
  const reduziert = useReducedMotion()
  const knopf = useRef<HTMLButtonElement>(null)
  const GROESSE = 132
  const R = 76
  function tipp() {
    onTippen()
    if (!reduziert && knopf.current) animate(knopf.current, { scale: [1, 1.06, 1] }, { duration: 0.22, ease: kurve })
  }
  return (
    <div className="absolute" style={{ left: mitteX - 84, top: mitteY - 84, width: 168, height: 168 }}>
      <svg className="absolute inset-0" width={168} height={168} aria-hidden>
        <circle cx={84} cy={84} r={R} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={6} />
        <motion.circle
          cx={84}
          cy={84}
          r={R}
          fill="none"
          stroke={AKZENT}
          strokeWidth={6}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          style={{ strokeDashoffset: ring, rotate: -90, transformOrigin: '84px 84px' }}
        />
      </svg>
      <button
        ref={knopf}
        type="button"
        onPointerDown={tipp}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), tipp())}
        aria-label={laeuft ? 'Schlag' : 'Messung starten und bei jedem Schlag tippen'}
        className={`absolute flex items-center justify-center rounded-full text-black ${glasPille}`}
        style={{ left: (168 - GROESSE) / 2, top: (168 - GROESSE) / 2, width: GROESSE, height: GROESSE }}
      >
        <HeartPulse size={40} strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  )
}

/** Puls-Slider (Stil der Spiele), fährt weich auf den Wert */
export function PulsAnzeige({ wert }: { wert: number }) {
  const reduziert = useReducedMotion()
  const [anzeige, setAnzeige] = useState(wolken.messung.startPuls as number)
  useEffect(() => {
    const l = animate(anzeige, wert, { duration: reduziert ? 0 : 0.7, ease: kurve, onUpdate: (w) => setAnzeige(Math.round(w)) })
    return () => l.stop()
    // nur beim neuen Wert
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wert])
  const { pulsMin, pulsMax } = wolken.messung
  return (
    <input
      aria-label="Puls"
      className="sheet-range mt-3 block w-full"
      style={{ '--range-progress': `${((Math.min(pulsMax, anzeige) - pulsMin) / (pulsMax - pulsMin)) * 100}%` } as CSSProperties}
      type="range"
      min={pulsMin}
      max={pulsMax}
      step={1}
      value={Math.min(pulsMax, anzeige)}
      onChange={(e) => setAnzeige(Number(e.target.value))}
    />
  )
}

/* ── Schritt 4: Spielkarten zum Umdrehen ── */

/** Rückseite: Wolkensammeln mit dem ersten Satz seiner Erklärung, Himmelsroute mit eigenem Satz (Vorgabe Julius) */
const ERSTER_SATZ: Record<SpielId, string> = {
  wolkensammeln: 'Merke dir die Reihenfolge, in der 3 bis 8 Wolken am Himmel nacheinander aufleuchten, und tippe sie anschließend in genau dieser Reihenfolge an.',
  himmelsroute: 'Präge dir ein, wem und was Echoo begegnet ist, und gib die Reihenfolge anschließend korrekt wieder.',
}

export function WendeKarte({ spiel, gedreht, onTippen }: { spiel: SpielId; gedreht: boolean; onTippen: () => void }) {
  const reduziert = useReducedMotion()
  const seite = 'absolute inset-0 overflow-hidden [backface-visibility:hidden]'
  return (
    <button
      type="button"
      onClick={onTippen}
      aria-pressed={gedreht}
      aria-label={`${spielNamen[spiel]}: ${gedreht ? ERSTER_SATZ[spiel] : 'umdrehen'}`}
      className="relative h-[180px] w-full [perspective:800px]"
    >
      <motion.div
        className="absolute inset-0 [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: gedreht ? 180 : 0 }}
        transition={{ duration: reduziert ? 0 : 0.5, ease: kurve }}
      >
        <div className={`${seite} flex flex-col text-left ${karte}`}>
          <SpielBild spiel={spiel} />
          <div className="flex flex-1 flex-col justify-center px-3">
            <div className="text-[16px] font-semibold leading-5 text-ink">{spielNamen[spiel]}</div>
          </div>
        </div>
        <div className={`${seite} flex flex-col gap-2 p-4 text-left ${karte}`} style={{ transform: 'rotateY(180deg)' }}>
          <div className="text-[12px] leading-4 text-[#6a6a6a]">{modi[spielModus[spiel]].name}</div>
          <p className="text-[12px] leading-4 text-black">{ERSTER_SATZ[spiel]}</p>
        </div>
      </motion.div>
    </button>
  )
}
