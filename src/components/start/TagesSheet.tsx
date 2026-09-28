import Sheet from '../ui/Sheet'
import { knopfPrimaer } from '../spiel/SpielSheets'
import { tagesZeile } from '../../lib/kennzahlen'
import type { Sitzung } from '../../lib/sitzungen'
import { langesDatum, startTexte } from '../../lib/startTexte'

/*
  Tages-Sheet (kein Figma-Design): Titel „{Wochentag}, {Tag}. {Monat}",
  je Sitzung eine Zeile im Zeilen-Stil von 460:347, primärer Button
  „Zur Statistik". Gemeinsame Sheet-Komponente der Spiele.
*/
export default function TagesSheet({
  tag,
  sitzungen,
  onZurStatistik,
  onSchliessen,
}: {
  tag: Date
  sitzungen: Sitzung[]
  onZurStatistik: (s: Sitzung) => void
  onSchliessen: () => void
}) {
  return (
    <Sheet variante="karte" onClose={onSchliessen}>
      <div>
        <h2 id="sheet-titel" className="mt-[35px] text-[26px] font-semibold leading-8 tracking-[-0.01em]">
          {langesDatum(tag)}
        </h2>
        <ul className="mt-4 text-[14px]">
          {sitzungen.map((s) => (
            <li key={s.id} className="font-medium leading-8 text-[#6a6a6a]">
              {tagesZeile(s)}
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => onZurStatistik(sitzungen[0])} className={`mt-[18px] ${knopfPrimaer}`}>
          {startTexte.tagesSheet.primaer}
        </button>
      </div>
    </Sheet>
  )
}
