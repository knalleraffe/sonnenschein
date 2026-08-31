import Card from '../ui/Card'
import { modi } from '../../data/modes'
import type { Balance } from '../../lib/statistik'

/*
  Balance-Karte: ein waagerechter Balken, links das Langsame,
  rechts das Schnelle; die Trennstelle sitzt am Verhältnis.
*/
export default function BalanceCard({ balance }: { balance: Balance }) {
  return (
    <Card className="p-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[28px] font-bold leading-none" style={{ color: modi.langsam.farbe }}>
            {balance.langsam}
          </div>
          <div className="mt-1 text-[12px] font-medium text-ink-muted">{modi.langsam.name}</div>
        </div>
        <div className="text-right">
          <div className="text-[28px] font-bold leading-none" style={{ color: modi.schnell.farbe }}>
            {balance.schnell}
          </div>
          <div className="mt-1 text-[12px] font-medium text-ink-muted">{modi.schnell.name}</div>
        </div>
      </div>

      {/* Balken mit Trennstelle am Verhältnis */}
      <div className="mt-4 flex h-4 overflow-hidden rounded-pill">
        <div
          style={{
            width: `${(1 - balance.anteilSchnell) * 100}%`,
            background: modi.langsam.farbe,
          }}
        />
        <div className="w-[3px] bg-surface-card" />
        <div className="flex-1" style={{ background: modi.schnell.farbe }} />
      </div>

      <p className="mt-3 text-[13px] leading-snug text-ink-muted">{balance.text}</p>
    </Card>
  )
}
