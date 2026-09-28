import type { RundenErgebnis } from '../games/wolkensammeln/types'
import type { DurchgangsEnde, SitzungsErgebnis } from '../games/himmelsroute/types'
import { alleRunden } from '../games/wolkensammeln/storage'
import { alleSitzungen } from '../games/himmelsroute/storage'
import { alleStimmungen, tagesSchluessel, type Stimmungen } from './stimmung'
import { DEMO_DATA, demoSitzungen, demoStimmungen } from '../data/demo'
import type { Bedingung, SpielId } from './startTexte'

/*
  Eine Sitzung beider Spiele in einheitlicher Form (Master start-statistik,
  Abschnitt 2). Vor- und Nach-Wert:
  - Wolkensammeln: mittlere Stufe (Wolken) der letzten 6 Haupt-Durchgänge
    vor der ERSTEN Pause, Nach-Wert der 6 danach. Ohne Pause kein Nach-Wert;
    Vor-Wert dann das Mittel der letzten 6 Durchgänge.
  - Himmelsroute: Merkspanne Durchgang 1 und 2 (Wegpunkte).
  Gruppiert wird immer nach ZUGEWIESENER Bedingung.
*/

export interface Sitzung {
  id: string
  spiel: SpielId
  zeitpunkt: Date
  vor: number
  nach: number | null
  delta: number | null
  /** zugewiesene Pausenbedingung; null = Wolkensammeln ohne Pause */
  bedingung: Bedingung | null
  verhalten: 'bewegt' | 'ohneBewegung' | null
  pulsVorher: number | null
  pulsNachher: number | null
  /** Stimmung des Tages, 1–5 */
  stimmung: number | null
  dauerMs: number | null
  /** Himmelsroute: Grund für das Ende von Durchgang 1 */
  endeGrund: DurchgangsEnde | null
  /** Wolkensammeln: Trefferquote 0..1 (nur Nebenzeile) */
  trefferquote: number | null
  /** Wolkensammeln: Stufe je Haupt-Durchgang und Zahl der Durchgänge vor der Pause */
  stufen: number[] | null
  pauseNach: number | null
}

const FENSTER = 6
const mittel = (z: number[]) => (z.length === 0 ? 0 : z.reduce((s, x) => s + x, 0) / z.length)
const rund1 = (z: number) => Math.round(z * 10) / 10
const bedingungAus = (art: 'bewegung' | 'stille'): Bedingung => (art === 'bewegung' ? 'bewegung' : 'ruhe')

export function ausWolkensammeln(r: RundenErgebnis, stimmungen: Stimmungen): Sitzung {
  const haupt = r.durchgaenge.filter((d) => d.hauptIndex !== null)
  const pause = r.unterbrechungen[0] ?? null
  const stufen = haupt.map((d) => d.laenge)
  let vor: number
  let nach: number | null = null
  if (pause) {
    vor = mittel(haupt.filter((d) => (d.hauptIndex ?? 0) <= pause.nachHauptDurchgang).slice(-FENSTER).map((d) => d.laenge))
    const danach = haupt.filter((d) => (d.hauptIndex ?? 0) > pause.nachHauptDurchgang).slice(0, FENSTER)
    nach = danach.length > 0 ? mittel(danach.map((d) => d.laenge)) : null
  } else {
    vor = mittel(stufen.slice(-FENSTER))
  }
  const zeitpunkt = new Date(r.zeitstempel)
  return {
    id: `ws-${r.zeitstempel}`,
    spiel: 'wolkensammeln',
    zeitpunkt,
    vor: rund1(vor),
    nach: nach === null ? null : rund1(nach),
    delta: nach === null ? null : rund1(nach - vor),
    bedingung: pause ? bedingungAus(pause.bedingung) : null,
    verhalten: pause ? pause.verhalten : null,
    pulsVorher: r.startPuls ?? null,
    pulsNachher: r.bewegungsPuls ?? null,
    stimmung: stimmungen[tagesSchluessel(zeitpunkt)] ?? null,
    dauerMs: null,
    endeGrund: null,
    trefferquote: r.trefferquote,
    stufen,
    pauseNach: pause ? pause.nachHauptDurchgang : null,
  }
}

export function ausHimmelsroute(s: SitzungsErgebnis, stimmungen: Stimmungen): Sitzung {
  const zeitpunkt = new Date(s.zeitstempel)
  return {
    id: `hr-${s.zeitstempel}`,
    spiel: 'himmelsroute',
    zeitpunkt,
    vor: s.merkspanne1,
    nach: s.merkspanne2,
    delta: s.merkspanne2 - s.merkspanne1,
    bedingung: bedingungAus(s.bedingung),
    verhalten: s.verhalten,
    pulsVorher: s.pulsVorher,
    pulsNachher: s.pulsDanach,
    stimmung: stimmungen[tagesSchluessel(zeitpunkt)] ?? null,
    dauerMs: s.gesamtdauer,
    endeGrund: s.endeDurchgang1 ?? null,
    trefferquote: null,
    stufen: null,
    pauseNach: null,
  }
}

/** Alle Sitzungen, älteste zuerst. Mit DEMO_DATA nur Demodaten — nie gemischt, nie gespeichert. */
export function ladeSitzungen(heute: Date = new Date()): Sitzung[] {
  if (DEMO_DATA) return demoSitzungen(heute)
  const stimmungen = alleStimmungen()
  return [
    ...alleRunden().map((r) => ausWolkensammeln(r, stimmungen)),
    ...alleSitzungen().map((s) => ausHimmelsroute(s, stimmungen)),
  ].sort((a, b) => a.zeitpunkt.getTime() - b.zeitpunkt.getTime())
}

/** Stimmungen je Tag — mit DEMO_DATA die erfundenen, sonst die gespeicherten */
export function ladeStimmungen(heute: Date = new Date()): Stimmungen {
  return DEMO_DATA ? { ...demoStimmungen(heute), ...alleStimmungenHeute(heute) } : alleStimmungen()
}

/** Die heute eingestellte Stimmung gilt auch im Demo-Betrieb (sonst ließe sich der Regler nicht ausprobieren) */
function alleStimmungenHeute(heute: Date): Stimmungen {
  const eigene = alleStimmungen()
  const tag = tagesSchluessel(heute)
  return tag in eigene ? { [tag]: eigene[tag] } : {}
}
