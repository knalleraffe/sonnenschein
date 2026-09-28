import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { konfig } from '../../games/wolkensammeln/config'
import { oeffentlich } from '../../lib/pfad'

/*
  Echoo — die Sonne aus Figma (Echoo1–3). Körper, Strahlen und Augen sind
  eine Grafik (echoo-koerper.svg, Maßstab von Stufe 3), der Mund liegt
  getrennt darüber, damit Echoo vom Lächeln ins Lachen wechseln kann.
  Solange fortschritt null ist, bleibt Echoo unter dem Rand. Beim ersten
  Erscheinen (0) ist er klein, sein Gesicht aber schon zu sehen; mit jedem
  weiteren richtigen Durchgang steigt er höher, wächst und strahlt stärker
  (bis 1). Zwischen den Stufen aus config.ts wird weich interpoliert. Echoo blockiert keine
  Antippfläche (pointer-events: none).
*/

/** Maße der Figma-Grafik „Group 3“ in Stufe 3 (Figma-Pixel) */
const KOERPER = { breite: 688.862, hoehe: 1072.26 }
/** Mittelpunkt des Körpers (Ellipse 3) — Zentrum des Leuchtens */
const KOERPER_MITTE = { x: 342.402, y: 529.136 }
/** Münder in Koordinaten der Grafik, aus Figma „Vector 9“ und „Happy Mouth“ */
const MUND_LAECHELN = { x: 310.79, y: 367.26, breite: 58.17, hoehe: 19.92 }
const MUND_LACHEND = { x: 311.85, y: 347.13, breite: 57.52, hoehe: 54.64 }
/** Gesicht (Augen bis Mund) in Koordinaten der Grafik */
const GESICHT = { links: 281, rechts: 403, oben: 321, unten: 402 }

type Stufe = (typeof konfig.echoo.stufen)[number]

/** Lage aus dem Fortschritt: zwischen zwei Stufen linear gemischt */
function lageFuer(fortschritt: number): { ueberUnterkante: number; skala: number } {
  const stufen: readonly Stufe[] = konfig.echoo.stufen
  const p = Math.min(1, Math.max(0, fortschritt))
  for (let i = 1; i < stufen.length; i++) {
    const a = stufen[i - 1]
    const b = stufen[i]
    if (p <= b.ab) {
      const t = b.ab === a.ab ? 1 : (p - a.ab) / (b.ab - a.ab)
      return {
        ueberUnterkante: a.ueberUnterkante + (b.ueberUnterkante - a.ueberUnterkante) * t,
        skala: a.skala + (b.skala - a.skala) * t,
      }
    }
  }
  const letzte = stufen[stufen.length - 1]
  return { ueberUnterkante: letzte.ueberUnterkante, skala: letzte.skala }
}

/** Lage und Größe, auch für „noch nicht erschienen“ */
function lage(fortschritt: number | null) {
  return fortschritt === null
    ? { ueberUnterkante: konfig.echoo.verstecktUeberUnterkante, skala: konfig.echoo.stufen[0].skala }
    : lageFuer(fortschritt)
}

/** Rechteck von Echoos Gesicht im Spielfeld (px, von oben links) — damit Wolken davor ausweichen können */
export function gesichtsRahmen(fortschritt: number | null, breite: number, hoehe: number) {
  const { ueberUnterkante, skala } = lage(fortschritt)
  const oberkante = hoehe - ueberUnterkante
  const mitteX = breite / 2
  const versatzX = (x: number) => mitteX + (x - KOERPER.breite / 2) * skala
  return {
    links: versatzX(GESICHT.links),
    rechts: versatzX(GESICHT.rechts),
    oben: oberkante + GESICHT.oben * skala,
    unten: oberkante + GESICHT.unten * skala,
  }
}

export default function Echoo({ fortschritt, lachend }: { fortschritt: number | null; lachend: boolean }) {
  const reduziert = useReducedMotion()
  const k = konfig.echoo
  const sichtbar = fortschritt !== null
  const { ueberUnterkante, skala } = lage(fortschritt)
  /* Die Grafik ist unten verankert und oben-mittig skaliert: y schiebt ihre Oberkante
     (= Spitze des höchsten Strahls) auf den gewünschten Abstand über der Unterkante */
  const y = KOERPER.hoehe - ueberUnterkante
  const mund = lachend ? MUND_LACHEND : MUND_LAECHELN

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute bottom-0 left-1/2"
        style={{
          width: KOERPER.breite,
          height: KOERPER.hoehe,
          marginLeft: -KOERPER.breite / 2,
          transformOrigin: '50% 0%',
        }}
        initial={false}
        animate={{ y, scale: skala }}
        transition={reduziert ? { duration: 0.2 } : { type: 'spring', ...k.feder }}
      >
        {/* Leuchten hinter dem Körper — wird mit dem Fortschritt kräftiger */}
        <div
          className="absolute rounded-full"
          style={{
            left: KOERPER_MITTE.x - k.leuchtenRadius,
            top: KOERPER_MITTE.y - k.leuchtenRadius,
            width: k.leuchtenRadius * 2,
            height: k.leuchtenRadius * 2,
            background: 'radial-gradient(closest-side, rgba(255, 202, 103, 0.75), rgba(255, 236, 187, 0.35) 55%, rgba(255, 236, 187, 0) 100%)',
            opacity: sichtbar ? k.leuchtenMin + (1 - k.leuchtenMin) * fortschritt : 0,
            transition: `opacity ${k.leuchtenDauer}ms ease-out`,
          }}
        />
        {/* sanftes Atmen, sobald Echoo da ist */}
        <motion.div
          className="absolute inset-0"
          style={{ transformOrigin: `${KOERPER_MITTE.x}px ${KOERPER_MITTE.y}px` }}
          animate={sichtbar && !reduziert ? { scale: [1, k.atmenSkala, 1] } : { scale: 1 }}
          transition={sichtbar && !reduziert ? { duration: k.atmenDauer / 1000, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
        >
          <img src={oeffentlich('/echoo/echoo-koerper.svg')} alt="" className="absolute inset-0 block size-full max-w-none" />
          <AnimatePresence initial={false}>
            <motion.img
              key={lachend ? 'lachend' : 'laecheln'}
              src={oeffentlich(lachend ? '/echoo/mund-lachend.svg' : '/echoo/mund-laecheln.svg')}
              alt=""
              className="absolute block max-w-none"
              style={{ left: mund.x, top: mund.y, width: mund.breite, height: mund.hoehe, transformOrigin: '50% 20%' }}
              initial={reduziert ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
              animate={
                reduziert
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 420, damping: 12 } }
              }
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            />
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}

