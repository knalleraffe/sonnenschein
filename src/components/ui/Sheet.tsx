import { useContext, useState, type ReactNode } from 'react'
import { SheetBewegung } from './sheetBewegung'
import { motion, useReducedMotion, type Transition } from 'motion/react'
import { X } from 'lucide-react'

export default function Sheet({
  children,
  onClose,
  schliessbar = true,
  labelledBy = 'sheet-titel',
  variante = 'standard',
  durchlaessig = false,
  hoehe,
}: {
  children: ReactNode
  onClose?: () => void
  schliessbar?: boolean
  labelledBy?: string
  variante?: 'standard' | 'karte'
  /** ohne Abdunkeln: die Szene dahinter bleibt sichtbar und bedienbar (Himmelsroute-Rückweg) */
  durchlaessig?: boolean
  /** feste Höhe der Karte, z. B. '44%' — der Inhalt füllt sie als Spalte */
  hoehe?: string
}) {
  const reduziert = useReducedMotion()
  const [schliesst, setSchliesst] = useState(false)

  function schliesse() {
    if (!onClose || schliesst) return
    setSchliesst(true)
    window.setTimeout(onClose, reduziert ? 150 : variante === 'karte' ? 320 : 280)
  }

  /*
    Öffnen und Schließen laufen über dieselben Zustände: `exit` greift, wenn
    der Aufrufer das Sheet in <AnimatePresence> ausblendet (z. B. per Button),
    `schliesst` beim eigenen X-Knopf. Die Karte federt von unten herein und
    gleitet beim Schließen wieder hinaus.
  */
  const bewegung = useContext(SheetBewegung)
  const karte = variante === 'karte'
  const zu = reduziert ? { opacity: 0 } : karte ? { y: '110%' } : { opacity: 0, y: 24 }
  const offen = reduziert ? { opacity: 1 } : karte ? { y: 0 } : { opacity: 1, y: 0 }
  const rein: Transition = reduziert
    ? { duration: 0.2 }
    : karte && bewegung === 'feder'
      ? { type: 'spring', stiffness: 320, damping: 26, mass: 1 }
      : { duration: 0.45, ease: [0.32, 0.72, 0, 1] }
  const raus: Transition = { duration: reduziert ? 0.15 : karte ? 0.32 : 0.28, ease: [0.4, 0, 1, 1] }

  return (
    <motion.div
      className={`absolute inset-0 z-50 flex items-end px-0 ${durchlaessig ? 'pointer-events-none' : 'bg-ink/20 backdrop-blur-[8px]'}`}
      role="presentation"
      initial={{ opacity: 0 }}
      animate={schliesst ? { opacity: 0, transition: raus } : { opacity: 1, transition: { duration: reduziert ? 0.2 : 0.45, ease: [0.32, 0.72, 0, 1] } }}
      exit={{ opacity: 0, transition: raus }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        /* Oben bleiben immer mindestens 80 px frei — ist der Inhalt länger, scrollt er in der Karte */
        style={hoehe ? { height: hoehe } : undefined}
        className={`pointer-events-auto relative flex flex-col overflow-hidden bg-white ${
          karte
            ? 'mx-2 mb-2 max-h-[calc(100%-88px)] w-[calc(100%-16px)] rounded-b-[56px] rounded-t-[40px] shadow-[0_0_40px_rgba(0,0,0,0.12)]'
            : 'max-h-[calc(100%-80px)] w-full rounded-t-[40px] border border-white/90 shadow-[var(--shadow-overlay)]'
        }`}
        initial={zu}
        animate={schliesst ? { ...zu, transition: raus } : { ...offen, transition: rein }}
        exit={{ ...zu, transition: raus }}
      >
        {schliessbar && onClose && (
          <button
            type="button"
            aria-label="Schließen"
            onClick={schliesse}
            className={variante === 'karte'
              ? 'absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-pill bg-[#fff8e6] text-black'
              : 'absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-pill bg-cream text-ink'}
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        )}
        {/* Innenabstand liegt im Scrollbereich, damit randlose Illustrationen (-mx-6 -mt-8) nicht abgeschnitten werden */}
        <div
          className={`sheet-content min-h-0 overflow-y-auto overscroll-contain px-6 pt-8 ${hoehe ? 'flex flex-1 flex-col [&>*]:flex-1' : ''} ${
            variante === 'standard' ? 'pb-[calc(24px+env(safe-area-inset-bottom))]' : 'pb-6'
          }`}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}