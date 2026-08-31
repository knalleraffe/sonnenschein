import { woche, heuteIndex } from '../../data/mock'

/**
 * Wochenleiste Mo–So mit je einem runden Wert-Chip.
 * Der heutige Tag bekommt ein helles, abgerundetes Feld als Hintergrund.
 */
export default function WeekStrip() {
  return (
    <div className="flex justify-between">
      {woche.map((eintrag, index) => {
        const istHeute = index === heuteIndex
        return (
          <div
            key={eintrag.tag}
            className={`flex w-11 flex-col items-center gap-2.5 rounded-2xl py-2 ${
              istHeute ? 'bg-white/40' : ''
            }`}
          >
            <span className="text-[13px] font-bold leading-none text-ink">{eintrag.tag}</span>
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-pill bg-surface-card text-[13px] font-semibold leading-none text-ink shadow-card">
              {eintrag.wert}
            </span>
          </div>
        )
      })}
    </div>
  )
}
