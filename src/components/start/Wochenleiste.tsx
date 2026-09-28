import type { WochenTag } from '../../lib/kennzahlen'
import { startTexte } from '../../lib/startTexte'
import { glasPille, kurve } from './stil'

/*
  Fester Kopf der Startseite (Figma 513:1605, beim Scrollen 513:1606):
  weiße Karte, Radius 28. Titel „Heute" mittig, rechts die Glas-Pille
  „{x} von 7 Tagen" (statt der Flamme — Streaks entfallen). Darunter Mo–So:
  weißer Chip mit Punkt in Akzentfarbe an Tagen mit Messung (statt Zahl),
  heute mit Glas-Pille dahinter, zukünftige Tage gedämpft. Tage mit Messung
  öffnen das Tages-Sheet. Kompakt klappt die Tageszeile per
  grid-template-rows weg (190 → 102 px).
*/

const AKZENT = '#ffba3a'
const KLAPPEN = `grid-template-rows 350ms cubic-bezier(${kurve.join(', ')}), opacity 250ms cubic-bezier(${kurve.join(', ')})`

export default function Wochenleiste({
  tage,
  pille,
  kompakt,
  onTag,
}: {
  tage: WochenTag[]
  pille: string
  kompakt: boolean
  onTag: (tag: WochenTag) => void
}) {
  return (
    <div className="px-6 pb-3 pt-[50px]">
      <div className="relative flex h-10 items-center justify-center">
        <h1 className="text-[18px] font-semibold leading-3 text-black">{startTexte.woche.titel}</h1>
        <span className={`absolute right-0 flex h-10 items-center px-4 text-[14px] font-medium leading-3 text-black ${glasPille}`}>{pille}</span>
      </div>
      <div className="grid" style={{ gridTemplateRows: kompakt ? '0fr' : '1fr', opacity: kompakt ? 0 : 1, transition: KLAPPEN }} aria-hidden={kompakt}>
        <div className="min-h-0 overflow-hidden">
          <div className="-mx-6 flex justify-between px-[23px] pb-2 pt-3">
            {tage.map((tag) => {
              const inhalt = (
                <>
                  <span className="text-[14px] font-semibold leading-3 text-black">{tag.kurz}</span>
                  <span className="flex size-8 items-center justify-center rounded-[24px] bg-white">
                    {tag.messung && <span className="size-2 rounded-full" style={{ background: AKZENT }} aria-hidden />}
                  </span>
                </>
              )
              const stil = `relative flex h-[68px] w-11 flex-col items-center gap-2 rounded-[80px] pt-3 ${
                tag.heute ? 'bg-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.12)]' : ''
              } ${tag.zukunft ? 'opacity-40' : ''}`
              return tag.messung ? (
                <button
                  key={tag.kurz}
                  type="button"
                  tabIndex={kompakt ? -1 : 0}
                  className={stil}
                  onClick={() => onTag(tag)}
                  aria-label={`${tag.kurz}: Messung ansehen`}
                >
                  {inhalt}
                </button>
              ) : (
                <div key={tag.kurz} className={stil} aria-label={`${tag.kurz}: keine Messung`}>
                  {inhalt}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
