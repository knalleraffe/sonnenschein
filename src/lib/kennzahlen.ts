import type { Sitzung } from './sitzungen'
import { tagesSchluessel } from './stimmung'
import { delta, einheit, fortschrittsSatz, fuelle, spielNamen, startTexte, uhrzeit, zahl, type SpielId } from './startTexte'

/*
  Auswertungen für Startseite und Statistiken (Master start-statistik,
  Abschnitte 2–4) — reine Funktionen über eine Sitzungsliste. Die beiden
  Spiele werden nie zu einem Gesamtwert verrechnet; einzige Ausnahme ist
  Echoos Zustand (jeder Wert relativ zum eigenen Schnitt seines Spiels).
*/

export const MINDEST = {
  /** Bewegung oder Ruhe: je Bedingung */
  bedingung: 5,
  /** Wie stark bewegen? Bewegungs-Sitzungen */
  puls: 8,
  /** Stimmung und Leistung: Sitzungen mit Stimmung */
  stimmung: 8,
  /** Echoo-Zustand: letzte Vor-Werte */
  echoo: 3,
  /** Pulsbereich: Mindestspanne der Anstiege und Sitzungen je 10er-Bereich */
  pulsSpanne: 20,
  pulsBereich: 3,
}

const mittel = (z: number[]) => (z.length === 0 ? 0 : z.reduce((s, x) => s + x, 0) / z.length)
function streuung(z: number[]): number {
  if (z.length < 2) return 0
  const m = mittel(z)
  return Math.sqrt(z.reduce((s, x) => s + (x - m) ** 2, 0) / (z.length - 1))
}
const vomSpiel = (liste: Sitzung[], spiel: SpielId) => liste.filter((s) => s.spiel === spiel)

/* ── Echoo-Zustand ── */

export type EchooZustand = 'heller' | 'normal' | 'gedaempft' | 'neutral'

/** Mittel der letzten 3 Vor-Werte (beide Spiele) als Abstand zum eigenen Schnitt in Standardabweichungen */
export function echooZustand(liste: Sitzung[]): { zustand: EchooZustand; satz: string; z: number | null } {
  if (liste.length < MINDEST.echoo) return { zustand: 'neutral', satz: startTexte.echoo.zuWenig, z: null }
  const kennwerte = new Map<SpielId, { m: number; s: number }>()
  for (const spiel of ['wolkensammeln', 'himmelsroute'] as SpielId[]) {
    const werte = vomSpiel(liste, spiel).map((s) => s.vor)
    kennwerte.set(spiel, { m: mittel(werte), s: streuung(werte) })
  }
  const letzte = liste.slice(-MINDEST.echoo)
  const z = mittel(
    letzte.map((s) => {
      const k = kennwerte.get(s.spiel)!
      return k.s === 0 ? 0 : (s.vor - k.m) / k.s
    }),
  )
  if (z > 0.5) return { zustand: 'heller', satz: startTexte.echoo.ueber, z }
  if (z < -0.5) return { zustand: 'gedaempft', satz: startTexte.echoo.unter, z }
  return { zustand: 'normal', satz: startTexte.echoo.im, z }
}

/* ── Woche ── */

export interface WochenTag {
  datum: Date
  kurz: string
  heute: boolean
  zukunft: boolean
  messung: boolean
}

/** Mo–So der aktuellen Woche mit Messpunkten und „{x} von 7 Tagen" */
export function woche(liste: Sitzung[], heute: Date = new Date()): { tage: WochenTag[]; pille: string; anzahl: number } {
  const montag = new Date(heute)
  montag.setHours(0, 0, 0, 0)
  montag.setDate(montag.getDate() - ((montag.getDay() + 6) % 7))
  const mitMessung = new Set(liste.map((s) => tagesSchluessel(s.zeitpunkt)))
  const heuteSchluessel = tagesSchluessel(heute)
  const tage = Array.from({ length: 7 }, (_, i) => {
    const datum = new Date(montag)
    datum.setDate(montag.getDate() + i)
    const schluessel = tagesSchluessel(datum)
    return {
      datum,
      kurz: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][i],
      heute: schluessel === heuteSchluessel,
      zukunft: schluessel > heuteSchluessel,
      messung: mitMessung.has(schluessel),
    }
  })
  const anzahl = tage.filter((t) => t.messung).length
  return { tage, anzahl, pille: fuelle(startTexte.woche.pille, { x: anzahl }) }
}

/** Sitzungen eines Tages */
export function tagesSitzungen(liste: Sitzung[], tag: Date): Sitzung[] {
  const schluessel = tagesSchluessel(tag)
  return liste.filter((s) => tagesSchluessel(s.zeitpunkt) === schluessel)
}

/* ── Spielkarten ── */

