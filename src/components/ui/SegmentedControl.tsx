/*
  Segmented Control (z. B. „7 Tage / 30 Tage / Alles").
  Das Gleiten der aktiven Pille kommt in Meilenstein 3 (Animation).
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
  return (
    <div className="flex rounded-pill bg-cream p-1">
      {optionen.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`flex-1 rounded-pill px-4 py-2 text-[13px] font-semibold transition-colors ${
            wert === option.id ? 'bg-surface-card text-ink shadow-card' : 'text-ink-muted'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
