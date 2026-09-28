import type { ReactNode } from 'react'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { konfig } from '../../games/himmelsroute/config'
import { kleineWolken, vordergrund, wolkenBild, type VordergrundElement } from './deko'
import { oeffentlich } from '../../lib/pfad'

/*
  Szene aus Figma „Spiel 2 Scroll" (315:3007, 393 × 6002): Himmelsverlauf,
  Wolkenstrecke, Nacht mit Sternenfeldern, Erde. Positionen in Figma-Pixeln,
  der ganze Rahmen wird auf Bildschirmbreite skaliert.

  Kamera: `kamera` ist die Szenenhöhe, auf der Echoo gerade steht. Echoo
  bleibt auf dem Bildschirm fest bei `echooY`, die Ebenen bewegen sich unter
  ihm — Sterne fern 0,3-fach, Sterne nah 0,6-fach, Himmel und Erde 1-fach,
  Wolken 1,15-fach, Vordergrund 1,8-fach (nur transform).
*/

const sz = konfig.szene

type Sternenfeld = {
  datei: 'a' | 'b' | 'c' | 'd'
  left: number
  top: number
  /** Figma-Rahmen um das gedrehte Feld; ohne Drehung = Größe des Felds */
  breite: number
  hoehe: number
  drehung?: { grad: number; breite: number; hoehe: number }
  /** ferne Felder ziehen langsamer (0,3-fach) als nahe (0,6-fach) */
  fern?: boolean
}

const B_GEDREHT = { grad: 150.13, breite: 349.657, hoehe: 511 }
const sternenfelder: Sternenfeld[] = [
  { datei: 'a', left: 19, top: 72, breite: 334, hoehe: 529 },
  { datei: 'b', left: -56.58, top: 365, breite: 557.724, hoehe: 617.262, drehung: B_GEDREHT },
  { datei: 'c', left: -160, top: -154.63, breite: 637.158, hoehe: 662.891, drehung: { grad: 150.13, breite: 441.264, hoehe: 511 }, fern: true },
  { datei: 'a', left: 19, top: 680, breite: 334, hoehe: 529 },
  { datei: 'b', left: -56.58, top: 973, breite: 557.724, hoehe: 617.262, drehung: B_GEDREHT },
  { datei: 'd', left: -67.1, top: 1340.05, breite: 538.964, hoehe: 561.55, drehung: { grad: -145.1, breite: 349.657, hoehe: 440.763 }, fern: true },
  { datei: 'b', left: -160, top: 499, breite: 557.724, hoehe: 617.262, drehung: B_GEDREHT, fern: true },
]

/* Himmelsverlauf aus Figma: Tag #9fe1ff → #defcff über die ganze Höhe,
   darüber die Nacht (Rechteck −273 … 2652) mit auslaufender Deckkraft */
const TAG_OBEN = [0x9f, 0xe1, 0xff]
const TAG_UNTEN = [0xde, 0xfc, 0xff]
const NACHT = { oben: -273, hoehe: 2925 }
const NACHT_STOPPS = [
  { t: 0.64583, farbe: [0x05, 0x0b, 0x2d], alpha: 1 },
  { t: 0.82651, farbe: [0x05, 0x0b, 0x2d], alpha: 0.54 },
  { t: 1, farbe: [0x0c, 0x12, 0x37], alpha: 0 },
]
const NACHT_VERLAUF =
  'linear-gradient(180deg, #050b2d 64.583%, rgba(5, 11, 45, 0.54) 82.651%, rgba(12, 18, 55, 0) 100%)'

const mische = (a: number[], b: number[], t: number) => a.map((w, i) => w + (b[i] - w) * t)

/** Farbe des Himmels auf Szenenhöhe y — für den verkürzten Verlauf der Übersicht */
export function himmelsfarbe(y: number): string {
  const tag = mische(TAG_OBEN, TAG_UNTEN, Math.min(1, Math.max(0, y / sz.hoehe)))
  const t = (y - NACHT.oben) / NACHT.hoehe
  let nacht = NACHT_STOPPS[0].farbe
  let alpha = 1
  if (t >= 1) alpha = 0
  else if (t > NACHT_STOPPS[0].t) {
    const i = t <= NACHT_STOPPS[1].t ? 0 : 1
    const a = NACHT_STOPPS[i]
    const b = NACHT_STOPPS[i + 1]
    const u = (t - a.t) / (b.t - a.t)
    nacht = mische(a.farbe, b.farbe, u)
    alpha = a.alpha + (b.alpha - a.alpha) * u
  }
  const [r, g, b] = mische(tag, nacht, alpha).map(Math.round)
  return `rgb(${r}, ${g}, ${b})`
}

