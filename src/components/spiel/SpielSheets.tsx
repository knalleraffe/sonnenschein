import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react'
import { HeartPulse } from 'lucide-react'
import Sheet from '../ui/Sheet'
import { konfig } from '../../games/wolkensammeln/config'
import { oeffentlich } from '../../lib/pfad'

/*
  Gemeinsame Sheets und Countdown der Spiele (Wolkensammeln, Himmelsroute) —
  Maße aus Figma. Jedes Sheet gehört in ein <AnimatePresence> des Spiels,
  dann schließt es animiert, egal ob per Button, X oder Wechsel zum
  nächsten Sheet. Beim Einsetzen jeweils einen `key` vergeben.
*/

const titel = 'text-[26px] font-semibold leading-8 tracking-[-0.01em]'
const fliesstext = 'text-[14px] leading-5 text-[#6a6a6a]'
const zeilenTitel = 'text-[18px] font-semibold leading-4 tracking-[-0.01em]'
const glasPille = 'flex h-12 items-center justify-center rounded-pill bg-white/20 text-black shadow-[0_8px_40px_rgba(0,0,0,0.12)]'
export const knopfPrimaer = 'sheet-primary min-h-14 w-full rounded-pill px-6 py-3 text-[14px] font-semibold text-black'
export const knopfSekundaer = 'sheet-secondary min-h-14 w-full rounded-pill px-6 py-3 text-[14px] font-semibold text-black'

const formatZahl = (wert: number) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(wert)
const fuellung = (wert: number, min: number, max: number) =>
  ({ '--range-progress': `${((wert - min) / (max - min)) * 100}%` }) as CSSProperties

/* ── Countdown: federt mittig, alte und neue Ziffer liegen exakt übereinander ── */

