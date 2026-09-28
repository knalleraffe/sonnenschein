import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Wolke, { type WolkenAussehen, type WolkenPuls } from '../components/spiel/Wolke'
import Echoo, { gesichtsRahmen } from '../components/spiel/Echoo'
import SpielHud from '../components/spiel/SpielHud'
import {
  BewegungspauseSheet,
  Countdown,
  EinstellungenSheet,
  ErgebnisSheet,
  PulsSheet,
  TextSheet,
  VerlassenSheet,
  knopfPrimaer,
  knopfSekundaer,
} from '../components/spiel/SpielSheets'
import Sheet from '../components/ui/Sheet'
import Hinweis from '../components/himmelsroute/Hinweis'
import { aufloesungGesamt, konfig, kurveCss } from '../games/wolkensammeln/config'
import { layouts } from '../games/wolkensammeln/layouts'
import { erzeugeFolge } from '../games/wolkensammeln/sequence'
import {
  berechneErgebnis,
  darfUnterbrechen,
  hauptIndex,
  istAufwaermen,
  istZuEnde,
  neueRunde,
  verbucheDurchgang,
  verbucheUnterbrechung,
  type Runde,
} from '../games/wolkensammeln/session'
import { letzteRunde, merkeProberundeGesehen, proberundeGesehen, speichereRunde } from '../games/wolkensammeln/storage'
import type { FehlerGrund, RundenErgebnis, UnterbrechungsArt } from '../games/wolkensammeln/types'
import { oeffentlich } from '../lib/pfad'

/*
  Wolkensammeln — der Spielbildschirm.
  Es zählt, WELCHE Wolken angetippt werden, nicht in welcher Reihenfolge.
  Wie eine Wolke aussieht, wird pro Bild aus Phase + Durchgangsdaten
  abgeleitet (markierungen) und beim Start jeder Ruhephase vollständig
  geleert — es kann keine hängengebliebene Färbung geben.
  Alle Zeiten/Kurven kommen aus config.ts, alle Zeitgeber laufen über
  die zentrale Registry plane()/stoppeAlleZeitgeber().
*/

type Phase =
  | { art: 'einstieg' }
  | { art: 'countdown'; zahl: number }
  | { art: 'ruhe' }
  | { art: 'vorfuehren'; schritt: number; leuchtet: boolean }
  | { art: 'startsignal' }
  | { art: 'eingabe' }
  | { art: 'rueckmeldung'; richtig: boolean }
  | { art: 'unterbrechung'; typ: UnterbrechungsArt; restSekunden: number }
  | { art: 'ende' }

/*
  Proberunde (wie in der Himmelsroute): nur beim allerersten Start, direkt
  nach der Erklärung und vor der Pulsabfrage. Ein Durchgang mit 3 Wolken,
  wird nicht gewertet und nicht gespeichert. Hinweise erscheinen als kleine
  Karte unter der oberen Leiste, unten rechts steht „Überspringen".
*/
const probeTexte = {
  fortschritt: 'Proberunde',
  merken: 'Merk dir die Wolken, die gleich aufleuchten.',
  tippen: 'Tippe jetzt die Wolken an, die geleuchtet haben.',
  link: 'Überspringen',
  beendet: {
    titel: 'Proberunde beendet',
    text: 'Jetzt zählt es. Merkst du dir alle Wolken, leuchten nach und nach mehr auf.',
    primaer: 'Weiter',
    sekundaer: 'Noch einmal üben',
  },
}

const formatZahl = (wert: number) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(wert)

function vergleichsSatz(aktuell: RundenErgebnis, vorher: RundenErgebnis | null): string | null {
  if (!vorher || vorher.licht <= 0) return null
  const prozent = Math.round(((aktuell.licht - vorher.licht) / vorher.licht) * 100)
  if (prozent === 0) return 'Genauso viel Licht wie beim letzten Mal gesammelt.'
  return `${Math.abs(prozent)} % ${prozent > 0 ? 'mehr' : 'weniger'} Licht als beim letzten Mal gesammelt.`
}

/* Illustration des Einstiegs-Sheets — Maße und Positionen 1:1 aus Figma (377 px breit) */
const einstiegsWolken: { src: string; left: number; top: number; w: number; h: number; drehung?: { grad: number; w: number; h: number }; inset: string }[] = [
  { src: oeffentlich('/wolkensammeln-intro/wolke-1.svg'), left: 171, top: 188, w: 112.776, h: 58.541, drehung: { grad: 179.21, w: 112, h: 57 }, inset: '0 -13.75% -60.35% -13.75%' },
  { src: oeffentlich('/wolkensammeln-intro/wolke-2.svg'), left: 215, top: 122, w: 117.675, h: 51.705, inset: '0 -13.09% -66.53% -13.09%' },
  { src: oeffentlich('/wolkensammeln-intro/wolke-3.svg'), left: 203, top: 43, w: 117.846, h: 68.332, drehung: { grad: -169.45, w: 110.769, h: 48.868 }, inset: '0 -13.9% -70.39% -13.9%' },
  { src: oeffentlich('/wolkensammeln-intro/wolke-4.svg'), left: 64, top: 72, w: 120.052, h: 67.158, inset: '-35.74% -19.99% -51.22% -19.99%' },
  { src: oeffentlich('/wolkensammeln-intro/wolke-5.svg'), left: 53, top: 165, w: 94.496, h: 52.3, inset: '0 -16.3% -65.77% -16.3%' },
]

