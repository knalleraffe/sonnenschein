import { motion, useReducedMotion } from 'motion/react'
import { easeAus } from '../../lib/motion'

/*
  Tab-Leiste im Kopf des Statistiken-Screens.
  Die Unterstreichung des aktiven Tabs gleitet horizontal mit (layoutId)
  und fährt beim ersten Aufbau aus der Mitte auf ihre Breite aus.
*/
export default function StatTabs<T extends string>({
  tabs,
  aktiv,
  onChange,
}: {
  tabs: { id: T; label: string }[]
  aktiv: T
  onChange: (neu: T) => void
}) {
  const reduziert = useReducedMotion()

  return (
    <div className="flex gap-1" role="tablist" aria-label="Ansichten">
      {tabs.map((tab) => {
        const istAktiv = tab.id === aktiv
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={istAktiv}
            onClick={() => onChange(tab.id)}
            className={`relative flex h-11 items-center px-2.5 text-[13px] font-semibold ${
              istAktiv ? 'text-ink' : 'text-ink-muted'
            }`}
          >
            {tab.label}
            {istAktiv && (
              <motion.span
                layoutId="stat-tab-linie"
                className="absolute inset-x-2 bottom-0 h-[3px] rounded-pill bg-sun-deep"
                initial={reduziert ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={
                  reduziert
                    ? { duration: 0 }
                    : { layout: { duration: 0.35, ease: easeAus }, scaleX: { duration: 0.4, ease: easeAus } }
                }
                style={{ transformOrigin: 'center' }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