/** Bildschirm-y einer Szenenhöhe für eine Ebene mit Parallax-Faktor */
function ebenenY(kamera: number, echooY: number, faktor: number, rate: number, anker: number) {
  return echooY - anker * faktor - (kamera - anker) * faktor * rate
}

function Ebene({
  kamera,
  echooY,
  faktor,
  rate = 1,
  anker = 0,
  x,
  zusatzY,
  children,
}: {
  kamera: MotionValue<number>
  echooY: number
  faktor: number
  rate?: number
  anker?: number
  x?: MotionValue<number>
  zusatzY?: MotionValue<number>
  children: ReactNode
}) {
  const y = useTransform(() => ebenenY(kamera.get(), echooY, faktor, rate, anker) + (zusatzY?.get() ?? 0))
  return (
    <motion.div
      className="pointer-events-none absolute left-0 top-0"
      style={{ width: sz.breite, height: sz.hoehe, y, x, scale: faktor, transformOrigin: '0 0' }}
    >
      {children}
    </motion.div>
  )
}

function feldBild(feld: Sternenfeld, index: number) {
  return (
    <div
      key={index}
      className="absolute flex items-center justify-center"
      style={{ left: feld.left, top: feld.top, width: feld.breite, height: feld.hoehe }}
    >
      {feld.drehung ? (
        <div className="flex-none" style={{ transform: `rotate(${feld.drehung.grad}deg)` }}>
          <img
            src={oeffentlich(`/himmelsroute/spielfeld/sterne-${feld.datei}.svg`)}
            alt=""
            className="block max-w-none"
            style={{ width: feld.drehung.breite, height: feld.drehung.hoehe }}
          />
        </div>
      ) : (
        <img src={oeffentlich(`/himmelsroute/spielfeld/sterne-${feld.datei}.svg`)} alt="" className="block size-full max-w-none" />
      )}
    </div>
  )
}

/** Deckkraft der Nacht als Maske: Sterne erscheinen nur, wo Nacht ist */
const NACHT_MASKE = 'linear-gradient(180deg, #000 64.583%, rgba(0, 0, 0, 0.54) 82.651%, rgba(0, 0, 0, 0) 100%)'
/** Sternenfelder liegen doppelt übereinander, damit beim langsameren Ziehen oben keine Lücke entsteht */
const STERNEN_KACHEL = 1900

/**
  Sterne mit eigenem Parallax (fern 0,3-fach, nah 0,6-fach): Die Felder
  verschieben sich innerhalb der Nacht und sind auf sie beschnitten — so
  rutschen sie nie in den Taghimmel.
*/
function SternEbene({
  kamera,
  echooY,
  faktor,
  rate,
  fern,
  neigung,
}: {
  kamera: MotionValue<number>
  echooY: number
  faktor: number
  rate: number
  fern: boolean
  neigung: Neigung
}) {
  const anker = sz.parallaxAnker.sterne
  // gegenüber dem Himmel: unterhalb des Ankers liegen langsamere Ebenen tiefer
  const versatz = useTransform(() => (kamera.get() - anker) * (1 - rate) + neigung.yHalb.get())
  const felder = sternenfelder.filter((f) => Boolean(f.fern) === fern)
  return (
    <Ebene kamera={kamera} echooY={echooY} faktor={faktor}>
      <div
        className="absolute overflow-hidden"
        style={{ left: -231, top: NACHT.oben, width: 855, height: NACHT.hoehe, maskImage: NACHT_MASKE, WebkitMaskImage: NACHT_MASKE }}
      >
        <motion.div className="absolute" style={{ left: 231, top: -NACHT.oben, width: sz.breite, height: NACHT.hoehe, y: versatz, x: neigung.xHalb }}>
          {[-STERNEN_KACHEL, 0].map((kachel) => (
            <div key={kachel} className="absolute left-0 w-full" style={{ top: kachel, height: STERNEN_KACHEL }}>
              {felder.map(feldBild)}
            </div>
          ))}
        </motion.div>
      </div>
    </Ebene>
  )
}

export type Neigung = { x: MotionValue<number>; y: MotionValue<number>; xHalb: MotionValue<number>; yHalb: MotionValue<number> }

