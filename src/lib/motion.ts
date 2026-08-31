/*
  Zentrale Animations-Presets.
  Hier lässt sich das komplette Bewegungsgefühl der App an einer Stelle
  nachjustieren — alle Komponenten importieren von hier.
*/

/** Standard-Feder für alles, was auf eine Handlung reagiert */
export const spring = {
  type: 'spring',
  stiffness: 260,
  damping: 24,
  mass: 0.9,
} as const

/** Weichere Feder für große Flächen (z. B. Seitenwechsel, Karten) */
export const springSoft = {
  type: 'spring',
  stiffness: 180,
  damping: 26,
} as const

/** Straffe Feder für Tipp-Reaktionen */
export const springTap = {
  type: 'spring',
  stiffness: 400,
  damping: 28,
} as const

/** Standard-Kurve, wenn eine Kurve statt Feder nötig ist */
export const easeStandard = [0.32, 0.72, 0, 1] as const

/** Diagrammlinien zeichnen sich (einzige erlaubte längere Animation) */
export const zeichnen = { duration: 0.9, ease: easeStandard } as const

/** Flächen unter Diagrammlinien blenden verzögert nach */
export const flaecheEinblenden = { duration: 0.4, delay: 0.2, ease: easeStandard } as const

/** Große Zahlen zählen in ~700 ms hoch */
export const zaehlen = { duration: 0.7, ease: easeStandard } as const

/** whileTap-Preset für jedes tippbare Element */
export const tap = {
  scale: 0.96,
} as const
