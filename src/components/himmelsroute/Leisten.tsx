import { motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowUp, HeartPulse, Settings2 } from 'lucide-react'
import { konfig as wolkenKonfig } from '../../games/wolkensammeln/config'
import { konfig } from '../../games/himmelsroute/config'

/*
  infoOverlay der Himmelsroute (Figma 507:1276): Glas-Pillen, 48 px hoch.
  Oben links Zurück, oben rechts Runde | Fortschritt. Unten links der Puls,
  unten rechts Pfeil | Einstellungen. Der Pfeil fährt zum nächsten
  Haltepunkt und steht gesperrt auf 40 % Deckkraft. In der Proberunde steht
  unten rechts stattdessen „Überspringen" (Figma 507:1295).
*/

const icon = { size: 20, strokeWidth: 1.5, 'aria-hidden': true } as const

function pille(weiss: boolean) {
  return `pointer-events-auto flex h-12 items-center rounded-pill bg-white/20 text-[14px] font-medium leading-3 shadow-[0_8px_40px_rgba(0,0,0,0.12)] backdrop-blur-sm ${weiss ? 'text-white' : 'text-black'}`
}

/** Trennlinie aus Figma (Line 5): 20 px, 1 px, runde Enden, in Schriftfarbe */
function Trenner() {
  return <span className="h-5 w-px shrink-0 rounded-full bg-current" aria-hidden />
}

export default function Leisten({
  hellOben,
  hellUnten,
  runde,
  fortschritt,
  untenRechts,
  puls,
  unten,
  pfeilFrei,
  onPfeil,
  onLeave,
  onSettings,
}: {
  hellOben: boolean
  hellUnten: boolean
  runde: string
  fortschritt: string
  /** ersetzt Pfeil und Einstellungen unten rechts (Proberunde: „Überspringen") */
  untenRechts?: { text: string; onClick: () => void }
  puls: number
  /** untere Leiste zeigen (unter dem Rückweg-Sheet ruht sie) */
  unten: boolean
  pfeilFrei: boolean
  onPfeil: () => void
  onLeave: () => void
  onSettings: () => void
}) {
  const reduziert = useReducedMotion()
  const e = wolkenKonfig.einstieg
  const eintritt = (versatz: number, von: number) => ({
    initial: reduziert ? { opacity: 0 } : { opacity: 0, y: von },
    animate: { opacity: 1, y: 0 },
    transition: { duration: e.hudDauer / 1000, ease: wolkenKonfig.kurven.standard, delay: (e.hudVerzoegerung + versatz) / 1000 },
  })

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex items-center justify-between px-6">
        <motion.button type="button" aria-label="Spiel verlassen" onClick={onLeave} className={`${pille(hellOben)} w-12 justify-center`} {...eintritt(0, -e.hudHoehe)}>
          <ArrowLeft {...icon} />
        </motion.button>
        <motion.div className={`${pille(hellOben)} gap-4 px-4 whitespace-nowrap`} {...eintritt(e.hudPillenVersatz, -e.hudHoehe)}>
          <span>{runde}</span>
          <Trenner />
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fortschritt}</span>
        </motion.div>
      </div>

      {unten && (
        <div className="pointer-events-none absolute inset-x-0 bottom-10 z-30 flex items-center justify-between pl-8 pr-6">
          <motion.div key="puls" className={`${pille(hellUnten)} gap-2 px-4 whitespace-nowrap`} {...eintritt(30, e.hudHoehe)}>
            <HeartPulse {...icon} />
            <span aria-label={`${puls} Schläge pro Minute`}>{puls}</span>
          </motion.div>
          {untenRechts ? (
            <motion.button key="ueberspringen" type="button" onClick={untenRechts.onClick} className={`${pille(hellUnten)} px-4 whitespace-nowrap`} {...eintritt(60, e.hudHoehe)}>
              {untenRechts.text}
            </motion.button>
          ) : (
            <motion.div key="steuerung" className={pille(hellUnten)} {...eintritt(60, e.hudHoehe)}>
              <button
                type="button"
                aria-label="Zum nächsten Haltepunkt"
                disabled={!pfeilFrei}
                onClick={onPfeil}
                className="flex h-12 w-[52px] items-center justify-center rounded-l-pill disabled:cursor-default"
              >
                <motion.span
                  className="flex"
                  animate={{ opacity: pfeilFrei ? 1 : konfig.fortbewegung.gesperrt }}
                  transition={{ duration: 0.2, ease: konfig.kurve }}
                >
                  <ArrowUp {...icon} />
                </motion.span>
              </button>
              <Trenner />
              <button type="button" aria-label="Einstellungen" onClick={onSettings} className="flex h-12 w-[52px] items-center justify-center rounded-r-pill">
                <Settings2 {...icon} />
              </button>
            </motion.div>
          )}
        </div>
      )}
    </>
  )
}
