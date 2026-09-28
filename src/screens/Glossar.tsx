import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Search, X } from 'lucide-react'
import { glossar, kategorieListe, type GlossarEintrag, type Kategorie } from '../data/glossar'
import { spring, springTap, tap } from '../lib/motion'
import { fliessStil, glasPille, karte } from '../components/start/stil'

/*
  Glossar: Suchfeld, Kategorie-Chips, Begriffsliste.
  Tippt man eine Karte an, wächst SIE SELBST zur Detailansicht
  (geteilte layoutIds für Fläche, Titel und Kategorie).
  Schließen: Knopf oder Herunterziehen — die Wurfgeschwindigkeit
  entscheidet mit, nicht nur die Distanz.
*/

function DetailAnsicht({
  eintrag,
  onClose,
  onWechsel,
  reduziert,
}: {
  eintrag: GlossarEintrag
  onClose: () => void
  onWechsel: (id: string) => void
  reduziert: boolean
}) {
  const feder = reduziert ? { duration: 0 } : spring
  const verwandte = eintrag.verwandt
    .map((id) => glossar.find((e) => e.id === id))
    .filter((e): e is GlossarEintrag => Boolean(e))

  return (
    <div className="absolute inset-0 z-40">
      <motion.div
        className="absolute inset-0 bg-ink/20 backdrop-blur-[8px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        layoutId={`karte-${eintrag.id}`}
        transition={feder}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.55, bottom: 1 }}
        onDragEnd={(_, info) => {
          // Schneller Wurf schließt auch bei kurzem Weg
          if (info.velocity.y > 500 || info.offset.y > 160) onClose()
        }}
        className="absolute inset-x-2 bottom-2 top-20 flex flex-col overflow-hidden rounded-b-[56px] rounded-t-[40px] bg-white shadow-[0_0_40px_rgba(0,0,0,0.12)]"
      >
        <div className="flex items-start justify-between px-6 pt-6">
          <motion.span
            layoutId={`kat-${eintrag.id}`}
            transition={feder}
            className="rounded-pill bg-[#fff8e6] px-3 py-1 text-[12px] font-semibold text-black"
          >
            {eintrag.kategorie}
          </motion.span>
          <motion.button
            type="button"
            aria-label="Detailansicht schließen"
            onClick={onClose}
            whileTap={tap}
            transition={springTap}
            className="flex h-10 w-10 items-center justify-center rounded-pill bg-[#fff8e6] text-black"
          >
            <X size={20} strokeWidth={1.8} />
          </motion.button>
        </div>

        <motion.h2
          layoutId={`titel-${eintrag.id}`}
          transition={feder}
          className="px-6 pt-3 text-[24px] font-bold"
        >
          {eintrag.begriff}
        </motion.h2>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-3">
          <p className="text-[15px] leading-relaxed text-[#1a1a1a]">{eintrag.erklaerung}</p>

          <h3 className="mt-6 text-[13px] font-bold text-[#6a6a6a]">Warum das hier vorkommt</h3>
          <p className="mt-1 text-[15px] leading-relaxed">{eintrag.warum}</p>

          {verwandte.length > 0 && (
            <>
              <h3 className="mt-6 text-[13px] font-bold text-[#6a6a6a]">Verwandte Begriffe</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {verwandte.map((v) => (
                  <motion.button
                    key={v.id}
                    type="button"
                    onClick={() => onWechsel(v.id)}
                    whileTap={tap}
                    transition={springTap}
                    className="sheet-secondary min-h-11 rounded-pill px-4 py-2 text-[13px] font-semibold text-black"
                  >
                    {v.begriff}
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function Glossar() {
  const reduziert = useReducedMotion()
  const [suche, setSuche] = useState('')
  const [kategorie, setKategorie] = useState<'Alle' | Kategorie>('Alle')
  const [aktivId, setAktivId] = useState<string | null>(null)

  const aktiv = useMemo(() => glossar.find((e) => e.id === aktivId) ?? null, [aktivId])

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
      <div className={`mx-6 mt-4 flex h-12 items-center gap-2 px-4 ${glasPille}`}>
        <Search size={20} strokeWidth={1.5} className="shrink-0 text-black" />
        <input
          type="search"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          placeholder="Begriff suchen"
          className="w-full bg-transparent text-[14px] font-medium text-black outline-none placeholder:text-[#6a6a6a]"
        />
      </div>

      {/* Kategorie-Chips, waagerecht scrollbar */}
      <div className="-mb-6 mt-1 flex gap-2 overflow-x-auto px-6 pb-8 pt-2">
        {kategorieListe.map((eintrag) => (
          <motion.button
            key={eintrag}
            type="button"
            onClick={() => setKategorie(eintrag)}
            whileTap={tap}
            transition={springTap}
            className={`flex h-11 shrink-0 items-center px-4 text-[13px] font-semibold text-black ${
              kategorie === eintrag ? 'sheet-primary rounded-pill shadow-[0_8px_40px_rgba(0,0,0,0.12)]' : glasPille
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
              layoutId={`karte-${eintrag.id}`}
              type="button"
              onClick={() => setAktivId(eintrag.id)}
              initial={reduziert ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduziert ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              whileTap={tap}
              transition={feder}
              className={`p-4 text-left ${karte}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <motion.h2 layoutId={`titel-${eintrag.id}`} transition={feder} className="text-[16px] font-semibold text-[#1a1a1a]">
                  {eintrag.begriff}
                </motion.h2>
                <motion.span
                  layoutId={`kat-${eintrag.id}`}
                  transition={feder}
                  className="shrink-0 text-[12px] font-medium text-[#6a6a6a]"
                >
                  {eintrag.kategorie}
                </motion.span>
              </div>
              <p className={`mt-0.5 ${fliessStil}`}>{eintrag.anriss}</p>
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Ruhige Zeile bei null Ergebnissen */}
        {gefiltert.length === 0 && (
          <p className={`px-1 pt-4 ${fliessStil}`}>
            Keine Einträge zu „{suche.trim()}“.
          </p>
        )}
      </div>

      {/* Detailansicht: die angetippte Karte wächst zur Vollansicht */}
      <AnimatePresence>
        {aktiv && (
          <DetailAnsicht
            key={aktiv.id}
            eintrag={aktiv}
            reduziert={Boolean(reduziert)}
            onClose={() => setAktivId(null)}
            onWechsel={(id) => setAktivId(id)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}