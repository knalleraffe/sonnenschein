/*
  Texte für Startseite und Statistiken (Master start-statistik, Abschnitt 5),
  zeichengenau. {…} sind Platzhalter, gefüllt über fuelle() oder die
  Hilfsfunktionen unten. Zahlen deutsch: Dezimalkomma, höchstens eine
  Nachkommastelle, echtes Minuszeichen, „±0", geschütztes Leerzeichen.
*/

export type SpielId = 'wolkensammeln' | 'himmelsroute'
export type Bedingung = 'bewegung' | 'ruhe'

const MINUS = '−'
const GESCHUETZT = ' '

export function fuelle(vorlage: string, werte: Record<string, string | number>): string {
  // Platzhalter dürfen Bindestriche und Sonderzeichen enthalten, z. B. {Vor-Wert} oder {ΔB}
  return vorlage.replace(/\{([^{}]+)\}/g, (ganz, name: string) => (name in werte ? String(werte[name]) : ganz))
}

export const startTexte = {
  echoo: {
    ueber: 'Deine letzten Messungen liegen über deinem Schnitt.',
    im: 'Deine letzten Messungen liegen in deinem Schnitt.',
    unter: 'Deine letzten Messungen liegen unter deinem Schnitt.',
    zuWenig: 'Noch zu wenige Messungen für einen Vergleich.',
  },
  woche: {
    titel: 'Heute',
    pille: '{x} von 7 Tagen',
  },
  stimmung: {
    titel: 'Wie fühlst du dich heute?',
    text: 'Dein Stimmungscheck für heute.',
    stufen: ['Schlecht', 'Eher schlecht', 'Geht so', 'Eher gut', 'Gut'],
    eingeklappt: 'Stimmung heute: {Stufe}',
  },
  spiele: {
    abschnitt: 'Spiele',
    wert: 'Zuletzt: {Vor-Wert} {Einheit}',
    leer: 'Noch nicht gespielt',
    heuteDran: 'Heute dran',
  },
  zusammenhaengeKarte: {
    titel: 'Deine Zusammenhänge',
  },
  tagesSheet: {
    titel: '{Wochentag}, {Tag}. {Monat}',
    zeile: '{Spiel} · {Uhrzeit} — {Vor} → {Nach} {Einheit} · {Bedingung}',
    primaer: 'Zur Statistik',
  },
  statistik: {
    ebenen: ['Sitzung', 'Verlauf', 'Zusammenhänge'],
    bedingung: { bewegung: 'Bewegung', ruhe: 'Ruhe' } as Record<Bedingung, string>,
    ohneBewegung: 'Ohne Bewegung fortgefahren',
    zeilen: {
      pause: 'Pause',
      puls: 'Puls',
      stimmung: 'Stimmung',
      dauer: 'Dauer',
      trefferquote: 'Trefferquote',
      ende: 'Ende von Durchgang 1',
    },
    endeGruende: {
      mehrAlsHaelfteFalsch: 'Mehr als die Hälfte falsch',
      zweiterFehlversuch: 'Zweiter Fehlversuch',
      maximallaenge: 'Längste Route geschafft',
    },
    verlaufSatz: 'Dein Wert vor der Pause, Sitzung für Sitzung.',
    verlaufUmschalter: ['4 Wochen', 'Alle'],
    leer: 'Noch keine Sitzung.',
    titel1: 'Bewegung oder Ruhe?',
    kernsatz: 'Nach Bewegung im Schnitt {ΔB} {Einheit}, nach Ruhe {ΔR} ({nB} und {nR} Sitzungen).',
    zusatzBewegung: 'Bewegung liegt bei dir bisher vorn.',
    zusatzRuhe: 'Ruhe liegt bei dir bisher vorn.',
    zusatzGleich: 'Bisher zeigt sich kein klarer Unterschied.',
    fortschritt: 'Noch {a} Sitzungen mit Bewegung und {b} mit Ruhe bis zur ersten Auswertung.',
    hinweisGruppierung: 'Gruppiert nach zugewiesener Pause. {n}-mal wurde ohne Bewegung fortgefahren.',
    titel2: 'Wie stark bewegen?',
    pulsbereich: 'Am meisten bringt dir bisher ein Pulsanstieg von {a}–{b} Schlägen pro Minute.',
    pulsbereichFehlt: 'Beweg dich mal leichter, mal stärker – dann zeigt sich, welcher Bereich dir am meisten bringt.',
    titel3: 'Stimmung und Leistung',
    stimmungssatz: 'An Tagen mit guter Stimmung im Schnitt {x} {Einheit}, sonst {y}.',
    zuWenig: 'Ab {n} Sitzungen siehst du hier einen Zusammenhang.',
  },
} as const

