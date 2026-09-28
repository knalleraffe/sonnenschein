import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type MotionValue } from 'motion/react'
import { Check, X } from 'lucide-react'
import Sheet from '../ui/Sheet'
import { knopfPrimaer } from '../spiel/SpielSheets'
import Hinweis from './Hinweis'
import { ErdeBild, himmelsfarbe } from './Szene'
import { konfig } from '../../games/himmelsroute/config'
import { gegenstand } from '../../games/himmelsroute/gegenstaende'
import { texte } from '../../games/himmelsroute/texte'
import type { Ziehung } from '../../games/himmelsroute/ziehung'

/*
  Übersicht, Rückweg-Sheet, Auflösung und Heimkehr (Master Abschnitt 5).

  Übersicht (kein Figma-Design): Echoo bleibt oben stehen, die Erde fährt
  von unten ins Bild, dazwischen ein verkürzter Himmelsverlauf in den Farben
  des durchflogenen Abschnitts. Die Wegpunkte liegen gleichmäßig zwischen
  Erde und Echoo, abwechselnd links und rechts der Mitte.

  Rückweg-Sheet (Basis 467:398): nicht wegwischbar, kein Kreuz. Karten im
  Stil von 467:398 — Ziehen mit Finger oder Maus, oder antippen und dann
  einen Wegpunkt antippen.
*/

const sz = konfig.szene
const rw = konfig.rueckweg
const au = konfig.aufloesung
const { akzent, neutral } = konfig.farben
const kurve = konfig.kurve

/** Mitte der oberen Leiste (Figma: 64 + 48 / 2) */
export const LEISTE_MITTE = 88
/** Unterkante der oberen Leiste (64 + 48) und Abstand bis zum obersten Wegpunkt */
const LEISTE_UNTEN = 112
const ABSTAND_LEISTE = 12
/**
  Echoo beim Nachbauen: groß oben links, angeschnitten (Figma 507:1066,
  „EchooMini 1“ 328 × 348 px bei −143 / −134 → Mitte bei 21 / 40,
  Körperbreite 328 × 1062 / 2016 ≈ 173 px).
*/
export const ECHOO_ECKE = { x: 21, y: 40, koerper: 173 }
/** Heimflug: aus der Ecke zum obersten Wegpunkt, dabei zurück auf Fluggröße */
const ANFLUG = 700
/** Falsche Route: so lange bleibt das Ergebnis stehen, bevor das Sheet kommt */
const NACHLAUF_FALSCH = 1200
/** Ein passierter Abschnitt blendet in dieser Zeit aus */
const ABSCHNITT_AUS = 250
/** Die Erde ragt so weit über die Oberkante des Sheets */
const ERDE_UEBER_SHEET = 20

type Punkt = { x: number; y: number }

export interface Geometrie {
  sheetOben: number
  erdeOben: number
  wegpunkte: Punkt[]
  durchmesser: number
  /** Start der Route: Horizont in der Mitte */
  start: Punkt
}

export function geometrie(breite: number, hoehe: number, faktor: number, laenge: number): Geometrie {
  const sheetOben = hoehe - hoehe * rw.sheetAnteil - 8
  const erdeOben = sheetOben - ERDE_UEBER_SHEET
  const unten = erdeOben - 4
  const obenKante = LEISTE_UNTEN + ABSTAND_LEISTE
  // erst der Durchmesser, dann der oberste Mittelpunkt: der Kreis beginnt unter der Leiste
  const vorlaeufig = laenge > 1 ? (unten - obenKante - rw.wegpunktMax / 2) / (laenge - 1) : 0
  // Nachbarn auf derselben Seite liegen zwei Abstände auseinander
  const durchmesser = laenge > 1 ? Math.max(rw.wegpunktMin, Math.min(rw.wegpunktMax, 2 * vorlaeufig - 6)) : rw.wegpunktMax
  const oben = obenKante + durchmesser / 2
  const abstand = laenge > 1 ? (unten - oben) / (laenge - 1) : 0
  const mitte = breite / 2
  const wegpunkte = Array.from({ length: laenge }, (_, i) => ({
    x: mitte + ((i + 1) % 2 === 1 ? -1 : 1) * konfig.begegnung.seitlich * faktor,
    y: laenge > 1 ? unten - i * abstand : (unten + oben) / 2,
  }))
  return { sheetOben, erdeOben, wegpunkte, durchmesser, start: { x: mitte, y: erdeOben + 2 } }
}

