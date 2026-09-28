import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from 'react'
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, useVelocity } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Sheet from '../components/ui/Sheet'
import { SheetBewegung } from '../components/ui/sheetBewegung'
import EchooMini from '../components/himmelsroute/EchooMini'
import {
  BewegungspauseSheet,
  EinstellungenSheet,
  ErgebnisSheet,
  PulsSheet,
  TextSheet,
  VerlassenSheet,
  knopfPrimaer,
  knopfSekundaer,
} from '../components/spiel/SpielSheets'
import { SzeneErde, SzeneHinten, SzeneVordergrund } from '../components/himmelsroute/Szene'
import Begegnung from '../components/himmelsroute/Begegnung'
import Rueckweg, { LEISTE_MITTE } from '../components/himmelsroute/Rueckweg'
import Hinweis from '../components/himmelsroute/Hinweis'
import Leisten from '../components/himmelsroute/Leisten'
import MiniRoute from '../components/himmelsroute/MiniRoute'
import ErklaerIllustration from '../components/himmelsroute/ErklaerIllustration'
import { frageNeigungAn, useNeigung } from '../components/himmelsroute/neigung'
import { konfig } from '../games/himmelsroute/config'
import { konfig as wolkenKonfig } from '../games/wolkensammeln/config'
import { gegenstand } from '../games/himmelsroute/gegenstaende'
import {
  merkspanneIm,
  neuerZustand,
  sitzungsErgebnis,
  uebergang,
  weisePausenbedingungZu,
  type Ereignis,
  type Zustand,
} from '../games/himmelsroute/ablauf'
import { berechneEndwerte, type Endwerte } from '../games/himmelsroute/auswertung'
import { letzteSitzung, merkeProberundeGesehen, proberundeGesehen, speichereSitzung } from '../games/himmelsroute/storage'
import {
  durchgang1Text,
  endergebnisZeilen,
  grosseZahl,
  rundenanzeigeTeile,
  rundenErfolg,
  rundenstartAnzeige,
  satz1,
  satz2,
  texte,
} from '../games/himmelsroute/texte'

/*
  Himmelsroute: eine durchgehende Szene. Echoo geht hinter der Erde auf,
  man zieht ihn von Haltepunkt zu Haltepunkt nach oben, unterwegs begegnet
  er Gegenständen. Oben angekommen baut man seine Route nach (Rückweg),
  dann gleitet Echoo heim. Sheets legen sich darüber.

  Der Ablauf kommt vollständig aus der Zustandsmaschine (games/himmelsroute/
  ablauf.ts); dieser Bildschirm meldet nur Ereignisse und zeigt den Zustand.
*/

const sz = konfig.szene
const fb = konfig.fortbewegung
const fl = konfig.flug
const ag = konfig.aufgang
const kurve = konfig.kurve
const puls = wolkenKonfig.messung
/** Erklär-Sheet öffnet erst, wenn der Übergang vom Dashboard steht (wie Wolkensammeln) */
const ERKLAERUNG_VERZOEGERUNG = wolkenKonfig.einstieg.erklaerungVerzoegerung
/** Oberkante der unteren Leiste: 40 px Abstand zum Rand + 48 px Höhe (Figma 507:1276) */
const LEISTE_UNTEN = 40 + 48

const haltepunkt = (k: number) => sz.start - k * konfig.haltepunktAbstand
const rundenPhasen: Zustand['phase'][] = ['aufgang', 'aufstieg', 'rueckweg', 'aufloesung']

