import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Sheet from '../components/ui/Sheet'
import { SheetBewegung } from '../components/ui/sheetBewegung'
import StatTabs from '../components/stats/StatTabs'
import GlasUmschalter from '../components/statistik/GlasUmschalter'
import SitzungsAnsicht from '../components/statistik/SitzungsAnsicht'
import { AKZENT, FortschrittsBalken, SpaltenDiagramm, StreuDiagramm, VerlaufsDiagramm } from '../components/statistik/Diagramme'
import { fliessStil, glasPille, karte, kurve, titelStil } from '../components/start/stil'
import { ladeSitzungen, type Sitzung } from '../lib/sitzungen'
import { bewegungOderRuhe, stimmungUndLeistung, verlauf, wieStarkBewegen } from '../lib/kennzahlen'
import { datumUhrzeit, delta, mitEinheit, spielNamen, startTexte, zahl, type SpielId } from '../lib/startTexte'

/*
  Statistiken (Master start-statistik, Abschnitt 4): oben Tabs für die beiden
  Spiele (Glas-Pille), darunter die drei Ebenen Sitzung, Verlauf und
  Zusammenhänge (bestehende Ebenen-Leiste). Über jedem Diagramm steht ein
  Satz, der es übersetzt. Punkte sind antippbar und öffnen die Sitzung als
  Sheet. Deep-Links: ?ebene=sitzung|verlauf|zusammenhaenge&spiel=…&sitzung=…
*/

type Ebene = 'sitzung' | 'verlauf' | 'zusammenhaenge'
const t = startTexte.statistik
const ebenen: { id: Ebene; label: string }[] = [
  { id: 'sitzung', label: t.ebenen[0] },
  { id: 'verlauf', label: t.ebenen[1] },
  { id: 'zusammenhaenge', label: t.ebenen[2] },
]
const spiele: { id: SpielId; label: string }[] = [
  { id: 'wolkensammeln', label: spielNamen.wolkensammeln },
  { id: 'himmelsroute', label: spielNamen.himmelsroute },
]

function Karte({ titel, satz, children }: { titel?: string; satz?: string | null; children?: React.ReactNode }) {
  return (
    <section className={`p-4 ${karte}`}>
      {titel && <h2 className={titelStil}>{titel}</h2>}
      {satz && <p className={`${titel ? 'mt-1' : ''} ${fliessStil}`}>{satz}</p>}
      {children && <div className="mt-4">{children}</div>}
    </section>
  )
}

/* ── Ebene Sitzung: Kopf, Blättern per Wischen oder Pfeil ── */

function SitzungEbene({ liste, start }: { liste: Sitzung[]; start: string | null }) {
  const reduziert = useReducedMotion()
  const [index, setIndex] = useState(() => {
    const i = start ? liste.findIndex((s) => s.id === start) : -1
    return i >= 0 ? i : liste.length - 1
  })
  const [richtung, setRichtung] = useState(1)
  if (liste.length === 0) return <Karte satz={t.leer} />
  const i = Math.min(index, liste.length - 1)
  const s = liste[i]
  const blaettere = (um: number) => {
    const neu = Math.max(0, Math.min(liste.length - 1, i + um))
    if (neu === i) return
    setRichtung(um)
    setIndex(neu)
  }
  const knopf = `flex size-12 items-center justify-center text-black disabled:opacity-40 ${glasPille}`
  return (
    <div>
      <div className="flex items-center justify-between">
        <button type="button" className={knopf} onClick={() => blaettere(-1)} disabled={i === 0} aria-label="Vorige Sitzung">
          <ChevronLeft size={20} strokeWidth={1.5} aria-hidden />
        </button>
        <h2 className="text-[16px] font-semibold leading-5" aria-live="polite">
          {datumUhrzeit(s.zeitpunkt)}
        </h2>
        <button type="button" className={knopf} onClick={() => blaettere(1)} disabled={i === liste.length - 1} aria-label="Nächste Sitzung">
          <ChevronRight size={20} strokeWidth={1.5} aria-hidden />
        </button>
      </div>
      <AnimatePresence mode="popLayout" initial={false} custom={richtung}>
        <motion.div
          key={s.id}
          className={`mt-4 touch-pan-y p-4 ${karte}`}
          drag={reduziert ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) blaettere(1)
            else if (info.offset.x > 60) blaettere(-1)
          }}
          initial={reduziert ? { opacity: 0 } : { opacity: 0, x: 40 * richtung }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduziert ? { opacity: 0 } : { opacity: 0, x: -40 * richtung }}
          transition={{ duration: 0.3, ease: kurve }}
        >
          <SitzungsAnsicht sitzung={s} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ── Ebene Verlauf ── */

