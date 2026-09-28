/*
  Zentrale Animations-Presets — das GEMEINSAME Modul aller Screens
  (Statistik, Dashboard, Glossar). Hier lässt sich das komplette
  Bewegungsgefühl der App an einer Stelle nachjustieren.
  Dazu gehören die Bausteine in components/ui: Erscheinen (Karten-
  Einblendung mit Staffelung), Stufe (Staffelung innerhalb einer
  Karte) und ZaehlZahl (Hochzählen großer Zahlen).
*/

/** Merker: welcher Screen seine Einblend-Animation schon gezeigt hat.
    Beim Rückkehren über die Navigation läuft sie nicht erneut. */
const eintrittGesehen = new Set<string>()

export function einmalProSitzung(schluessel: string): boolean {
  if (eintrittGesehen.has(schluessel)) return true
  eintrittGesehen.add(schluessel)
  return false
}

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

/** Standardkurve des Statistiken-Screens: cubic-bezier(0.22, 1, 0.36, 1) */
export const easeAus = [0.22, 1, 0.36, 1] as const

/** Federnde Kurve mit Überschwingen: cubic-bezier(0.34, 1.56, 0.64, 1) */
export const easeFeder = [0.34, 1.56, 0.64, 1] as const

/** Standard-Übergang für Datenmorphs (Zeitraumwechsel): 500 ms */
export const morph = { duration: 0.5, ease: easeAus } as const

/** Erscheinen einer Karte im Sichtbereich: 500 ms, 16 px aufsteigend */
export const erscheinen = { duration: 0.5, ease: easeAus } as const

/** Diagrammlinien zeichnen sich (einzige erlaubte längere Animation) */
export const zeichnen = { duration: 0.9, ease: easeStandard } as const

/** Flächen unter Diagrammlinien blenden erst nach der Linie ein (400 ms) */
export const flaecheEinblenden = { duration: 0.4, delay: 0.85, ease: easeStandard } as const

/** Große Zahlen zählen in 800 ms hoch, mit Abbremsen */
export const zaehlen = { duration: 0.8, ease: easeAus } as const

/** whileTap-Preset für jedes tippbare Element */
export const tap = {
  scale: 0.96,
} as const
