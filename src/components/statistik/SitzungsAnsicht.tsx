import MiniRoute from '../himmelsroute/MiniRoute'
import { StufenDiagramm } from './Diagramme'
import type { Sitzung } from '../../lib/sitzungen'
import { dauer, delta, einheit, mitEinheit, prozent, startTexte, zahl } from '../../lib/startTexte'

/*
  Eine Sitzung (Master start-statistik, Abschnitt 4 „Sitzung"): groß
  „{Vor} → {Nach}" mit Einheit, darunter Δ; Wolkensammeln mit Stufenverlauf
  und Pausenmarke, Himmelsroute mit zwei Mini-Routen (vor und nach der
  Pause); Zeilen im Stil von 460:347 (Label links, Wert rechts).
*/

const t = startTexte.statistik

function Zeile({ label, wert, zusatz }: { label: string; wert: string; zusatz?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="font-medium text-[#6a6a6a]">
        <span className="block leading-8">{label}</span>
        {zusatz && <span className="block leading-5">{zusatz}</span>}
      </span>
      <span className="text-right font-semibold leading-8 text-black">{wert}</span>
    </div>
  )
}

export default function SitzungsAnsicht({ sitzung: s }: { sitzung: Sitzung }) {
  const gross = s.nach === null ? mitEinheit(s.spiel, s.vor) : `${zahl(s.vor)} → ${mitEinheit(s.spiel, s.nach)}`
  const puls =
    s.pulsVorher === null ? '–' : s.pulsNachher === null ? String(s.pulsVorher) : `${s.pulsVorher} → ${s.pulsNachher}`
  return (
    <div>
      {/* große Zahl im Stil des Ergebnis-Sheets (460:347), Einheit und Δ darunter */}
      <div className="text-center" aria-label={s.delta === null ? gross : `${gross}, ${delta(s.delta)}`}>
        <div className="whitespace-nowrap text-[56px] font-extrabold leading-[68px] tracking-[-0.01em]" style={{ fontVariantNumeric: 'tabular-nums' }} aria-hidden>
          {s.nach === null ? zahl(s.vor) : `${zahl(s.vor)} → ${zahl(s.nach)}`}
        </div>
        <p className="text-[14px] leading-5 text-[#6a6a6a]" aria-hidden>
          {einheit(s.spiel, s.nach ?? s.vor)}
          {s.delta !== null && ` · ${delta(s.delta)}`}
        </p>
      </div>

      {s.spiel === 'wolkensammeln' && s.stufen && s.stufen.length > 0 && (
        <div className="mt-4" aria-label={gross}>
          <StufenDiagramm stufen={s.stufen} pauseNach={s.pauseNach} pauseLabel={t.zeilen.pause} />
        </div>
      )}
      {s.spiel === 'himmelsroute' && s.nach !== null && (
        <div className="mt-2 flex items-end justify-center gap-2" aria-label={gross}>
          <div className="flex flex-col items-center">
            <MiniRoute wegpunkte={s.vor} className="" />
            <span className="text-[14px] font-semibold">{mitEinheit('himmelsroute', s.vor)}</span>
          </div>
          <span className="mb-10 text-[20px] font-semibold text-[#6a6a6a]" aria-hidden>
            →
          </span>
          <div className="flex flex-col items-center">
            <MiniRoute wegpunkte={s.nach} className="" />
            <span className="text-[14px] font-semibold">{mitEinheit('himmelsroute', s.nach)}</span>
          </div>
        </div>
      )}

      <div className="mt-5 text-[14px]">
        {s.bedingung !== null && (
          <Zeile
            label={t.zeilen.pause}
            wert={t.bedingung[s.bedingung]}
            zusatz={s.verhalten === 'ohneBewegung' && s.bedingung === 'bewegung' ? t.ohneBewegung : undefined}
          />
        )}
        <Zeile label={t.zeilen.puls} wert={puls} />
        <Zeile label={t.zeilen.stimmung} wert={s.stimmung === null ? '–' : startTexte.stimmung.stufen[s.stimmung - 1]} />
        <Zeile label={t.zeilen.dauer} wert={s.dauerMs === null ? '–' : dauer(s.dauerMs)} />
        {s.trefferquote !== null && <Zeile label={t.zeilen.trefferquote} wert={prozent(s.trefferquote)} />}
        {s.endeGrund !== null && <Zeile label={t.zeilen.ende} wert={t.endeGruende[s.endeGrund]} />}
      </div>
    </div>
  )
}