function VerlaufEbene({ alle, spiel, onTippen }: { alle: Sitzung[]; spiel: SpielId; onTippen: (s: Sitzung) => void }) {
  const [zeitraum, setZeitraum] = useState<'vierWochen' | 'alle'>('vierWochen')
  const liste = useMemo(() => verlauf(alle, spiel, zeitraum), [alle, spiel, zeitraum])
  return (
    <div className="flex flex-col gap-4">
      <GlasUmschalter
        label="Zeitraum"
        optionen={[
          { id: 'vierWochen', label: t.verlaufUmschalter[0] },
          { id: 'alle', label: t.verlaufUmschalter[1] },
        ]}
        wert={zeitraum}
        onChange={setZeitraum}
      />
      {liste.length === 0 ? (
        <Karte satz={t.leer} />
      ) : (
        <Karte satz={t.verlaufSatz}>
          <VerlaufsDiagramm key={`${spiel}-${zeitraum}`} sitzungen={liste} zahl={zahl} onTippen={onTippen} />
        </Karte>
      )}
    </div>
  )
}

/* ── Ebene Zusammenhänge ── */

function ZusammenhaengeEbene({ alle, spiel, onTippen }: { alle: Sitzung[]; spiel: SpielId; onTippen: (s: Sitzung) => void }) {
  const br = useMemo(() => bewegungOderRuhe(alle, spiel), [alle, spiel])
  const puls = useMemo(() => wieStarkBewegen(alle, spiel), [alle, spiel])
  const stimmung = useMemo(() => stimmungUndLeistung(alle, spiel), [alle, spiel])
  const pulsX = puls.punkte.map((p) => p.anstieg)
  const pulsBereich = { min: Math.min(0, ...pulsX) - 5, max: Math.max(50, ...pulsX) + 5 }
  return (
    <div className="flex flex-col gap-4">
      <Karte titel={t.titel1} satz={br.genug ? `${br.kernsatz} ${br.zusatz}` : br.fortschritt}>
        {br.genug ? (
          <>
            <SpaltenDiagramm
              key={spiel}
              zahl={delta}
              onTippen={onTippen}
              spalten={[
                { label: t.bedingung.bewegung, form: 'kreis', farbe: AKZENT, sitzungen: br.bewegung, mittel: br.mittelBewegung },
                { label: t.bedingung.ruhe, form: 'quadrat', farbe: '#6a6a6a', sitzungen: br.ruhe, mittel: br.mittelRuhe },
              ]}
            />
            <p className={`mt-3 ${fliessStil}`}>{br.hinweis}</p>
          </>
        ) : (
          <FortschrittsBalken
            zeilen={[
              { label: t.bedingung.bewegung, anteil: br.anteil.bewegung },
              { label: t.bedingung.ruhe, anteil: br.anteil.ruhe },
            ]}
          />
        )}
      </Karte>

      <Karte titel={t.titel2} satz={puls.satz}>
        {puls.genug ? (
          <StreuDiagramm
            key={spiel}
            punkte={puls.punkte.map((p) => ({ x: p.anstieg, y: p.delta, sitzung: p.sitzung, label: `+${p.anstieg}: ${delta(p.delta)}` }))}
            xBereich={pulsBereich}
            xBeschriftung={[0, 10, 20, 30, 40, 50].filter((w) => w >= pulsBereich.min && w <= pulsBereich.max)}
            yZahl={delta}
            markierung={puls.bereich}
            onTippen={onTippen}
          />
        ) : null}
      </Karte>

      <Karte titel={t.titel3} satz={stimmung.satz}>
        {stimmung.genug ? (
          <StreuDiagramm
            key={spiel}
            punkte={stimmung.punkte.map((p) => ({
              x: p.stimmung,
              y: p.vor,
              sitzung: p.sitzung,
              label: `${startTexte.stimmung.stufen[p.stimmung - 1]}: ${mitEinheit(spiel, p.vor)}`,
            }))}
            xBereich={{ min: 0.5, max: 5.5 }}
            xBeschriftung={[1, 2, 3, 4, 5]}
            yZahl={zahl}
            onTippen={onTippen}
          />
        ) : null}
      </Karte>
    </div>
  )
}

