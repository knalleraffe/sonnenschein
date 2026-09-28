import { createContext, useContext, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { easeAus, einmalProSitzung } from '../../lib/motion'

/*
  Erscheinen im Sichtbereich: Karte fadet ein, steigt 16 px auf und
  skaliert von 0.97 auf 1 — einmalig (IntersectionObserver via
  whileInView), Versatz je Karte einstellbar über index × versatz.
  Beim Antippen drückt sich die Karte auf 0.98 zusammen und federt zurück.
  `prefers-reduced-motion` wird zentral hier behandelt.

  EintrittEinmal umschließt einen Screen: Beim ersten Besuch laufen die
  Einblendungen, beim Rückkehren über die Navigation stehen sofort die
  Endzustände — Erscheinen, Stufe und ZaehlZahl lesen das automatisch mit.
*/

const SofortKontext = createContext(false)

/** true, wenn der umgebende Screen seine Einblendung schon gezeigt hat */
export function useSofort(): boolean {
  return useContext(SofortKontext)
}

export function EintrittEinmal({ schluessel, children }: { schluessel: string; children: ReactNode }) {
  const [sofort] = useState(() => einmalProSitzung(schluessel))
  return <SofortKontext.Provider value={sofort}>{children}</SofortKontext.Provider>
}

export default function Erscheinen({
  index = 0,
  versatz = 60,
  sofort = false,
  children,
  className = '',
}: {
  index?: number
  /** Staffel-Versatz in ms zwischen zwei Karten */
  versatz?: number
  sofort?: boolean
  children: ReactNode
  className?: string
}) {
  const reduziert = useReducedMotion()
  const sofortKontext = useSofort()

  if (reduziert) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={sofort || sofortKontext ? false : { opacity: 0, y: 16, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-30px 0px' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.5, ease: easeAus, delay: (index * versatz) / 1000 }}
    >
      {children}
    </motion.div>
  )
}

/*
  Gestaffeltes Element INNERHALB einer Karte: erst Überschrift,
  dann Grafik, dann der erklärende Satz — je 100 ms versetzt (stufe).
*/
export function Stufe({
  stufe = 0,
  sofort = false,
  children,
  className = '',
}: {
  stufe?: number
  sofort?: boolean
  children: ReactNode
  className?: string
}) {
  const reduziert = useReducedMotion()
  const sofortKontext = useSofort()
  if (reduziert || sofort || sofortKontext) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: easeAus, delay: stufe * 0.1 }}
    >
      {children}
    </motion.div>
  )
}