export default function Himmelsroute() {
  const navigate = useNavigate()
  const reduziert = Boolean(useReducedMotion())

  /* ── Größe: die Szene wird auf Bildschirmbreite skaliert ── */
  const wurzel = useRef<HTMLDivElement>(null)
  const [mass, setMass] = useState<{ b: number; h: number }>({ b: sz.breite, h: 852 })
  useLayoutEffect(() => {
    const el = wurzel.current
    if (!el) return
    const messe = () => setMass({ b: el.clientWidth, h: el.clientHeight })
    messe()
    const beobachter = new ResizeObserver(messe)
    beobachter.observe(el)
    return () => beobachter.disconnect()
  }, [])
  const faktor = mass.b / sz.breite
  const echooY = mass.h * sz.echooBildschirm
  const mitteX = mass.b / 2

  /* ── Zustand: jedes Ereignis läuft durch die Zustandsmaschine ──
     Solange Abbruch oder Einstellungen offen sind, warten Ereignisse und
     laufen nach dem Schließen nach. */
  const [z, setZ] = useState<Zustand>(neuerZustand)
  const zRef = useRef(z)
  const warteschlange = useRef<Ereignis[]>([])
  const melde = useCallback((e: Ereignis) => {
    const alt = zRef.current
    if (alt.sheetOffen && e.typ !== 'sheetZu' && e.typ !== 'spielVerlassen' && e.typ !== 'zeigedauerSetzen') {
      warteschlange.current.push(e)
      return
    }
    let neu = uebergang(alt, e, Date.now())
    if (e.typ === 'sheetZu') {
      for (const w of warteschlange.current) neu = uebergang(neu, w, Date.now())
      warteschlange.current = []
    }
    zRef.current = neu
    setZ(neu)
  }, [])

  const [overlay, setOverlay] = useState<'abbruch' | 'einstellungen' | null>(null)
  function oeffne(art: 'abbruch' | 'einstellungen') {
    setOverlay(art)
    melde({ typ: 'sheetAuf' })
  }
  function schliesse() {
    setOverlay(null)
    melde({ typ: 'sheetZu' })
  }

  const [erklaerungBereit, setErklaerungBereit] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setErklaerungBereit(true), ERKLAERUNG_VERZOEGERUNG)
    return () => window.clearTimeout(id)
  }, [])

  const [pulsVorher, setPulsVorher] = useState<number>(puls.startPuls)
  const [pulsDanach, setPulsDanach] = useState<number>(puls.startPuls + puls.bewegungsPulsAbstand)
  /** Regler in den Einstellungen; übernommen wird beim Speichern */
  const [zeigedauer, setZeigedauer] = useState<number>(konfig.zeigedauer)

  /* ── Kamera und Echoo ── */
  const kamera = useMotionValue<number>(sz.start)
  const echoo = {
    x: useMotionValue(mitteX),
    y: useMotionValue(echooY + ag.versatz),
    opacity: useMotionValue(0),
    /** 1 = Fluggröße; beim Nachbauen größer in der Ecke */
    skala: useMotionValue(1),
    /** seitliche Ruhelage im Aufstieg (px), wechselt je Haltepunkt */
    seitX: useMotionValue(0),
  }
  const neigung = useNeigung()
  const [ansicht, setAnsicht] = useState<'szene' | 'uebersicht'>('szene')
  const ansichtRef = useRef(ansicht)
  ansichtRef.current = ansicht
  const [rundenstart, setRundenstart] = useState<{ titel: string; unterzeile: string } | null>(null)
  const [faehrt, setFaehrt] = useState(false)
  const [gezogen, setGezogen] = useState(false)
  const [belegt, setBelegt] = useState(0)
  /** nach richtiger Route unten angekommen: Echoo grinst und strahlt */
  const [jubelt, setJubelt] = useState(false)

  /* Flug-Gefühl: Vorlauf auf dem Bildschirm, Tempo aus Kamera und Vorlauf */
  const vorlauf = useMotionValue(0)
  const echooBildY = useTransform(() => echoo.y.get() + vorlauf.get())
  /* Seitlich: Echoo gleitet im Flug zur Seite des nächsten Haltepunkts und bleibt dort stehen
     (ungerades k links, gerades rechts, Start mittig) — hängt nur von der Nummer ab, nie vom
     Gegenstand. Im Flug neigt er sich in die Richtung, in Ruhe steht er gerade. */
  const flugRichtung = useMotionValue(-1)
  const echooBildX = useTransform(() => echoo.x.get() + echoo.seitX.get())
  const echooNeigung = useTransform(() => Math.min(1, -vorlauf.get() / fl.vorlauf) * flugRichtung.get() * fl.neigung)
  const kameraTempo = useVelocity(kamera)
  const vorlaufTempo = useVelocity(vorlauf)
  /** 0 … 1: wie schnell Echoo gerade durch die Szene steigt */
  const tempo = useTransform(() => {
    if (reduziert) return 0
    const steigen = -kameraTempo.get() - vorlaufTempo.get() / faktor
    return Math.min(1, Math.max(0, steigen / fl.vollesTempo))
  })
  const streckungX = useTransform(tempo, [0, 1], [1, fl.streckungX])
  const streckungY = useTransform(tempo, [0, 1], [1, fl.streckungY])
  const schweifDeckkraft = useTransform(tempo, [0, 1], [0, fl.schweifDeckkraft])

  // Echoo bleibt in der Szene mittig bei 62 % der Höhe, auch wenn sich die Größe ändert
  useEffect(() => {
    if (ansicht !== 'szene' || z.phase === 'aufgang') return
    echoo.x.set(mitteX)
    echoo.y.set(echooY)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mitteX, echooY])

  /* Aufgang: bei jeder neu gezogenen Runde. Nach einer Übersicht blendet
     diese zuerst zur Szene unten an der Erde über. */
  useEffect(() => {
    if (z.phase !== 'aufgang' || !z.ziehung) return
    halteAn()
    const vonUebersicht = ansichtRef.current === 'uebersicht'
    setAnsicht('szene')
    const zeitgeber: number[] = []
    let laeufe: { stop: () => void }[] = []
    const beginne = () => {
      kamera.set(sz.start)
      vorlauf.set(0)
      echoo.skala.set(1)
      echoo.seitX.set(0)
      setJubelt(false)
      echoo.x.set(mitteX)
      echoo.y.set(echooY + ag.versatz)
      echoo.opacity.set(0)
      laeufe = [
        animate(echoo.y, echooY, { duration: reduziert ? 0 : ag.dauer / 1000, ease: kurve }),
        animate(echoo.opacity, 1, { duration: (reduziert ? 300 : ag.dauer) / 1000, ease: kurve }),
      ]
      setRundenstart(rundenstartAnzeige(zRef.current))
      zeitgeber.push(window.setTimeout(() => setRundenstart(null), ag.anzeigeEin + ag.anzeigeStehen))
      zeitgeber.push(
        window.setTimeout(() => melde({ typ: 'aufgangFertig' }), Math.max(ag.dauer, ag.anzeigeEin + ag.anzeigeStehen + ag.anzeigeAus)),
      )
    }
    if (vonUebersicht) {
      kamera.set(sz.start)
      // die große Echoo-Version gilt nur für den Nachbau: in der neuen Runde sofort weg und
      // zurück auf Originalgröße, dann geht er hinter der Erde neu auf
      echoo.opacity.set(0)
      echoo.skala.set(1)
      zeitgeber.push(window.setTimeout(beginne, ag.ueberblendung))
    } else beginne()
    return () => {
      zeitgeber.forEach(window.clearTimeout)
      laeufe.forEach((l) => l.stop())
    }
    // nur beim Start einer neu gezogenen Runde
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [z.ziehung])

  /* ── Fortbewegung: Ziehen, Mausrad, Pfeil — nur zwischen den Begegnungen ── */
  const basis = haltepunkt(z.begegnungen)
  const naechster = haltepunkt(z.begegnungen + 1)
  /** seitliche Ruhelage an Haltepunkt k */
  const seiteBei = (k: number) => (k === 0 ? 0 : (k % 2 === 1 ? -1 : 1) * fl.seitlich)
  const seiteBasis = seiteBei(z.begegnungen)
  const seiteZiel = seiteBei(z.begegnungen + 1)
  useEffect(() => flugRichtung.set(Math.sign(seiteZiel - seiteBasis) || 1), [seiteZiel, seiteBasis, flugRichtung])
  const frei =
    z.phase === 'aufstieg' && !z.begegnungLaeuft && z.begegnungen < z.laenge && !z.sheetOffen && !faehrt && ansicht === 'szene'

  /*
    Flug zum nächsten Haltepunkt: Echoo steigt auf dem Bildschirm zuerst vor
    (`vorlauf`, bis 96 px in den ersten 35 %), dann holt die Kamera auf und
    bringt ihn weich zurück auf seine Ruhelage. Am Haltepunkt bleibt er nicht
    stehen: Die Kamera geht mit gleichem Tempo in ein langsames Nachgleiten
    über, das die ganze Begegnung dauert und danach weich ausläuft. Die
    Begegnung startet, sobald der Haltepunkt erreicht ist.
  */
  type Lauf = { stop: () => void; pause?: () => void; play?: () => void }
  const laeufe = useRef<Lauf[]>([])
  /** Kamerastand, an dem der aktuelle Zug oder das Mausrad begonnen hat */
  const abflug = useRef<number | null>(null)
  function halteAn() {
    laeufe.current.forEach((l) => l.stop())
    laeufe.current = []
  }
  // offene Sheets halten auch das Nachgleiten an
  useEffect(() => {
    laeufe.current.forEach((l) => (z.sheetOffen ? l.pause?.() : l.play?.()))
  }, [z.sheetOffen])

  function fliege(ziel: number, dauer: number, dannBegegnung: boolean) {
    halteAn()
    setFaehrt(true)
    const rest = Math.abs(kamera.get() - ziel) / konfig.haltepunktAbstand
    const vorwaerts = ziel < kamera.get()
    const seiteNach = vorwaerts ? seiteZiel : seiteBasis
    if (reduziert) {
      vorlauf.set(0)
      laeufe.current = [
        animate(kamera, ziel, { duration: fl.reduziertDauer / 1000, ease: kurve }),
        animate(echoo.seitX, seiteNach, { duration: fl.reduziertDauer / 1000, ease: kurve }),
      ]
    } else if (vorwaerts) {
      const spitze = Math.min(vorlauf.get(), -fl.vorlauf * Math.min(1, rest))
      // Flug und Nachgleiten als eine Bewegung: das Tempo am Haltepunkt ist in beiden Teilen gleich
      const t1 = dauer / 1000
      const t2 = (konfig.begegnung.eintritt + z.zeigedauer + konfig.begegnung.weiterflug + fl.nachgleitenAuslauf) / 1000
      const [, , x2, y2] = fl.kameraKurve
      const tempoAmHaltepunkt = ((1 - y2) / (1 - x2)) * ((kamera.get() - ziel) / t1)
      const anfangsSteigung = (tempoAmHaltepunkt * t2) / fl.nachgleiten
      const x1 = 0.2
      const nachgleiten: [number, number, number, number] = [x1, Math.min(0.95, x1 * anfangsSteigung), 0.4, 1]
      laeufe.current = [
        animate(kamera, [kamera.get(), ziel, ziel - fl.nachgleiten], {
          duration: t1 + t2,
          times: [0, t1 / (t1 + t2), 1],
          ease: [fl.kameraKurve, nachgleiten],
        }),
        animate(vorlauf, [vorlauf.get(), spitze, 0], {
          duration: dauer / 1000,
          times: [0, fl.vorlaufAnteil, 1],
          ease: [kurve, [0.45, 0, 0.25, 1]],
        }),
        animate(echoo.seitX, seiteNach, { duration: dauer / 1000, ease: kurve }),
      ]
    } else {
      // zurückgleiten: nur Kamera und Vorlauf beruhigen, kein Flug
      laeufe.current = [
        animate(kamera, ziel, { duration: dauer / 1000, ease: kurve }),
        animate(vorlauf, 0, { duration: dauer / 1000, ease: kurve }),
        animate(echoo.seitX, seiteNach, { duration: dauer / 1000, ease: kurve }),
      ]
    }
    if (vorwaerts && !reduziert) {
      // am Haltepunkt beginnt die Begegnung — die Kamera gleitet dabei weiter
      window.setTimeout(() => {
        setFaehrt(false)
        if (dannBegegnung) melde({ typ: 'begegnungBeginnt' })
      }, dauer)
      return
    }
    Promise.all(laeufe.current).then(() => {
      setFaehrt(false)
      if (dannBegegnung) melde({ typ: 'begegnungBeginnt' })
    })
  }

  /** Beim Loslassen: ab 30 % der Strecke einrasten (als Flug), sonst zurückgleiten */
  function rasteEin() {
    const start = abflug.current ?? basis
    abflug.current = null
    const anteil = (start - kamera.get()) / Math.max(1, start - naechster)
    if (anteil >= fb.einrasten) fliege(naechster, Math.max(fl.minDauer, fl.dauer * (1 - anteil)), true)
    else if (anteil > 0 || vorlauf.get() !== 0) fliege(start, fb.rastDauer, false)
  }

  /** Zug oder Mausrad beginnt: Nachgleiten anhalten, ab der aktuellen Stelle weiter */
  function beginneZug() {
    halteAn()
    abflug.current = kamera.get()
  }
  /** Kamera und seitliche Lage für eine gezogene Strecke (Szenen-px ab dem Abflug) */
  function ziehAuf(strecke: number) {
    const start = abflug.current ?? basis
    const weg = Math.max(1, start - naechster)
    const s = Math.min(weg, Math.max(0, strecke))
    kamera.set(start - s)
    echoo.seitX.set(seiteBasis + ((seiteZiel - seiteBasis) * s) / weg)
  }

  /** Mitziehen: je nach Zuggeschwindigkeit läuft Echoo bis zu 40 px vor */
  const zugTempo = useRef({ y: 0, t: 0, tempo: 0 })
  function laufeVor(bildschirmY: number) {
    const jetzt = performance.now()
    const z0 = zugTempo.current
    const dt = Math.max(1, jetzt - z0.t)
    const momentan = ((z0.y - bildschirmY) / dt) * 1000
    // geglättet, nur nach oben
    z0.tempo = z0.tempo * 0.7 + Math.max(0, momentan) * 0.3
    z0.y = bildschirmY
    z0.t = jetzt
    if (!reduziert) vorlauf.set(-fl.zugVorlauf * Math.min(1, z0.tempo / fl.zugVollesTempo))
  }

  const zug = useRef<{ y0: number; id: number } | null>(null)
  function ziehStart(e: ReactPointerEvent<HTMLDivElement>) {
    if (!frei) return
    zug.current = { y0: e.clientY, id: e.pointerId }
    beginneZug()
    zugTempo.current = { y: e.clientY, t: performance.now(), tempo: 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
    setGezogen(true)
  }
  function ziehBewegung(e: ReactPointerEvent<HTMLDivElement>) {
    if (!zug.current) return
    // die Szene folgt dem Finger 1:1, höchstens bis zum nächsten Haltepunkt; nach unten nichts
    ziehAuf((zug.current.y0 - e.clientY) / faktor)
    laufeVor(e.clientY)
  }
  function ziehEnde() {
    if (!zug.current) return
    zug.current = null
    setGezogen(false)
    rasteEin()
  }

  const rad = useRef({ akku: 0, zeitgeber: 0, y: 0 })
  function beiRad(e: WheelEvent<HTMLDivElement>) {
    if (!frei) return
    const schritt = e.deltaMode === 1 ? 16 : 1
    if (!gezogen) beginneZug()
    // nach oben scrollen (negatives deltaY) bewegt Echoo nach oben
    const weg = (abflug.current ?? basis) - naechster
    rad.current.akku = Math.min(weg, Math.max(0, rad.current.akku - (e.deltaY * schritt) / faktor))
    ziehAuf(rad.current.akku)
    if (!gezogen) {
      setGezogen(true)
      zugTempo.current = { y: 0, t: performance.now(), tempo: 0 }
      rad.current.y = 0
    }
    rad.current.y += e.deltaY * schritt
    laufeVor(rad.current.y)
    window.clearTimeout(rad.current.zeitgeber)
    rad.current.zeitgeber = window.setTimeout(() => {
      rad.current.akku = 0
      setGezogen(false)
      rasteEin()
    }, fb.radRuhe)
  }

  function pfeil() {
    if (frei) fliege(naechster, fl.dauer, true)
  }

  /* ── Begegnungen und Übergang in die Übersicht ── */
  const k = z.begegnungen + 1
  const uebersichtZeitgeber = useRef(0)
  function beiBegegnungFertig() {
    const letzte = zRef.current.begegnungen + 1 === zRef.current.laenge
    melde({ typ: 'begegnungFertig' })
    if (!letzte) return
    uebersichtZeitgeber.current = window.setTimeout(() => {
      halteAn()
      setAnsicht('uebersicht')
      melde({ typ: 'rueckwegOffen' })
    }, konfig.begegnung.uebersichtNach)
  }
  useEffect(() => () => window.clearTimeout(uebersichtZeitgeber.current), [])

  /* ── Leisten: weiße Schrift, sobald die Nacht darunter liegt ── */
  const hoeheAuf = useCallback((y: number) => kamera.get() + (y - echooY) / faktor, [kamera, echooY, faktor])
  const [hell, setHell] = useState({ oben: false, unten: false })
  const pruefeHell = useCallback(() => {
    const oben = hoeheAuf(LEISTE_MITTE) < sz.nachtBis
    const unten = hoeheAuf(mass.h - 64) < sz.nachtBis
    setHell((alt) => (alt.oben === oben && alt.unten === unten ? alt : { oben, unten }))
  }, [hoeheAuf, mass.h])
  useMotionValueEvent(kamera, 'change', pruefeHell)
  useEffect(pruefeHell, [pruefeHell])
  const obenHoehe = haltepunkt(z.laenge)
  const leisteHell = ansicht === 'uebersicht' ? { oben: obenHoehe < sz.nachtBis, unten: false } : hell

  /* ── Proberunde gesehen; Endergebnis berechnen und speichern ── */
  useEffect(() => {
    if (z.phase === 'proberundeBeendet') merkeProberundeGesehen()
  }, [z.phase])

  const [endwerte, setEndwerte] = useState<Endwerte | null>(null)
  const gespeichert = useRef(false)
  useEffect(() => {
    if (z.phase !== 'endergebnis' || gespeichert.current) return
    const sitzung = sitzungsErgebnis(z, Date.now())
    if (!sitzung) return
    gespeichert.current = true
    // die letzte Sitzung lesen, BEVOR die neue gespeichert wird
    const vorige = letzteSitzung()
    speichereSitzung(sitzung)
    setEndwerte(berechneEndwerte(sitzung, vorige))
  }, [z])

  const imSpiel = z.proberunde || z.durchgang > 0
  const inRunde = rundenPhasen.includes(z.phase)
  // im Aufstieg die Begegnungen, beim Nachbauen die belegten Wegpunkte
  const bisherige = ansicht === 'uebersicht' ? belegt : z.begegnungen + (z.begegnungLaeuft ? 1 : 0)
  const rundenTeile = rundenanzeigeTeile(z.runde, bisherige, z.laenge)

  const echooElement = (
    <motion.div
      className="pointer-events-none absolute left-0 top-0"
      style={{ x: echooBildX, y: echooBildY, opacity: echoo.opacity, scale: echoo.skala, rotate: echooNeigung }}
    >
      {/* Lichtschweif: Ursprung an Echoos Unterkante, wächst mit dem Tempo */}
      {!reduziert && (
        <motion.div
          className="absolute"
          style={{
            left: (-sz.echooGroesse * fl.schweifBreite) / 2,
            top: sz.echooGroesse / 2 - 6,
            width: sz.echooGroesse * fl.schweifBreite,
            height: fl.schweifLaenge,
            borderRadius: 999,
            background: `linear-gradient(180deg, ${konfig.farben.akzent}, rgba(255, 186, 58, 0))`,
            transformOrigin: '50% 0%',
            scaleY: tempo,
            opacity: schweifDeckkraft,
          }}
        />
      )}
      {/* Streckung im Flug: am schnellsten Punkt länger und schmaler */}
      <motion.div className="absolute left-0 top-0" style={{ scaleX: streckungX, scaleY: streckungY }}>
        <EchooMini groesse={sz.echooGroesse} ruht={!faehrt && !gezogen} jubelt={jubelt} />
      </motion.div>
    </motion.div>
  )

  return (
    // Himmelsroute federt nirgends nach: Sheets ruhig, alle übrigen Übergänge als weiche Kurve
    <SheetBewegung.Provider value="ruhig">
    <MotionConfig transition={{ duration: 0.25, ease: kurve }}>
    <div
      ref={wurzel}
      className="relative h-full select-none overflow-hidden bg-[#9fe1ff]"
      onWheel={beiRad}
      data-phase={z.phase}
      data-runde={`${z.durchgang}-${z.runde}-${z.laenge}-${z.versuch}`}
      data-begegnungen={z.begegnungen}
    >
      {/* Szene: Himmel, Wolken, Nacht, Sterne — davor Echoo — davor die Erde */}
      <SzeneHinten kamera={kamera} echooY={echooY} faktor={faktor} neigung={neigung} />
      {echooElement}
      <SzeneErde kamera={kamera} echooY={echooY} faktor={faktor} />
      {/* Vordergrund 1,8-fach: Wolkenfetzen und Lichtpunkte, teils vor Echoo */}
      {!reduziert && ansicht === 'szene' && <SzeneVordergrund kamera={kamera} echooY={echooY} faktor={faktor} />}

      {/* Begegnung: Gegenstand über Echoo, genau `zeigedauer` ruhig sichtbar */}
      {z.phase === 'aufstieg' && z.begegnungLaeuft && z.ziehung && (
        <Begegnung
          key={`${z.proberunde}-${z.durchgang}-${z.runde}-${z.versuch}-${k}`}
          k={k}
          gegenstand={gegenstand(z.ziehung.folge[k - 1])}
          mitteX={mitteX}
          echooY={echooY}
          breite={mass.b}
          pausiert={z.sheetOffen}
          reduziert={reduziert}
          zeigedauer={z.zeigedauer}
          kamera={kamera}
          faktor={faktor}
          onFertig={beiBegegnungFertig}
        />
      )}

      {/* Gesten-Fläche: irgendwo auf der Szene nach oben ziehen */}
      {ansicht === 'szene' && (
        <div
          className="absolute inset-0 z-10 touch-none"
          onPointerDown={ziehStart}
          onPointerMove={ziehBewegung}
          onPointerUp={ziehEnde}
          onPointerCancel={ziehEnde}
          aria-hidden
        />
      )}

      {/* Rundenstart-Anzeige (Figma 507:1293 / 507:1294): halbtransparente Pille mittig über der Szene */}
      <div className="pointer-events-none absolute inset-x-0 z-20 flex justify-center" style={{ top: mass.h * 0.34 }}>
        <AnimatePresence>
          {rundenstart && (
            <motion.div
              key={`${rundenstart.titel}|${rundenstart.unterzeile}`}
              className="flex h-[68px] flex-col items-center justify-center whitespace-nowrap rounded-[34px] bg-white/50 px-6 text-center shadow-[0_8px_40px_rgba(0,0,0,0.06)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: ag.anzeigeEin / 1000, ease: kurve } }}
              exit={{ opacity: 0, transition: { duration: ag.anzeigeAus / 1000, ease: kurve } }}
              role="status"
            >
              <p className="text-[16px] font-semibold leading-3 text-ink">{rundenstart.titel}</p>
              <p className="mt-2 text-[12px] leading-4 text-[#6a6a6a]">{rundenstart.unterzeile}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Übersicht, Rückweg, Auflösung, Heimkehr */}
      <AnimatePresence>
        {/* beim Rundenstart nie neu aufbauen — sonst holt sie Echoo wieder groß in die Ecke */}
        {ansicht === 'uebersicht' && z.phase !== 'aufgang' && z.ziehung && (
          <Rueckweg
            key={`${z.proberunde}-${z.durchgang}-${z.runde}-${z.versuch}`}
            phase={z.phase === 'rueckweg' ? 'rueckweg' : z.phase === 'aufloesung' ? 'aufloesung' : 'danach'}
            ziehung={z.ziehung}
            bewertung={z.bewertung}
            breite={mass.b}
            hoehe={mass.h}
            faktor={faktor}
            echoo={echoo}
            echooElement={echooElement}
            obenHoehe={obenHoehe}
            proberunde={z.proberunde}
            onBestaetigt={(gelegt) => melde({ typ: 'routeBestaetigt', gelegt })}
            onHeimgekehrt={() => melde({ typ: 'heimgekehrt' })}
            onBelegt={setBelegt}
            onJubel={() => setJubelt(true)}
          />
        )}
      </AnimatePresence>

      {/* infoOverlay (Figma 507:1276): Zurück | Runde · Fortschritt oben, Puls | Pfeil · Einstellungen unten */}
      {imSpiel && (
        <Leisten
          hellOben={leisteHell.oben}
          hellUnten={leisteHell.unten}
          runde={rundenTeile[0]}
          fortschritt={rundenTeile[1]}
          // Proberunde: „Überspringen" unten rechts anstelle von Pfeil und Einstellungen (Figma 507:1295)
          untenRechts={z.proberunde && inRunde ? { text: texte.proberunde.link, onClick: () => melde({ typ: 'proberundeUeberspringen' }) } : undefined}
          puls={z.pulsDanach ?? z.pulsVorher ?? pulsVorher}
          // unter dem Rückweg-Sheet ruht die untere Leiste
          unten={z.phase !== 'rueckweg'}
          pfeilFrei={frei}
          onPfeil={pfeil}
          onLeave={() => oeffne('abbruch')}
          onSettings={() => oeffne('einstellungen')}
        />
      )}

      {/* Proberunde: Hinweise im Aufstieg */}
      <AnimatePresence>
        {z.proberunde && z.phase === 'aufstieg' && z.begegnungen === 0 && !z.begegnungLaeuft && !faehrt && (
          <Hinweis key="vor-dem-ziehen" text={texte.proberunde.vorDemErstenZiehen} className="right-6" style={{ bottom: LEISTE_UNTEN + 12 }} />
        )}
        {z.proberunde && z.phase === 'aufstieg' && z.begegnungen === 0 && z.begegnungLaeuft && (
          <Hinweis
            key="erste-begegnung"
            text={texte.proberunde.ersteBegegnung}
            className="left-1/2 -translate-x-1/2"
            style={{ bottom: mass.h - (echooY - konfig.begegnung.ueberEchoo - 80) }}
          />
        )}
      </AnimatePresence>

      {/* Sheets der Sitzung: das alte schließt animiert, erst dann öffnet das nächste */}
      <AnimatePresence mode="wait">
        {z.phase === 'erklaerung' && erklaerungBereit && (
          <Sheet key="erklaerung" schliessbar={false} variante="karte">
            <div className="text-center">
              <ErklaerIllustration />
              <h2 id="sheet-titel" className="text-[26px] font-semibold leading-8 tracking-[-0.01em]">{texte.erklaerung.titel}</h2>
              <p className="mt-2 text-[14px] leading-5 text-[#6a6a6a]">{texte.erklaerung.text}</p>
              <button type="button" onClick={() => melde({ typ: 'erklaerungWeiter', proberundeGesehen: proberundeGesehen() })} className={`mt-8 ${knopfPrimaer}`}>
                {texte.erklaerung.primaer}
              </button>
              <button type="button" onClick={() => navigate('/')} className={`mt-2 ${knopfSekundaer}`}>
                {texte.erklaerung.sekundaer}
              </button>
            </div>
          </Sheet>
        )}

        {z.phase === 'proberundeBeendet' && (
          <TextSheet
            key="proberunde-beendet"
            titel={texte.proberundeBeendet.titel}
            text={texte.proberundeBeendet.text}
            primaer={{ text: texte.proberundeBeendet.primaer, onClick: () => melde({ typ: 'proberundeWeiter' }) }}
            sekundaer={{ text: texte.proberundeBeendet.sekundaer, onClick: () => melde({ typ: 'nochEinmalUeben' }) }}
          />
        )}

        {z.phase === 'pulsVorher' && (
          <PulsSheet
            key="puls-vorher"
            art="start"
            wert={pulsVorher}
            min={puls.pulsMin}
            max={puls.pulsMax}
            onChange={setPulsVorher}
            onWeiter={() => {
              frageNeigungAn()
              melde({ typ: 'pulsVorherBestaetigt', puls: pulsVorher })
            }}
          />
        )}

        {z.phase === 'rundenErfolg' && (
          <TextSheet
            key="runden-erfolg"
            {...rundenErfolg(z.runde, z.laenge)}
            primaer={{ text: texte.rundenErfolg.primaer, onClick: () => melde({ typ: 'naechsteRunde' }) }}
          />
        )}

        {z.phase === 'zweiterVersuch' && (
          <TextSheet
            key="zweiter-versuch"
            titel={texte.zweiterVersuch.titel}
            text={texte.zweiterVersuch.text}
            primaer={{ text: texte.zweiterVersuch.primaer, onClick: () => melde({ typ: 'zweiterVersuchStarten' }) }}
          />
        )}

        {z.phase === 'durchgang1Beendet' && (
          <TextSheet
            key="durchgang-1-beendet"
            titel={texte.durchgang1Beendet.titel}
            text={durchgang1Text(merkspanneIm(z, 1))}
            primaer={{
              text: texte.durchgang1Beendet.primaer,
              onClick: () => melde({ typ: 'durchgang1Weiter', bedingung: weisePausenbedingungZu() }),
            }}
          />
        )}

        {/* Pause wie in Wolkensammeln: dort gibt es nur die Bewegungs-Variante */}
        {z.phase === 'pause' && (
          <BewegungspauseSheet
            key="pause"
            onBewegt={() => melde({ typ: 'pauseBeendet', verhalten: 'bewegt' })}
            onOhneBewegung={() => melde({ typ: 'pauseBeendet', verhalten: 'ohneBewegung' })}
          />
        )}

        {z.phase === 'pulsDanach' && (
          <PulsSheet
            key="puls-danach"
            art="bewegung"
            wert={pulsDanach}
            min={puls.pulsMin}
            max={puls.pulsMax}
            onChange={setPulsDanach}
            onWeiter={() => melde({ typ: 'pulsDanachBestaetigt', puls: pulsDanach })}
          />
        )}

        {z.phase === 'endergebnis' && endwerte && (
          <ErgebnisSheet
            key="endergebnis"
            wert={endwerte.bestSpan}
            anzeige={endwerte.bestSpan === 0 ? grosseZahl(0) : undefined}
            wertLabel={`${grosseZahl(endwerte.bestSpan)} ${texte.endergebnis.satz1}`}
            satz={[satz1(endwerte.bestSpan), satz2(endwerte.bestSpan, endwerte.dLast)].filter(Boolean).join(' ')}
            zeilen={endergebnisZeilen(endwerte).map(([label, wert]) => ({ label, wert }))}
            bild={<MiniRoute wegpunkte={endwerte.bestSpan} />}
            primaer={{ text: texte.endergebnis.primaer, onClick: () => navigate('/') }}
            sekundaer={{ text: texte.endergebnis.sekundaer, onClick: () => navigate('/statistiken') }}
          />
        )}
      </AnimatePresence>

      {/* Abbruch und Einstellungen liegen über allem und halten die Zeit an */}
      <AnimatePresence>
        {overlay === 'abbruch' && (
          <VerlassenSheet
            key="abbruch"
            onFortsetzen={schliesse}
            onVerlassen={() => {
              melde({ typ: 'spielVerlassen' })
              navigate('/')
            }}
          />
        )}
        {overlay === 'einstellungen' && (
          <EinstellungenSheet
            key="einstellungen"
            // nur die Zeigedauer — sie gilt ab der nächsten Begegnung
            dauer={{ wert: zeigedauer, ...konfig.zeigedauerRegler, onChange: setZeigedauer }}
            onSpeichern={() => {
              melde({ typ: 'zeigedauerSetzen', ms: zeigedauer })
              schliesse()
            }}
          />
        )}
      </AnimatePresence>
    </div>
    </MotionConfig>
    </SheetBewegung.Provider>
  )
}