export default function Statistiken() {
  const reduziert = useReducedMotion()
  const [params] = useSearchParams()
  const alle = useMemo(() => ladeSitzungen(), [])
  const letzteSpiel = alle.length > 0 ? alle[alle.length - 1].spiel : 'wolkensammeln'
  const [spiel, setSpiel] = useState<SpielId>(() => (params.get('spiel') as SpielId | null) ?? letzteSpiel)
  const [ebene, setEbene] = useState<Ebene>(() => (params.get('ebene') as Ebene | null) ?? 'sitzung')
  const [offen, setOffen] = useState<Sitzung | null>(null)
  const startSitzung = params.get('sitzung')
  const vomSpiel = useMemo(() => alle.filter((s) => s.spiel === spiel), [alle, spiel])
  const rahmen = typeof document !== 'undefined' ? document.querySelector('main')?.parentElement : null

  return (
    // Sheets ohne Nachfedern (Master start-statistik, Abschnitt 0)
    <SheetBewegung.Provider value="ruhig">
    <div className="min-h-full bg-surface pb-36">
      <div className="px-6 pt-14">
        {/* Headline wie im Glossar */}
        <h1 className="text-[24px] font-bold">Statistiken</h1>
        <div className="mt-4">
          {/* Spielwahl: gleitende Pille in der Farbe der Schließen-Knöpfe, damit sie deutlich hervortritt */}
          <GlasUmschalter label="Spiel" optionen={spiele} wert={spiel} onChange={setSpiel} aktivFarbe="#fff8e6" />
        </div>
        <div className="mt-3">
          <StatTabs tabs={ebenen} aktiv={ebene} onChange={setEbene} />
        </div>
        <div className="h-px bg-cream" />
      </div>

      <div className="px-6 pt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${spiel}-${ebene}`}
            initial={reduziert ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: kurve }}
          >
            {ebene === 'sitzung' && <SitzungEbene liste={vomSpiel} start={startSitzung} />}
            {ebene === 'verlauf' && <VerlaufEbene alle={alle} spiel={spiel} onTippen={setOffen} />}
            {ebene === 'zusammenhaenge' && <ZusammenhaengeEbene alle={alle} spiel={spiel} onTippen={setOffen} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sitzung als Sheet über dem ganzen Rahmen */}
      {rahmen &&
        createPortal(
          <AnimatePresence>
            {offen && (
              <Sheet key="sitzung" variante="karte" onClose={() => setOffen(null)}>
                <div>
                  <h2 id="sheet-titel" className="mt-[35px] text-[18px] font-semibold leading-6">
                    {datumUhrzeit(offen.zeitpunkt)}
                  </h2>
                  <div className="mt-4">
                    <SitzungsAnsicht sitzung={offen} />
                  </div>
                </div>
              </Sheet>
            )}
          </AnimatePresence>,
          rahmen,
        )}
    </div>
    </SheetBewegung.Provider>
  )
}
