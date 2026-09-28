import { motion, useReducedMotion } from 'motion/react'
import Sonnenschein from '../avatar/Sonnenschein'
import type { EchooZustand } from '../../lib/kennzahlen'
import { echooAtmen, echooAussehen, kurveRuhig } from './stil'
import { oeffentlich } from '../../lib/pfad'

/*
  Echoo oben auf der Startseite (Figma 513:1427): weiße Bühne, dahinter der
  helle Schein („Echoo", 787 × 1230), davor die Figur („Group 3",
  563 × 846), angeschnitten bei 416 px. Der Zustand der letzten Messungen
  zeigt sich im Schein (heller oder gedämpfter), die Figur atmet sanft
  (einzige Dauerschleife). Antippen öffnet den Sonnenschein-Screen — Echoo
  wächst dabei mit (geteilte layoutId).
*/

export const ECHOO_LAYOUT = 'echoo-sonnenschein'
export const echooUebergang = { duration: 0.5, ease: kurveRuhig }

/** Höhe der Bühne (Figma: Rahmen 732 px, oben −316 px) */
export const BUEHNE_HOEHE = 416
/** Stärke des Scheins je Zustand */
export const SCHEIN: Record<EchooZustand, number> = { heller: 1, normal: 0.8, gedaempft: 0.45, neutral: 0.8 }

/** Der atmende Sonnenschein-Avatar — im Sonnenschein-Screen */
export function AtmenderEchoo({ zustand, groesse }: { zustand: EchooZustand; groesse: 'full' | 'kopf' }) {
  const reduziert = useReducedMotion()
  const { emotion, vitality } = echooAussehen[zustand]
  return (
    <motion.div
      className="size-full"
      style={{ transformOrigin: '50% 100%' }}
      animate={reduziert ? { scale: 1 } : { scale: [1, echooAtmen.skala, 1] }}
      transition={reduziert ? { duration: 0 } : { duration: echooAtmen.dauer / 1000, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Sonnenschein emotion={emotion} vitality={vitality} size={groesse} />
    </motion.div>
  )
}

export default function EchooKopf({ zustand, satz, onOeffnen }: { zustand: EchooZustand; satz: string; onOeffnen: () => void }) {
  const reduziert = useReducedMotion()
  return (
    <div className="relative overflow-hidden bg-white" style={{ height: BUEHNE_HOEHE }}>
      {/* Schein hinter Echoo */}
      <img
        src={oeffentlich('/start/echoo-schein.svg')}
        alt=""
        aria-hidden
        className="absolute block max-w-none"
        style={{ left: -199, top: -115, width: 787, height: 1230, opacity: SCHEIN[zustand] }}
      />
      <motion.button
        type="button"
        aria-label={`Echoo öffnen. ${satz}`}
        onClick={onOeffnen}
        layoutId={ECHOO_LAYOUT}
        transition={reduziert ? { duration: 0 } : echooUebergang}
        className="absolute block"
        style={{ left: -85, top: 71, width: 563.138, height: 845.788 }}
      >
        <motion.img
          src={oeffentlich('/start/echoo-figur.svg')}
          alt=""
          className="block size-full max-w-none"
          style={{ transformOrigin: '279.9px 401.8px' }}
          animate={reduziert ? { scale: 1 } : { scale: [1, echooAtmen.skala, 1] }}
          transition={reduziert ? { duration: 0 } : { duration: echooAtmen.dauer / 1000, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.button>
    </div>
  )
}