/** Hintere Ebenen: Himmelsverlauf, Wolken, Nacht und Sterne — Echoo liegt davor */
export function SzeneHinten({
  kamera,
  echooY,
  faktor,
  neigung,
}: {
  kamera: MotionValue<number>
  echooY: number
  faktor: number
  neigung: Neigung
}) {
  const e = { kamera, echooY, faktor }
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <Ebene {...e}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #9fe1ff, #defcff)' }} />
        {/* vereinzelte kleine Wolken im unteren Himmel als Bezugspunkte */}
        {kleineWolken.map((w, i) => (
          <img key={i} src={wolkenBild(w.datei)} alt="" className="absolute block h-auto max-w-none" style={{ left: w.x, top: w.y, width: w.breite }} />
        ))}
      </Ebene>
      <Ebene {...e} rate={sz.parallax.wolken} anker={sz.parallaxAnker.wolken} x={neigung.x} zusatzY={neigung.y}>
        <img src={oeffentlich('/himmelsroute/spielfeld/wolken.svg')} alt="" className="absolute left-[-54px] top-[2023px] block h-[1856px] w-[452px] max-w-none" />
      </Ebene>
      <Ebene {...e}>
        {/* die Nacht liegt über dem Taghimmel und läuft nach unten aus */}
        <div className="absolute left-[-231px] top-[-273px] h-[2925px] w-[855px]" style={{ background: NACHT_VERLAUF }} />
      </Ebene>
      <SternEbene {...e} rate={sz.parallax.sterneFern} fern neigung={neigung} />
      <SternEbene {...e} rate={sz.parallax.sterne} fern={false} neigung={neigung} />
    </div>
  )
}

/** Die Erde aus 315:3776 — Bildausschnitt in Figma-Pixeln, links oben an (0, 0) */
export function ErdeBild() {
  return (
    <div className="absolute left-[-63px] top-0 h-[595.173px] w-[508px]">
      <div className="absolute" style={{ inset: '-7.53% -7.83% -5.23% -7.83%' }}>
        <img src={oeffentlich('/himmelsroute/spielfeld/erde.svg')} alt="Erde" className="block size-full max-w-none" />
      </div>
    </div>
  )
}

/** Vordere Ebene: die Erde — Echoo geht hinter ihr auf und unter */
export function SzeneErde({ kamera, echooY, faktor }: { kamera: MotionValue<number>; echooY: number; faktor: number }) {
  return (
    <Ebene kamera={kamera} echooY={echooY} faktor={faktor}>
      <div className="absolute left-0" style={{ top: sz.erdeOben }}>
        <ErdeBild />
      </div>
    </Ebene>
  )
}

/* ── Vordergrund (1,8-fach): zieht schneller als alles andere an Echoo vorbei ── */

function VordergrundTeil({ el, kamera, echooY, faktor }: { el: VordergrundElement; kamera: MotionValue<number>; echooY: number; faktor: number }) {
  // auf Echoos Höhe, wenn die Kamera bei el.y steht
  const y = useTransform(kamera, (k) => echooY + (el.y - k) * faktor * sz.parallax.vordergrund)
  if (el.art === 'stern')
    return (
      <motion.img
        src={oeffentlich('/himmelsroute/erklaerung/stern-gross.svg')}
        alt=""
        className="absolute left-0 top-0 block max-w-none"
        style={{ x: (el.x - el.groesse / 2) * faktor, y, width: el.groesse * faktor, height: el.groesse * faktor, marginTop: (-el.groesse / 2) * faktor, opacity: el.deckkraft }}
      />
    )
  return (
    <motion.div className="absolute left-0 top-0" style={{ x: (el.x - el.breite / 2) * faktor, y, opacity: el.deckkraft }}>
      <img src={wolkenBild(el.datei)} alt="" className="block h-auto max-w-none -translate-y-1/2" style={{ width: el.breite * faktor }} />
    </motion.div>
  )
}

/** Vordergrund-Ebene: Wolkenfetzen im unteren Himmel und in der Wolkenzone, größere Lichtpunkte bei den Sternen */
export function SzeneVordergrund({ kamera, echooY, faktor }: { kamera: MotionValue<number>; echooY: number; faktor: number }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {vordergrund.map((el, i) => (
        <VordergrundTeil key={i} el={el} kamera={kamera} echooY={echooY} faktor={faktor} />
      ))}
    </div>
  )
}
