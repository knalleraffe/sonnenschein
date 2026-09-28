import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { konfig as wolkenKonfig } from '../../games/wolkensammeln/config'
import { konfig } from '../../games/himmelsroute/config'
import { oeffentlich } from '../../lib/pfad'

/*
  Echoo in der Himmelsroute (EchooMini.png, 2016 × 2138 px): Körper mit
  Strahlen und Gesicht in einem Bild, der Körper mittig. `groesse` ist die
  Körperbreite in px. Der Nullpunkt des Elements ist die Körpermitte, der
  Aufrufer setzt ihn per transform. Dahinter das weiche Leuchten; Echoo
  atmet sanft — die einzige Dauerschleife im Spiel. Im Flug (`ruht` = false)
  pausiert das Atmen und setzt nach dem Ankommen weich wieder ein.

  Jubel (`jubelt`): nach einer richtigen Route grinst Echoo — der lachende
  Mund aus der Figma-Echoo (mund-lachend.svg) liegt über dem Lächeln im
  Bild — und strahlt: stärkeres Leuchten und zwei Lichtringe nach außen.
*/

const BILD = { breite: 2016, hoehe: 2138 }
/** Körperbreite im Bild (px) */
const KOERPER_IM_BILD = 1062
/** Lächeln im Bild, relativ zur Körperbreite: Oberkante und Mitte gegenüber der Körpermitte */
const LAECHELN = { oben: -0.302, mitteX: -0.006, breite: 0.15 }
/** mund-lachend.svg: 57.52 × 54.64, sichtbarer Mund x 5–52.5, gerade Oberkante bei y 24.8 */
const MUND = { breite: 57.52, hoehe: 54.64, links: 5, sichtbar: 47.5, oben: 24.8 }

export default function EchooMini({ groesse, ruht = true, jubelt = false }: { groesse: number; ruht?: boolean; jubelt?: boolean }) {
  const reduziert = useReducedMotion()
  const e = wolkenKonfig.echoo
  const breite = (BILD.breite * groesse) / KOERPER_IM_BILD
  const hoehe = (breite * BILD.hoehe) / BILD.breite
  const j = konfig.jubel
  // Mund so skaliert, dass sein sichtbarer Teil das Lächeln ganz bedeckt
  const m = (LAECHELN.breite * groesse) / MUND.sichtbar
  const mundLinks = LAECHELN.mitteX * groesse - (MUND.links + MUND.sichtbar / 2) * m
  const mundOben = LAECHELN.oben * groesse - MUND.oben * m
  return (
    <div className="pointer-events-none absolute left-0 top-0 size-0" aria-hidden>
      <motion.div
        className="absolute rounded-full"
        style={{
          left: -groesse * 1.4,
          top: -groesse * 1.4,
          width: groesse * 2.8,
          height: groesse * 2.8,
          background: 'radial-gradient(closest-side, rgba(255, 202, 103, 0.55), rgba(255, 236, 187, 0.25) 55%, rgba(255, 236, 187, 0) 100%)',
        }}
        animate={{ scale: jubelt ? j.glanz : 1 }}
        transition={{ duration: reduziert ? 0 : j.dauer / 1000, ease: konfig.kurve }}
      />
      {/* Strahlen: Lichtringe laufen einmal nach außen */}
      <AnimatePresence>
        {jubelt &&
          !reduziert &&
          Array.from({ length: j.ringe }, (_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-[3px]"
              style={{
                left: -groesse * 0.7,
                top: -groesse * 0.7,
                width: groesse * 1.4,
                height: groesse * 1.4,
                borderColor: 'rgba(255, 202, 103, 0.9)',
              }}
              initial={{ scale: 0.8, opacity: 0.9 }}
              animate={{ scale: j.ringSkala, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: j.ringDauer / 1000, delay: (i * j.ringVersatz) / 1000, ease: konfig.kurve }}
            />
          ))}
      </AnimatePresence>
      <motion.img
        src={oeffentlich('/himmelsroute/objekte/EchooMini.png')}
        alt=""
        draggable={false}
        className="absolute block max-w-none"
        style={{ left: -breite / 2, top: -hoehe / 2, width: breite, height: hoehe }}
        animate={reduziert || !ruht ? { scale: 1 } : { scale: [1, e.atmenSkala * 1.02, 1] }}
        transition={
          reduziert ? { duration: 0 } : !ruht ? { duration: 0.3, ease: 'easeOut' } : { duration: e.atmenDauer / 1000, repeat: Infinity, ease: 'easeInOut' }
        }
      />
      {/* Grinsen */}
      <AnimatePresence>
        {jubelt && (
          <motion.img
            key="grinsen"
            src={oeffentlich('/echoo/mund-lachend.svg')}
            alt=""
            className="absolute block max-w-none"
            style={{ left: mundLinks, top: mundOben, width: MUND.breite * m, height: MUND.hoehe * m, transformOrigin: '50% 45%' }}
            initial={reduziert ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduziert ? 0.15 : 0.3, ease: konfig.kurve }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
