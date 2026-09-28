import { motion, type MotionValue } from 'motion/react'
import EchooMini from '../components/himmelsroute/EchooMini'

/*
  Echoo für Splash und Onboarding: EchooMini.png aus der Himmelsroute mit
  seinem Leuchten, frei platzierbar. Der Nullpunkt ist die Körpermitte;
  x, y, Skala und Deckkraft kommen als Bewegungswerte. Bei Skala 1 ist der
  Körper KOERPER px breit. Die Ruhe-Schleife (Atmen) läuft nur, wenn
  `atmet` gesetzt ist.
*/

const KOERPER = 300

export default function EchooFigur({
  x,
  y,
  skala,
  deckkraft,
  atmet,
}: {
  x: MotionValue<number>
  y: MotionValue<number>
  skala: MotionValue<number>
  deckkraft: MotionValue<number>
  atmet: boolean
}) {
  return (
    <motion.div className="pointer-events-none absolute left-0 top-0" style={{ x, y, scale: skala, opacity: deckkraft }} aria-hidden>
      <EchooMini groesse={KOERPER} ruht={atmet} />
    </motion.div>
  )
}
