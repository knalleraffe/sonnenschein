import { motion, useReducedMotion } from 'motion/react'
import type { CSSProperties } from 'react'

/*
  Hinweis der Proberunde: kleine weiße Karte im Stil der Sheets
  (weiß, weicher Schatten 0 0 40 px, Fließtext 14 px), nahe am
  betreffenden Element. Kein eigenes Figma-Design.
*/
export default function Hinweis({ text, style, className = '' }: { text: string; style?: CSSProperties; className?: string }) {
  const reduziert = useReducedMotion()
  return (
    <motion.div
      role="status"
      className={`pointer-events-none absolute z-40 max-w-[240px] rounded-[20px] bg-white px-4 py-3 text-[14px] leading-5 text-black shadow-[0_0_40px_rgba(0,0,0,0.12)] ${className}`}
      style={style}
      initial={reduziert ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {text}
    </motion.div>
  )
}
