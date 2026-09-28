import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { fuelle, startTexte } from '../../lib/startTexte'
import { speichereStimmung } from '../../lib/stimmung'
import { kurve, titelStil, weisseKarte } from './stil'
import { oeffentlich } from '../../lib/pfad'

/*
  Stimmungscheck (Figma 513:1427): weiße Karte, links die Skala (Tacho-Bild
  aus Figma), rechts Titel und Text, darunter der Slider im Stil des
  Puls-Sliders — der Griff ist eine weiße Pille mit der Stufe („Geht so"),
  5 Stufen mit Einrasten. Nach dem Einrasten klappt die Karte nach 600 ms
  zu einer Zeile zusammen (grid-template-rows), Antippen klappt sie wieder
  auf. Kein Schließen-Kreuz; einmal pro Tag, jederzeit änderbar.
*/

const ZUKLAPPEN_NACH = 600
const KLAPPEN = `grid-template-rows 400ms cubic-bezier(${kurve.join(', ')})`
/** Griff aus Figma: 86 × 34, Kontur 0,725 px #d6d6d6, Radius 23,2, doppelter Schatten */
const GRIFF = { breite: 86, hoehe: 34 }

/** Tacho-Bild aus Figma (Bildschirmfoto, gedreht und gespiegelt wie im Design) */
function Skala({ groesse = 64 }: { groesse?: number }) {
  const s = groesse / 64
  return (
    <div className="relative shrink-0 overflow-hidden" style={{ width: groesse, height: groesse }} aria-hidden>
      <div
        className="absolute flex items-center justify-center"
        style={{ left: -3.43 * s, top: 0.14 * s, width: 69.38 * s, height: 61.83 * s }}
      >
        <div className="relative flex-none overflow-hidden" style={{ width: 61.714 * s, height: 52.571 * s, transform: 'rotate(170.73deg) scaleY(-1)' }}>
          <img
            src={oeffentlich('/start/stimmung-tacho.png')}
            alt=""
            className="absolute max-w-none"
            style={{ left: '-7.41%', top: '-4.97%', width: '116.67%', height: '105.59%' }}
          />
        </div>
      </div>
    </div>
  )
}

/** Slider: Spur und Füllung wie der Puls-Slider, der Griff trägt die Stufe */
function Regler({
  stufe,
  name,
  offen,
  onWaehle,
  onGriff,
  onEingerastet,
}: {
  stufe: number
  name: string
  offen: boolean
  onWaehle: (s: number) => void
  onGriff: () => void
  onEingerastet: () => void
}) {
  const reduziert = useReducedMotion()
  const bahn = useRef<HTMLDivElement>(null)
  const [breite, setBreite] = useState(297)
  useLayoutEffect(() => {
    const el = bahn.current
    if (!el) return
    const beobachter = new ResizeObserver(() => setBreite(el.clientWidth))
    beobachter.observe(el)
    return () => beobachter.disconnect()
  }, [])
  // Mitte des Griffs: von ganz links bis ganz rechts, der Griff bleibt in der Bahn
  const mitte = GRIFF.breite / 2 + ((stufe - 1) / 4) * (breite - GRIFF.breite)
  const bewegung = { duration: reduziert ? 0 : 0.2, ease: kurve }
  return (
    <div ref={bahn} className="relative" style={{ height: GRIFF.hoehe }}>
      <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#dddddd]" />
      <motion.div
        className="absolute left-0 top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-[#ffba3a]"
        style={{ transformOrigin: 'left center' }}
        initial={false}
        animate={{ scaleX: mitte / breite }}
        transition={bewegung}
      />
      <motion.span
        className="absolute left-0 top-0 flex items-center justify-center rounded-[23.2px] border-[0.725px] border-[#d6d6d6] bg-white text-[12px] font-medium leading-4 text-black shadow-[0_0.725px_5.8px_rgba(0,0,0,0.12),0_8.7px_18.85px_rgba(0,0,0,0.12)]"
        style={{ width: GRIFF.breite, height: GRIFF.hoehe }}
        initial={false}
        animate={{ x: mitte - GRIFF.breite / 2 }}
        transition={bewegung}
        aria-hidden
      >
        {name}
      </motion.span>
      {/* unsichtbarer, echter Regler: Finger, Maus und Tastatur */}
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={stufe}
        tabIndex={offen ? 0 : -1}
        aria-label={startTexte.stimmung.titel}
        aria-valuetext={name}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        onPointerDown={onGriff}
        onChange={(e) => onWaehle(Number(e.target.value))}
        onPointerUp={onEingerastet}
        onKeyUp={onEingerastet}
      />
    </div>
  )
}

export default function StimmungsKarte({
  gespeichert,
  heute,
  offenErzwingen,
}: {
  gespeichert: number | null
  heute: Date
  /** nur für die Konzeptseite: Karte trotz gespeicherter Stufe offen zeigen */
  offenErzwingen?: boolean
}) {
  const [stufe, setStufe] = useState(gespeichert ?? 3)
  const [offen, setOffen] = useState(offenErzwingen ?? gespeichert === null)
  const [gesetzt, setGesetzt] = useState(gespeichert !== null)
  const zuklappen = useRef(0)
  useEffect(() => () => window.clearTimeout(zuklappen.current), [])
  const t = startTexte.stimmung
  const name = t.stufen[stufe - 1]

  function waehle(neu: number) {
    setStufe(neu)
    setGesetzt(true)
    speichereStimmung(heute, neu)
  }
  /** eingerastet: Stufe gilt (auch ohne Verschieben), nach 600 ms zuklappen */
  function eingerastet() {
    waehle(stufe)
    window.clearTimeout(zuklappen.current)
    zuklappen.current = window.setTimeout(() => setOffen(false), ZUKLAPPEN_NACH)
  }

  return (
    <div className={`overflow-hidden ${weisseKarte}`}>
      <div className="grid" style={{ gridTemplateRows: offen ? '1fr' : '0fr', transition: KLAPPEN }} aria-hidden={!offen}>
        <div className="min-h-0 overflow-hidden">
          <div className="px-6 pb-[29px] pt-5">
            <div className="flex items-start gap-4">
              <Skala />
              <div className="min-w-0 pt-2">
                <h2 className={titelStil}>{t.titel}</h2>
                <p className="mt-1 text-[12px] leading-4 text-[#6a6a6a]">{t.text}</p>
              </div>
            </div>
            <div className="mt-[14px]">
              <Regler
                stufe={stufe}
                name={name}
                offen={offen}
                onWaehle={waehle}
                onGriff={() => window.clearTimeout(zuklappen.current)}
                onEingerastet={eingerastet}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateRows: offen ? '0fr' : '1fr', transition: KLAPPEN }} aria-hidden={offen}>
        <div className="min-h-0 overflow-hidden">
          <button
            type="button"
            tabIndex={offen ? -1 : 0}
            onClick={() => setOffen(true)}
            className="flex h-14 w-full items-center gap-3 px-6 text-left"
          >
            <Skala groesse={36} />
            <span className={titelStil}>{gesetzt ? fuelle(t.eingeklappt, { Stufe: name }) : t.titel}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
