import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { SzeneErde, SzeneHinten } from '../components/himmelsroute/Szene'
import { useNeigung } from '../components/himmelsroute/neigung'
import Hinweis from '../components/himmelsroute/Hinweis'
import { glasPille, kurve, kurveRuhig } from '../components/start/stil'
import { knopfPrimaer } from '../components/spiel/SpielSheets'
import { konfig as himmel } from '../games/himmelsroute/config'
import { merkeOnboardingGesehen, onboardingGesehen } from '../lib/einstellungen'
import { fuelle, type SpielId } from '../lib/startTexte'
import EchooFigur from './EchooFigur'
import { MittippKnopf, PulsAnzeige, SitzungsRoute, SitzungsTexte, usePulsMessung, WendeKarte } from './Schritte'
import { einfuehrungsTexte as t } from './texte'
import Fortschrittsroute from './Fortschrittsroute'

/*
  Splash und Onboarding als EINE durchgehende Szene (Master splash-onboarding,
  Abschnitte 2 und 3): Echoo geht hinter der Erde auf wie in der Himmelsroute.
  Beim ersten Start wird der Splash ohne Schnitt zu Onboarding-Schritt 1; jeder
  Schritt liegt 480 px höher im Himmel, die Kamera fährt mit (900 ms), Echoo
  steigt mit. Am Ende wächst alles leicht und blendet zur Startseite aus.
  Kein Figma-Design — gebaut aus Himmelsszene, Echoo, Sheet-Stil, Wegpunkten,
  Glas-Pille und Buttons der Spiele.
*/

const SCHRITTE = 6
const ABSTAND = himmel.haltepunktAbstand // 480
const START = himmel.szene.start // 5650: Echoo nach dem Aufgang
const FAHRT = 900
const EINRASTEN = himmel.fortbewegung.einrasten // 30 %
/** Kameralinie: Echoos Höhe im Splash (Anteil der Bildschirmhöhe) */
const LINIE = 0.36
/** Inhaltskarte: passt sich dem Inhalt an; die Szene rechnet mit höchstens diesem Anteil der Höhe */
const KARTE = 0.46
/** Splash-Zeitplan (ms) */
const ZEIT = { erde: 300, aufgang: 1300, name: 1800, ende: 2300 }
/** Echoo je Schritt: Höhe (Anteil) und Skala (1 = Körper 300 px) */
const ECHOO_LAGE = [
  { y: 0.36, skala: 0.4 },
  { y: 0.16, skala: 0.16 },
  { y: 0.14, skala: 0.14 },
  { y: 0.15, skala: 0.16 },
  { y: 0.29, skala: 0.3 },
  { y: 0.3, skala: 0.34 },
]

type Phase = 'splash' | 'onboarding' | 'ausgang'

