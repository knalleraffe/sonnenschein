import { useRef, useState } from 'react'
import { cubicBezier, motion, useAnimationFrame, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { konfig } from '../../games/himmelsroute/config'
import type { Flugbahn, Gegenstand } from '../../games/himmelsroute/gegenstaende'

/*
  Eine Begegnung: Eintritt (600 ms) → genau `zeigedauer` ruhig sichtbar
  (aus den Einstellungen) → Weiterflug (450 ms). Die Zeit läuft über eine
  eigene Uhr pro Bild, die steht, solange `pausiert` ist — nach „Fortsetzen" läuft nur die Restzeit.
  Animiert werden nur transform und opacity; keine Dauerschleife.

  Position hängt nur von k ab: `ueberEchoo` px über Echoo, ungerades k
  links, gerades k rechts der Mitte. „Seite" s ist die Seite der Ruhelage.
  Der Gegenstand hält seine Lage im Himmel: Gleitet Echoo während der
  Begegnung weiter, zieht der Gegenstand mit der Szene nach unten —
  Echoo fliegt an ihm vorbei.
*/

const b = konfig.begegnung
const ein = cubicBezier(...konfig.kurve)
/** Weiterflug: langsam lösen, dann zügig hinaus */
const aus = cubicBezier(0.55, 0, 0.9, 0.45)

type Lage = { x: number; y: number; scale: number; rotate: number; opacity: number }
const RUHE: Lage = { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }

/**
  Ablage gegenüber der Ruhelage am Anfang des Eintritts (u = 1 → 0) bzw. am
  Ende des Weiterflugs (u = 0 → 1). Alle Gegenstände fliegen seitlich: herein
  von der Seite `s`, hinaus auf der anderen Seite. Die Familie gibt nur eine
  leichte eigene Note (Bogen, Neigung, Schweben). `weit` = Strecke bis sicher
  außerhalb des Bildes.
*/
function flug(bahn: Flugbahn, s: number, weit: number, phase: 'ein' | 'aus', u: number): Lage {
  const bogen = Math.sin(Math.PI * u)
  const blende = phase === 'ein' ? 1 - Math.min(1, u * 1.6) : 1 - Math.min(1, Math.max(0, (u - 0.35) / 0.65))
  // herein von s, hinaus nach −s
  const x = (phase === 'ein' ? s : -s) * weit * u
  const r = (lage: Partial<Lage>): Lage => ({ ...RUHE, x, opacity: blende, ...lage })
  switch (bahn) {
    case 'bogenSeite':
      return r({ y: -48 * bogen })
    case 'tiefe':
      return r({ scale: 1 - 0.2 * u })
    case 'diagonalOben':
      return r({ y: (phase === 'ein' ? -1 : 1) * 40 * u })
    case 'vonRechts':
      return r({})
    case 'gleitbogenLinks':
      return r({ y: 24 * bogen, rotate: (phase === 'ein' ? s : -s) * 6 * u })
    case 'langsamSeite':
      return r({ y: -10 * bogen })
    case 'herabschweben':
      return r({ y: 14 * bogen, rotate: 5 * bogen * s })
    case 'seiteGeneigt':
      return r({ y: (phase === 'ein' ? 1 : -1) * 20 * u, rotate: (phase === 'ein' ? s : -s) * 14 * u })
    case 'aufsteigend':
      return r({ y: (phase === 'ein' ? 1 : -1) * 30 * u })
    case 'schnellVonUnten':
      return r({ y: (phase === 'ein' ? 1 : -1) * 36 * u, rotate: (phase === 'ein' ? s : -s) * 8 * u })
  }
}

export default function Begegnung({
  k,
  gegenstand,
  mitteX,
  echooY,
  breite,
  pausiert,
  reduziert,
  zeigedauer,
  kamera,
  faktor,
  onFertig,
}: {
  k: number
  gegenstand: Gegenstand
  mitteX: number
  echooY: number
  breite: number
  pausiert: boolean
  reduziert: boolean
  /** ms — der Wert beim Start der Begegnung gilt bis zu ihrem Ende */
  zeigedauer: number
  /** Kamerastand — der Gegenstand bleibt an seiner Stelle in der Szene */
  kamera: MotionValue<number>
  faktor: number
  onFertig: () => void
}) {
  const s = k % 2 === 1 ? -1 : 1
  const ruheX = mitteX + s * b.seitlich
  const ruheY = echooY - b.ueberEchoo
  const weit = breite * 0.8

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  const rotate = useMotionValue(0)
  const opacity = useMotionValue(0)
  const vergangen = useRef(0)
  const fertig = useRef(false)

  const [ruhig] = useState(zeigedauer)
  const [kameraBeimStart] = useState(() => kamera.get())
  const szeneY = useTransform(kamera, (k) => ruheY + (kameraBeimStart - k) * faktor)
  const gesamt = b.eintritt + ruhig + b.weiterflug

  useAnimationFrame((_, delta) => {
    if (fertig.current) return
    if (!pausiert) vergangen.current += delta
    const t = vergangen.current
    let lage: Lage
    if (t < b.eintritt) {
      const u = 1 - ein(t / b.eintritt)
      lage = reduziert ? { ...RUHE, opacity: 1 - u } : flug(gegenstand.flugbahn, s, weit, 'ein', u)
    } else if (t < b.eintritt + ruhig) {
      lage = RUHE
    } else if (t < gesamt) {
      const u = aus((t - b.eintritt - ruhig) / b.weiterflug)
      lage = reduziert ? { ...RUHE, opacity: 1 - u } : flug(gegenstand.flugbahn, s, weit, 'aus', u)
    } else {
      opacity.set(0)
      fertig.current = true
      onFertig()
      return
    }
    x.set(lage.x)
    y.set(lage.y)
    scale.set(lage.scale)
    rotate.set(lage.rotate)
    opacity.set(lage.opacity)
  })

  return (
    <motion.div className="pointer-events-none absolute left-0 top-0" style={{ x: ruheX, y: szeneY }} data-begegnung={k}>
      <motion.img
        src={gegenstand.bild}
        alt={gegenstand.name}
        draggable={false}
        className="absolute block max-w-none object-contain"
        style={{
          left: -gegenstand.groesse / 2,
          top: -gegenstand.groesse / 2,
          width: gegenstand.groesse,
          height: gegenstand.groesse,
          x,
          y,
          scale,
          rotate,
          opacity,
        }}
      />
    </motion.div>
  )
}
