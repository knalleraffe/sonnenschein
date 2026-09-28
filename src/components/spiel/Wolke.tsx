import { memo, useEffect, useRef, useState } from 'react'
import { animate, motion, useReducedMotion } from 'motion/react'
import { konfig, kurveCss } from '../../games/wolkensammeln/config'
import type { Wolke as WolkeDaten } from '../../games/wolkensammeln/types'

/*
  Eine Wolke am Himmel. Ihre Position ändert sich nur, wenn Echoo sie
  zwischen zwei Durchgängen sanft beiseiteschiebt (versatz) — nie
  während Vorführung oder Eingabe. Sie speichert ihren Zustand NICHT selbst: Wie sie aussieht, wird jedes Mal aus dem
  `aussehen`-Prop berechnet, das der Bildschirm aus Phase und
  Durchgangsdaten ableitet. Es gibt keine nachlaufende Animation, die
  einen alten Wert zurückschreiben könnte — Farbwechsel sind reine
  CSS-Übergänge zum jeweils aktuellen Ziel.
  Rückmeldung färbt ausschließlich die Füllfläche, nie eine Kontur.
  Die Form ist eine Ersatzform — wolke.svg ersetzt später nur diese Datei.
*/

export type WolkenAussehen = 'ruhe' | 'leuchten' | 'getippt' | 'richtig' | 'falsch' | 'aufgeloest'

export interface WolkenPuls {
  n: number
  /** Stärke des kurzen weißen Scheins um die Wolke (0–1) */
  staerke: number
  verzoegerung: number
}

const cssStandard = kurveCss(konfig.kurven.standard)

const FARBEN: Record<WolkenAussehen, string> = {
  ruhe: '#ffffff',
  leuchten: 'var(--wolke-leuchten)',
  aufgeloest: 'var(--wolke-leuchten)',
  getippt: konfig.rueckmeldungAnim.richtigFarbe,
  richtig: konfig.rueckmeldungAnim.richtigFarbe,
  falsch: konfig.rueckmeldungAnim.falschFarbe,
}

/** Übergangsdauer beim WECHSEL zu einem Aussehen (Rückweg hängt vom Vorgänger ab) */
function fuellDauer(neu: WolkenAussehen, vorher: WolkenAussehen): number {
  const a = konfig.rueckmeldungAnim
  if (neu === 'leuchten') return 300
  if (neu === 'aufgeloest') return a.aufloesung.einblenden
  if (neu === 'getippt' || neu === 'richtig') return a.richtigEin
  if (neu === 'falsch') return a.falschEin
  // zurück in die Ruhe
  if (vorher === 'richtig') return a.richtigZurueck
  if (vorher === 'falsch' || vorher === 'aufgeloest' || vorher === 'getippt') return a.aufloesung.zurueck
  if (vorher === 'leuchten') return 300
  return konfig.bewegung.durchgangsWechsel
}