function EinstiegsHimmel() {
  return (
    <div
      className="relative -mx-6 -mt-8 mb-0 h-[331px] w-[calc(100%+48px)] overflow-hidden rounded-t-[40px]"
      role="img"
      aria-label="Himmel mit weißen und einer orange leuchtenden Wolke"
    >
      <div className="absolute inset-x-0 top-0 h-[307px] bg-gradient-to-b from-[#9fe1ff] to-[#defcff]" />
      <div className="absolute left-1/2 top-0 h-full w-[377px] -translate-x-1/2">
        {einstiegsWolken.map((wolke) => {
          const bild = (
            <div className="absolute" style={{ inset: wolke.inset }}>
              <img alt="" src={wolke.src} className="block size-full max-w-none" />
            </div>
          )
          return (
            <div
              key={wolke.src}
              className="absolute flex items-center justify-center"
              style={{ left: wolke.left, top: wolke.top, width: wolke.w, height: wolke.h }}
            >
              {wolke.drehung ? (
                <div className="flex-none" style={{ transform: `rotate(${wolke.drehung.grad}deg)` }}>
                  <div className="relative" style={{ width: wolke.drehung.w, height: wolke.drehung.h }}>{bild}</div>
                </div>
              ) : (
                bild
              )}
            </div>
          )
        })}
      </div>
      <div className="absolute inset-x-0 top-[194px] h-[137px] bg-gradient-to-b from-white/0 to-white to-[82.212%]" />
    </div>
  )
}

