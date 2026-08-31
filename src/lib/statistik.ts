/*
  Berechnungen für den Statistiken-Screen.
  Alle Beobachtungssätze werden aus den Daten in src/data/mock.ts
  BERECHNET — ändern sich die Zahlen dort, gehen die Sätze mit.
  Haltung: N=1. Beobachtungen mit Zahl, nie Ratschläge oder Urteile.
*/

import { verlauf, type TagesEintrag, type Tageszeit, type ModusWerte } from '../data/mock'
import { modi } from '../data/modes'

export type Zeitraum = '7' | '30' | 'alles'

export const zeitraumListe: { id: Zeitraum; label: string }[] = [
  { id: '7', label: '7 Tage' },
  { id: '30', label: '30 Tage' },
  { id: 'alles', label: 'Alles' },
]

export function eintraegeFuerZeitraum(zeitraum: Zeitraum): TagesEintrag[] {
  if (zeitraum === 'alles') return verlauf
  const anzahl = zeitraum === '7' ? 7 : 30
  const grenze = new Date()
  grenze.setDate(grenze.getDate() - (anzahl - 1))
  const grenzeIso = grenze.toISOString().slice(0, 10)
  return verlauf.filter((tag) => tag.datum >= grenzeIso)
}

function mittelwert(zahlen: number[]): number {
  if (zahlen.length === 0) return 0
  return zahlen.reduce((summe, z) => summe + z, 0) / zahlen.length
}

/* ── 1.2 Balance ── */

export interface Balance {
  langsam: number
  schnell: number
  /** Anteil des Schnellen an der Summe, 0..1 (für die Trennstelle des Balkens) */
  anteilSchnell: number
  text: string
}

export function berechneBalance(zeitraum: Zeitraum): Balance {
  const eintraege = eintraegeFuerZeitraum(zeitraum)
  const langsam = Math.round(mittelwert(eintraege.map((t) => t.wertLangsam)))
  const schnell = Math.round(mittelwert(eintraege.map((t) => t.wertSchnell)))
  const summe = langsam + schnell
  const anteilSchnell = summe === 0 ? 0.5 : schnell / summe

  const zeitwort =
    zeitraum === '7' ? 'Diese Woche' : zeitraum === '30' ? 'In diesen 30 Tagen' : 'Über alle Tage'
  const text =
    Math.abs(langsam - schnell) < 3
      ? `${zeitwort} waren beide Modi nahezu im Gleichgewicht.`
      : `${zeitwort} lag dein Schwerpunkt beim ${langsam > schnell ? modi.langsam.name : modi.schnell.name}.`

  return { langsam, schnell, anteilSchnell, text }
}

/* ── 1.4 Tagesrhythmus ── */

export const tageszeitListe: { id: Tageszeit; label: string }[] = [
  { id: 'morgen', label: 'Morgen' },
  { id: 'mittag', label: 'Mittag' },
  { id: 'nachmittag', label: 'Nachmittag' },
  { id: 'abend', label: 'Abend' },
]

export function berechneTagesrhythmus(zeitraum: Zeitraum): {
  bloecke: { id: Tageszeit; label: string; werte: ModusWerte }[]
  text: string
} {
  const eintraege = eintraegeFuerZeitraum(zeitraum)
  const bloecke = tageszeitListe.map((block) => ({
    ...block,
    werte: {
      langsam: Math.round(mittelwert(eintraege.map((t) => t.tageszeiten[block.id].langsam))),
      schnell: Math.round(mittelwert(eintraege.map((t) => t.tageszeiten[block.id].schnell))),
    },
  }))

  // Wo hat welcher Modus seinen größten Vorsprung?
  const besterSchnell = bloecke.reduce((a, b) =>
    b.werte.schnell - b.werte.langsam > a.werte.schnell - a.werte.langsam ? b : a,
  )
  const besterLangsam = bloecke.reduce((a, b) =>
    b.werte.langsam - b.werte.schnell > a.werte.langsam - a.werte.schnell ? b : a,
  )
  const text = `Am ${besterSchnell.label} lag dein ${modi.schnell.name} vorn, am ${besterLangsam.label} dein ${modi.langsam.name}.`

  return { bloecke, text }
}