function WolkeInnen({
  wolke,
  aussehen,
  helligkeit,
  eintritt,
  puls,
  deaktiviert,
  nurOptisch = false,
  stumm = false,
  lichtringFaktor = 1,
  versatz = 0,
  onTipp,
}: {
  wolke: WolkeDaten
  /** vollständig vom Bildschirm abgeleitet — die Wolke merkt sich nichts */
  aussehen: WolkenAussehen
  /** 1 = normal, darunter gedämpft (Ankündigung) — Wolken bleiben immer deckend */
  helligkeit: number
  /** Versatz beim Betreten des Spiels (ms) */
  eintritt: number
  puls: WolkenPuls | null
  deaktiviert: boolean
  /** Einstieg: Druckzustand zeigen, aber nichts bewirken */
  nurOptisch?: boolean
  /** schon angetippt: reagiert gar nicht mehr */
  stumm?: boolean
  /** der allererste Lichtring ist einmalig größer */
  lichtringFaktor?: number
  /** seitliches Ausweichen vor Echoo (Einheiten = % der Breite) */
  versatz?: number
  onTipp: (id: number) => void
}) {
  const reduziert = useReducedMotion()
  const b = konfig.bewegung
  const e = konfig.einstieg
  const breite = konfig.wolken.breiten[wolke.groesse]

  const deckRef = useRef<HTMLDivElement>(null)
  const scheinRef = useRef<HTMLDivElement>(null)
  const vorherRef = useRef<WolkenAussehen>('ruhe')
  const [gedrueckt, setGedrueckt] = useState(false)
  const [tippRing, setTippRing] = useState<{ x: number; y: number; n: number } | null>(null)
  const [leuchtN, setLeuchtN] = useState(0)

  const dauer = fuellDauer(aussehen, vorherRef.current)
  useEffect(() => {
    vorherRef.current = aussehen
  }, [aussehen])

  /* Helligkeit weich zum Ziel führen — nie über die Deckkraft, damit nichts durchscheint */
  useEffect(() => {
    if (!deckRef.current) return
    const lauf = animate(deckRef.current, { filter: `brightness(${helligkeit})` }, {
      duration: 0.4,
      ease: konfig.kurven.standard,
    })
    return () => lauf.stop()
  }, [helligkeit])

  /* Kurzer Puls: weicher weißer Schein um die Wolke (Nachbarn, Echoo-Welle) — endet immer bei null */
  useEffect(() => {
    if (!puls || !scheinRef.current || reduziert) return
    const aus = 'drop-shadow(0 0 0px rgba(255, 255, 255, 0))'
    const an = `drop-shadow(0 0 ${b.pulsScheinRadius}px rgba(255, 255, 255, ${puls.staerke}))`
    const lauf = animate(scheinRef.current, { filter: [aus, an, aus] }, {
      duration: (b.nachbarDauer * 2) / 1000,
      delay: puls.verzoegerung / 1000,
      ease: konfig.kurven.standard,
    })
    return () => lauf.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puls?.n])

  /* Lichtring bei jedem Aufleuchten neu starten */
  useEffect(() => {
    if (aussehen === 'leuchten' || aussehen === 'aufgeloest') setLeuchtN((n) => n + 1)
  }, [aussehen])

  function beiTipp(ev: React.PointerEvent<HTMLButtonElement>) {
    if (deaktiviert || stumm) return
    const rect = ev.currentTarget.getBoundingClientRect()
    if (!reduziert) {
      setGedrueckt(true)
      setTimeout(() => setGedrueckt(false), b.tippDruckEin)
      if (!nurOptisch) setTippRing({ x: ev.clientX - rect.left, y: ev.clientY - rect.top, n: Date.now() })
    }
    if (!nurOptisch) onTipp(wolke.id)
  }

  const leuchtet = aussehen === 'leuchten' || aussehen === 'aufgeloest'

  return (
    <button
      type="button"
      aria-label={`Wolke ${wolke.id + 1}`}
      disabled={deaktiviert && !nurOptisch}
      onPointerDown={beiTipp}
      className="absolute block"
      style={{
        left: `${wolke.x + versatz}%`,
        top: `${(wolke.y / 200) * 100}%`,
        transition: reduziert ? 'none' : `left ${konfig.echoo.wolkenDauer}ms ${kurveCss(konfig.kurven.ruhig)}`,
        /* die Wolkenebenen lassen Klicks durch, nur die Wolke selbst nimmt sie an */
        pointerEvents: 'auto',
        width: `${breite}%`,
        minWidth: 44,
        minHeight: 44,
        transform: 'translate(-50%, -50%)',
        touchAction: 'manipulation',
      }}
    >
      {/* Eintritt beim Betreten des Spiels */}
      <motion.div
        initial={{ opacity: 0, scale: reduziert ? 1 : e.wolkeSkala }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: e.wolkeDauer / 1000,
          delay: eintritt / 1000,
          ease: konfig.kurven.standard,
        }}
      >
        {/* Helligkeit (Ankündigung) */}
        <div ref={deckRef} style={{ filter: `brightness(${helligkeit})` }}>
          {/* weißer Schein bei Pulsen */}
          <div ref={scheinRef}>
            {/* Druck beim Antippen */}
            <motion.div
              animate={
                reduziert
                  ? { opacity: gedrueckt ? 0.8 : 1 }
                  : { scale: gedrueckt ? b.tippDruckSkala : 1 }
              }
              transition={{
                duration: (gedrueckt ? b.tippDruckEin : b.tippDruckAus) / 1000,
                ease: konfig.kurven.druck,
              }}
            >
              {/* leichtes Größer-Werden bei Leuchten und Richtig — alles ohne Nachfedern */}
              <motion.div
                animate={
                  reduziert
                    ? { opacity: leuchtet ? 0.82 : 1 }
                    : {
                        scale: leuchtet ? 1.04 : aussehen === 'richtig' ? konfig.rueckmeldungAnim.richtigSkala : 1,
                      }
                }
                transition={{ duration: dauer / 1000, ease: konfig.kurven.standard }}
                style={{
                  filter: leuchtet
                    ? 'drop-shadow(0 0 16px rgba(252, 224, 168, 0.9))'
                    : 'drop-shadow(0 4px 8px rgba(90, 120, 160, 0.16))',
                    transition: reduziert ? 'none' : `filter 300ms ${cssStandard}`,
                }}
              >
                <svg viewBox="0 0 100 40" className="h-auto w-full" aria-hidden style={{ overflow: 'visible' }}>
                  <g
                    id="wolke-fuellung"
                    fill={FARBEN[aussehen]}
                    style={{ transition: reduziert ? 'none' : `fill ${dauer}ms ${cssStandard}` }}
                  >
                    <circle cx="20" cy="26" r="12" />
                    <circle cx="40" cy="16" r="16" />
                    <circle cx="63" cy="20" r="14" />
                    <circle cx="83" cy="27" r="9" />
                    <rect x="8" y="20" width="84" height="16" rx="8" />
                  </g>
                </svg>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Lichtring: eine weiche Form, die aus der Wolke herausläuft */}
      {!reduziert && aussehen === 'leuchten' && leuchtN > 0 && (
        <motion.div
          key={`ring-${leuchtN}`}
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: '50%',
            background:
              'radial-gradient(closest-side, rgba(252, 224, 168, 0.0) 55%, rgba(252, 224, 168, 0.85) 72%, rgba(252, 224, 168, 0) 100%)',
          }}
          initial={{ scale: 1, opacity: b.lichtringDeckkraft }}
          animate={{ scale: b.lichtringSkala * lichtringFaktor, opacity: 0 }}
          transition={{ duration: b.lichtringDauer / 1000, ease: konfig.kurven.standard }}
        />
      )}

      {/* Ring an der Berührstelle */}
      {!reduziert && tippRing && (
        <motion.div
          key={`tipp-${tippRing.n}`}
          className="pointer-events-none absolute h-11 w-11 rounded-full border-2 border-white"
          style={{ left: tippRing.x - 22, top: tippRing.y - 22 }}
          initial={{ scale: 1, opacity: b.tippRingDeckkraft }}
          animate={{ scale: b.tippRingSkala, opacity: 0 }}
          transition={{ duration: b.tippRingDauer / 1000, ease: konfig.kurven.standard }}
          onAnimationComplete={() => setTippRing(null)}
        />
      )}
    </button>
  )
}

const Wolke = memo(WolkeInnen)
export default Wolke