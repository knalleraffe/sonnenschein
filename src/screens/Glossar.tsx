import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Search } from 'lucide-react'
import { glossar, kategorieListe, type Kategorie } from '../data/glossar'
import { spring, springTap, tap } from '../lib/motion'

/*
  Glossar: Suchfeld, waagerecht scrollbare Kategorie-Chips und die
  Begriffsliste. Beim Filtern gleiten bleibende Karten an ihre neue
  Position, wegfallende schrumpfen und blenden aus — nichts springt.
  Die Detailansicht (wachsende Karte) folgt in Meilenstein 5.
*/
export default function Glossar() {
  const reduziert = useReducedMotion()
  const [suche, setSuche] = useState('')
  const [kategorie, setKategorie] = useState<'Alle' | Kategorie>('Alle')

  const gefiltert = useMemo(() => {
    const begriff = suche.trim().toLowerCase()
    return glossar.filter((eintrag) => {
      const passtKategorie = kategorie === 'Alle' || eintrag.kategorie === kategorie
      const passtSuche =
        begriff === '' ||
        eintrag.begriff.toLowerCase().includes(begriff) ||
        eintrag.anriss.toLowerCase().includes(begriff) ||
        eintrag.erklaerung.toLowerCase().includes(begriff)
      return passtKategorie && passtSuche
    })
  }, [suche, kategorie])

  const feder = reduziert ? { duration: 0 } : spring

  return (
    <div className="min-h-full bg-surface pb-32 pt-14">
      <h1 className="px-6 text-[24px] font-bold">Glossar</h1>

      {/* Suchfeld */}
      <div className="mx-6 mt-4 flex items-center gap-2 rounded-pill bg-cream px-4 py-2.5">
        <Search size={16} className="shrink-0 text-ink-muted" />
        <input
          type="search"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          placeholder="Begriff suchen"
          className="w-full bg-transparent text-[14px] outline-none placeholder:text-ink-muted"
        />
      </div>

      {/* Kategorie-Chips, waagerecht scrollbar */}
      <div
        className="mt-3 flex gap-2 overflow-x-auto px-6 pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {kategorieListe.map((eintrag) => (
          <motion.button
            key={eintrag}
            type="button"
            onClick={() => setKategorie(eintrag)}
            whileTap={tap}
            transition={springTap}
            className={`shrink-0 rounded-pill px-4 py-2 text-[13px] font-semibold transition-colors ${
              kategorie === eintrag
                ? 'bg-ink text-surface-card'
                : 'bg-cream text-ink'
            }`}
          >
            {eintrag}
          </motion.button>
        ))}
      </div>

      {/* Begriffsliste mit animiertem Umordnen */}
      <div className="mx-6 mt-4 flex flex-col gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {gefiltert.map((eintrag) => (
            <motion.button
              key={eintrag.id}
              layout
              type="button"
              initial={reduziert ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduziert ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              whileTap={tap}
              transition={feder}
              className="rounded-card bg-surface-card p-4 text-left shadow-card"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-[15px] font-bold">{eintrag.begriff}</h2>
                <span className="shrink-0 text-[11px] font-medium text-ink-muted">
                  {eintrag.kategorie}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] leading-snug text-ink-muted">{eintrag.anriss}</p>
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Ruhige Zeile bei null Ergebnissen */}
        {gefiltert.length === 0 && (
          <p className="px-1 pt-4 text-[14px] text-ink-muted">
            Keine Einträge zu „{suche.trim()}".
          </p>
        )}
      </div>
    </div>
  )
}
