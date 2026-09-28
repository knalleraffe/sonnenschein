import { useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronRight, Settings2 } from 'lucide-react'
import Erscheinen, { EintrittEinmal } from '../components/ui/Erscheinen'
import { SheetBewegung } from '../components/ui/sheetBewegung'
import EchooKopf, { BUEHNE_HOEHE } from '../components/start/EchooKopf'
import StimmungsKarte from '../components/start/StimmungsKarte'
import SpielKarte, { SpielBild } from '../components/start/SpielKarte'
import TagesSheet from '../components/start/TagesSheet'
import EinstellungenSheet from '../components/start/EinstellungenSheet'
import { useEinfuehrung } from '../einfuehrung/kontext'
import { buehnenVerlauf, fliessStil, glasPille, himmelVerlauf, karte, kurveRuhig, seitenFarbe, titelStil } from '../components/start/stil'
import { ladeSitzungen, ladeStimmungen, type Sitzung } from '../lib/sitzungen'
import { echooZustand, heuteDran, spielkartenWert, tagesSitzungen, zusammenhangSatz, type WochenTag } from '../lib/kennzahlen'
import { tagesSchluessel } from '../lib/stimmung'
import { startTexte, type SpielId } from '../lib/startTexte'

/*
  Startseite (Master start-statistik, Abschnitt 3; Layout Figma 513:1427):
  Echoo im Zustand der letzten Messungen, Stimmungscheck, die beiden
  Spielkarten mit „Heute dran" und die Zusammenhänge-Karte. Ohne Kopfzeile.
*/

const SPIEL_ROUTE: Record<SpielId, string> = {
  wolkensammeln: '/spiel/wolkensammeln',
  himmelsroute: '/himmelsroute',
}
/** Container Transform: Spielkarte wächst bildschirmfüllend auf */
const AUFWACHSEN = 500

type Aufwachsen = { spiel: SpielId; von: { x: number; y: number; b: number; h: number }; ziel: { y: number; b: number; h: number }; wurzel: HTMLElement }