/* ── Kartenhaufen: zufällig angeordnet, leicht gedreht, höchstens 8 px Überlappung ── */

type Platz = { x: number; y: number; drehung: number }

function mische<T>(liste: T[]): T[] {
  const kopie = [...liste]
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[kopie[i], kopie[j]] = [kopie[j], kopie[i]]
  }
  return kopie
}

/** Gedrehte Karte braucht mehr Platz: Breite × (cos + sin) der größten Drehung */
const DREH_ZUSCHLAG = Math.cos((rw.drehung * Math.PI) / 180) + Math.sin((rw.drehung * Math.PI) / 180)

function haufenLayout(anzahl: number, breite: number, hoehe: number): { groesse: number; plaetze: Platz[] } {
  let beste = { groesse: 0, proReihe: anzahl }
  for (let proReihe = 1; proReihe <= anzahl; proReihe++) {
    const reihen = Math.ceil(anzahl / proReihe)
    const g = Math.min(
      rw.karte,
      (breite + (proReihe - 1) * rw.ueberlappung) / proReihe / DREH_ZUSCHLAG,
      (hoehe + (reihen - 1) * rw.ueberlappung) / reihen / DREH_ZUSCHLAG,
    )
    if (g > beste.groesse + 0.5) beste = { groesse: g, proReihe }
  }
  const groesse = Math.floor(beste.groesse)
  const proReihe = beste.proReihe
  const reihen = Math.ceil(anzahl / proReihe)
  const aussen = groesse * DREH_ZUSCHLAG
  const zelleB = breite / proReihe
  const zelleH = hoehe / reihen
  // Spielraum je Richtung: so weit darf eine Karte verrutschen, ohne mehr als 8 px zu überlappen
  const spielX = Math.max(0, (zelleB - aussen + rw.ueberlappung) / 2)
  const spielY = Math.max(0, (zelleH - aussen + rw.ueberlappung) / 2)
  const plaetze: Platz[] = []
  for (let i = 0; i < anzahl; i++) {
    const reihe = Math.floor(i / proReihe)
    const inReihe = Math.min(proReihe, anzahl - reihe * proReihe)
    const spalte = i % proReihe
    const einzug = ((proReihe - inReihe) * zelleB) / 2
    plaetze.push({
      x: einzug + zelleB * (spalte + 0.5) + (Math.random() * 2 - 1) * spielX,
      y: zelleH * (reihe + 0.5) + (Math.random() * 2 - 1) * spielY,
      drehung: (Math.random() * 2 - 1) * rw.drehung,
    })
  }
  return { groesse, plaetze }
}

/* ── Ein Gegenstand als Karte (Haufen, Wegpunkt oder in der Hand) ── */

function GegenstandBild({ kennung, anteil }: { kennung: string; anteil: number }) {
  const g = gegenstand(kennung)
  return (
    <img
      src={g.bild}
      alt={g.name}
      draggable={false}
      className="pointer-events-none block max-w-none object-contain"
      style={{ width: `${anteil * 100}%`, height: `${anteil * 100}%` }}
    />
  )
}

const layoutUebergang = { duration: 0.3, ease: kurve }
const kartenSchatten = '0 8px 40px rgba(0,0,0,0.06)'
const gehobenSchatten = '0 8px 40px rgba(0,0,0,0.12)'

type Herkunft = 'haufen' | number
type Ziehen = { kennung: string; herkunft: Herkunft; startX: number; startY: number; aktiv: boolean }

