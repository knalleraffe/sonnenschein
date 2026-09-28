/*
  Stimmung des Tages (Skala 1–5), einmal pro Tag, jederzeit änderbar.
  Browser-Speicher, gleiches Muster wie die Spiele.
*/

const SCHLUESSEL = 'sonnenschein.stimmung.v1'

export type Stimmungen = Record<string, number>

/** „2026-09-25" — lokales Datum */
export function tagesSchluessel(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function alleStimmungen(): Stimmungen {
  try {
    const roh = localStorage.getItem(SCHLUESSEL)
    const daten = roh ? JSON.parse(roh) : {}
    return daten && typeof daten === 'object' ? daten : {}
  } catch {
    return {}
  }
}

export function speichereStimmung(tag: Date, stufe: number): void {
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify({ ...alleStimmungen(), [tagesSchluessel(tag)]: stufe }))
  } catch {
    // Speicher gesperrt — die Stimmung gilt dann nur bis zum Neuladen
  }
}