export default function Startsequenz({ modus, onFertig }: { modus: 'splash' | 'einfuehrung'; onFertig: () => void }) {
  const reduziert = Boolean(useReducedMotion())
  const wurzel = useRef<HTMLDivElement>(null)
  const [mass, setMass] = useState<{ b: number; h: number }>({ b: 393, h: 852 })
  useLayoutEffect(() => {
    const el = wurzel.current
    if (!el) return
    const messe = () => setMass({ b: el.clientWidth, h: el.clientHeight })
    messe()
    const b = new ResizeObserver(messe)
    b.observe(el)
    return () => b.disconnect()
  }, [])
  const f = mass.b / himmel.szene.breite
  const linieY = mass.h * LINIE
  // Oberkante der Inhaltskarte (gemessen); Szenen-Elemente bleiben darüber
  const [kartenHoehe, setKartenHoehe] = useState(0)
  const karteOben = Math.min(mass.h * (1 - KARTE), mass.h - kartenHoehe) - 8

  const kartenBeobachter = useRef<ResizeObserver | null>(null)
  const misstKarte = useCallback((el: HTMLDivElement | null) => {
    kartenBeobachter.current?.disconnect()
    if (!el) return
    kartenBeobachter.current = new ResizeObserver(() => setKartenHoehe(el.offsetHeight))
    kartenBeobachter.current.observe(el)
  }, [])

  /*
    Höhe der Karte als Bewegungswert: beim Schrittwechsel gleitet sie weich auf
    die neue Höhe (auf Wunsch von Julius, einzige Höhen-Animation). Wächst der
    Inhalt innerhalb eines Schritts (aufgeklappter Wegpunkt, Pulsergebnis),
    folgt sie sofort, denn der Inhalt animiert dort schon selbst.
  */
  const kartenH = useMotionValue(0)
  const hoehenSchritt = useRef(-1)
  // Spielkarten in Schritt 4: 12 px über der Karte (wie ihr Abstand zueinander), 180 px hoch
  const kartenY = useTransform(kartenH, (h) => mass.h - h - 8 - 12 - 180)

  const [phase, setPhase] = useState<Phase>(modus === 'splash' ? 'splash' : 'onboarding')
  const [schritt, setSchritt] = useState(0)
  useEffect(() => {
    if (!kartenHoehe) return
    const neuerSchritt = hoehenSchritt.current !== schritt
    hoehenSchritt.current = schritt
    if (kartenH.get() === 0 || !neuerSchritt || reduziert) kartenH.set(kartenHoehe)
    else {
      const lauf = animate(kartenH, kartenHoehe, { duration: 0.35, ease: kurveRuhig })
      return () => lauf.stop()
    }
    // nur bei neuer Inhaltshöhe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kartenHoehe])
  const [nameSichtbar, setNameSichtbar] = useState(false)
  const [atmet, setAtmet] = useState(false)

  const kamera = useMotionValue<number>(START)
  const erdeY = useMotionValue(modus === 'splash' ? 40 : 0)
  const erdeDeckkraft = useMotionValue(modus === 'splash' ? 0 : 1)
  const ausgangDeckkraft = useMotionValue(1)
  const ausgangSkala = useMotionValue(1)
  const echoo = {
    x: useMotionValue(mass.b / 2),
    y: useMotionValue(linieY + (modus === 'splash' ? 220 : 0)),
    skala: useMotionValue(ECHOO_LAGE[0].skala),
    deckkraft: useMotionValue(modus === 'splash' ? 0 : 1),
  }
  const neigung = useNeigung()
  const laeufe = useRef<{ stop: () => void }[]>([])
  const zeitgeber = useRef<number[]>([])
  const halteAn = () => {
    laeufe.current.forEach((l) => l.stop())
    laeufe.current = []
  }
  useEffect(
    () => () => {
      zeitgeber.current.forEach(window.clearTimeout)
      laeufe.current.forEach((l) => l.stop())
    },
    [],
  )
  const nach = (ms: number, fn: () => void) => zeitgeber.current.push(window.setTimeout(fn, ms))

  // Echoo bleibt mittig, auch wenn sich die Breite erst nach dem Messen ergibt
  useEffect(() => {
    if (phase !== 'ausgang') echoo.x.set(mass.b / 2)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mass.b])

  /* ── Splash: Zeittabelle aus Abschnitt 2 ── */
  useEffect(() => {
    if (modus !== 'splash') {
      setAtmet(true)
      return
    }
    const d = (ms: number) => (reduziert ? 0 : ms / 1000)
    laeufe.current.push(animate(erdeY, 0, { duration: d(ZEIT.erde), ease: kurve }), animate(erdeDeckkraft, 1, { duration: d(ZEIT.erde) || 0.2, ease: kurve }))
    nach(ZEIT.erde, () => {
      laeufe.current.push(
        animate(echoo.y, linieY, { duration: d(ZEIT.aufgang - ZEIT.erde), ease: kurveRuhig }),
        animate(echoo.deckkraft, 1, { duration: (ZEIT.aufgang - ZEIT.erde) / 1000, ease: kurveRuhig }),
      )
    })
    nach(ZEIT.aufgang, () => setNameSichtbar(true))
    nach(ZEIT.name, () => setAtmet(true))
    nach(ZEIT.ende, splashEnde)
    // einmal beim Start
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Antippen springt zum Endzustand des Splashs */
  function splashUeberspringen() {
    if (phase !== 'splash') return
    zeitgeber.current.forEach(window.clearTimeout)
    zeitgeber.current = []
    halteAn()
    erdeY.set(0)
    erdeDeckkraft.set(1)
    echoo.y.set(linieY)
    echoo.deckkraft.set(1)
    setNameSichtbar(true)
    setAtmet(true)
    nach(300, splashEnde)
  }

  function splashEnde() {
    if (!onboardingGesehen()) {
      // kein Schnitt: der Name blendet aus, die Szene wird zu Schritt 1, Echoo bleibt stehen
      setNameSichtbar(false)
      setPhase('onboarding')
    } else ausgang()
  }

  /* ── Ausgang: Echoo fährt an seine Stelle auf der Startseite, alles andere blendet aus ── */
  function ausgang() {
    halteAn()
    setPhase('ausgang')
    setNameSichtbar(false)
    // Szene und Echoo wachsen leicht und blenden aus, die Startseite liegt schon darunter
    const dauer = reduziert ? 0.2 : 0.5
    laeufe.current.push(animate(ausgangDeckkraft, 0, { duration: dauer, ease: kurveRuhig }))
    if (!reduziert) laeufe.current.push(animate(ausgangSkala, 1.06, { duration: dauer, ease: kurveRuhig }))
    nach(dauer * 1000, onFertig)
  }

  function beende() {
    merkeOnboardingGesehen()
    ausgang()
  }

  /* ── Onboarding: Kamera und Echoo je Schritt ── */
  const basis = (s: number) => START - s * ABSTAND
  function gehe(neu: number, dauer = FAHRT) {
    const s = Math.max(0, Math.min(SCHRITTE - 1, neu))
    halteAn()
    setSchritt(s)
    const d = reduziert ? 0 : dauer / 1000
    laeufe.current.push(
      animate(kamera, basis(s), { duration: d, ease: kurveRuhig }),
      animate(echoo.y, mass.h * ECHOO_LAGE[s].y, { duration: d, ease: kurveRuhig }),
      animate(echoo.skala, ECHOO_LAGE[s].skala, { duration: d, ease: kurveRuhig }),
      animate(echoo.x, mass.b / 2, { duration: d, ease: kurveRuhig }),
    )
  }
  // Beim Eintritt ins Onboarding: Echoo auf die Lage von Schritt 1
  useEffect(() => {
    if (phase === 'onboarding' && schritt === 0) gehe(0, 500)
    // nur beim Wechsel der Phase
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  /* Ziehen: nach oben = weiter, nach unten = zurück; Einrasten ab 30 % */
  const zug = useRef<{ y0: number } | null>(null)
  function strecke(d: number) {
    if (d > 0 && schritt < SCHRITTE - 1) return Math.min(ABSTAND, d)
    if (d < 0 && schritt > 0) return Math.max(-ABSTAND, d)
    return 0
  }
  function loslassen(d: number) {
    const s = strecke(d)
    if (Math.abs(s) >= EINRASTEN * ABSTAND) gehe(schritt + Math.sign(s), FAHRT * (1 - Math.abs(s) / ABSTAND) + 200)
    else gehe(schritt, 300)
  }
  function ziehStart(e: ReactPointerEvent<HTMLDivElement>) {
    if (phase === 'splash') return splashUeberspringen()
    if (phase !== 'onboarding') return
    halteAn()
    zug.current = { y0: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function ziehBewegung(e: ReactPointerEvent<HTMLDivElement>) {
    if (!zug.current) return
    const s = strecke((zug.current.y0 - e.clientY) / f)
    kamera.set(basis(schritt) - s)
    // Echoo folgt dem Finger ein Stück
    echoo.y.set(mass.h * ECHOO_LAGE[schritt].y - s * f * 0.25)
  }
  function ziehEnde(e: ReactPointerEvent<HTMLDivElement>) {
    if (!zug.current) return
    const d = (zug.current.y0 - e.clientY) / f
    zug.current = null
    loslassen(d)
  }
  const rad = useRef({ akku: 0, zeitgeber: 0 })
  function beiRad(e: WheelEvent<HTMLDivElement>) {
    if (phase !== 'onboarding') return
    halteAn()
    // nach unten scrollen = weiter, wie Hochziehen
    rad.current.akku += e.deltaY / f
    const s = strecke(rad.current.akku)
    kamera.set(basis(schritt) - s)
    window.clearTimeout(rad.current.zeitgeber)
    rad.current.zeitgeber = window.setTimeout(() => {
      const d = rad.current.akku
      rad.current.akku = 0
      loslassen(d)
    }, himmel.fortbewegung.radRuhe)
  }

  /* ── Zustand der Schritte ── */
  const [offenerWegpunkt, setOffenerWegpunkt] = useState<number | null>(null)
  const puls = usePulsMessung()
  const [gedreht, setGedreht] = useState<Record<SpielId, boolean>>({ wolkensammeln: false, himmelsroute: false })

  const inhalt = t.schritte[schritt]
  const zeigeOnboarding = phase === 'onboarding'
  const wegpunkte = Array.from({ length: SCHRITTE }, (_, i) => {
    const oben = 150
    const unten = karteOben - 28
    return { x: mass.b - 26, y: unten - (i * (unten - oben)) / (SCHRITTE - 1) }
  })

  return (
    <motion.div
      ref={wurzel}
      className="absolute inset-0 z-[70] touch-none select-none overflow-hidden"
      style={{ opacity: ausgangDeckkraft, scale: ausgangSkala }}
      onPointerDown={ziehStart}
      onPointerMove={ziehBewegung}
      onPointerUp={ziehEnde}
      onPointerCancel={ziehEnde}
      onWheel={beiRad}
      role="dialog"
      aria-label={phase === 'onboarding' ? inhalt.titel : t.splash}
    >
      {/* Szene: unterer Abschnitt der Himmelsszene mit Erdbogen */}
      <SzeneHinten kamera={kamera} echooY={linieY} faktor={f} neigung={neigung} />
      <EchooFigur x={echoo.x} y={echoo.y} skala={echoo.skala} deckkraft={echoo.deckkraft} atmet={atmet} />
      <motion.div className="pointer-events-none absolute inset-0" style={{ y: erdeY, opacity: erdeDeckkraft }}>
        <SzeneErde kamera={kamera} echooY={linieY} faktor={f} />
      </motion.div>

      {/* Splash: APP_NAME unter Echoo */}
      <AnimatePresence>
        {nameSichtbar && (
          <motion.p
            key="name"
            className="pointer-events-none absolute inset-x-0 text-center text-[26px] font-semibold leading-8 tracking-[-0.01em] text-black"
            style={{ top: linieY + 84 }}
            initial={{ opacity: 0, y: reduziert ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: (ZEIT.name - ZEIT.aufgang) / 1000, ease: kurve }}
          >
            {t.splash}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zeigeOnboarding && (
          <motion.div key="onboarding" className="absolute inset-0" style={{ pointerEvents: 'none' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: kurve }}>
            {/* Szenen-Elemente der Schritte */}
            {schritt === 0 && (
              <Hinweis key="h1" text={t.schritte[0].hinweis} className="left-1/2 -translate-x-1/2" style={{ top: mass.h * ECHOO_LAGE[0].y - 190 }} />
            )}
            {schritt === 1 && (
              <div onPointerDown={(e) => e.stopPropagation()}>
                <SitzungsRoute offen={offenerWegpunkt} onTippen={(i) => setOffenerWegpunkt((o) => (o === i ? null : i))} breite={mass.b - 40} unten={karteOben} />
              </div>
            )}
            {schritt === 2 && (
              <div className="pointer-events-auto" onPointerDown={(e) => e.stopPropagation()}>
                <MittippKnopf ring={puls.ring} onTippen={puls.tippe} laeuft={puls.laeuft} mitteX={mass.b / 2} mitteY={(mass.h * ECHOO_LAGE[2].y + 60 + karteOben) / 2 + 20} />
              </div>
            )}
            {schritt === 3 && (
              // folgt der Oberkante der Inhaltskarte (kartenY)
              <motion.div className="pointer-events-auto absolute inset-x-6 top-0 grid grid-cols-2 gap-3" style={{ y: kartenY }} onPointerDown={(e) => e.stopPropagation()}>
                {(['wolkensammeln', 'himmelsroute'] as SpielId[]).map((spiel) => (
                  <WendeKarte key={spiel} spiel={spiel} gedreht={gedreht[spiel]} onTippen={() => setGedreht((g) => ({ ...g, [spiel]: !g[spiel] }))} />
                ))}
              </motion.div>
            )}

            {/* Überspringen oben rechts (Schritte 1–5) */}
            {schritt < SCHRITTE - 1 && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={beende}
                className={`pointer-events-auto absolute right-6 top-16 flex h-12 items-center px-4 text-[14px] font-medium leading-3 text-black ${glasPille}`}
              >
                {t.ueberspringen}
              </button>
            )}

            {/* Fortschritt: senkrechte Route am rechten Rand, 6 Wegpunkte */}
            <Fortschrittsroute wegpunkte={wegpunkte} schritt={schritt} onGehe={gehe} />

            {/* Inhaltskarte im Stil der Sheets, so hoch wie ihr Inhalt — beim Schrittwechsel gleitet ihre Höhe weich, nur ihr Inhalt blendet über */}
            <motion.div
              className="pointer-events-auto absolute inset-x-2 bottom-2 flex max-h-[calc(100%-88px)] flex-col justify-end overflow-hidden rounded-b-[56px] rounded-t-[40px] bg-white shadow-[0_0_40px_rgba(0,0,0,0.12)]"
              style={{ height: kartenHoehe ? kartenH : 'auto' }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div ref={misstKarte} className="shrink-0">
                <div className="relative px-6 pt-8">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={schritt}
                      initial={{ opacity: 0, y: reduziert ? 0 : 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: reduziert ? 0 : -8 }}
                      transition={{ duration: 0.25, ease: kurve }}
                    >
                      <h2 className="text-[26px] font-semibold leading-8 tracking-[-0.01em]">{inhalt.titel}</h2>
                      {'text' in inhalt && inhalt.text && <p className="mt-2 text-[14px] leading-5 text-[#6a6a6a]">{inhalt.text}</p>}
                      {schritt === 1 && (
                        <>
                          <p className="mt-2 text-[14px] leading-5 text-[#6a6a6a]">{t.schritte[1].hinweis}</p>
                          <SitzungsTexte offen={offenerWegpunkt} onTippen={(i) => setOffenerWegpunkt((o) => (o === i ? null : i))} />
                        </>
                      )}
                      {schritt === 2 && (
                        <div className="mt-3">
                          {puls.ergebnis !== null && (
                            <p className="text-[18px] font-semibold leading-6 text-black" role="status">
                              {fuelle(t.schritte[2].ergebnis, { x: puls.ergebnis })}
                            </p>
                          )}
                          {(puls.ergebnis !== null || puls.uhr) && <PulsAnzeige wert={puls.ergebnis ?? 70} />}
                          {puls.ergebnis === null && !puls.uhr && (
                            <button type="button" onClick={puls.zeigeUhr} className="min-h-11 text-left text-[14px] font-medium text-black underline underline-offset-2">
                              {t.schritte[2].link}
                            </button>
                          )}
                          <p className="mt-2 text-[12px] leading-4 text-[#6a6a6a]">{t.schritte[2].hinweis}</p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="px-6 pb-6 pt-3">
                  <button type="button" onClick={() => (schritt < SCHRITTE - 1 ? gehe(schritt + 1) : beende())} className={knopfPrimaer}>
                    {schritt < SCHRITTE - 1 ? t.weiter : t.schritte[5].primaer}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
