import { konfig } from './config'
import type { Endwerte } from './auswertung'

/*
  Alle Texte der Himmelsroute (Master Abschnitt 4 und 6), zeichengenau.
  {…} sind Platzhalter, gefüllt über fuelle() oder die Hilfsfunktionen unten.
*/

const MINUS = '−'
const GESCHUETZT = ' '

/** Ersetzt {name} durch den Wert; unbekannte Platzhalter bleiben stehen */
export function fuelle(vorlage: string, werte: Record<string, string | number>): string {
  return vorlage.replace(/\{(\w+)\}/g, (ganz, name: string) => (name in werte ? String(werte[name]) : ganz))
}

export const texte = {
  erklaerung: {
    titel: konfig.spielName,
    text: 'Echoo geht auf und reist durch den Himmel. Merk dir, in welcher Reihenfolge er den Dingen begegnet – oben baust du daraus seine Route nach. Mit jeder Runde wird die Route länger.',
    primaer: 'Weiter',
    sekundaer: 'Abbrechen',
  },
  proberunde: {
    rundenstartZeile1: 'Proberunde',
    rundenstartZeile2: '2 Begegnungen · zählt nicht',
    vorDemErstenZiehen: 'Zieh nach oben oder tippe auf den Pfeil.',
    ersteBegegnung: 'Merk dir, was Echoo begegnet – und in welcher Reihenfolge.',
    rueckwegSchritt1: 'Zieh den Drachen auf den untersten Wegpunkt.',
    rueckwegSchritt2: 'Jetzt die Rakete darüber.',
    rueckwegSchritt3: 'Das Ufo war nicht dabei. Tippe auf „Route bestätigen“.',
    link: 'Überspringen',
  },
  proberundeBeendet: {
    titel: 'Proberunde beendet',
    text: 'Jetzt zählt es. Mit jeder Runde kommt eine Begegnung dazu.',
    primaer: 'Weiter',
    sekundaer: 'Noch einmal üben',
  },
  pulsVorher: {
    titel: 'Bevor es losgeht',
    label: 'Aktueller Puls',
    primaer: 'Spiel starten',
  },
  rundenstart: {
    durchgang2: 'Durchgang 2',
    runde: 'Runde {n}',
    begegnungen: '{L} Begegnungen',
    zweiterVersuch: 'Zweiter Versuch',
  },
  rundenanzeige: 'Runde {n} | {k} von {L}',
  rueckweg: {
    titel: 'Bau Echoos Route nach',
    text: 'Zieh die Gegenstände in der Reihenfolge, in der Echoo ihnen begegnet ist, von der Erde aus nach oben auf die Wegpunkte. Einer davon war nicht dabei.',
    primaer: 'Route bestätigen',
  },
  rundenErfolg: {
    titel: 'Runde {n} geschafft',
    text: 'Nächste Runde: {L} Begegnungen.',
    primaer: 'Nächste Runde',
  },
  zweiterVersuch: {
    titel: 'Route nicht ganz richtig',
    text: 'Du bekommst einen zweiten Versuch – gleich lang, mit neuen Begegnungen.',
    primaer: 'Zweiter Versuch',
  },
  durchgang1Beendet: {
    titel: 'Durchgang 1 beendet',
    textStandard: 'Deine längste Route: {span1} Wegpunkte. Nach einer kurzen Pause folgt Durchgang 2.',
    textMerkspanne0: 'Diesmal hat keine Route ganz gestimmt. Nach einer kurzen Pause folgt Durchgang 2.',
    textMaxLaenge: 'Du hast die längste Route geschafft: {MAX_LENGTH} Wegpunkte. Nach einer kurzen Pause folgt Durchgang 2.',
    primaer: 'Weiter',
  },
  bewegungspause: {
    titel: 'Bewegungspause',
    text: 'Bewege dich aktiv, bis dein Puls spürbar ansteigt. Danach trägst du deinen neuen Pulswert ein und es geht weiter.',
    primaer: 'Ich habe mich bewegt',
    sekundaer: 'Ohne Bewegung fortfahren',
  },
  pulsDanach: {
    titel: 'Bevor es weitergeht',
    // Label wie in Wolkensammeln (kommt aus dem gemeinsamen PulsSheet)
    primaer: 'Spiel fortsetzen',
  },
  abbruch: {
    titel: 'Bist du sicher?',
    text: 'Wenn du das Spiel jetzt verlässt, geht dein bisheriger Fortschritt verloren.',
    primaer: 'Fortsetzen',
    sekundaer: 'Spiel verlassen',
  },
  endergebnis: {
    satz1: 'Wegpunkte in deiner längsten Route.',
    satz1Null: 'Diesmal hat keine Route ganz gestimmt.',
    satz2Erste: 'Deine erste {GAME_NAME}.',
    satz2MehrViele: 'Das sind {dLast} mehr als beim letzten Mal.',
    satz2MehrEins: 'Das ist einer mehr als beim letzten Mal.',
    satz2Gleich: 'Genauso viele wie beim letzten Mal.',
    satz2WenigerEins: 'Das ist einer weniger als beim letzten Mal.',
    satz2WenigerViele: 'Das sind {betrag} weniger als beim letzten Mal.',
    zeileVorPause: 'Längste Route vor der Pause',
    zeileNachPause: 'Längste Route nach der Pause',
    zeileVeraenderung: 'Veränderung nach der Pause',
    zeileRichtig: 'Richtige Wegpunkte',
    zeileDauer: 'Gesamtdauer',
    primaer: 'Dashboard',
    sekundaer: 'Statistiken',
  },
} as const

