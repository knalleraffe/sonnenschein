import type { Sitzung } from '../lib/sitzungen'
import type { Stimmungen } from '../lib/stimmung'
import { tagesSchluessel } from '../lib/stimmung'
import type { DurchgangsEnde } from '../games/himmelsroute/types'

/*
  Demodaten für den Prototyp (Master start-statistik, Abschnitt 2):
  24 plausible Sitzungen über 5 Wochen, beide Spiele, beide Bedingungen
  ausgewogen, Bewegung im Schnitt etwas besser als Ruhe, mit Streuung,
  Pulsanstiege 10–50 Schläge, Stimmungen an den meisten Tagen.
  Fester Startwert — bei jedem Laden dieselben Werte relativ zu heute.
  Werden nie gespeichert und nie mit echten Daten gemischt.
*/

/** Demodaten statt echter Daten zeigen */
export const DEMO_DATA = true

const ANZAHL = 24
const TAGE = 35

function zufall(startwert: number) {
  let a = startwert
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rund1 = (z: number) => Math.round(z * 10) / 10

/** Trainingstage: 24 verschiedene Tage in den letzten 35, heute eingeschlossen nicht zwingend */
function tagesVersaetze(z: () => number): number[] {
  const tage = new Set<number>()
  while (tage.size < ANZAHL) tage.add(1 + Math.floor(z() * (TAGE - 1)))
  return [...tage].sort((a, b) => b - a)
}

export function demoStimmungen(heute: Date): Stimmungen {
  const z = zufall(7)
  const stimmungen: Stimmungen = {}
  for (let versatz = 1; versatz < TAGE; versatz++) {
    // an den meisten Tagen, nicht an allen
    if (z() < 0.1) continue
    const tag = new Date(heute)
    tag.setDate(heute.getDate() - versatz)
    stimmungen[tagesSchluessel(tag)] = 2 + Math.floor(z() * 4)
  }
  return stimmungen
}

export function demoSitzungen(heute: Date): Sitzung[] {
  const z = zufall(2026)
  const stimmungen = demoStimmungen(heute)
  const versaetze = tagesVersaetze(z)
  // ausgewogen: je Spiel abwechselnd Bewegung und Ruhe
  const zaehler = { wolkensammeln: 0, himmelsroute: 0 }

  return versaetze.map((versatz, i): Sitzung => {
    const spiel = i % 2 === 0 ? 'wolkensammeln' : 'himmelsroute'
    const bedingung = zaehler[spiel]++ % 2 === 0 ? 'bewegung' : 'ruhe'
    const zeitpunkt = new Date(heute)
    zeitpunkt.setDate(heute.getDate() - versatz)
    zeitpunkt.setHours(8 + Math.floor(z() * 12), Math.floor(z() * 60), 0, 0)
    const stimmung = stimmungen[tagesSchluessel(zeitpunkt)] ?? null
    const stimmungsBonus = stimmung === null ? 0 : (stimmung - 3) * 0.15

    // Bewegung: meist bewegt, manchmal ohne Bewegung fortgefahren
    const verhalten = bedingung === 'bewegung' ? (z() < 0.85 ? 'bewegt' : 'ohneBewegung') : null
    const pulsVorher = 62 + Math.floor(z() * 16)
    const anstieg = verhalten === 'bewegt' ? 10 + Math.floor(z() * 41) : null
    const pulsNachher = anstieg === null ? null : pulsVorher + anstieg
    // Bewegung etwas besser als Ruhe, am besten bei mittlerem Anstieg (20–40)
    const pulsBonus = anstieg === null ? 0 : anstieg >= 20 && anstieg < 40 ? 0.3 : 0

    if (spiel === 'wolkensammeln') {
      const vor = rund1(4.6 + z() * 1.6 + stimmungsBonus)
      const effekt = (bedingung === 'bewegung' ? 0.5 + pulsBonus : 0.15) + (z() * 2 - 1) * 0.5
      const nach = rund1(vor + effekt)
      const stufen = stufenVerlauf(z, vor, nach)
      return {
        id: `demo-${i}`,
        spiel,
        zeitpunkt,
        vor,
        nach,
        delta: rund1(nach - vor),
        bedingung,
        verhalten,
        pulsVorher,
        pulsNachher,
        stimmung,
        dauerMs: (4 + z() * 3) * 60000,
        endeGrund: null,
        trefferquote: 0.66 + z() * 0.08,
        stufen,
        pauseNach: 10,
      }
    }

    const vor = Math.max(3, Math.round(4 + z() * 3 + stimmungsBonus * 2))
    const effekt = (bedingung === 'bewegung' ? 0.7 + pulsBonus * 2 : 0.2) + (z() * 2 - 1) * 1.1
    const nach = Math.max(0, Math.min(11, Math.round(vor + effekt)))
    const gruende: DurchgangsEnde[] = ['zweiterFehlversuch', 'zweiterFehlversuch', 'mehrAlsHaelfteFalsch']
    return {
      id: `demo-${i}`,
      spiel,
      zeitpunkt,
      vor,
      nach,
      delta: nach - vor,
      bedingung,
      verhalten,
      pulsVorher,
      pulsNachher,
      stimmung,
      dauerMs: (6 + z() * 4) * 60000,
      endeGrund: gruende[Math.floor(z() * gruende.length)],
      trefferquote: null,
      stufen: null,
      pauseNach: null,
    }
  })
}

/** 20 Durchgänge Wolkensammeln: Treppe um den Vor-Wert, nach der Pause um den Nach-Wert */
function stufenVerlauf(z: () => number, vor: number, nach: number): number[] {
  const stufen: number[] = []
  let stufe = 3
  for (let i = 0; i < 20; i++) {
    const ziel = i < 10 ? vor : nach
    stufe += stufe < ziel ? 1 : stufe > ziel + 0.5 ? -1 : z() < 0.5 ? 1 : -1
    stufe = Math.max(3, Math.min(10, stufe))
    stufen.push(stufe)
  }
  return stufen
}