export function letzteSitzung(liste: Sitzung[], spiel: SpielId): Sitzung | null {
  const eigene = vomSpiel(liste, spiel)
  return eigene.length > 0 ? eigene[eigene.length - 1] : null
}

/** „Zuletzt: 5,2 Wolken" oder „Noch nicht gespielt" */
export function spielkartenWert(liste: Sitzung[], spiel: SpielId): string {
  const letzte = letzteSitzung(liste, spiel)
  if (!letzte) return startTexte.spiele.leer
  return fuelle(startTexte.spiele.wert, { 'Vor-Wert': zahl(letzte.vor), Einheit: einheit(spiel, letzte.vor) })
}

/**
  „Heute dran": das Spiel, dessen letzte Sitzung länger her ist. Nie gespielt
  zählt als am längsten her, Gleichstand → Wolkensammeln. Wurden beide heute
  gespielt, keine Pille.
*/
export function heuteDran(liste: Sitzung[], heute: Date = new Date()): SpielId | null {
  const w = letzteSitzung(liste, 'wolkensammeln')
  const h = letzteSitzung(liste, 'himmelsroute')
  const heuteS = tagesSchluessel(heute)
  if (w && h && tagesSchluessel(w.zeitpunkt) === heuteS && tagesSchluessel(h.zeitpunkt) === heuteS) return null
  const zeit = (s: Sitzung | null) => (s ? s.zeitpunkt.getTime() : -Infinity)
  return zeit(h) < zeit(w) ? 'himmelsroute' : 'wolkensammeln'
}

/* ── Verlauf ── */

export function verlauf(liste: Sitzung[], spiel: SpielId, zeitraum: 'vierWochen' | 'alle', heute: Date = new Date()): Sitzung[] {
  const grenze = new Date(heute)
  grenze.setDate(grenze.getDate() - 28)
  return vomSpiel(liste, spiel).filter((s) => zeitraum === 'alle' || s.zeitpunkt >= grenze)
}

/* ── Zusammenhang 1: Bewegung oder Ruhe? ── */

export interface BedingungsAuswertung {
  bewegung: Sitzung[]
  ruhe: Sitzung[]
  mittelBewegung: number
  mittelRuhe: number
  genug: boolean
  kernsatz: string | null
  zusatz: string | null
  fortschritt: string | null
  /** Anteil bis zur ersten Auswertung je Bedingung (0..1) */
  anteil: { bewegung: number; ruhe: number }
  hinweis: string
}

/** „Kein klarer Unterschied": Mittelwert-Abstand kleiner als die halbe gemeinsame Standardabweichung */
export function keinKlarerUnterschied(a: number[], b: number[]): boolean {
  const n1 = a.length
  const n2 = b.length
  const gemeinsam = n1 + n2 > 2 ? Math.sqrt(((n1 - 1) * streuung(a) ** 2 + (n2 - 1) * streuung(b) ** 2) / (n1 + n2 - 2)) : 0
  return Math.abs(mittel(a) - mittel(b)) < gemeinsam / 2
}

export function bewegungOderRuhe(liste: Sitzung[], spiel: SpielId): BedingungsAuswertung {
  const mitDelta = vomSpiel(liste, spiel).filter((s) => s.delta !== null && s.bedingung !== null)
  const bewegung = mitDelta.filter((s) => s.bedingung === 'bewegung')
  const ruhe = mitDelta.filter((s) => s.bedingung === 'ruhe')
  const dB = bewegung.map((s) => s.delta!)
  const dR = ruhe.map((s) => s.delta!)
  const mB = mittel(dB)
  const mR = mittel(dR)
  const genug = bewegung.length >= MINDEST.bedingung && ruhe.length >= MINDEST.bedingung
  const t = startTexte.statistik
  const ohne = bewegung.filter((s) => s.verhalten === 'ohneBewegung').length

  let fortschritt: string | null = null
  if (!genug) {
    const a = Math.max(0, MINDEST.bedingung - bewegung.length)
    const b = Math.max(0, MINDEST.bedingung - ruhe.length)
    fortschritt = fortschrittsSatz(a, b)
  }

  return {
    bewegung,
    ruhe,
    mittelBewegung: mB,
    mittelRuhe: mR,
    genug,
    kernsatz: genug
      ? fuelle(t.kernsatz, { ΔB: delta(mB), ΔR: delta(mR), Einheit: einheit(spiel, mB), nB: bewegung.length, nR: ruhe.length })
      : null,
    zusatz: genug ? (keinKlarerUnterschied(dB, dR) ? t.zusatzGleich : mB > mR ? t.zusatzBewegung : t.zusatzRuhe) : null,
    fortschritt,
    anteil: {
      bewegung: Math.min(1, bewegung.length / MINDEST.bedingung),
      ruhe: Math.min(1, ruhe.length / MINDEST.bedingung),
    },
    hinweis: fuelle(t.hinweisGruppierung, { n: ohne }),
  }
}

