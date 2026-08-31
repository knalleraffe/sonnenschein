/*
  Pfad-Daten für Augen und Mund je Stimmung.
  Alle Pfade haben dieselbe Struktur (M … Q …), damit sie später
  weich ineinander übergeblendet bzw. gefedert werden können.
  Koordinaten beziehen sich auf das 393×852-Raster der Sonne.
*/

export type Emotion =
  | 'froehlich'
  | 'neutral'
  | 'muede'
  | 'aufgeregt'
  | 'nachdenklich'
  | 'traurig'

export interface Gesicht {
  eyeLeft: string
  eyeRight: string
  mouth: string
}

export const emotionen: Record<Emotion, Gesicht> = {
  // Lachende, geschlossene Augen und breites Lächeln (wie im Screenshot)
  froehlich: {
    eyeLeft: 'M 115 408 Q 145 372 175 408',
    eyeRight: 'M 218 408 Q 248 372 278 408',
    mouth: 'M 152 442 Q 196 492 241 442',
  },
  // Entspannt: fast gerade Augen, leichtes Lächeln
  neutral: {
    eyeLeft: 'M 120 400 Q 145 396 170 400',
    eyeRight: 'M 223 400 Q 248 396 273 400',
    mouth: 'M 168 456 Q 196 466 225 456',
  },
  // Müde: hängende Lider, kleiner flacher Mund
  muede: {
    eyeLeft: 'M 118 398 Q 145 412 172 404',
    eyeRight: 'M 221 404 Q 248 412 275 398',
    mouth: 'M 170 462 Q 196 458 223 462',
  },
  // Aufgeregt: weit aufgerissene Bögen, großer offener Mund
  aufgeregt: {
    eyeLeft: 'M 112 412 Q 145 356 178 412',
    eyeRight: 'M 215 412 Q 248 356 281 412',
    mouth: 'M 148 438 Q 196 506 245 438',
  },
  // Nachdenklich: leicht schräge Augen, kleiner schiefer Mund
  nachdenklich: {
    eyeLeft: 'M 120 398 Q 145 390 170 395',
    eyeRight: 'M 223 395 Q 248 390 273 398',
    mouth: 'M 170 458 Q 196 452 222 462',
  },
  // Traurig: nach unten gewölbte Augen, umgedrehtes Lächeln
  traurig: {
    eyeLeft: 'M 115 400 Q 145 416 175 400',
    eyeRight: 'M 218 400 Q 248 416 278 400',
    mouth: 'M 155 472 Q 196 438 238 472',
  },
}

/** Reihenfolge und deutsche Beschriftung für die Playground-Seite */
export const emotionListe: { id: Emotion; label: string }[] = [
  { id: 'froehlich', label: 'Fröhlich' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'muede', label: 'Müde' },
  { id: 'aufgeregt', label: 'Aufgeregt' },
  { id: 'nachdenklich', label: 'Nachdenklich' },
  { id: 'traurig', label: 'Traurig' },
]