export default function Rueckweg({
  phase,
  ziehung,
  bewertung,
  breite,
  hoehe,
  faktor,
  echoo,
  echooElement,
  obenHoehe,
  proberunde,
  onBestaetigt,
  onHeimgekehrt,
  onBelegt,
  onJubel,
}: {
  phase: 'rueckweg' | 'aufloesung' | 'danach'
  ziehung: Ziehung
  bewertung: { richtigProWegpunkt: boolean[]; routeRichtig: boolean; gelegt: string[] } | null
  breite: number
  hoehe: number
  faktor: number
  echoo: { x: MotionValue<number>; y: MotionValue<number>; opacity: MotionValue<number>; skala: MotionValue<number>; seitX: MotionValue<number> }
  /** Echoo selbst — liegt zwischen Himmel und Erde, die Erde verdeckt ihn am Horizont */
  echooElement: ReactNode
  /** Szenenhöhe des letzten Haltepunkts — oberes Ende des verkürzten Verlaufs */
  obenHoehe: number
  proberunde: boolean
  onBestaetigt: (gelegt: string[]) => void
  onHeimgekehrt: () => void
  /** Zahl der belegten Wegpunkte — für die Rundenanzeige */
  onBelegt: (anzahl: number) => void
  /** richtige Route: Echoo ist unten angekommen und jubelt */
  onJubel: () => void
}) {
  const reduziert = Boolean(useReducedMotion())
  const laenge = ziehung.folge.length
  const geo = useMemo(() => geometrie(breite, hoehe, faktor, laenge), [breite, hoehe, faktor, laenge])
  const [belegung, setBelegung] = useState<(string | null)[]>(() => Array(laenge).fill(null))
  const [auswahl, setAuswahl] = useState<string | null>(null)
  const [ziehen, setZiehen] = useState<Ziehen | null>(null)
  const [ueber, setUeber] = useState<number | null>(null)
  const [aufgedeckt, setAufgedeckt] = useState(0)
  const wurzel = useRef<HTMLDivElement>(null)
  const ziehRef = useRef<Ziehen | null>(null)
  const klickSperre = useRef(false)
  const handX = useMotionValue(0)
  const handY = useMotionValue(0)

  /* Kartenhaufen: Fläche messen, dann zufällig anordnen (neu je Runde) */
  const haufenRef = useRef<HTMLDivElement>(null)
  const [haufenMass, setHaufenMass] = useState<{ b: number; h: number } | null>(null)
  useLayoutEffect(() => {
    const el = haufenRef.current
    if (!el) return
    const beobachter = new ResizeObserver(() => setHaufenMass({ b: el.clientWidth, h: el.clientHeight }))
    beobachter.observe(el)
    return () => beobachter.disconnect()
  }, [phase])
  const karten = useMemo(() => mische([...ziehung.folge, ziehung.zusatz]), [ziehung])
  const haufen = useMemo(
    () => (haufenMass ? haufenLayout(karten.length, haufenMass.b, haufenMass.h) : null),
    // Anordnung bleibt stehen, solange die Fläche gleich groß ist
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [karten, haufenMass?.b, haufenMass?.h],
  )

  /* Übergang in die Übersicht: Echoo nach oben, Erde fährt von unten herein */
  const erdeY = useMotionValue(reduziert ? 0 : hoehe - geo.erdeOben)
  useEffect(() => {
    const dauer = reduziert ? 0 : rw.erdeFahrt / 1000
    // Echoo gleitet vom Ende des Aufstiegs in die Ecke und wächst dabei — gleichzeitig mit der Erde
    const laeufe = [
      animate(erdeY, 0, { duration: dauer, ease: kurve }),
      animate(echoo.x, ECHOO_ECKE.x * faktor, { duration: dauer, ease: kurve }),
      animate(echoo.seitX, 0, { duration: dauer, ease: kurve }),
      animate(echoo.y, ECHOO_ECKE.y, { duration: dauer, ease: kurve }),
      animate(echoo.skala, (ECHOO_ECKE.koerper * faktor) / sz.echooGroesse, { duration: dauer, ease: kurve }),
    ]
    return () => laeufe.forEach((l) => l.stop())
    // nur beim Eintritt in die Übersicht
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Verkürzter Himmelsverlauf: Bildschirm-y ↦ Szenenhöhe zwischen letztem Haltepunkt und Erde */
  const verlauf = useMemo(() => {
    const zuHoehe = (y: number) => obenHoehe + ((y - LEISTE_MITTE) * (sz.erdeOben - obenHoehe)) / (geo.erdeOben - LEISTE_MITTE)
    const stopps = Array.from({ length: 13 }, (_, i) => {
      const y = (hoehe * i) / 12
      return `${himmelsfarbe(zuHoehe(y))} ${Math.round((i / 12) * 100)}%`
    })
    return `linear-gradient(180deg, ${stopps.join(', ')})`
  }, [obenHoehe, geo, hoehe])

  /* ── Ablegen, Tauschen, Zurücklegen ── */

  function lege(kennung: string, herkunft: Herkunft, ziel: number) {
    setBelegung((alt) => {
      const neu = [...alt]
      const verdraengt = neu[ziel]
      if (herkunft === ziel) return alt
      neu[ziel] = kennung
      // der verdrängte Gegenstand geht dorthin, woher die gezogene Karte kam
      if (herkunft !== 'haufen') neu[herkunft] = verdraengt
      return neu
    })
    setAuswahl(null)
  }

  function zurueckInDenHaufen(index: number) {
    setBelegung((alt) => alt.map((k, i) => (i === index ? null : k)))
  }

  function wegpunktUnter(x: number, y: number): number | null {
    let bester: number | null = null
    let abstand = geo.durchmesser / 2 + 16
    geo.wegpunkte.forEach((p, i) => {
      const d = Math.hypot(p.x - x, p.y - y)
      if (d < abstand) {
        abstand = d
        bester = i
      }
    })
    return bester
  }

  function lokal(event: PointerEvent | ReactPointerEvent) {
    const r = wurzel.current!.getBoundingClientRect()
    return { x: event.clientX - r.left, y: event.clientY - r.top }
  }

  const kartenGroesse = haufen?.groesse ?? rw.karte

  function greife(event: ReactPointerEvent, kennung: string, herkunft: Herkunft) {
    if (phase !== 'rueckweg' || event.button !== 0) return
    const start = lokal(event)
    ziehRef.current = { kennung, herkunft, startX: start.x, startY: start.y, aktiv: false }
    klickSperre.current = false

    const bewege = (e: PointerEvent) => {
      const z = ziehRef.current
      if (!z) return
      const p = lokal(e)
      if (!z.aktiv && Math.hypot(p.x - z.startX, p.y - z.startY) > rw.ziehSchwelle) {
        z.aktiv = true
        klickSperre.current = true
        setAuswahl(null)
        setZiehen({ ...z })
      }
      if (z.aktiv) {
        handX.set(p.x - kartenGroesse / 2)
        handY.set(p.y - kartenGroesse / 2)
        setUeber(wegpunktUnter(p.x, p.y))
      }
    }
    const lasse = (e: PointerEvent) => {
      window.removeEventListener('pointermove', bewege)
      window.removeEventListener('pointerup', lasse)
      window.removeEventListener('pointercancel', lasse)
      const z = ziehRef.current
      ziehRef.current = null
      // der Klick nach dem Loslassen gehört noch zum Ziehen — danach ist Antippen wieder frei
      window.setTimeout(() => (klickSperre.current = false), 0)
      if (!z?.aktiv) return
      const p = lokal(e)
      const ziel = wegpunktUnter(p.x, p.y)
      if (ziel !== null) lege(z.kennung, z.herkunft, ziel)
      else if (z.herkunft !== 'haufen' && p.y > geo.sheetOben) zurueckInDenHaufen(z.herkunft)
      setZiehen(null)
      setUeber(null)
    }
    window.addEventListener('pointermove', bewege)
    window.addEventListener('pointerup', lasse)
    window.addEventListener('pointercancel', lasse)
  }

  /** Antippen einer Karte im Haufen: auswählen oder abwählen */
  function tippeKarte(kennung: string) {
    if (klickSperre.current) return
    setAuswahl((a) => (a === kennung ? null : kennung))
  }

  /** Antippen eines Wegpunkts: ausgewählte Karte ablegen, sonst Belegung zurücklegen */
  function tippeWegpunkt(index: number) {
    if (klickSperre.current || phase !== 'rueckweg') return
    if (auswahl) lege(auswahl, 'haufen', index)
    else if (belegung[index]) zurueckInDenHaufen(index)
  }

  const vollstaendig = belegung.every(Boolean)
  const belegt = belegung.filter(Boolean).length
  useEffect(() => onBelegt(belegt), [belegt, onBelegt])
  const imHaufen = (k: string) => !belegung.includes(k) && ziehen?.kennung !== k

  /* ── Auflösung und Heimkehr ── */

  const ersterFehler = bewertung ? bewertung.richtigProWegpunkt.findIndex((r) => !r) : -1
  // die Route verbindet Erde und Wegpunkte — zu Echoo führt keine Linie
  const abschnitte = [geo.start, ...geo.wegpunkte]
  /** Abschnitte, die Echoo auf dem Heimflug schon passiert hat (Index i = Abschnitt zu Wegpunkt i + 1) */
  const [passiert, setPassiert] = useState<Set<number>>(() => new Set())

  useEffect(() => {
    if (phase !== 'aufloesung' || !bewertung) return
    const zeitgeber: number[] = []
    const nach = (ms: number, f: () => void) => zeitgeber.push(window.setTimeout(f, ms))
    for (let i = 1; i <= laenge; i++) nach(i * au.abschnitt, () => setAufgedeckt(i))
    const aufgeloest = laenge * au.abschnitt + au.ergebnis
    let laeufe: { stop: () => void }[] = []

    // Falsche Route: Echoo bleibt in der Ecke, ohne traurige Reaktion — dann folgt das Sheet
    if (!bewertung.routeRichtig) {
      nach(aufgeloest + NACHLAUF_FALSCH, onHeimgekehrt)
      return () => zeitgeber.forEach(window.clearTimeout)
    }

    nach(aufgeloest + au.pauseVorHeimkehr, () => {
      if (reduziert) {
        // ohne Flug: Echoo grinst und strahlt in der Ecke
        onJubel()
        nach(konfig.jubel.halten, onHeimgekehrt)
        return
      }
      // 1. aus der Ecke zum obersten Wegpunkt, dabei zurück auf Fluggröße
      const oben = geo.wegpunkte[laenge - 1]
      const anflug = { duration: ANFLUG / 1000, ease: kurve }
      laeufe = [animate(echoo.x, oben.x, anflug), animate(echoo.y, oben.y, anflug), animate(echoo.skala, 1, anflug)]
      nach(ANFLUG, () => {
        // 2. die Route entlang bis zur Erde — ein einziger weicher Fortschritt über die ganze Strecke
        //    (nach Weglänge verteilt), passierte Abschnitte blenden aus
        const weg = [...abschnitte].reverse()
        const laengen = weg.slice(1).map((p, i) => Math.hypot(p.x - weg[i].x, p.y - weg[i].y))
        const summe = laengen.reduce((s0, l) => s0 + l, 0) || 1
        let bisher = 0
        const marken = [0, ...laengen.map((l) => (bisher += l) / summe)]
        let passiertBis = 0
        laeufe.push(
          animate(0, 1, {
            duration: au.gleiten / 1000,
            ease: au.gleitenKurve,
            onUpdate: (f) => {
              const i = Math.min(laengen.length - 1, marken.findIndex((m, n) => n > 0 && f <= m) - 1)
              const t = (f - marken[i]) / (marken[i + 1] - marken[i] || 1)
              echoo.x.set(weg[i].x + (weg[i + 1].x - weg[i].x) * t)
              echoo.y.set(weg[i].y + (weg[i + 1].y - weg[i].y) * t)
              // Abschnitt zu Wegpunkt j (Index j − 1) ist passiert, sobald Echoo unten an ihm ankommt
              while (passiertBis < laengen.length && f >= marken[passiertBis + 1]) {
                const n = passiertBis++
                setPassiert((alt) => new Set(alt).add(laenge - 1 - n))
              }
            },
          }),
        )
        nach(au.gleiten, () => {
          // 3. angekommen: Echoo hebt sich über den Horizont, wird größer, grinst und strahlt
          const j = konfig.jubel
          const jubel = { duration: j.dauer / 1000, ease: kurve }
          laeufe.push(animate(echoo.y, geo.start.y - j.hub, jubel), animate(echoo.skala, j.skala, jubel))
          onJubel()
          nach(j.dauer + j.halten, onHeimgekehrt)
        })
      })
    })
    return () => {
      zeitgeber.forEach(window.clearTimeout)
      laeufe.forEach((l) => l.stop())
    }
    // einmal je Auflösung
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, bewertung])

  /* Proberunde: Hinweise Schritt für Schritt */
  const probeSchritt =
    !proberunde || phase !== 'rueckweg'
      ? null
      : belegung[0] !== ziehung.folge[0]
        ? 1
        : belegung[1] !== ziehung.folge[1]
          ? 2
          : 3

  const d = geo.durchmesser

  return (
    <motion.div
      ref={wurzel}
      className="absolute inset-0 z-20 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: konfig.aufgang.ueberblendung / 1000, ease: kurve } }}
      transition={{ duration: reduziert ? 0.2 : 0.4, ease: kurve }}
    >
      {/* verkürzter Himmelsverlauf des durchflogenen Abschnitts */}
      <div className="absolute inset-0" style={{ background: verlauf }} aria-hidden />
      <div className="absolute inset-0 z-[1]">{echooElement}</div>

      {/* Erde fährt von unten ins Bild — sie liegt vor Echoo */}
      <motion.div className="pointer-events-none absolute left-0 top-0 z-[2]" style={{ y: erdeY }} aria-hidden>
        <div className="absolute left-0" style={{ top: geo.erdeOben, width: sz.breite, transform: `scale(${faktor})`, transformOrigin: '0 0' }}>
          <ErdeBild />
        </div>
      </motion.div>

      {/* Route: Abschnitt für Abschnitt per stroke-dashoffset, ab dem ersten Fehler gestrichelt */}
      {phase !== 'rueckweg' && bewertung && (
        <svg className="pointer-events-none absolute inset-0 z-[3] size-full" aria-hidden>
          <defs>
            {abschnitte.slice(1).map((p, i) => (
              <mask key={i} id={`route-maske-${i}`} maskUnits="userSpaceOnUse">
                <motion.line
                  x1={abschnitte[i].x}
                  y1={abschnitte[i].y}
                  x2={p.x}
                  y2={p.y}
                  stroke="white"
                  strokeWidth={au.linienBreite + 2}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1 1"
                  initial={{ strokeDashoffset: 1 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: au.abschnitt / 1000, delay: (i * au.abschnitt) / 1000, ease: 'linear' }}
                />
              </mask>
            ))}
          </defs>
          {abschnitte.slice(1).map((p, i) => {
            const gestrichelt = ersterFehler >= 0 && i > ersterFehler
            return (
              <motion.g key={i} initial={false} animate={{ opacity: passiert.has(i) ? 0 : 1 }} transition={{ duration: ABSCHNITT_AUS / 1000, ease: kurve }}>
              <line
                x1={abschnitte[i].x}
                y1={abschnitte[i].y}
                x2={p.x}
                y2={p.y}
                mask={`url(#route-maske-${i})`}
                stroke={gestrichelt ? 'white' : akzent}
                strokeOpacity={gestrichelt ? 0.6 : 1}
                strokeWidth={au.linienBreite}
                strokeLinecap="round"
                strokeDasharray={gestrichelt ? '8 10' : undefined}
              />
              </motion.g>
            )
          })}
        </svg>
      )}

      {/* Wegpunkte: gestaffelt von unten nach oben */}
      {geo.wegpunkte.map((p, i) => {
        const belegt = belegung[i]
        const gelegt = bewertung?.gelegt[i] ?? null
        const inhalt = bewertung ? gelegt : belegt
        return (
          <Wegpunkt
            key={i}
            index={i}
            mitte={p}
            durchmesser={d}
            inhalt={inhalt}
            inhaltSichtbar={Boolean(inhalt) && ziehen?.kennung !== inhalt}
            ergebnis={bewertung && aufgedeckt > i ? bewertung.richtigProWegpunkt[i] : null}
            richtigerGegenstand={ziehung.folge[i]}
            hervorgehoben={ueber === i}
            auswahlAktiv={Boolean(auswahl)}
            layoutId={bewertung ? undefined : `karte-${inhalt}`}
            gesperrt={phase !== 'rueckweg'}
            onClick={() => tippeWegpunkt(i)}
            onPointerDown={(e) => belegt && greife(e, belegt, i)}
          />
        )
      })}

      {/* Proberunde: Hinweise nahe am Wegpunkt */}
      <AnimatePresence>
        {(probeSchritt === 1 || probeSchritt === 2) && (
          <Hinweis
            key={`probe-${probeSchritt}`}
            text={probeSchritt === 1 ? texte.proberunde.rueckwegSchritt1 : texte.proberunde.rueckwegSchritt2}
            style={
              probeSchritt === 1
                ? { left: geo.wegpunkte[0].x + d / 2 + 12, top: geo.wegpunkte[0].y - 24, maxWidth: breite - geo.wegpunkte[0].x - d / 2 - 24 }
                : { right: breite - (geo.wegpunkte[1].x - d / 2 - 12), top: geo.wegpunkte[1].y - 24, maxWidth: geo.wegpunkte[1].x - d / 2 - 24 }
            }
          />
        )}
      </AnimatePresence>

      {/* Rückweg-Sheet: nicht wegwischbar, kein Kreuz — Abbrechen nur über den Zurück-Pfeil */}
      <AnimatePresence>
        {phase === 'rueckweg' && (
          <Sheet key="rueckweg" variante="karte" schliessbar={false} durchlaessig hoehe={`${rw.sheetAnteil * 100}%`}>
            <div className="flex flex-col">
              <h2 id="sheet-titel" className="mt-1 text-[26px] font-semibold leading-8 tracking-[-0.01em]">{texte.rueckweg.titel}</h2>
              <p className="mt-2 text-[14px] leading-5 text-[#6a6a6a]">{texte.rueckweg.text}</p>
              <div ref={haufenRef} className="relative my-3 min-h-0 flex-1">
                {haufen &&
                  karten.map((kennung, i) => {
                    const platz = haufen.plaetze[i]
                    return (
                      imHaufen(kennung) && (
                        <GegenstandsKarte
                          key={kennung}
                          kennung={kennung}
                          mitte={platz}
                          groesse={kartenGroesse}
                          drehung={platz.drehung}
                          ausgewaehlt={auswahl === kennung}
                          onPointerDown={(e) => greife(e, kennung, 'haufen')}
                          onClick={() => tippeKarte(kennung)}
                        />
                      )
                    )
                  })}
                <AnimatePresence>
                  {probeSchritt === 3 && (
                    <Hinweis key="probe-3" text={texte.proberunde.rueckwegSchritt3} className="bottom-0 left-1/2 -translate-x-1/2" />
                  )}
                </AnimatePresence>
              </div>
              <button
                type="button"
                disabled={!vollstaendig}
                onClick={() => onBestaetigt(belegung as string[])}
                className={`${knopfPrimaer} shrink-0 disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {texte.rueckweg.primaer}
              </button>
            </div>
          </Sheet>
        )}
      </AnimatePresence>

      {/* Karte in der Hand: gehoben, stärkerer Schatten, folgt dem Finger */}
      {ziehen?.aktiv && <GehobeneKarte kennung={ziehen.kennung} links={handX} oben={handY} groesse={kartenGroesse} />}
    </motion.div>
  )
}

/* ── Bausteine: Wegpunkt, Karte im Haufen, Karte in der Hand ──
   Aus dem Rückweg herausgelöst, damit die Konzeptseite dieselben Bausteine
   in festen Zuständen zeigen kann. Das Spiel rendert sie unverändert. */

/** Wegpunkt: leer (gestrichelt), hervorgehoben, belegt, richtig oder falsch */
export function Wegpunkt({
  index,
  mitte,
  durchmesser: d,
  inhalt,
  inhaltSichtbar,
  ergebnis,
  richtigerGegenstand,
  hervorgehoben,
  auswahlAktiv,
  layoutId,
  gesperrt,
  onClick,
  onPointerDown,
}: {
  index: number
  mitte: Punkt
  durchmesser: number
  inhalt: string | null
  inhaltSichtbar: boolean
  ergebnis: boolean | null
  richtigerGegenstand: string
  hervorgehoben: boolean
  auswahlAktiv: boolean
  layoutId?: string
  gesperrt: boolean
  onClick?: () => void
  onPointerDown?: (e: ReactPointerEvent) => void
}) {
  const reduziert = Boolean(useReducedMotion())
  const nummer = index + 1
  const seite = nummer % 2 === 1 ? -1 : 1
  return (
    <motion.button
      type="button"
      disabled={gesperrt}
      aria-label={
        inhalt
          ? `Wegpunkt ${nummer}: ${gegenstand(inhalt).name}${ergebnis === null ? ' – antippen zum Zurücklegen' : ergebnis ? ' – richtig' : ` – falsch, richtig wäre ${gegenstand(richtigerGegenstand).name}`}`
          : `Wegpunkt ${nummer}, leer`
      }
      onClick={onClick}
      onPointerDown={onPointerDown}
      className="absolute z-[4] touch-none select-none"
      style={{ left: mitte.x - d / 2, top: mitte.y - d / 2, width: d, height: d }}
      initial={reduziert ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: hervorgehoben ? rw.hervorheben : 1 }}
      transition={{
        opacity: { duration: 0.3, delay: (rw.erdeFahrt * 0.5 + index * rw.wegpunktStaffel) / 1000 },
        scale: { duration: 0.2, ease: kurve, delay: hervorgehoben ? 0 : (rw.erdeFahrt * 0.5 + index * rw.wegpunktStaffel) / 1000 },
      }}
    >
      <span
        className="absolute inset-0 flex items-center justify-center rounded-full border-2"
        style={{
          borderStyle: inhalt || hervorgehoben || auswahlAktiv ? 'solid' : 'dashed',
          borderColor: ergebnis === true ? akzent : 'white',
          background: inhalt && ergebnis !== false ? 'white' : 'rgba(255,255,255,0.5)',
        }}
      >
        {!inhalt && (
          <span className="text-[18px] font-semibold leading-5 text-[#c0c0c0]" aria-hidden>
            {nummer}
          </span>
        )}
      </span>

      {/* gelegter Gegenstand — bei „falsch" rückt er verkleinert halb neben den Wegpunkt */}
      {inhalt && inhaltSichtbar && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 flex items-center justify-center"
          transition={layoutUebergang}
          animate={
            ergebnis === false
              ? { x: seite * d * 0.75, scale: 0.5, opacity: 0.5 }
              : { x: 0, scale: 1, opacity: 1 }
          }
        >
          <GegenstandBild kennung={inhalt} anteil={0.72} />
        </motion.span>
      )}

      {/* richtiger Gegenstand blendet im Wegpunkt ein */}
      {ergebnis === false && (
        <motion.span
          className="absolute inset-0 flex items-center justify-center rounded-full bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: au.ergebnis / 1000, ease: kurve }}
        >
          <GegenstandBild kennung={richtigerGegenstand} anteil={0.72} />
        </motion.span>
      )}

      {/* Abzeichen: Symbol statt nur Farbe */}
      {ergebnis !== null && (
        <motion.span
          className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full"
          style={{ background: ergebnis ? akzent : neutral }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: au.ergebnis / 1000, ease: kurve }}
          aria-hidden
        >
          {ergebnis ? <Check size={12} strokeWidth={3} color="black" /> : <X size={12} strokeWidth={3} color="white" />}
        </motion.span>
      )}
    </motion.button>
  )
}

/** Gegenstands-Karte im Haufen: normal oder ausgewählt (Rahmen in Akzentfarbe) */
export function GegenstandsKarte({
  kennung,
  mitte,
  groesse: g,
  drehung,
  ausgewaehlt,
  onPointerDown,
  onClick,
}: {
  kennung: string
  mitte: Punkt
  groesse: number
  drehung: number
  ausgewaehlt: boolean
  onPointerDown?: (e: ReactPointerEvent) => void
  onClick?: () => void
}) {
  return (
    <motion.button
      type="button"
      layoutId={`karte-${kennung}`}
      aria-label={gegenstand(kennung).name}
      aria-pressed={ausgewaehlt}
      onPointerDown={onPointerDown}
      onClick={onClick}
      className="absolute flex touch-none select-none items-center justify-center border-solid bg-white"
      style={{
        left: mitte.x - g / 2,
        top: mitte.y - g / 2,
        width: g,
        height: g,
        borderRadius: g * 0.26,
        borderWidth: ausgewaehlt ? 2 : 0.5,
        borderColor: ausgewaehlt ? akzent : '#f2f2f2',
        boxShadow: kartenSchatten,
      }}
      initial={{ opacity: 0, rotate: drehung }}
      animate={{ opacity: 1, rotate: drehung }}
      transition={layoutUebergang}
    >
      <GegenstandBild kennung={kennung} anteil={0.73} />
    </motion.button>
  )
}

/** Karte in der Hand: gehoben, stärkerer Schatten, folgt dem Finger */
export function GehobeneKarte({
  kennung,
  links,
  oben,
  groesse,
}: {
  kennung: string
  links: MotionValue<number> | number
  oben: MotionValue<number> | number
  groesse: number
}) {
  return (
    <motion.div
      layoutId={`karte-${kennung}`}
      className="pointer-events-none absolute z-[60] flex items-center justify-center bg-white"
      style={{
        left: links,
        top: oben,
        width: groesse,
        height: groesse,
        borderRadius: groesse * 0.26,
        boxShadow: gehobenSchatten,
      }}
      initial={{ scale: 1 }}
      animate={{ scale: rw.anheben, rotate: 0 }}
      transition={layoutUebergang}
    >
      <GegenstandBild kennung={kennung} anteil={0.73} />
    </motion.div>
  )
}

