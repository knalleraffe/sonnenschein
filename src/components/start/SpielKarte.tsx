import { forwardRef } from 'react'
import MiniRoute from '../himmelsroute/MiniRoute'
import { modi } from '../../data/modes'
import { spielNamen, startTexte, type SpielId } from '../../lib/startTexte'
import { glasPille, himmelVerlauf, karte } from './stil'
import { oeffentlich } from '../../lib/pfad'

/*
  Spielkarte (Figma 513:1427: weiß, 167 × 180, Radius 28): Bild aus der Spielszene, Name,
  Modus-Label aus modes.ts, letzter Vor-Wert oder „Noch nicht gespielt",
  dazu die Glas-Pille „Heute dran". Das Bild (Himmel aus 315:3007) ist auch
  der Anfang des Container Transforms ins Spiel.
*/

export const spielModus: Record<SpielId, keyof typeof modi> = {
  wolkensammeln: 'schnell',
  himmelsroute: 'langsam',
}

/** Bild der Spielszene: Wolken am Himmel bzw. Erde mit Route */
export function SpielBild({ spiel }: { spiel: SpielId }) {
  return (
    <div className="relative h-[96px] overflow-hidden" style={{ background: himmelVerlauf }} aria-hidden>
      {spiel === 'wolkensammeln' ? (
        <>
          <img src={oeffentlich('/wolkensammeln-intro/wolke-2.svg')} alt="" className="absolute left-[10px] top-[14px] w-[72px]" />
          <img src={oeffentlich('/wolkensammeln-intro/wolke-3.svg')} alt="" className="absolute left-[84px] top-[34px] w-[70px]" />
          <img src={oeffentlich('/wolkensammeln-intro/wolke-5.svg')} alt="" className="absolute left-[30px] top-[58px] w-[60px]" />
        </>
      ) : (
        <div className="absolute left-1/2 top-0 origin-top -translate-x-1/2 scale-[0.75]">
          <MiniRoute wegpunkte={3} className="" />
        </div>
      )}
    </div>
  )
}

const SpielKarte = forwardRef<
  HTMLButtonElement,
  { spiel: SpielId; wert: string; heuteDran: boolean; onStart: () => void }
>(function SpielKarte({ spiel, wert, heuteDran, onStart }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onStart}
      className={`flex h-[180px] w-full flex-col overflow-hidden text-left ${karte}`}
      aria-label={`${spielNamen[spiel]} starten`}
    >
      <div className="relative w-full">
        <SpielBild spiel={spiel} />
        {heuteDran && (
          <span className={`absolute left-2 top-2 flex h-8 items-center px-3 text-[12px] font-medium leading-3 text-black ${glasPille}`}>
            {startTexte.spiele.heuteDran}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center px-3">
        <div className="text-[16px] font-semibold leading-5 text-ink">{spielNamen[spiel]}</div>
        <div className="text-[12px] leading-4 text-[#6a6a6a]">{modi[spielModus[spiel]].name}</div>
        <div className="mt-1 text-[12px] font-medium leading-4 text-ink">{wert}</div>
      </div>
    </button>
  )
})

export default SpielKarte
