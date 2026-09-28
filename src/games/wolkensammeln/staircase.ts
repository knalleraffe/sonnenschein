import { konfig } from './config'
import { naechsteStufe } from '../staircase'

/*
  Die Treppe: zwei richtig → eine Stufe hoch, ein Fehler → eine runter.
  Der Zähler „zwei hintereinander" beginnt nach jeder Längenänderung
  von vorn. Umkehrpunkte (Richtungswechsel) werden für die Spanne
  festgehalten.
*/

export interface Treppe {
  laenge: number
  richtigeSeitAenderung: number
  /** Länge zum Zeitpunkt jedes Richtungswechsels */
  umkehrLaengen: number[]
  letzteRichtung: -1 | 0 | 1
}

export function neueTreppe(): Treppe {
  return {
    laenge: konfig.startLaenge,
    richtigeSeitAenderung: 0,
    umkehrLaengen: [],
    letzteRichtung: 0,
  }
}

/** Verbucht einen Haupt-Durchgang und liefert die neue Treppe */
export function verbucheErgebnis(treppe: Treppe, richtig: boolean): Treppe {
  const t = { ...treppe, umkehrLaengen: [...treppe.umkehrLaengen] }

  let richtung: -1 | 0 | 1 = 0
  if (richtig) {
    t.richtigeSeitAenderung += 1
    if (t.richtigeSeitAenderung >= 2) {
      richtung = 1
      t.richtigeSeitAenderung = 0
    }
  } else {
    richtung = -1
    t.richtigeSeitAenderung = 0
  }

  if (richtung !== 0) {
    // Umkehr = die Richtung wechselt gegenüber der letzten Änderung
    if (t.letzteRichtung !== 0 && richtung !== t.letzteRichtung) {
      t.umkehrLaengen.push(t.laenge)
    }
    t.letzteRichtung = richtung
    t.laenge = naechsteStufe(t.laenge, richtung === 1, richtung === 1 ? 2 : 0, konfig.minLaenge, konfig.maxLaenge)
  }

  return t
}
