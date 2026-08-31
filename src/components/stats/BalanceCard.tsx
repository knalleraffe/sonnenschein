import { motion, useReducedMotion } from 'motion/react'
import Card from '../ui/Card'
import ZaehlZahl from '../ui/ZaehlZahl'
import { modi } from '../../data/modes'
import { springSoft } from '../../lib/motion'
import type { Balance } from '../../lib/statistik'

/*
  Balance-Karte: ein waagerechter Balken, links das Langsame,
  rechts das Schnelle. Beim Zeitraumwechsel wandert die Trennstelle
  federnd an die neue Position, die Zahlen zählen mit.
  Es werden nur transform und opacity animiert (kein width).
*/
export default function BalanceCard({ balance }: { balance: Balance }) {
  const reduziert = useReducedMotion()
  const feder = reduziert ? { duration: 0 } : springSoft
  const anteilLangsam = 1 - balance.anteilSchnell

  return (
    <Card className="p-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[28px] font-bold leading-none" style={{ color: modi.langsam.farbe }}>
            <ZaehlZahl wert={balance.langsam} />
          </div>
          <div className="mt-1 text-[12px] font-medium text-ink-muted">{modi.langsam.name}</div>
        </div>
        <div className="text-right">
          <div className="text-[28px] font-bold leading-none" style={{ color: modi.schnell.farbe }}>
            <ZaehlZahl wert={balance.schnell} />
          </div>
          <div className="mt-1 text-[12px] font-medium text-ink-muted">{modi.schnell.name}</div>
        </div>
      </div>

      {/* Balken: das Schnelle liegt unten, das Langsame wird darüber skaliert */}
      <div className="relative mt-4 h-4 overflow-hidden rounded-pill">
        <div className="absolute inset-0" style={{ background: modi.schnell.farbe }} />
        <motion.div
          className="absolute inset-0"
          style={{ background: modi.langsam.farbe, transformOrigin: 'left center' }}
          animate={{ scaleX: anteilLangsam }}
          transition={feder}
        />
        {/* Trennstelle: wandert per transform über die volle Breite */}
        <motion.div
          className="absolute inset-0"
          animate={{ x: `${anteilLangsam * 100}%` }}
          transition={feder}
        >
          <div className="h-full w-[3px] -translate-x-1/2 bg-surface-card" />
        </motion.div>
      </div>

      <p className="mt-3 text-[13px] leading-snug text-ink-muted">{balance.text}</p>
    </Card>
  )
}
