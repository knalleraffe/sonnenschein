import { useMemo } from 'react'
import { motion } from 'motion/react'
import { AtmenderEchoo, ECHOO_LAYOUT, echooUebergang } from '../components/start/EchooKopf'
import { ladeSitzungen } from '../lib/sitzungen'
import { echooZustand } from '../lib/kennzahlen'

/*
  Sonnenschein-Screen: Echoo füllt den Screen, sein Körper läuft unten
  hinaus. Zustand wie auf der Startseite (letzte Messungen gegen den
  eigenen Schnitt); von dort wächst er per geteilter layoutId hier hinein.
*/
export default function Avatar() {
  const zustand = useMemo(() => echooZustand(ladeSitzungen()).zustand, [])
  return (
    <div className="h-full" style={{ background: 'var(--grad-avatar)' }}>
      <motion.div layoutId={ECHOO_LAYOUT} transition={echooUebergang} className="h-full">
        <AtmenderEchoo zustand={zustand} groesse="full" />
      </motion.div>
    </div>
  )
}