export function Countdown({ zahl }: { zahl: number | null }) {
  const reduziert = useReducedMotion()
  return (
    <AnimatePresence>
      {zahl !== null && (
        <motion.div
          className="absolute inset-0 z-40 flex items-center justify-center bg-ink/10"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduziert ? 0.2 : 0.45, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* relative + absolute Ziffern: alte und neue Zahl liegen exakt übereinander, nie nebeneinander */}
          <div className="relative flex h-[112px] w-[112px] items-center justify-center">
            <AnimatePresence initial={false}>
              <motion.div
                key={zahl}
                className="absolute inset-0 flex items-center justify-center text-[112px] font-black leading-none text-white drop-shadow-lg"
                initial={reduziert ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                animate={
                  reduziert
                    ? { opacity: 1 }
                    : { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 380, damping: 14, mass: 0.9 } }
                }
                exit={
                  reduziert
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.7, transition: { type: 'spring', stiffness: 380, damping: 26, mass: 0.7 } }
                }
                transition={{ duration: reduziert ? 0.2 : undefined }}
              >
                {zahl}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Puls vor dem Start und nach der Bewegungspause ── */

export function PulsSheet({
  art,
  wert,
  min,
  max,
  onChange,
  onWeiter,
}: {
  art: 'start' | 'bewegung'
  wert: number
  min: number
  max: number
  onChange: (wert: number) => void
  onWeiter: () => void
}) {
  const beschriftung = art === 'start' ? 'Aktueller Puls' : 'Bewegungs-Puls'
  return (
    <Sheet variante="karte" onClose={onWeiter}>
      <div>
        <h2 id="sheet-titel" className={`mt-[35px] ${titel}`}>{art === 'start' ? 'Bevor es losgeht' : 'Bevor es weitergeht'}</h2>
        <div className="mt-6 flex items-center justify-between">
          <span className={zeilenTitel}>{beschriftung}</span>
          <span className={`${glasPille} w-[78px] gap-2 text-[14px] font-medium leading-3`} aria-label={`${wert} Schläge pro Minute`}>
            <HeartPulse size={20} aria-hidden="true" />
            {wert}
          </span>
        </div>
        <input
          aria-label={beschriftung}
          className="sheet-range mt-[29px] block w-full"
          style={fuellung(wert, min, max)}
          type="range"
          min={min}
          max={max}
          step="1"
          value={wert}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <button type="button" onClick={onWeiter} className={`mt-[46px] ${knopfPrimaer}`}>
          {art === 'start' ? 'Spiel starten' : 'Spiel fortsetzen'}
        </button>
      </div>
    </Sheet>
  )
}

/* ── Einstellungen: Anzeigedauer und -pause ── */

type Regler = { wert: number; min: number; max: number; schritt: number; onChange: (wert: number) => void }

function EinstellungsZeile({ label, regler, className }: { label: string; regler: Regler; className: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="flex items-center justify-between">
        <span className={zeilenTitel}>{label}</span>
        <span className={`${glasPille} w-20 text-[12px] font-medium`}>{regler.wert} ms</span>
      </span>
      <input
        className="sheet-range mt-[29px] block w-full"
        style={fuellung(regler.wert, regler.min, regler.max)}
        type="range"
        min={regler.min}
        max={regler.max}
        step={regler.schritt}
        value={regler.wert}
        onChange={(event) => regler.onChange(Number(event.target.value))}
      />
    </label>
  )
}

/** `pause` ist optional — die Himmelsroute stellt nur die Zeigedauer ein */
export function EinstellungenSheet({ dauer, pause, onSpeichern }: { dauer: Regler; pause?: Regler; onSpeichern: () => void }) {
  return (
    <Sheet variante="karte" onClose={onSpeichern}>
      <div>
        <h2 id="sheet-titel" className={`mt-[35px] ${titel}`}>Einstellungen</h2>
        <EinstellungsZeile label="Anzeigedauer" regler={dauer} className="mt-6" />
        {pause && <EinstellungsZeile label="Anzeigepause" regler={pause} className="mt-[38px]" />}
        <button type="button" onClick={onSpeichern} className={`mt-[46px] ${knopfPrimaer}`}>
          Speichern
        </button>
      </div>
    </Sheet>
  )
}

/* ── Spiel verlassen? ── */

export function VerlassenSheet({ onFortsetzen, onVerlassen }: { onFortsetzen: () => void; onVerlassen: () => void }) {
  return (
    <Sheet variante="karte" schliessbar={false}>
      <div>
        <h2 id="sheet-titel" className={`mt-[35px] ${titel}`}>Bist du sicher?</h2>
        <p className={`mt-2 ${fliesstext}`}>Wenn du das Spiel jetzt verlässt, geht dein bisheriger Fortschritt verloren.</p>
        <button type="button" onClick={onFortsetzen} className={`mt-6 ${knopfPrimaer}`}>Fortsetzen</button>
        <button type="button" onClick={onVerlassen} className={`mt-2 ${knopfSekundaer}`}>Spiel verlassen</button>
      </div>
    </Sheet>
  )
}

/* ── Schlichtes Sheet: Titel, Text, ein oder zwei Buttons (für Zustände ohne eigenes Design) ── */

export function TextSheet({
  titel: ueberschrift,
  text,
  primaer,
  sekundaer,
}: {
  titel: string
  text: string
  primaer: { text: string; onClick: () => void }
  sekundaer?: { text: string; onClick: () => void }
}) {
  return (
    <Sheet variante="karte" schliessbar={false}>
      <div>
        <h2 id="sheet-titel" className={`mt-[35px] ${titel}`}>{ueberschrift}</h2>
        <p className={`mt-2 ${fliesstext}`}>{text}</p>
        <button type="button" onClick={primaer.onClick} className={`mt-6 ${knopfPrimaer}`}>{primaer.text}</button>
        {sekundaer && (
          <button type="button" onClick={sekundaer.onClick} className={`mt-2 ${knopfSekundaer}`}>{sekundaer.text}</button>
        )}
      </div>
    </Sheet>
  )
}

/* ── Bewegungspause ── */

export function BewegungspauseSheet({ onBewegt, onOhneBewegung }: { onBewegt: () => void; onOhneBewegung: () => void }) {
  return (
    <Sheet variante="karte" schliessbar={false}>
      <div className="w-full text-center">
        <div className="relative mx-auto mt-6 h-[184px] w-[179px] translate-x-[5px] overflow-hidden">
          <img src={oeffentlich('/bewegungspause.png')} alt="Person in Bewegung" className="absolute left-[-8.94%] top-[-7.13%] h-[114.27%] w-[117.88%] max-w-none" />
        </div>
        <h2 id="sheet-titel" className={`mt-6 ${titel}`}>Bewegungspause</h2>
        <p className={`mt-2 ${fliesstext}`}>Bewege dich aktiv, bis dein Puls spürbar ansteigt. Danach trägst du deinen neuen Pulswert ein und es geht weiter.</p>
        <button type="button" onClick={onBewegt} className={`mt-6 ${knopfPrimaer}`}>Ich habe mich bewegt</button>
        <button type="button" onClick={onOhneBewegung} className={`mt-2 ${knopfSekundaer}`}>Ohne Bewegung fortfahren</button>
      </div>
    </Sheet>
  )
}

/* ── Ergebnis: Pokal, zählende Zahl, Kennwerte ── */

function ZaehlendeZahl({ wert }: { wert: number }) {
  const reduziert = useReducedMotion()
  const [anzeige, setAnzeige] = useState(reduziert ? wert : 0)

  useEffect(() => {
    if (reduziert) {
      setAnzeige(wert)
      return
    }
    const lauf = animate(0, wert, {
      duration: 0.8,
      ease: konfig.kurven.standard,
      onUpdate: (wertAktuell) => setAnzeige(Math.round(wertAktuell)),
    })
    return () => lauf.stop()
  }, [wert, reduziert])

  return <>{formatZahl(anzeige)}</>
}

export type ErgebnisZeile = { label: string; wert: string; zusatz?: string }

export function ErgebnisSheet({
  wert,
  wertLabel,
  satz,
  zeilen,
  primaer,
  sekundaer,
  verzoegerung = 0,
  zeilenVersatz = 60,
  bild,
  anzeige,
}: {
  wert: number
  /** Vorlesetext der großen Zahl */
  wertLabel: string
  satz: string | null
  zeilen: ErgebnisZeile[]
  primaer: { text: string; onClick: () => void }
  sekundaer: { text: string; onClick: () => void }
  /** Die Karte erscheint erst nach dieser Zeit (ms), die Zeilen gestaffelt danach */
  verzoegerung?: number
  zeilenVersatz?: number
  /** ersetzt den Pokal (Himmelsroute: Mini-Route) */
  bild?: ReactNode
  /** feste Anzeige statt der zählenden Zahl (z. B. „–") */
  anzeige?: string
}) {
  const reduziert = useReducedMotion()
  return (
    <Sheet variante="karte" schliessbar={false}>
      <motion.div
        className="w-full"
        initial={reduziert ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: konfig.kurven.ruhig, delay: verzoegerung / 1000 }}
      >
        <div className="text-center">
          {bild ?? (
            <div className="relative mx-auto mt-8 h-[127px] w-[148px] overflow-hidden">
              <img src={oeffentlich('/trophy.png')} alt="Trophäe" className="absolute left-[-11.8%] top-[-20.64%] h-[132.78%] w-[129.21%] max-w-none" />
            </div>
          )}
          <div className="mt-4 text-[56px] font-extrabold leading-[68px] tracking-[-0.01em]" style={{ fontVariantNumeric: 'tabular-nums' }} aria-label={wertLabel}>
            {anzeige ?? <ZaehlendeZahl wert={wert} />}
          </div>
          {satz && <p className={`mx-auto max-w-[231px] ${fliesstext}`}>{satz}</p>}
        </div>

        <div className="mt-5 text-[14px]">
          {zeilen.map(({ label, wert: zeilenWert, zusatz }, i) => (
            <motion.div
              key={label}
              className="flex justify-between gap-4"
              initial={reduziert ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: konfig.kurven.standard, delay: (verzoegerung + 300 + i * zeilenVersatz) / 1000 }}
            >
              <span className="font-medium text-[#6a6a6a]">
                <span className="block leading-8">{label}</span>
                {zusatz && <span className="block leading-5">{zusatz}</span>}
              </span>
              <span className="font-semibold leading-8 text-black">{zeilenWert}</span>
            </motion.div>
          ))}
        </div>

        <button type="button" onClick={primaer.onClick} className={`mt-[18px] ${knopfPrimaer}`}>{primaer.text}</button>
        <button type="button" onClick={sekundaer.onClick} className={`mt-2 ${knopfSekundaer}`}>{sekundaer.text}</button>
      </motion.div>
    </Sheet>
  )
}
