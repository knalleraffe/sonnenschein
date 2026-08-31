/*
  Alle Platzhalterdaten an einem Ort.
  Zahlen und Texte hier ändern — die Oberfläche übernimmt sie automatisch.
  Werte entsprechen dem Screenshot design/screens/Frame.jpg.
*/

/** Punktestand auf der großen Punktekarte */
export const punkte = 12

/** Serie (Flammen-Badge oben rechts) */
export const serie = 28

/** Wochenleiste Mo–So: Wert pro Tag; heute wird hervorgehoben */
export const woche = [
  { tag: 'Mo', wert: 15 },
  { tag: 'Di', wert: 15 },
  { tag: 'Mi', wert: 15 },
  { tag: 'Do', wert: 15 },
  { tag: 'Fr', wert: 15 },
  { tag: 'Sa', wert: 15 },
  { tag: 'So', wert: 15 },
]

/** Index des heutigen Tages in der Wochenleiste (0 = Montag) */
export const heuteIndex = 3

/** Texte der Stimmungscheck-Karte */
export const stimmungscheck = {
  frage: 'Wie fühlst du dich heute?',
  erklaerung: "Dein Stimmungscheck für heute, danach kann's losgehen.",
}

/** Spieleliste im Abschnitt „Verfügbare Spiele" — Namen im Screenshot nicht sichtbar */
export const spiele = [
  { id: 'spiel-1', name: '[SPIEL 1]' },
  { id: 'spiel-2', name: '[SPIEL 2]' },
  { id: 'spiel-3', name: '[SPIEL 3]' },
  { id: 'spiel-4', name: '[SPIEL 4]' },
]

/* ────────────────────────────────────────────────────────────
   Statistik-Daten: 60 Tage Verlauf für den Statistiken-Screen.
   Fester Startwert für den Zufallsgenerator → die Zahlen bleiben
   bei jedem Neuladen exakt gleich.
   ──────────────────────────────────────────────────────────── */

export type Tageszeit = 'morgen' | 'mittag' | 'nachmittag' | 'abend'

export interface ModusWerte {
  langsam: number
  schnell: number
}

export interface TagesEintrag {
  /** ISO-Datum, z. B. "2026-08-31" */
  datum: string
  /** 0–100: tiefes, verknüpfendes Behalten (Elefanten-Modus) */
  wertLangsam: number
  /** 0–100: wache, flexible Aufmerksamkeit (Hasen-Modus) */
  wertSchnell: number
  /** Stimmungscheck des Tages, 1–5 */
  stimmung: 1 | 2 | 3 | 4 | 5
  /** Gab es eine Bewegungsphase? */
  bewegungsphase: boolean
  /** Werte je Tagesabschnitt */
  tageszeiten: Record<Tageszeit, ModusWerte>
}

/** Deterministischer Zufallsgenerator (Mulberry32) mit festem Startwert */
function erzeugeZufall(startwert: number) {
  let a = startwert
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp100 = (wert: number) => Math.max(0, Math.min(100, Math.round(wert)))

/** Tage (Index 0–59) ohne Eintrag — bewusst gesetzte Lücken */
const luecken = new Set([9, 23, 24, 44])

export const verlauf: TagesEintrag[] = (() => {
  const zufall = erzeugeZufall(42)
  const rausch = (staerke: number) => (zufall() * 2 - 1) * staerke
  const eintraege: TagesEintrag[] = []
  const heute = new Date()

  for (let i = 0; i < 60; i++) {
    const datum = new Date(heute)
    datum.setDate(heute.getDate() - (59 - i))
    const wochentag = datum.getDay() // 0 = Sonntag

    // leichter Aufwärtstrend über die 60 Tage
    const trend = (i / 59) * 8

    const bewegungsphase = zufall() < 0.4

    // Stimmung 1–5, mittlere Werte am häufigsten
    const wurf = zufall()
    const stimmung = (wurf < 0.05 ? 1 : wurf < 0.17 ? 2 : wurf < 0.45 ? 3 : 0.8 > wurf ? 4 : 5) as
      | 1 | 2 | 3 | 4 | 5
    const stimmungsEffekt = (stimmung - 3.4) * 4

    // Elefanten-Modus: Wochenrhythmus mit starken Sonntagen (Ruhe + Wiederholung)
    let langsam = 54 + trend + rausch(6)
    if (wochentag === 0) langsam += 9
    if (wochentag === 6) langsam += 4
    langsam += stimmungsEffekt * 0.35

    // Hasen-Modus: stark in der Wochenmitte, deutlich höher mit Bewegungsphase
    let schnell = 53 + trend + rausch(7)
    if (wochentag >= 2 && wochentag <= 4) schnell += 4
    if (wochentag === 0) schnell -= 3
    if (bewegungsphase) schnell += 12
    schnell += stimmungsEffekt

    // Tagesabschnitte: morgens ist das Schnelle vorn, abends das Langsame
    const tageszeiten: Record<Tageszeit, ModusWerte> = {
      morgen: { langsam: clamp100(langsam - 6 + rausch(4)), schnell: clamp100(schnell + 8 + rausch(4)) },
      mittag: { langsam: clamp100(langsam + 2 + rausch(4)), schnell: clamp100(schnell + 2 + rausch(4)) },
      nachmittag: { langsam: clamp100(langsam + 1 + rausch(4)), schnell: clamp100(schnell - 4 + rausch(4)) },
      abend: { langsam: clamp100(langsam + 7 + rausch(4)), schnell: clamp100(schnell - 9 + rausch(4)) },
    }

    if (luecken.has(i)) continue

    eintraege.push({
      datum: datum.toISOString().slice(0, 10),
      wertLangsam: clamp100(langsam),
      wertSchnell: clamp100(schnell),
      stimmung,
      bewegungsphase,
      tageszeiten,
    })
  }
  return eintraege
})()
