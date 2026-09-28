import { useId } from 'react'
import { motion } from 'motion/react'
import { spring, springTap, tap } from '../../lib/motion'

/*
  Segmented Control (z. B. „7 Tage / 30 Tage / Alles").
  Die aktive Pille GLEITET zwischen den Positionen (layoutId),
  sie blendet nie aus und woanders wieder ein.
*/
interface Option<T extends string> {
  id: T
  label: string
}

export default function SegmentedControl<T extends string>({
  optionen,
  wert,
  onChange,
}: {
  optionen: Option<T>[]
  wert: T
  onChange: (neu: T) => void
}) {
  const gruppenId = useId()

  return (
    <div className="flex rounded-pill bg-cream p-1">
      {optionen.map((option) => (
        <motion.button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          whileTap={tap}
          transition={springTap}
          className={`relative flex-1 rounded-pill px-4 py-2 text-[13px] font-semibold transition-colors ${
            wert === option.id ? 'text-ink' : 'text-ink-muted'
          }`}
        >
          {wert === option.id && (
            <motion.span
              layoutId={`${gruppenId}-aktive-pille`}
              transition={{ ...spring, duration: 0.35 }}
              /* Während des Gleitens weitet sich die Pille kurz um 4 % */
              animate={{ scaleX: [1, 1.04, 1] }}
              className="absolute inset-0 rounded-pill bg-surface-card shadow-card"
            />
          )}
          <span className="relative z-10">{option.label}</span>
        </motion.button>
      ))}
    </div>
  )
}