function StartInhalt() {
  const navigate = useNavigate()
  const reduziert = useReducedMotion()
  const heute = useMemo(() => new Date(), [])
  const sitzungen = useMemo(() => ladeSitzungen(heute), [heute])
  const stimmungen = useMemo(() => ladeStimmungen(heute), [heute])
  const echoo = useMemo(() => echooZustand(sitzungen), [sitzungen])
  const dran = useMemo(() => heuteDran(sitzungen, heute), [sitzungen, heute])
  const zusammenhang = useMemo(() => zusammenhangSatz(sitzungen), [sitzungen])

  const [tag, setTag] = useState<WochenTag | null>(null)
  const [einstellungen, setEinstellungen] = useState(false)
  const zeigeEinfuehrung = useEinfuehrung()
  const [waechst, setWaechst] = useState<Aufwachsen | null>(null)
  const karten = useRef<Record<SpielId, HTMLButtonElement | null>>({ wolkensammeln: null, himmelsroute: null })

  function starte(spiel: SpielId) {
    const el = karten.current[spiel]
    const wurzel = el?.closest<HTMLElement>('.overflow-y-auto')
    if (!el || !wurzel || reduziert) {
      navigate(SPIEL_ROUTE[spiel])
      return
    }
    const k = el.getBoundingClientRect()
    const w = wurzel.getBoundingClientRect()
    setWaechst({
      spiel,
      von: { x: k.left - w.left, y: k.top - w.top + wurzel.scrollTop, b: k.width, h: k.height },
      ziel: { y: wurzel.scrollTop, b: wurzel.clientWidth, h: wurzel.clientHeight },
      wurzel,
    })
    window.setTimeout(() => navigate(SPIEL_ROUTE[spiel]), AUFWACHSEN)
  }

  function zurStatistik(s: Sitzung) {
    navigate(`/statistiken?ebene=sitzung&spiel=${s.spiel}&sitzung=${encodeURIComponent(s.id)}`)
  }

  const rahmen = typeof document !== 'undefined' ? document.querySelector('main')?.parentElement : null

  return (
    <div className="relative min-h-full pb-32" style={{ background: seitenFarbe }}>

      {/* Einstellungen: runder Glas-Button wie in den Spielleisten, bleibt beim Scrollen oben rechts stehen */}
      <div className="pointer-events-none sticky top-0 z-20 h-0">
        <button
          type="button"
          aria-label="Einstellungen"
          onClick={() => setEinstellungen(true)}
          className={`pointer-events-auto absolute right-6 top-16 flex size-12 items-center justify-center text-black ${glasPille}`}
        >
          <Settings2 size={20} strokeWidth={1.5} aria-hidden />
        </button>
      </div>
      {/* Layout nach Figma 513:1427: Echoo-Bühne, darunter Verlauf Akzent → Seite */}
      <EchooKopf zustand={echoo.zustand} satz={echoo.satz} onOeffnen={() => navigate('/sonnenschein')} />
      <div className="pointer-events-none absolute inset-x-0 h-[240px]" style={{ top: BUEHNE_HOEHE - 36, background: buehnenVerlauf }} aria-hidden />

      <Erscheinen index={1} className="relative mx-6 -mt-0.5">
        <StimmungsKarte gespeichert={stimmungen[tagesSchluessel(heute)] ?? null} heute={heute} />
      </Erscheinen>

      <section className="relative mx-6 mt-8">
        <h2 className={titelStil}>{startTexte.spiele.abschnitt}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {(['wolkensammeln', 'himmelsroute'] as SpielId[]).map((spiel, i) => (
            <Erscheinen key={spiel} index={2 + i}>
              <SpielKarte
                ref={(el) => {
                  karten.current[spiel] = el
                }}
                spiel={spiel}
                wert={spielkartenWert(sitzungen, spiel)}
                heuteDran={dran === spiel}
                onStart={() => starte(spiel)}
              />
            </Erscheinen>
          ))}
        </div>
      </section>

      {zusammenhang.satz && (
        <section className="relative mx-6 mt-8">
          <h2 className={titelStil}>{startTexte.zusammenhaengeKarte.titel}</h2>
          <Erscheinen index={4} className="mt-[18px]">
            <button
              type="button"
              onClick={() => navigate(`/statistiken?ebene=zusammenhaenge&spiel=${zusammenhang.spiel}`)}
              className={`flex min-h-[88px] w-full items-start gap-4 py-5 pl-[19px] pr-6 text-left ${karte}`}
            >
              <p className={`flex-1 ${fliessStil}`}>{zusammenhang.satz}</p>
              <ChevronRight size={16} className="mt-1 shrink-0 text-black" aria-hidden />
            </button>
          </Erscheinen>
        </section>
      )}

      {/* Tages-Sheet über dem ganzen Rahmen (auch über der Tab-Leiste) */}
      {rahmen &&
        createPortal(
          <AnimatePresence>
            {einstellungen && (
              <EinstellungenSheet
                key="einstellungen"
                onSchliessen={() => setEinstellungen(false)}
                onEinfuehrung={() => {
                  setEinstellungen(false)
                  zeigeEinfuehrung()
                }}
              />
            )}
            {tag && (
              <TagesSheet
                key="tag"
                tag={tag.datum}
                sitzungen={tagesSitzungen(sitzungen, tag.datum)}
                onZurStatistik={zurStatistik}
                onSchliessen={() => setTag(null)}
              />
            )}
          </AnimatePresence>,
          rahmen,
        )}

      {/* Container Transform: das Kartenbild wächst auf und geht ins Spiel über (nur transform und opacity) */}
      {waechst &&
        createPortal(
          <motion.div
            className="pointer-events-none absolute left-0 top-0 z-40 overflow-hidden"
            style={{ width: waechst.von.b, height: waechst.von.h, transformOrigin: '0 0' }}
            initial={{ x: waechst.von.x, y: waechst.von.y, scaleX: 1, scaleY: 1 }}
            animate={{ x: 0, y: waechst.ziel.y, scaleX: waechst.ziel.b / waechst.von.b, scaleY: waechst.ziel.h / waechst.von.h }}
            transition={{ duration: AUFWACHSEN / 1000, ease: kurveRuhig }}
          >
            <div className="h-[96px]">
              <SpielBild spiel={waechst.spiel} />
            </div>
            {/* Karteninhalt blendet aus, der Himmel füllt den Bildschirm */}
            <motion.div
              className="absolute inset-0"
              style={{ background: himmelVerlauf }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: (AUFWACHSEN * 0.6) / 1000, ease: kurveRuhig }}
            />
          </motion.div>,
          waechst.wurzel,
        )}
    </div>
  )
}

export default function Dashboard() {
  return (
    // Sheets ohne Nachfedern (Master start-statistik, Abschnitt 0)
    <SheetBewegung.Provider value="ruhig">
      <EintrittEinmal schluessel="startseite">
        <StartInhalt />
      </EintrittEinmal>
    </SheetBewegung.Provider>
  )
}