/* ── Formatierung ── */

/** „+2", „±0", „−1" (echtes Minuszeichen) */
export function veraenderung(wert: number): string {
  if (wert > 0) return `+${wert}`
  if (wert < 0) return `${MINUS}${Math.abs(wert)}`
  return '±0'
}

/** Anteil 0..1 → „86 %" (ganzzahlig gerundet, geschütztes Leerzeichen) */
export function prozent(anteil: number): string {
  return `${Math.round(anteil * 100)}${GESCHUETZT}%`
}

/** ms → „7:42 min" (Sekunden zweistellig, geschütztes Leerzeichen) */
export function dauer(ms: number): string {
  const sekunden = Math.round(ms / 1000)
  const m = Math.floor(sekunden / 60)
  const ss = String(sekunden % 60).padStart(2, '0')
  return `${m}:${ss}${GESCHUETZT}min`
}

/* ── Varianten ── */

export function rundenanzeige(n: number, k: number, laenge: number): string {
  return fuelle(texte.rundenanzeige, { n, k, L: laenge })
}

/** Rundenanzeige in zwei Teilen für die Leiste (507:1276): „Runde {n}" und „{k} von {L}", dazwischen die Trennlinie */
export function rundenanzeigeTeile(n: number, k: number, laenge: number): [string, string] {
  const [runde, fortschritt] = rundenanzeige(n, k, laenge).split(' | ')
  return [runde, fortschritt]
}

/**
  Rundenstart-Anzeige als Titel und Unterzeile (Figma 507:1293 / 507:1294):
  normal „Runde {n}" · „{L} Begegnungen", beim zweiten Versuch „Zweiter Versuch"
  · „{L} Begegnungen" (die Rundennummer steht oben in der Leiste). Durchgang 2,
  Runde 1 und die Proberunde folgen demselben Muster.
*/
export function rundenstartAnzeige(werte: {
  proberunde: boolean
  durchgang: number
  runde: number
  laenge: number
  versuch: number
}): { titel: string; unterzeile: string } {
  if (werte.proberunde) return { titel: texte.proberunde.rundenstartZeile1, unterzeile: texte.proberunde.rundenstartZeile2 }
  const begegnungen = fuelle(texte.rundenstart.begegnungen, { L: werte.laenge })
  const runde = fuelle(texte.rundenstart.runde, { n: werte.runde })
  if (werte.versuch === 2) return { titel: texte.rundenstart.zweiterVersuch, unterzeile: begegnungen }
  if (werte.durchgang === 2 && werte.runde === 1) return { titel: texte.rundenstart.durchgang2, unterzeile: `${runde} · ${begegnungen}` }
  return { titel: runde, unterzeile: begegnungen }
}

export function rundenErfolg(n: number, laenge: number): { titel: string; text: string } {
  return {
    titel: fuelle(texte.rundenErfolg.titel, { n }),
    text: fuelle(texte.rundenErfolg.text, { L: laenge + 1 }),
  }
}

/** Text von „Durchgang 1 beendet" nach der Merkspanne */
export function durchgang1Text(span1: number): string {
  const t = texte.durchgang1Beendet
  if (span1 === 0) return t.textMerkspanne0
  if (span1 >= konfig.maxLaenge) return fuelle(t.textMaxLaenge, { MAX_LENGTH: konfig.maxLaenge })
  return fuelle(t.textStandard, { span1 })
}

/** Große Zahl im Endergebnis: bei 0 ein Halbgeviertstrich */
export function grosseZahl(bestSpan: number): string {
  return bestSpan === 0 ? '–' : String(bestSpan)
}

/** Satz 1 nach bestSpan */
export function satz1(bestSpan: number): string {
  return bestSpan === 0 ? texte.endergebnis.satz1Null : texte.endergebnis.satz1
}

/** Satz 2 nach dLast; null = entfällt (bei bestSpan 0) */
export function satz2(bestSpan: number, dLast: number | null): string | null {
  const t = texte.endergebnis
  if (bestSpan === 0) return null
  if (dLast === null) return fuelle(t.satz2Erste, { GAME_NAME: konfig.spielName })
  if (dLast >= 2) return fuelle(t.satz2MehrViele, { dLast })
  if (dLast === 1) return t.satz2MehrEins
  if (dLast === 0) return t.satz2Gleich
  if (dLast === -1) return t.satz2WenigerEins
  return fuelle(t.satz2WenigerViele, { betrag: Math.abs(dLast) })
}

/** Zeilen im Endergebnis als [Label, Wert] */
export function endergebnisZeilen(w: Endwerte): [string, string][] {
  const t = texte.endergebnis
  return [
    [t.zeileVorPause, String(w.span1)],
    [t.zeileNachPause, String(w.span2)],
    [t.zeileVeraenderung, veraenderung(w.dPause)],
    [t.zeileRichtig, prozent(w.anteilRichtig)],
    [t.zeileDauer, dauer(w.gesamtdauer)],
  ]
}