/* ── 1.5 Bewegungsphase ── */

export interface Bewegungsvergleich {
  mit: { werte: ModusWerte; anzahlTage: number }
  ohne: { werte: ModusWerte; anzahlTage: number }
}

export function berechneBewegungsvergleich(zeitraum: Zeitraum): Bewegungsvergleich {
  const eintraege = eintraegeFuerZeitraum(zeitraum)
  const gruppe = (mitBewegung: boolean) => {
    const tage = eintraege.filter((t) => t.bewegungsphase === mitBewegung)
    return {
      werte: {
        langsam: Math.round(mittelwert(tage.map((t) => t.wertLangsam))),
        schnell: Math.round(mittelwert(tage.map((t) => t.wertSchnell))),
      },
      anzahlTage: tage.length,
    }
  }
  return { mit: gruppe(true), ohne: gruppe(false) }
}

/* ── 1.6 Beobachtungen — aus allen 60 Tagen berechnet ── */

export function berechneBeobachtungen(): string[] {
  const saetze: string[] = []

  // 1) Bewegungsphase und der schnelle Modus
  const mitBewegung = verlauf.filter((t) => t.bewegungsphase)
  const ohneBewegung = verlauf.filter((t) => !t.bewegungsphase)
  if (mitBewegung.length >= 3 && ohneBewegung.length >= 3) {
    const differenz = Math.round(
      mittelwert(mitBewegung.map((t) => t.wertSchnell)) -
        mittelwert(ohneBewegung.map((t) => t.wertSchnell)),
    )
    if (differenz !== 0) {
      saetze.push(
        `An deinen ${mitBewegung.length} Tagen mit Bewegungsphase lag der ${modi.schnell.name} im Schnitt ${Math.abs(differenz)} Punkte ${differenz > 0 ? 'höher' : 'niedriger'}.`,
      )
    }
  }

  // 2) Sonntage: wie oft war das Langsame der stärkste Wert seiner Woche?
  const sonntage = verlauf.filter((t) => new Date(t.datum).getDay() === 0).slice(-4)
  if (sonntage.length >= 2) {
    let treffer = 0
    for (const sonntag of sonntage) {
      const start = new Date(sonntag.datum)
      start.setDate(start.getDate() - 6)
      const startIso = start.toISOString().slice(0, 10)
      const woche = verlauf.filter((t) => t.datum >= startIso && t.datum <= sonntag.datum)
      if (woche.every((t) => sonntag.wertLangsam >= t.wertLangsam)) treffer++
    }
    if (treffer >= 2) {
      saetze.push(
        `Dein ${modi.langsam.name} war an ${treffer === sonntage.length ? `den letzten ${sonntage.length}` : `${treffer} der letzten ${sonntage.length}`} Sonntagen dein stärkster Wert der Woche.`,
      )
    }
  }

  // 3) Stimmung: Vergleich hohe (4–5) gegen niedrige (unter 3) Stimmung
  const hoch = verlauf.filter((t) => t.stimmung >= 4)
  const niedrig = verlauf.filter((t) => t.stimmung < 3)
  if (hoch.length >= 3 && niedrig.length >= 3) {
    const diffSchnell = Math.round(
      mittelwert(hoch.map((t) => t.wertSchnell)) - mittelwert(niedrig.map((t) => t.wertSchnell)),
    )
    const diffLangsam = Math.round(
      mittelwert(hoch.map((t) => t.wertLangsam)) - mittelwert(niedrig.map((t) => t.wertLangsam)),
    )
    saetze.push(
      `An deinen ${niedrig.length} Tagen mit Stimmung unter 3 lag der ${modi.schnell.name} im Schnitt ${Math.abs(diffSchnell)} Punkte ${diffSchnell > 0 ? 'niedriger' : 'höher'} als bei Stimmung 4 und 5 — der ${modi.langsam.name} nur ${Math.abs(diffLangsam)} Punkte.`,
    )
  }

  return saetze.slice(0, 3)
}
