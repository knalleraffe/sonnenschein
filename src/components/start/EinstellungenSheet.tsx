import Sheet from '../ui/Sheet'
import { knopfSekundaer } from '../spiel/SpielSheets'
import { einfuehrungsTexte } from '../../einfuehrung/texte'

/*
  Einstellungen der App (kein Figma-Design): gemeinsame Sheet-Komponente,
  Titel wie das Einstellungen-Sheet der Spiele, bisher ein Eintrag —
  „Einführung ansehen" öffnet das Onboarding erneut.
*/
export default function EinstellungenSheet({ onEinfuehrung, onSchliessen }: { onEinfuehrung: () => void; onSchliessen: () => void }) {
  return (
    <Sheet variante="karte" onClose={onSchliessen}>
      <div>
        <h2 id="sheet-titel" className="mt-[35px] text-[26px] font-semibold leading-8 tracking-[-0.01em]">
          Einstellungen
        </h2>
        <button type="button" onClick={onEinfuehrung} className={`mt-6 ${knopfSekundaer}`}>
          {einfuehrungsTexte.einstellungenEintrag}
        </button>
      </div>
    </Sheet>
  )
}