export const spielNamen: Record<SpielId, string> = {
  wolkensammeln: 'Wolkensammeln',
  himmelsroute: 'Himmelsroute',
}

/* ── Zahlen ── */

/** Dezimalkomma, höchstens eine Nachkommastelle; ganze Zahlen ohne „,0" */
export function zahl(wert: number): string {
  const gerundet = Math.round(wert * 10) / 10
  const text = Number.isInteger(gerundet) ? String(Math.abs(gerundet)) : Math.abs(gerundet).toFixed(1).replace('.', ',')
  return gerundet < 0 ? `${MINUS}${text}` : text
}

/** Veränderung mit Vorzeichen: „+1,5", „±0", „−0,5" */
export function delta(wert: number): string {
  const gerundet = Math.round(wert * 10) / 10
  if (gerundet === 0) return '±0'
  return gerundet > 0 ? `+${zahl(gerundet)}` : zahl(gerundet)
}

/** Einheit im Singular bei genau 1 */
export function einheit(spiel: SpielId, wert: number): string {
  const eins = Math.abs(Math.round(wert * 10) / 10) === 1
  if (spiel === 'wolkensammeln') return eins ? 'Wolke' : 'Wolken'
  return eins ? 'Wegpunkt' : 'Wegpunkte'
}

/** Zahl mit Einheit, getrennt durch ein geschütztes Leerzeichen: „4,5 Wolken" */
export function mitEinheit(spiel: SpielId, wert: number, text = zahl(wert)): string {
  return `${text}${GESCHUETZT}${einheit(spiel, wert)}`
}

/** „1 Sitzung" / „3 Sitzungen" */
export function sitzungen(n: number): string {
  return `${n} ${n === 1 ? 'Sitzung' : 'Sitzungen'}`
}

/**
  Fortschrittssatz „Noch {a} Sitzungen mit Bewegung und {b} mit Ruhe bis zur
  ersten Auswertung." — der Teil einer Bedingung, die schon genug hat, entfällt.
*/
export function fortschrittsSatz(a: number, b: number): string {
  if (a > 0 && b > 0) return `Noch ${sitzungen(a)} mit Bewegung und ${b} mit Ruhe bis zur ersten Auswertung.`
  if (a > 0) return `Noch ${sitzungen(a)} mit Bewegung bis zur ersten Auswertung.`
  return `Noch ${sitzungen(b)} mit Ruhe bis zur ersten Auswertung.`
}

/** Anteil 0..1 → „71 %" */
export function prozent(anteil: number): string {
  return `${Math.round(anteil * 100)}${GESCHUETZT}%`
}

/** ms → „7:42 min" */
export function dauer(ms: number): string {
  const sekunden = Math.round(ms / 1000)
  return `${Math.floor(sekunden / 60)}:${String(sekunden % 60).padStart(2, '0')}${GESCHUETZT}min`
}

/* ── Datum ── */

const WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
export const WOCHENTAGE_KURZ = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

/** „Mittwoch, 24. September" */
export function langesDatum(d: Date): string {
  return fuelle(startTexte.tagesSheet.titel, { Wochentag: WOCHENTAGE[d.getDay()], Tag: d.getDate(), Monat: MONATE[d.getMonth()] })
}

/** „14:05" */
export function uhrzeit(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** „24. September, 14:05" — Kopf der Sitzungs-Ebene */
export function datumUhrzeit(d: Date): string {
  return `${d.getDate()}. ${MONATE[d.getMonth()]}, ${uhrzeit(d)}`
}
