import { useEffect, useRef } from 'react'
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, Clock10, HeartPulse, Settings2, Sun } from 'lucide-react'
import ZaehlZahl from '../ui/ZaehlZahl'
import { konfig } from '../../games/wolkensammeln/config'

/*
  Bedienleiste über dem Himmel: links die Pause-Pille, rechts Uhrzeit
  und Lichtstand. Die Pillen fahren beim Betreten von oben herein,
  die Uhrziffern wechseln mit weicher Überblendung, der Lichtstand
  zählt weich und bekommt bei jedem richtigen Antipper kurzen Auftrieb.
  Die Uhr ist reine Anzeige — die Runde endet nach Durchgängen.
*/

function formatZeit(sekunden: number): string {
  const m = Math.floor(sekunden / 60)
  const s = sekunden % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function SpielHud({
  sekunden,
  licht,
  bumpN,
  puls,
  fortschritt,
  onLeave,
  onSettings,
  untenRechts,
  hell = false,
}: {
  sekunden: number
  licht: number
  /** zählt bei jedem richtigen Antipper hoch → kurzer Auftrieb */
  bumpN: number
  /** untere Leiste (Fortschritt, Puls, Einstellungen) nur, wenn alle drei übergeben werden */
  puls?: number
  fortschritt?: string
  onLeave: () => void
  onSettings?: () => void
  /** ersetzt den Einstellungen-Knopf unten rechts (Proberunde: „Überspringen") */
  untenRechts?: { text: string; onClick: () => void }
  /** weiße Schrift und Icons für dunklen Hintergrund */
  hell?: boolean
}) {
  const reduziert = useReducedMotion()
  const b = konfig.bewegung
  const lichtRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (bumpN === 0 || reduziert || !lichtRef.current) return
    const lauf = animate(
      lichtRef.current,
      { scale: [b.lichtstandSkala, 1] },
      { duration: b.lichtstandDauer / 1000, ease: konfig.kurven.standard },
    )
    return () => lauf.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bumpN])

  const eintritt = (versatz: number) => ({
    initial: reduziert ? { opacity: 0 } : { opacity: 0, y: -konfig.einstieg.hudHoehe },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: konfig.einstieg.hudDauer / 1000,
      ease: konfig.kurven.standard,
      delay: (konfig.einstieg.hudVerzoegerung + versatz) / 1000,
    },
  })

  /* Glas-Pille aus Figma: 48 px hoch, 20 % Weiß, weicher Schatten */
  const pille = `pointer-events-auto flex h-12 items-center rounded-pill bg-white/20 text-[14px] font-medium leading-3 shadow-[0_8px_40px_rgba(0,0,0,0.12)] backdrop-blur-sm ${hell ? 'text-white' : 'text-black'}`
  const untereLeiste = puls !== undefined && fortschritt !== undefined && onSettings !== undefined
  const icon = { size: 20, strokeWidth: 1.5, 'aria-hidden': true } as const

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex items-center justify-between px-6">
      <motion.button
        type="button"
        aria-label="Spiel verlassen"
        onClick={onLeave}
        whileTap={reduziert ? undefined : { scale: b.pausePilleSkala }}
        className={`${pille} w-12 justify-center`}
        {...eintritt(0)}
      >
        <ArrowLeft {...icon} />
      </motion.button>

      <motion.div
        className={`${pille} gap-4 px-4`}
        {...eintritt(konfig.einstieg.hudPillenVersatz)}
      >
        <span className="flex items-center gap-2">
          <Clock10 {...icon} />
          <span className="inline-flex" style={{ fontVariantNumeric: 'tabular-nums' }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={formatZeit(sekunden)}
                initial={reduziert ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduziert ? undefined : { opacity: 0, y: 4 }}
                transition={{ duration: 0.18, ease: konfig.kurven.standard }}
              >
                {formatZeit(sekunden)}
              </motion.span>
            </AnimatePresence>
          </span>
        </span>
        <span className="h-5 w-px bg-[#f2f2f2]" />
        <span ref={lichtRef} className="flex items-center gap-2">
          <Sun {...icon} />
          <ZaehlZahl wert={licht} />
        </span>
      </motion.div>
      </div>
      {untereLeiste && (
      <div className="pointer-events-none absolute inset-x-0 bottom-10 z-30 flex min-w-0 items-center justify-between gap-2 px-6">
        <motion.div
          className={`${pille} min-w-0 gap-4 px-4`}
          {...eintritt(30)}
        >
          <span className="min-w-0 truncate whitespace-nowrap leading-5">{fortschritt}</span>
          <span className="h-5 w-px shrink-0 bg-[#f2f2f2]" />
          <span className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <HeartPulse {...icon} />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={puls}
                initial={reduziert ? { opacity: 0 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduziert ? 0.12 : 0.18, ease: konfig.kurven.standard }}
              >
                {puls}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.div>
        {untenRechts ? (
          <motion.button
            key="untenRechts"
            type="button"
            onClick={untenRechts.onClick}
            className={`${pille} shrink-0 whitespace-nowrap px-4`}
            {...eintritt(60)}
          >
            {untenRechts.text}
          </motion.button>
        ) : (
          <motion.button
            key="einstellungen"
            type="button"
            aria-label="Einstellungen"
            onClick={onSettings}
            className={`${pille} w-12 shrink-0 justify-center`}
            {...eintritt(60)}
          >
            <Settings2 {...icon} />
          </motion.button>
        )}
      </div>
      )}
    </>
  )
}