/* ── Zusammenhang 2: Wie stark bewegen? ── */

export interface PulsAuswertung {
  punkte: { sitzung: Sitzung; anstieg: number; delta: number }[]
  genug: boolean
  satz: string
  bereich: { von: number; bis: number } | null
}

export function wieStarkBewegen(liste: Sitzung[], spiel: SpielId): PulsAuswertung {
  const t = startTexte.statistik
  const punkte = vomSpiel(liste, spiel)
    .filter((s) => s.bedingung === 'bewegung' && s.delta !== null && s.pulsVorher !== null && s.pulsNachher !== null)
    .map((s) => ({ sitzung: s, anstieg: s.pulsNachher! - s.pulsVorher!, delta: s.delta! }))
  if (punkte.length < MINDEST.puls) return { punkte, genug: false, satz: fuelle(t.zuWenig, { n: MINDEST.puls }), bereich: null }

  const anstiege = punkte.map((p) => p.anstieg)
  if (Math.max(...anstiege) - Math.min(...anstiege) < MINDEST.pulsSpanne)
    return { punkte, genug: true, satz: t.pulsbereichFehlt, bereich: null }

  // 10er-Bereiche, der mit dem höchsten mittleren Δ und mindestens 3 Sitzungen
  const bereiche = new Map<number, number[]>()
  for (const p of punkte) {
    const von = Math.floor(p.anstieg / 10) * 10
    bereiche.set(von, [...(bereiche.get(von) ?? []), p.delta])
  }
  const kandidaten = [...bereiche.entries()].filter(([, d]) => d.length >= MINDEST.pulsBereich)
  if (kandidaten.length === 0) return { punkte, genug: true, satz: t.pulsbereichFehlt, bereich: null }
  const [von] = kandidaten.reduce((a, b) => (mittel(b[1]) > mittel(a[1]) ? b : a))
  return { punkte, genug: true, satz: fuelle(t.pulsbereich, { a: von, b: von + 10 }), bereich: { von, bis: von + 10 } }
}

/* ── Zusammenhang 3: Stimmung und Leistung ── */

export interface StimmungsAuswertung {
  punkte: { sitzung: Sitzung; stimmung: number; vor: number }[]
  genug: boolean
  satz: string
}

export function stimmungUndLeistung(liste: Sitzung[], spiel: SpielId): StimmungsAuswertung {
  const t = startTexte.statistik
  const punkte = vomSpiel(liste, spiel)
    .filter((s) => s.stimmung !== null)
    .map((s) => ({ sitzung: s, stimmung: s.stimmung!, vor: s.vor }))
  if (punkte.length < MINDEST.stimmung) return { punkte, genug: false, satz: fuelle(t.zuWenig, { n: MINDEST.stimmung }) }
  const gut = punkte.filter((p) => p.stimmung >= 4).map((p) => p.vor)
  const sonst = punkte.filter((p) => p.stimmung < 4).map((p) => p.vor)
  const x = mittel(gut)
  return {
    punkte,
    genug: true,
    satz: fuelle(t.stimmungssatz, { x: zahl(x), Einheit: einheit(spiel, x), y: zahl(mittel(sonst)) }),
  }
}

/* ── Zusammenhänge-Karte der Startseite ── */

/** Kernsatz des Spiels mit mehr Sitzungen, sonst dessen Fortschrittssatz */
export function zusammenhangSatz(liste: Sitzung[]): { spiel: SpielId; satz: string } {
  const spiel: SpielId = vomSpiel(liste, 'himmelsroute').length > vomSpiel(liste, 'wolkensammeln').length ? 'himmelsroute' : 'wolkensammeln'
  const a = bewegungOderRuhe(liste, spiel)
  return { spiel, satz: a.kernsatz ?? a.fortschritt ?? '' }
}

/* ── Tages-Sheet ── */

/** „Wolkensammeln · 14:05 — 5,2 → 5,8 Wolken · Bewegung" (ohne Pause nur der Vor-Wert) */
export function tagesZeile(s: Sitzung): string {
  const werte = {
    Spiel: spielNamen[s.spiel],
    Uhrzeit: uhrzeit(s.zeitpunkt),
    Vor: zahl(s.vor),
    Nach: s.nach === null ? '' : zahl(s.nach),
    Einheit: einheit(s.spiel, s.nach ?? s.vor),
    Bedingung: s.bedingung === null ? '' : startTexte.statistik.bedingung[s.bedingung],
  }
  if (s.nach === null || s.bedingung === null) return `${werte.Spiel} · ${werte.Uhrzeit} — ${werte.Vor}\u00A0${werte.Einheit}`
  return fuelle(startTexte.tagesSheet.zeile, werte)
}
