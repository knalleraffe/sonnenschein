import Card from '../ui/Card'
import { modi } from '../../data/modes'
import type { Bewegungsvergleich } from '../../lib/statistik'

/*
  Bewegungsphase: Vergleich der Werte an Tagen mit und ohne
  Bewegungsphase. Die Anzahl der Tage steht klein dabei —
  damit sichtbar bleibt, auf wie wenigen Daten die Aussage beruht (N=1).
*/

const BALKEN_MAX = 72 // Höhe in px für den Wert 100

function Balkenpaar({
  titel,
  werte,
  anzahlTage,
}: {
  titel: string
  werte: { langsam: number; schnell: number }
  anzahlTage: number
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div className="flex h-[100px] items-end gap-2">
        {(['langsam', 'schnell'] as const).map((id) => (
          <div key={id} className="flex flex-col items-center gap-1">
            <span className="text-[12px] font-bold" style={{ color: modi[id].farbe }}>
              {werte[id]}
            </span>
            <div
              className="rounded-t-[5px]"
              style={{
                width: id === 'langsam' ? 18 : 11,
                height: Math.max(4, (BALKEN_MAX * werte[id]) / 100),
                background: modi[id].farbe,
              }}
            />
          </div>
        ))}
      </div>
      <div className="text-center">
        <div className="text-[13px] font-semibold">{titel}</div>
        <div className="text-[11px] text-ink-muted">
          {anzahlTage} {anzahlTage === 1 ? 'Tag' : 'Tage'}
        </div>
      </div>
    </div>
  )
}

export default function BewegungsCard({ vergleich }: { vergleich: Bewegungsvergleich }) {
  return (
    <Card className="p-5">
      <h2 className="text-[16px] font-bold">Bewegungsphase</h2>
      <div className="mt-4 flex gap-4">
        <Balkenpaar
          titel="Mit Bewegungsphase"
          werte={vergleich.mit.werte}
          anzahlTage={vergleich.mit.anzahlTage}
        />
        <Balkenpaar
          titel="Ohne Bewegungsphase"
          werte={vergleich.ohne.werte}
          anzahlTage={vergleich.ohne.anzahlTage}
        />
      </div>
    </Card>
  )
}
