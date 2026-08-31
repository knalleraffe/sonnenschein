import { useMemo, useState } from 'react'
import Card from '../components/ui/Card'
import SegmentedControl from '../components/ui/SegmentedControl'
import BalanceCard from '../components/stats/BalanceCard'
import VerlaufsChart from '../components/stats/VerlaufsChart'
import TagesrhythmusChart from '../components/stats/TagesrhythmusChart'
import BewegungsCard from '../components/stats/BewegungsCard'
import {
  berechneBalance,
  berechneBeobachtungen,
  berechneBewegungsvergleich,
  berechneTagesrhythmus,
  eintraegeFuerZeitraum,
  zeitraumListe,
  type Zeitraum,
} from '../lib/statistik'

/* Statistiken: Was zeigen meine Daten über mich? Ruhig und hell gehalten. */
export default function Statistiken() {
  const [zeitraum, setZeitraum] = useState<Zeitraum>('7')

  const eintraege = useMemo(() => eintraegeFuerZeitraum(zeitraum), [zeitraum])
  const balance = useMemo(() => berechneBalance(zeitraum), [zeitraum])
  const rhythmus = useMemo(() => berechneTagesrhythmus(zeitraum), [zeitraum])
  const bewegung = useMemo(() => berechneBewegungsvergleich(zeitraum), [zeitraum])
  const beobachtungen = useMemo(() => berechneBeobachtungen(), [])

  return (
    <div className="min-h-full bg-surface px-6 pb-32 pt-14">
      <h1 className="text-[24px] font-bold">Deine Daten</h1>

      <div className="mt-4">
        <SegmentedControl optionen={zeitraumListe} wert={zeitraum} onChange={setZeitraum} />
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <BalanceCard balance={balance} />
        <VerlaufsChart eintraege={eintraege} />
        <TagesrhythmusChart bloecke={rhythmus.bloecke} text={rhythmus.text} />
        <BewegungsCard vergleich={bewegung} />

        <section>
          <h2 className="px-1 text-[16px] font-bold">Beobachtungen</h2>
          <div className="mt-3 flex flex-col gap-3">
            {beobachtungen.map((satz) => (
              <Card key={satz} className="p-4">
                <p className="text-[14px] leading-snug">{satz}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