export default function Wolkensammeln() {
  const navigate = useNavigate()
  const reduziert = useReducedMotion()
  const b = konfig.bewegung
  const e = konfig.einstieg

  const rundeRef = useRef<Runde>(neueRunde())
  const folgeRef = useRef<number[]>([])
  const getipptRef = useRef<{ wolkeId: number; zeit: number }[]>([])
  const eingabeStartRef = useRef(0)
  const zeitgeberRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())
  const tippTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unterbrechungsTickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pulsZaehler = useRef(0)
  const ersterRingVergeben = useRef(false)

  const [phase, setPhase] = useState<Phase>({ art: 'einstieg' })
  const [sheet, setSheet] = useState<'erklaerung' | 'startPuls' | 'einstellungen' | 'verlassen' | 'bewegung' | 'bewegungPuls' | 'proberundeBeendet' | null>(null)
  const [gestartet, setGestartet] = useState(false)
  /** zählt jeden Einstieg (Proberunde und echte Runde) — startet die Einstiegsbewegung */
  const [einstiegN, setEinstiegN] = useState(0)
  const [proberunde, setProberunde] = useState(false)
  const probeRef = useRef(false)
  const [startPuls, setStartPuls] = useState<number>(konfig.messung.startPuls)
  const [bewegungsPuls, setBewegungsPuls] = useState<number>(konfig.messung.startPuls + konfig.messung.bewegungsPulsAbstand)
  const [anzeigedauer, setAnzeigedauer] = useState<number>(konfig.messung.anzeigeDauer)
  const [anzeigepause, setAnzeigepause] = useState<number>(konfig.messung.anzeigePause)
  const [pausiert, setPausiert] = useState(false)
  const [abbruchDialog, setAbbruchDialog] = useState(false)
  const [gedimmt, setGedimmt] = useState(false)
  const [himmelDunkel, setHimmelDunkel] = useState(false)
  const [welleN, setWelleN] = useState(0)
  const [pulse, setPulse] = useState<Record<number, WolkenPuls>>({})
  /* Markierungen des LAUFENDEN Durchgangs — beim Start jeder Ruhephase geleert */
  const [markierungen, setMarkierungen] = useState<Record<number, WolkenAussehen>>({})
  const [bumpN, setBumpN] = useState(0)
  const [sekunden, setSekunden] = useState(0)
  const [ergebnis, setErgebnis] = useState<RundenErgebnis | null>(null)
  const [vergleich, setVergleich] = useState<string | null>(null)

  /* Größe des Spielfelds — Echoo steht in Pixeln, die Wolken in Prozent */
  const feldRef = useRef<HTMLDivElement>(null)
  const [feld, setFeld] = useState({ breite: 393, hoehe: 852 })
  useEffect(() => {
    const el = feldRef.current
    if (!el) return
    const beobachter = new ResizeObserver(([eintrag]) =>
      setFeld({ breite: eintrag.contentRect.width, hoehe: eintrag.contentRect.height }),
    )
    beobachter.observe(el)
    return () => beobachter.disconnect()
  }, [])

  const runde = rundeRef.current
  const layout = layouts[runde.layoutIndex]
  const rundeAktiv = phase.art !== 'ende'
  const imSpiel = phase.art !== 'einstieg' && phase.art !== 'ende'

  const raenge = useMemo(() => {
    const vonUnten = [...layout].sort((a, w) => w.y - a.y).map((w) => w.id)
    const vonOben = [...vonUnten].reverse()
    return {
      vonUnten: new Map(vonUnten.map((id, i) => [id, i])),
      vonOben: new Map(vonOben.map((id, i) => [id, i])),
    }
  }, [layout])

  /* ── Zeitgeber-Registry: ALLE Zeitgeber laufen über diese eine Stelle ── */

  function plane(ms: number, fn: () => void) {
    const id = setTimeout(() => {
      zeitgeberRef.current.delete(id)
      fn()
    }, ms)
    zeitgeberRef.current.add(id)
  }

  function stoppeAlleZeitgeber() {
    zeitgeberRef.current.forEach(clearTimeout)
    zeitgeberRef.current.clear()
    if (tippTimerRef.current) clearTimeout(tippTimerRef.current)
    if (unterbrechungsTickRef.current) clearInterval(unterbrechungsTickRef.current)
  }

  useEffect(() => stoppeAlleZeitgeber, [])

  /* Erklär-Sheet: nicht sofort offen, sondern federt nach dem Seitenübergang herein */
  useEffect(() => {
    const id = setTimeout(() => setSheet('erklaerung'), e.erklaerungVerzoegerung)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Einstieg: eine durchgehende Bewegung, danach beginnt der erste Durchgang */
  useEffect(() => {
    if (einstiegN === 0) return
    plane(e.gesamt - e.welleDauer, () => setWelleN((n) => n + 1))
    plane(e.gesamt, starteDurchgang)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [einstiegN])

  useEffect(() => {
    if (phase.art !== 'countdown') return
    if (phase.zahl <= 1) {
      const id = setTimeout(() => {
        setGestartet(true)
        setEinstiegN((n) => n + 1)
        setPhase({ art: 'einstieg' })
      }, 1000)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => setPhase({ art: 'countdown', zahl: phase.zahl - 1 }), 1000)
    return () => clearTimeout(id)
  }, [phase])

  /* Uhr: reine Anzeige, läuft ab dem ersten Durchgang, hält in der Pause an */
  useEffect(() => {
    if (!imSpiel || pausiert) return
    const intervall = setInterval(() => setSekunden((s) => s + 1), 1000)
    return () => clearInterval(intervall)
  }, [imSpiel, pausiert])

  function neuerPuls(ids: number[], puls: Omit<WolkenPuls, 'n'>, versatzJeId = 0) {
    setPulse((alt) => {
      const neu = { ...alt }
      ids.forEach((id, i) => {
        neu[id] = { ...puls, verzoegerung: puls.verzoegerung + i * versatzJeId, n: ++pulsZaehler.current }
      })
      return neu
    })
  }

  function markiere(eintraege: Record<number, WolkenAussehen>) {
    setMarkierungen((alt) => ({ ...alt, ...eintraege }))
  }

  /* ── Ablauf ── */

  function starteDurchgang() {
    const r = rundeRef.current
    if (!probeRef.current && istZuEnde(r)) {
      beendeRunde()
      return
    }
    const laenge = probeRef.current || istAufwaermen(r) ? konfig.startLaenge : r.treppe.laenge
    folgeRef.current = erzeugeFolge(layouts[r.layoutIndex], laenge)
    getipptRef.current = []
    // Ruhephasen-Start: Rückmeldungsdaten des vorherigen Durchgangs vollständig leeren
    setMarkierungen({})
    setHimmelDunkel(false)
    setGedimmt(false)
    setPhase({ art: 'ruhe' })
    plane(konfig.zeiten.ruhephase - b.ankuendigungDauer, () => {
      setGedimmt(true)
      plane(b.ankuendigungDauer, () => zeigeSchritt(0))
    })
  }

  function zeigeSchritt(schritt: number) {
    if (schritt >= folgeRef.current.length) {
      setPhase({ art: 'startsignal' })
      setGedimmt(false)
      plane(konfig.zeiten.startsignal, starteEingabe)
      return
    }
    setPhase({ art: 'vorfuehren', schritt, leuchtet: true })
    const ziel = layout.find((w) => w.id === folgeRef.current[schritt])
    if (ziel && !reduziert) {
      const nachbarn = layout
        .filter((w) => w.id !== ziel.id && Math.hypot(w.x - ziel.x, w.y - ziel.y) < b.nachbarRadius)
        .map((w) => w.id)
      if (nachbarn.length > 0)
        neuerPuls(nachbarn, { staerke: b.nachbarSchein, verzoegerung: b.nachbarVerzoegerung })
    }
    plane(rundeRef.current.anzeigedauer, () => {
      ersterRingVergeben.current = true
      setPhase({ art: 'vorfuehren', schritt, leuchtet: false })
      plane(rundeRef.current.anzeigepause, () => zeigeSchritt(schritt + 1))
    })
  }

  function starteEingabe() {
    setPhase({ art: 'eingabe' })
    eingabeStartRef.current = performance.now()
    stelleTippTimer(konfig.zeiten.ersterTipp)
  }

  function stelleTippTimer(ms: number) {
    if (tippTimerRef.current) clearTimeout(tippTimerRef.current)
    tippTimerRef.current = setTimeout(() => {
      beendeDurchgang(false, 'zeitAbgelaufen')
    }, ms)
  }

  function tipp(wolkeId: number) {
    if (phase.art !== 'eingabe' || pausiert) return
    // schon angetippt: keine Wirkung, kein Fehler, kein zweiter Punkt
    if (getipptRef.current.some((t) => t.wolkeId === wolkeId)) return

    const zeit = Math.round(performance.now() - eingabeStartRef.current)
    getipptRef.current.push({ wolkeId, zeit })

    if (!folgeRef.current.includes(wolkeId)) {
      beendeDurchgang(false, 'falscheWolke', wolkeId)
      return
    }
    markiere({ [wolkeId]: 'getippt' })
    setBumpN((n) => n + 1)
    const richtige = getipptRef.current.filter((t) => folgeRef.current.includes(t.wolkeId)).length
    if (richtige === folgeRef.current.length) {
      beendeDurchgang(true, null)
      return
    }
    stelleTippTimer(konfig.zeiten.weitererTipp)
  }

  function beendeDurchgang(richtig: boolean, grund: FehlerGrund | null, falsche?: number) {
    if (tippTimerRef.current) clearTimeout(tippTimerRef.current)
    const richtigeVorFehler = richtig
      ? null
      : getipptRef.current.filter((t) => folgeRef.current.includes(t.wolkeId)).length
    // die Proberunde wird nicht gewertet
    if (!probeRef.current)
      rundeRef.current = verbucheDurchgang(rundeRef.current, {
        richtig,
        fehlerGrund: grund,
        richtigeVorFehler,
        folge: folgeRef.current,
        getippt: [...getipptRef.current],
      })
    setPhase({ art: 'rueckmeldung', richtig })

    if (richtig) {
      // 120 einfärben + 150 halten, dann gemeinsam über 280 zurück
      const a = konfig.rueckmeldungAnim
      markiere(Object.fromEntries(folgeRef.current.map((id) => [id, 'richtig' as const])))
      plane(a.richtigEin + a.richtigHalten, () => setMarkierungen({}))
      plane(konfig.zeiten.rueckmeldungRichtig, weiterNachRueckmeldung)
      return
    }

    // Auflösung: zeigen, welche Wolken gefehlt hätten
    const a = konfig.rueckmeldungAnim.aufloesung
    const fehlende = folgeRef.current.filter(
      (id) => !getipptRef.current.some((t) => t.wolkeId === id),
    )
    setHimmelDunkel(true)
    if (falsche !== undefined) markiere({ [falsche]: 'falsch' })
    fehlende.forEach((id, i) => {
      plane(a.start + i * a.versatz, () => markiere({ [id]: 'aufgeloest' }))
    })
    const haltenEnde =
      a.start + Math.max(0, fehlende.length - 1) * a.versatz + a.einblenden + a.halten
    plane(haltenEnde, () => {
      // alles geht gemeinsam zurück, der Himmel kommt mit
      setMarkierungen({})
      setHimmelDunkel(false)
    })
    plane(aufloesungGesamt(fehlende.length), weiterNachRueckmeldung)
  }

  function weiterNachRueckmeldung() {
    if (probeRef.current) {
      beendeProberunde()
      return
    }
    if (rundeRef.current.fehlerInFolge > 0 && darfUnterbrechen(rundeRef.current)) {
      starteUnterbrechung()
      return
    }
    starteDurchgang()
  }

  function starteUnterbrechung() {
    const typ = 'bewegung' as const
    rundeRef.current = verbucheUnterbrechung(rundeRef.current, typ)
    stoppeAlleZeitgeber()
    setPausiert(true)
    setBewegungsPuls(rundeRef.current.startPuls + konfig.messung.bewegungsPulsAbstand)
    setPhase({ art: 'unterbrechung', typ, restSekunden: 0 })
    setSheet('bewegung')
  }

  function beendeRunde() {
    const daten = berechneErgebnis(rundeRef.current)
    const vorherige = letzteRunde()
    speichereRunde(daten)
    setVergleich(vergleichsSatz(daten, vorherige))
    setErgebnis(daten)
    setMarkierungen({})
    setPhase({ art: 'ende' })
  }

  /* ── Pause und Abbruch ── */

  function pausiere() {
    if (!imSpiel || phase.art === 'unterbrechung') return
    stoppeAlleZeitgeber()
    setPausiert(true)
    setSheet('verlassen')
  }

  function fortsetzen() {
    setPausiert(false)
    setAbbruchDialog(false)
    setSheet(null)
    starteDurchgang()
  }

  function starteMitStartPuls() {
    rundeRef.current.startPuls = startPuls
    rundeRef.current.anzeigedauer = anzeigedauer
    rundeRef.current.anzeigepause = anzeigepause
    setSheet(null)
    setPausiert(false)
    setPhase({ art: 'countdown', zahl: 3 })
  }

  function oeffneErklaerung() {
    if (proberundeGesehen()) {
      setSheet('startPuls')
      return
    }
    probeRef.current = true
    setProberunde(true)
    setSheet(null)
    setPhase({ art: 'countdown', zahl: 3 })
  }

  /* ── Proberunde ── */

  /** Ende der Proberunde — nach dem Durchgang oder über „Überspringen" */
  function beendeProberunde() {
    stoppeAlleZeitgeber()
    merkeProberundeGesehen()
    setMarkierungen({})
    setHimmelDunkel(false)
    setGedimmt(false)
    setPausiert(true)
    setSheet('proberundeBeendet')
  }

  function nochEinmalUeben() {
    setSheet(null)
    setPausiert(false)
    starteDurchgang()
  }

  /** Weiter zur echten Runde: frische Runde, dann Pulsabfrage wie beim normalen Start */
  function probeWeiter() {
    probeRef.current = false
    setProberunde(false)
    rundeRef.current = neueRunde()
    setSekunden(0)
    setPhase({ art: 'einstieg' })
    setSheet('startPuls')
  }

  function speichereEinstellungen() {
    rundeRef.current.anzeigedauer = anzeigedauer
    rundeRef.current.anzeigepause = anzeigepause
    setSheet(null)
    setPausiert(false)
    starteDurchgang()
  }

  function brichAb() {
    stoppeAlleZeitgeber()
    navigate('/')
  }

  /* Zurück-Knopf des Browsers: Nachfrage statt stillem Abbruch */
  useEffect(() => {
    if (!rundeAktiv) return
    window.history.pushState({ wolkensammeln: true }, '')
    const beiZurueck = () => {
      window.history.pushState({ wolkensammeln: true }, '')
      pausiere()
      setAbbruchDialog(false)
    }
    window.addEventListener('popstate', beiZurueck)
    return () => window.removeEventListener('popstate', beiZurueck)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rundeAktiv])

  /* ── Abgeleitete Anzeige ── */

  /* Echoo erscheint nach der ersten Serie von 3 richtigen Durchgängen und wächst
     danach mit jedem weiteren richtigen Durchgang — Fehler nehmen nichts zurück */
  let serie = 0
  const startIndex = runde.logs.findIndex((log) => {
    serie = log.richtig ? serie + 1 : 0
    return serie >= konfig.echoo.startSerie
  })
  const weitereRichtige = startIndex === -1 ? 0 : runde.logs.slice(startIndex + 1).filter((log) => log.richtig).length
  const fortschritt: number | null =
    phase.art === 'ende'
      ? 1
      : startIndex === -1
        ? null
        : Math.min(1, weitereRichtige / konfig.echoo.schritteBisStrahlend)
  const lachend = fortschritt !== null && fortschritt >= konfig.echoo.lachenAb

  /* Wenn Echoo erscheint oder ein Stück aufsteigt, geht ein heller Schein von unten durch die Wolken */
  const vorigerFortschritt = useRef<number | null>(null)
  useEffect(() => {
    const vorher = vorigerFortschritt.current ?? -1
    if (fortschritt !== null && fortschritt > vorher && phase.art !== 'ende' && !reduziert) {
      const vonUnten = [...layout].sort((a, w) => w.y - a.y).map((w) => w.id)
      neuerPuls(vonUnten, { staerke: b.echooWolkenSchein, verzoegerung: 0 }, b.echooWolkenVersatz)
    }
    vorigerFortschritt.current = fortschritt
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fortschritt])

  /** Seitliches Ausweichen vor Echoo: weg von der Mitte, weiter unten stärker. Wolken,
      die vor seinem Gesicht lägen, weichen so weit aus, dass es frei bleibt — im Spiel
      so begrenzt, dass jede Wolke gut sichtbar und antippbar bleibt */
  const gesicht = gesichtsRahmen(fortschritt, feld.breite, feld.hoehe)
  function versatzFuer(x: number, y: number, breite: number): number {
    if (fortschritt === null) return 0
    const ende = phase.art === 'ende'
    const nachRechts = x >= 50
    /* sanftes Ausweichen: schon beim ersten Erscheinen etwas, dann mit dem Fortschritt mehr */
    let weg = (ende ? konfig.echoo.schiebenEnde : konfig.echoo.schiebenSpiel) * (0.3 + 0.7 * fortschritt) * (0.4 + 0.6 * (y / 200))
    /* liegt die Wolke vor dem Gesicht, rückt sie so weit, dass ihr Rand daneben endet */
    const pxJeEinheit = feld.breite / 100
    const breitePx = breite * pxJeEinheit
    const mitteY = (y / 200) * feld.hoehe
    const halbeHoehe = Math.max(44, breitePx * konfig.wolken.hoehenFaktor) / 2
    const frei = konfig.echoo.gesichtFreiraum
    if (mitteY + halbeHoehe > gesicht.oben - frei && mitteY - halbeHoehe < gesicht.unten + frei) {
      const kante = nachRechts ? (x - breite / 2) * pxJeEinheit : (x + breite / 2) * pxJeEinheit
      const noetig = nachRechts ? gesicht.rechts + frei - kante : kante - (gesicht.links - frei)
      weg = Math.max(weg, noetig / pxJeEinheit)
    }
    const rest = 1 - konfig.echoo.minSichtbar
    const grenze = ende
      ? Infinity
      : nachRechts
        ? Math.max(0, 100 + rest * breite - breite / 2 - x)
        : Math.max(0, x - breite / 2 + rest * breite)
    const betrag = Math.min(weg, grenze)
    return nachRechts ? betrag : -betrag
  }

  /** Aussehen einer Wolke — vollständig aus Phase + Durchgangsdaten berechnet */
  function aussehenFuer(id: number): WolkenAussehen {
    if (phase.art === 'vorfuehren' && phase.leuchtet && folgeRef.current[phase.schritt] === id)
      return 'leuchten'
    return markierungen[id] ?? 'ruhe'
  }

  /* Ankündigung dämpft die Wolken über die Helligkeit — sie bleiben immer deckend */
  const wolkenHelligkeit = gedimmt ? b.ankuendigungHelligkeit : 1

  const haupt = hauptIndex(runde)
  const pulsWert = sheet === 'startPuls' ? startPuls : bewegungsPuls
  const bewegungsUnterbrechung = ergebnis?.unterbrechungen.find((u) => u.bedingung === 'bewegung' && u.verhalten === 'bewegt')
  const verbesserung = bewegungsUnterbrechung
    ? Math.round((bewegungsUnterbrechung.nachher.trefferquote - bewegungsUnterbrechung.vorher.trefferquote) * 100)
    : 0
  const fortschrittsText = proberunde
    ? probeTexte.fortschritt
    : istAufwaermen(runde)
    ? `Aufwärmen ${runde.durchgangNr} von ${konfig.aufwaermDurchgaenge}`
    : haupt !== null && haupt <= konfig.hauptDurchgaenge
      ? `Durchgang ${haupt} von ${konfig.hauptDurchgaenge}`
      : ''

  const leuchtWolke =
    phase.art === 'vorfuehren' && phase.leuchtet
      ? layout.find((w) => w.id === folgeRef.current[phase.schritt])
      : null

  return (
    <div ref={feldRef} className="relative h-full select-none overflow-hidden">
      <motion.div
        className="absolute inset-0"
        animate={{ scale: phase.art === 'countdown' && !reduziert ? 1.02 : 1 }}
        transition={{ duration: reduziert ? 0.2 : 0.45, ease: [0.32, 0.72, 0, 1] }}
      >
      {/* Himmel: atmet beim Einstieg einmal ein (dunkler + enger → offen) */}
      <motion.div
        className="absolute inset-0"
        initial={reduziert ? { opacity: 0 } : { opacity: 0, scale: e.himmelEnger }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: e.himmelDauer / 1000, ease: konfig.kurven.ruhig }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, var(--himmel-blau-oben), var(--himmel-blau-unten))' }}
        />
        {/* Einstieg: startet 8 % dunkler und öffnet sich */}
        {!reduziert && (
          <motion.div
            className="absolute inset-0 bg-ink"
            initial={{ opacity: e.himmelDunkler }}
            animate={{ opacity: 0 }}
            transition={{ duration: e.himmelDauer / 1000, ease: konfig.kurven.ruhig }}
          />
        )}
      </motion.div>

      {/* Ankündigung (3 %) und Fehler (6 %): der Himmel dunkelt ab und kommt weich zurück */}
      <div
        className="absolute inset-0 bg-ink"
        style={{
          opacity: himmelDunkel
            ? konfig.rueckmeldungAnim.himmelAbdunkeln
            : gedimmt
              ? b.ankuendigungHimmel
              : 0,
          transition: `opacity ${himmelDunkel ? konfig.rueckmeldungAnim.falschEin : konfig.rueckmeldungAnim.aufloesung.zurueck}ms ${kurveCss(konfig.kurven.ruhig)}`,
        }}
      />

      {/* Warmer Hauch hinter der leuchtenden Wolke */}
      <AnimatePresence>
        {leuchtWolke && (
          <motion.div
            key={`glut-${leuchtWolke.id}`}
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${leuchtWolke.x}% ${(leuchtWolke.y / 200) * 100}%, rgba(252, 224, 168, 0.5), transparent 40%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: konfig.zeiten.leuchten / 1000, ease: konfig.kurven.ruhig }}
          />
        )}
      </AnimatePresence>

      {/* Bereitschaftsmoment am Ende des Einstiegs: eine warme, sehr weiche Welle */}
      <AnimatePresence>
        {welleN > 0 && phase.art === 'einstieg' && !reduziert && (
          <motion.div
            key={`welle-${welleN}`}
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(0deg, transparent, rgba(252, 224, 168, 0.28) 45%, rgba(252, 224, 168, 0.28) 55%, transparent)',
              backgroundSize: '100% 220%',
            }}
            initial={{ y: '55%', opacity: 0 }}
            animate={{ y: '-55%', opacity: [0, 1, 0] }}
            transition={{ duration: e.welleDauer / 1000, ease: konfig.kurven.ruhig }}
          />
        )}
      </AnimatePresence>

      {/* Startsignal: kurzer Helligkeitslift — kein wandernder Balken */}
      <AnimatePresence>
        {phase.art === 'startsignal' && (
          <motion.div
            className="pointer-events-none absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: reduziert ? 0.1 : [0, 0.14, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: konfig.zeiten.startsignal / 1000 }}
          />
        )}
      </AnimatePresence>

      {/* Tiefe: obere Wolken liegen hinter Echoo (seine Strahlen schieben sich davor),
          untere davor — die Wolkenebenen selbst lassen Klicks durch */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={
          reduziert ? { opacity: 0 } : { scale: e.ebeneSkala, filter: `blur(${e.ebeneBlur}px)` }
        }
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: e.ebeneDauer / 1000, ease: konfig.kurven.ruhig }}
      >
        {layout.filter((wolke) => wolke.y <= konfig.echoo.hintenBisY).map((wolke) => (
          <Wolke
            key={wolke.id}
            wolke={wolke}
            aussehen={aussehenFuer(wolke.id)}
            helligkeit={wolkenHelligkeit}
            eintritt={(raenge.vonUnten.get(wolke.id) ?? 0) * e.wolkeVersatz}
            puls={pulse[wolke.id] ?? null}
            deaktiviert={(phase.art !== 'eingabe' && phase.art !== 'einstieg') || pausiert}
            nurOptisch={phase.art === 'einstieg'}
            stumm={markierungen[wolke.id] === 'getippt'}
            lichtringFaktor={ersterRingVergeben.current ? 1 : e.ersterLichtringFaktor}
            versatz={versatzFuer(wolke.x, wolke.y, konfig.wolken.breiten[wolke.groesse])}
            onTipp={tipp}
          />
        ))}
      </motion.div>

      {/* Echoo: steigt mit jedem richtig gemerkten Durchgang */}
      <Echoo fortschritt={fortschritt} lachend={lachend} />

      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={
          reduziert ? { opacity: 0 } : { scale: e.ebeneSkala, filter: `blur(${e.ebeneBlur}px)` }
        }
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: e.ebeneDauer / 1000, ease: konfig.kurven.ruhig }}
      >
        {layout.filter((wolke) => wolke.y > konfig.echoo.hintenBisY).map((wolke) => (
          <Wolke
            key={wolke.id}
            wolke={wolke}
            aussehen={aussehenFuer(wolke.id)}
            helligkeit={wolkenHelligkeit}
            eintritt={(raenge.vonUnten.get(wolke.id) ?? 0) * e.wolkeVersatz}
            puls={pulse[wolke.id] ?? null}
            deaktiviert={(phase.art !== 'eingabe' && phase.art !== 'einstieg') || pausiert}
            nurOptisch={phase.art === 'einstieg'}
            stumm={markierungen[wolke.id] === 'getippt'}
            lichtringFaktor={ersterRingVergeben.current ? 1 : e.ersterLichtringFaktor}
            versatz={versatzFuer(wolke.x, wolke.y, konfig.wolken.breiten[wolke.groesse])}
            onTipp={tipp}
          />
        ))}
      </motion.div>
      </motion.div>

      {gestartet && phase.art !== 'ende' && phase.art !== 'countdown' && (
        <SpielHud
          sekunden={sekunden}
          licht={runde.licht}
          bumpN={bumpN}
          puls={runde.bewegungsPuls ?? runde.startPuls}
          fortschritt={fortschrittsText}
          onLeave={pausiere}
          onSettings={() => { stoppeAlleZeitgeber(); setPausiert(true); setSheet('einstellungen') }}
          untenRechts={proberunde ? { text: probeTexte.link, onClick: beendeProberunde } : undefined}
        />
      )}

      {/* Proberunde: Hinweise unter der oberen Leiste */}
      <AnimatePresence>
        {proberunde && !pausiert && (phase.art === 'ruhe' || phase.art === 'vorfuehren') && (
          <Hinweis key="merken" text={probeTexte.merken} className="left-1/2 top-[128px] -translate-x-1/2" />
        )}
        {proberunde && !pausiert && phase.art === 'eingabe' && (
          <Hinweis key="tippen" text={probeTexte.tippen} className="left-1/2 top-[128px] -translate-x-1/2" />
        )}
      </AnimatePresence>

      <Countdown zahl={phase.art === 'countdown' ? phase.zahl : null} />

      {/* Pause-Overlay */}
      {pausiert && !abbruchDialog && !sheet && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-ink/25 px-8 backdrop-blur-sm">
          <div className="w-full rounded-card border border-white/70 bg-[var(--overlay-surface)] p-6 text-center shadow-[var(--shadow-overlay)] backdrop-blur-xl">
            <h2 className="text-[18px] font-bold">Pause</h2>
            <p className="mt-1 text-[13px] text-ink-muted">
              Nach dem Fortsetzen beginnt der Durchgang von vorn.
            </p>
            <button
              type="button"
              onClick={fortsetzen}
              className="mt-4 w-full rounded-pill bg-sun-deep px-6 py-3 text-[15px] font-bold text-white"
            >
              Fortsetzen
            </button>
            <button
              type="button"
              onClick={brichAb}
              className="mt-2 w-full rounded-pill px-6 py-3 text-[14px] font-semibold text-ink-muted"
            >
              Runde beenden
            </button>
          </div>
        </div>
      )}

      {/* Abbruch-Nachfrage (Zurück-Knopf) */}
      {abbruchDialog && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-ink/25 px-8 backdrop-blur-sm">
          <div className="w-full rounded-card border border-white/70 bg-[var(--overlay-surface)] p-6 text-center shadow-[var(--shadow-overlay)] backdrop-blur-xl">
            <h2 className="text-[17px] font-bold">Runde abbrechen?</h2>
            <p className="mt-1 text-[13px] text-ink-muted">
              Die Ergebnisse dieser Runde gehen verloren.
            </p>
            <button
              type="button"
              onClick={brichAb}
              className="mt-4 w-full rounded-pill bg-sun-deep px-6 py-3 text-[15px] font-bold text-white"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={fortsetzen}
              className="mt-2 w-full rounded-pill px-6 py-3 text-[14px] font-semibold text-ink-muted"
            >
              Weiterspielen
            </button>
          </div>
        </div>
      )}

      {/* Unterbrechung: Bewegungsimpuls oder stille Pause, zufällig gewählt */}
      {phase.art === 'unterbrechung' && !sheet && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-ink/25 px-8 backdrop-blur-sm">
          <div className="w-full rounded-card border border-white/70 bg-[var(--overlay-surface)] p-6 text-center shadow-[var(--shadow-overlay)] backdrop-blur-xl">
            <h2 className="text-[18px] font-bold">
              {phase.typ === 'bewegung' ? 'Kurze Bewegung' : 'Stille Pause'}
            </h2>
            <p className="mt-2 text-[14px] leading-snug text-ink-muted">
              {phase.typ === 'bewegung'
                ? 'Steh auf, streck dich, geh ein paar Schritte — bis der Zähler abgelaufen ist.'
                : 'Bleib einfach kurz sitzen und lass die Augen vom Bildschirm — bis der Zähler abgelaufen ist.'}
            </p>
            <div
              className="mt-4 text-[44px] font-black leading-none"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {phase.restSekunden}
            </div>
            <p className="mt-3 text-[12px] leading-snug text-ink-muted">
              Danach geht es mit der aktuellen Länge weiter.
            </p>
          </div>
        </div>
      )}

      {/* Sheets: das alte schließt animiert, erst dann öffnet das nächste */}
      <AnimatePresence mode="wait">
        {sheet === 'erklaerung' && (
          <Sheet key="erklaerung" schliessbar={false} variante="karte">
            <div className="w-full text-center">
              <EinstiegsHimmel />
              <h2 id="sheet-titel" className="text-[26px] font-semibold leading-8 tracking-[-0.01em]">Wolkensammeln</h2>
              <p className="mt-2 text-[14px] leading-5 text-[#6a6a6a]">
                Merke dir die Reihenfolge, in der 3 bis 8 Wolken am Himmel nacheinander aufleuchten,
                und tippe sie anschließend in genau dieser Reihenfolge an. Bei jeder richtig erinnerten
                Wolke lichtet sich der Himmel ein Stück weiter, bis er vollständig strahlt und Echoo
                zum Vorschein kommt.
              </p>
              <button type="button" onClick={oeffneErklaerung} className={`mt-8 ${knopfPrimaer}`}>
                Spiel starten
              </button>
              <button type="button" onClick={brichAb} className={`mt-2 ${knopfSekundaer}`}>
                Abbrechen
              </button>
            </div>
          </Sheet>
        )}

        {(sheet === 'startPuls' || sheet === 'bewegungPuls') && (
          <PulsSheet
            key={sheet}
            art={sheet === 'startPuls' ? 'start' : 'bewegung'}
            wert={pulsWert}
            min={konfig.messung.pulsMin}
            max={konfig.messung.pulsMax}
            onChange={sheet === 'startPuls' ? setStartPuls : setBewegungsPuls}
            onWeiter={sheet === 'startPuls' ? starteMitStartPuls : () => {
              rundeRef.current.bewegungsPuls = bewegungsPuls
              setSheet(null)
              setPausiert(false)
              starteDurchgang()
            }}
          />
        )}

        {sheet === 'einstellungen' && (
          <EinstellungenSheet
            key="einstellungen"
            dauer={{ wert: anzeigedauer, min: konfig.messung.anzeigeMin, max: konfig.messung.anzeigeMax, schritt: konfig.messung.anzeigeSchritt, onChange: setAnzeigedauer }}
            pause={{ wert: anzeigepause, min: konfig.messung.anzeigePauseMin, max: konfig.messung.anzeigePauseMax, schritt: konfig.messung.anzeigePauseSchritt, onChange: setAnzeigepause }}
            onSpeichern={speichereEinstellungen}
          />
        )}

        {sheet === 'proberundeBeendet' && (
          <TextSheet
            key="proberunde-beendet"
            titel={probeTexte.beendet.titel}
            text={probeTexte.beendet.text}
            primaer={{ text: probeTexte.beendet.primaer, onClick: probeWeiter }}
            sekundaer={{ text: probeTexte.beendet.sekundaer, onClick: nochEinmalUeben }}
          />
        )}

        {sheet === 'verlassen' && <VerlassenSheet key="verlassen" onFortsetzen={fortsetzen} onVerlassen={brichAb} />}

        {sheet === 'bewegung' && (
          <BewegungspauseSheet
            key="bewegung"
            onBewegt={() => { rundeRef.current.unterbrechungen.at(-1)!.verhalten = 'bewegt'; setSheet('bewegungPuls') }}
            onOhneBewegung={() => { rundeRef.current.unterbrechungen.at(-1)!.verhalten = 'ohneBewegung'; setSheet(null); setPausiert(false); starteDurchgang() }}
          />
        )}
      </AnimatePresence>

      {/* Ergebnis: Karte erscheint nach dem großen Echoo, Zeilen gestaffelt */}
      {phase.art === 'ende' && ergebnis && (
        <ErgebnisSheet
          wert={Math.round(ergebnis.licht)}
          wertLabel={`${formatZahl(Math.round(ergebnis.licht))} Licht gesammelt`}
          satz={vergleich}
          zeilen={[
            { label: 'Höchste Anzahl', wert: formatZahl(ergebnis.hoechsteLaenge) },
            { label: 'Trefferquote', wert: `${Math.round(ergebnis.trefferquote * 100)} %` },
            { label: 'Längste Serie', wert: formatZahl(ergebnis.laengsteSerie) },
            { label: 'Prozentuale Verbesserung', wert: `${verbesserung} %`, zusatz: 'nach Bewegungspause' },
          ]}
          primaer={{ text: 'Dashboard', onClick: () => navigate('/') }}
          sekundaer={{ text: 'Statistiken', onClick: () => navigate('/statistiken') }}
          verzoegerung={b.echooAufstieg + b.endeKarteVerzoegerung}
          zeilenVersatz={b.endeZeilenVersatz}
        />
      )}
    </div>
  )
}