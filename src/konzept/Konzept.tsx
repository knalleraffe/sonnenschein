import { useMemo, type ComponentProps, type CSSProperties, type ReactNode } from 'react'
import { LayoutGroup } from 'motion/react'
import { Settings2 } from 'lucide-react'
import { APP_NAME } from '../einfuehrung/texte'
import Fortschrittsroute from '../einfuehrung/Fortschrittsroute'
import { WendeKarte } from '../einfuehrung/Schritte'
import EchooKopf from '../components/start/EchooKopf'
import SpielKarte from '../components/start/SpielKarte'
import StimmungsKarte from '../components/start/StimmungsKarte'
import Wochenleiste from '../components/start/Wochenleiste'
import { GegenstandsKarte, GehobeneKarte, Wegpunkt } from '../components/himmelsroute/Rueckweg'
import { VerlassenSheet, knopfPrimaer, knopfSekundaer } from '../components/spiel/SpielSheets'
import { SheetBewegung } from '../components/ui/sheetBewegung'
import { buehnenVerlauf, fliessStil, glasPille, himmelVerlauf, kopfVerlauf, karte, seitenFarbe, titelStil } from '../components/start/stil'
import { konfig as wolken } from '../games/wolkensammeln/config'
import { konfig as himmel } from '../games/himmelsroute/config'
import { ladeSitzungen } from '../lib/sitzungen'
import { spielkartenWert, type WochenTag } from '../lib/kennzahlen'
import type { SpielId } from '../lib/startTexte'
import { MODUL, SEMESTER, TEAM } from '../../abgabe/abgabe.config'

/*
  Konzeptseite für die Abgabe (Route /konzept, nicht in der Navigation).
  Druckformat A3 quer: jede <Seite> ist genau ein Blatt (420 × 297 mm).
  Alle Bausteine sind die echten Komponenten der App. Zustände wie Fokus
  oder Gedrückt kommen über die Klassen .ist-fokus / .ist-gedrueckt aus
  index.css, die dieselben Styles auslösen wie :focus-visible / :active.
  Gestaltet nur mit Farben, Schriften, Radien und Abständen der App.
  Bilder, Flowcharts und die Zusammenfassung liegen in abgabe/ und werden
  von den Skripten dort erzeugt.
*/

const BILDER = import.meta.glob('../../abgabe/bilder/*.png', { eager: true, import: 'default' }) as Record<string, string>
const FLOWCHARTS = import.meta.glob('../../abgabe/flowcharts/*.svg', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const ZUSAMMENFASSUNG = Object.values(
  import.meta.glob('../../abgabe/zusammenfassung.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>,
)[0]

const bild = (name: string) => BILDER[`../../abgabe/bilder/${name}.png`]
/** Mermaid vergibt in jeder Datei dieselbe id – eindeutig machen, sonst stören sich die Diagramme */
const flowchart = (name: string) => FLOWCHARTS[`../../abgabe/flowcharts/${name}.svg`]?.replaceAll('my-svg', `fc-${name}`)

/* A3 quer bei 96 dpi */
const SEITE = { breite: 1587, hoehe: 1123 }
const RAND = 64

const klein = 'text-[12px] leading-4 text-[#6a6a6a]'
const ueberschrift = 'text-[26px] font-semibold leading-8 tracking-[-0.01em] text-black'

/* ── Seitengerüst ── */

function Seite({ nummer, titel, children }: { nummer: number; titel: string; children: ReactNode }) {
  return (
    <section
      className="konzept-seite relative mx-auto mb-12 flex flex-col overflow-hidden"
      style={{ width: SEITE.breite, height: SEITE.hoehe, background: seitenFarbe, padding: RAND }}
    >
      <header className="mb-8 flex shrink-0 items-baseline justify-between">
        <h2 className={ueberschrift}>{titel}</h2>
        <span className={klein}>
          {APP_NAME} · {MODUL} · Seite {nummer}
        </span>
      </header>
      <div className="konzept-inhalt min-h-0 flex-1">{children}</div>
    </section>
  )
}

function Gruppe({ titel, notiz, children, className = '' }: { titel: string; notiz?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`p-6 ${karte} ${className}`}>
      <h3 className={titelStil}>{titel}</h3>
      {notiz && <p className={`mt-1 ${klein}`}>{notiz}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}

/** Ein Zustand mit Beschriftung */
function Zustand({ label, notiz, children, breite }: { label: string; notiz?: string; children: ReactNode; breite?: number }) {
  return (
    <figure className="m-0 flex flex-col gap-2" style={breite ? { width: breite } : undefined}>
      {children}
      <figcaption>
        <span className="block text-[12px] font-semibold leading-4 text-black">{label}</span>
        {notiz && <span className={`block ${klein}`}>{notiz}</span>}
      </figcaption>
    </figure>
  )
}

/** Telefon-Bildschirm als Bild (Playwright-Screenshot 393 × 852) */
function Telefon({ name, hoehe, alt }: { name: string; hoehe: number; alt: string }) {
  const src = bild(name)
  const breite = (hoehe * 393) / 852
  return src ? (
    <img src={src} alt={alt} className="block shrink-0 rounded-[28px] shadow-[0_8px_40px_rgba(0,0,0,0.12)]" style={{ width: breite, height: hoehe }} />
  ) : (
    <div className={`flex shrink-0 items-center justify-center rounded-[28px] bg-white p-4 text-center ${klein}`} style={{ width: breite, height: hoehe }}>
      Bild fehlt: {name}.png
    </div>
  )
}

/** Bühne mit fester Größe, in der absolut platzierte Komponenten liegen; optional verkleinert */
function Buehne({ breite, hoehe, skala = 1, hintergrund, children }: { breite: number; hoehe: number; skala?: number; hintergrund?: string; children: ReactNode }) {
  return (
    <div className="relative shrink-0 overflow-hidden rounded-[28px]" style={{ width: breite * skala, height: hoehe * skala }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: breite, height: hoehe, transform: `scale(${skala})`, background: hintergrund }}>
        {children}
      </div>
    </div>
  )
}

/* ── 1 · Titelseite ── */

function Titelseite() {
  const screens = [
    { name: 'screen-startseite', titel: 'Startseite' },
    { name: 'screen-himmelsroute', titel: 'Himmelsroute beim Nachbauen' },
    { name: 'screen-zusammenhaenge', titel: 'Statistik „Zusammenhänge“' },
  ]
  return (
    <Seite nummer={1} titel="Konzept Sheet">
      <div className="flex h-full gap-12">
        <div className="flex w-[340px] shrink-0 flex-col justify-between">
          <div>
            <h1 className="text-[112px] font-black leading-none tracking-[-0.02em] text-black">{APP_NAME}</h1>
            <p className="mt-6 text-[26px] font-semibold leading-8 text-black">{MODUL}</p>
            <p className={`mt-2 ${fliessStil}`}>{SEMESTER}</p>
          </div>
          <div>
            <h3 className={titelStil}>Team</h3>
            <ul className="mt-2 list-none p-0">
              {TEAM.map((name) => (
                <li key={name} className="text-[18px] font-semibold leading-8 text-black">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-1 items-end justify-end gap-10">
          {screens.map((s) => (
            <figure key={s.name} className="m-0 flex flex-col items-center gap-4">
              <Telefon name={s.name} hoehe={740} alt={s.titel} />
              <figcaption className={titelStil}>{s.titel}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Seite>
  )
}

/* ── 2 · Zusammenfassung und Grundlagen ── */

const FARBEN: { name: string; hex: string; wo: string }[] = [
  { name: 'Akzent', hex: '#ffba3a', wo: 'Primärbutton (Verlaufsende), Slider, Wegpunkte, Fortschritt' },
  { name: 'Akzent hell', hex: '#ffca67', wo: 'Primärbutton (Verlaufsanfang)' },
  { name: 'Fokus', hex: '#f59e1b', wo: 'Tastaturfokus (Umriss)' },
  { name: 'Seite', hex: '#fff9ed', wo: 'Hintergrund Startseite und Statistiken' },
  { name: 'Karte', hex: '#ffffff', wo: 'Karten, Sheets, Slider-Griff' },
  { name: 'Text', hex: '#000000', wo: 'Titel und Beschriftungen' },
  { name: 'Fließtext', hex: '#6a6a6a', wo: 'Fließtext, „falsch“ in der Himmelsroute' },
  { name: 'Sekundär', hex: '#f2f2f2', wo: 'Sekundärbutton' },
  { name: 'Spur', hex: '#dddddd', wo: 'Slider-Spur' },
  { name: 'Himmel oben', hex: '#9fe1ff', wo: 'Himmel der Spielszene' },
  { name: 'Himmel unten', hex: '#defcff', wo: 'Himmel der Spielszene' },
  { name: 'Schließen', hex: '#fff8e6', wo: 'Schließen-Knopf der Sheets' },
]

const SCHRIFTEN: { stufe: string; klasse: string; beispiel: string }[] = [
  { stufe: 'Countdown · 112 · Black', klasse: 'text-[112px] font-black leading-none', beispiel: '3' },
  { stufe: 'Ergebniszahl · 56/68 · Extrabold', klasse: 'text-[56px] font-extrabold leading-[68px] tracking-[-0.01em]', beispiel: '5,4' },
  { stufe: 'Titel · 26/32 · Semibold', klasse: 'text-[26px] font-semibold leading-8 tracking-[-0.01em]', beispiel: 'Bevor es losgeht' },
  { stufe: 'Zeilentitel · 18 · Semibold', klasse: 'text-[18px] font-semibold leading-5 tracking-[-0.01em]', beispiel: 'Aktueller Puls' },
  { stufe: 'Abschnitt · 16/20 · Semibold', klasse: 'text-[16px] font-semibold leading-5', beispiel: 'Deine Zusammenhänge' },
  { stufe: 'Fließtext · 14/20 · Regular', klasse: 'text-[14px] leading-5 !text-[#6a6a6a]', beispiel: 'Merk dir, was Echoo begegnet.' },
  { stufe: 'Klein · 12/16 · Medium', klasse: 'text-[12px] font-medium leading-4', beispiel: 'Heute dran' },
]

const RADIEN = [
  { name: 'Karte', wert: '28 px', stil: { borderRadius: 28 } },
  { name: 'Sheet oben / unten', wert: '40 / 56 px', stil: { borderRadius: '40px 40px 56px 56px' } },
  { name: 'Pille', wert: '999 px', stil: { borderRadius: 999 } },
  { name: 'Gegenstands-Karte', wert: '26 % der Seite', stil: { borderRadius: '26%', aspectRatio: '1', width: 48 } },
]

const SCHATTEN = [
  { name: 'Karte', wert: '0 8 40 · 6 %', schatten: '0 8px 40px rgba(0,0,0,0.06)' },
  { name: 'Glas, gehobene Karte', wert: '0 8 40 · 12 %', schatten: '0 8px 40px rgba(0,0,0,0.12)' },
  { name: 'Sheet', wert: '0 0 40 · 12 %', schatten: '0 0 40px rgba(0,0,0,0.12)' },
  { name: 'Slider-Griff', wert: 'doppelt · 12 %', schatten: '0 0.725px 5.8px rgba(0,0,0,0.12), 0 8.7px 18.85px rgba(0,0,0,0.12)' },
]

const ABSTAENDE = [
  { name: 'Sheet-Rand', px: 8 },
  { name: 'Karten', px: 12 },
  { name: 'Innen', px: 16 },
  { name: 'Seitenrand', px: 24 },
  { name: 'Abschnitte', px: 32 },
  { name: 'Glas-Button', px: 48 },
]

const KURVEN: { name: string; wo: string; werte: readonly number[] }[] = [
  { name: 'Standard', wo: 'Erscheinen, Farbwechsel, Klappen', werte: wolken.kurven.standard },
  { name: 'Ruhig', wo: 'Himmel, Echoo, große Übergänge', werte: wolken.kurven.ruhig },
  { name: 'Druck', wo: 'Antippen', werte: wolken.kurven.druck },
  { name: 'Sheet', wo: 'Sheet öffnen', werte: [0.32, 0.72, 0, 1] },
  { name: 'Himmelsroute', wo: 'Wegpunkte, Karten, Übersicht', werte: himmel.kurve },
  { name: 'Gleiten', wo: 'Heimflug entlang der Route', werte: himmel.aufloesung.gleitenKurve },
]

const DAUERN: { was: string; ms: number | string }[] = [
  { was: 'Button gedrückt', ms: 120 },
  { was: 'Slider-Griff', ms: 200 },
  { was: 'Karte legen, Wegpunkt', ms: 300 },
  { was: 'Sheet schließen / öffnen', ms: '320 / 450' },
  { was: 'Stimmungskarte klappen', ms: 400 },
  { was: 'Container Transform', ms: 500 },
  { was: 'Flug zwischen Haltepunkten', ms: himmel.flug.dauer },
  { was: 'Onboarding-Kamera', ms: 900 },
  { was: 'Echoos Aufgang', ms: himmel.aufgang.dauer },
  { was: 'Heimflug', ms: himmel.aufloesung.gleiten },
  { was: 'Echoo atmet (Schleife)', ms: wolken.echoo.atmenDauer },
]

function KurvenBild({ werte }: { werte: readonly number[] }) {
  const [x1, y1, x2, y2] = werte
  const g = 64
  const p = (x: number, y: number) => `${x * g},${g - y * g}`
  return (
    <svg width={g} height={g} viewBox={`-4 -4 ${g + 8} ${g + 8}`} className="shrink-0" aria-hidden>
      <rect x={0} y={0} width={g} height={g} fill="none" stroke="#dddddd" />
      <path d={`M ${p(0, 0)} C ${p(x1, y1)} ${p(x2, y2)} ${p(1, 1)}`} fill="none" stroke="#ffba3a" strokeWidth={3} strokeLinecap="round" />
    </svg>
  )
}

function Grundlagenseite() {
  return (
    <Seite nummer={2} titel="Zusammenfassung und Grundlagen">
      <div className="grid h-full grid-cols-[360px_1fr_1fr] gap-6">
        <Gruppe titel="Zusammenfassung des Lösungsansatzes">
          <div className="whitespace-pre-line text-[14px] leading-5 text-black">
            {ZUSAMMENFASSUNG ? ZUSAMMENFASSUNG.replace(/^#.*\n+/m, '').replace(/^>\s?/gm, '').trim() : 'abgabe/zusammenfassung.md fehlt'}
          </div>
        </Gruppe>
        <div className="flex min-h-0 flex-col gap-6">
          <Gruppe titel="Farben">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {FARBEN.map((f) => (
                <div key={f.name} className="flex items-center gap-3">
                  <span className="size-10 shrink-0 rounded-[12px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)]" style={{ background: f.hex }} />
                  <span>
                    <span className="block text-[12px] font-semibold leading-4 text-black">
                      {f.name} · {f.hex.toUpperCase()}
                    </span>
                    <span className={`block ${klein}`}>{f.wo}</span>
                  </span>
                </div>
              ))}
            </div>
          </Gruppe>
          <Gruppe titel="Schriftstufen · Inter Variable" className="flex-1">
            <div className="flex flex-col gap-2">
              {SCHRIFTEN.map((s) => (
                <div key={s.stufe} className="flex items-baseline justify-between gap-4 border-b border-[#f2f2f2] pb-2">
                  <span className={`truncate text-black ${s.klasse}`}>{s.beispiel}</span>
                  <span className={`shrink-0 ${klein}`}>{s.stufe}</span>
                </div>
              ))}
            </div>
          </Gruppe>
        </div>
        <div className="flex min-h-0 flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            <Gruppe titel="Radien">
              <div className="grid grid-cols-2 gap-3">
                {RADIEN.map((r) => (
                  <div key={r.name}>
                    <div className="h-12 w-full border-2 border-[#ffba3a] bg-white" style={r.stil} />
                    <span className={`mt-1 block ${klein}`}>
                      {r.name} · {r.wert}
                    </span>
                  </div>
                ))}
              </div>
            </Gruppe>
            <Gruppe titel="Schatten">
              <div className="grid grid-cols-2 gap-3">
                {SCHATTEN.map((s) => (
                  <div key={s.name}>
                    <div className="h-12 w-full rounded-[12px] bg-white" style={{ boxShadow: s.schatten }} />
                    <span className={`mt-2 block ${klein}`}>
                      {s.name} · {s.wert}
                    </span>
                  </div>
                ))}
              </div>
            </Gruppe>
          </div>
          <Gruppe titel="Abstände (px)">
            <div className="flex items-end gap-6">
              {ABSTAENDE.map((a) => (
                <div key={a.name} className="flex flex-col items-start gap-1">
                  <span className="block rounded-[4px] bg-[#ffba3a]" style={{ width: a.px, height: a.px }} />
                  <span className={klein}>
                    {a.px} · {a.name}
                  </span>
                </div>
              ))}
            </div>
          </Gruppe>
          <Gruppe titel="Easing-Kurven und Dauern" className="flex-1">
            <div className="grid grid-cols-2 gap-3">
              {KURVEN.map((k) => (
                <div key={k.name} className="flex items-center gap-3">
                  <KurvenBild werte={k.werte} />
                  <span>
                    <span className="block text-[12px] font-semibold leading-4 text-black">{k.name}</span>
                    <span className={`block ${klein}`}>{k.werte.join(', ')}</span>
                    <span className={`block ${klein}`}>{k.wo}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-6">
              {DAUERN.map((d) => (
                <div key={d.was} className="flex justify-between border-b border-[#f2f2f2] py-1 text-[12px] leading-4">
                  <span className="text-[#6a6a6a]">{d.was}</span>
                  <span className="font-semibold text-black">{d.ms} ms</span>
                </div>
              ))}
            </div>
          </Gruppe>
        </div>
      </div>
    </Seite>
  )
}

/* ── 3 · Bedienelemente ── */

const fuellung = (wert: number, min: number, max: number) => ({ '--range-progress': `${((wert - min) / (max - min)) * 100}%` }) as CSSProperties

/** Puls-Slider: dasselbe Element mit derselben Klasse wie im Puls-Sheet der Spiele */
function PulsRegler({ wert }: { wert: number }) {
  const { pulsMin, pulsMax } = wolken.messung
  return (
    <input
      aria-label="Aktueller Puls"
      className="sheet-range block w-full"
      style={fuellung(wert, pulsMin, pulsMax)}
      type="range"
      min={pulsMin}
      max={pulsMax}
      step={1}
      value={wert}
      readOnly
    />
  )
}

function Bedienseite({ heute }: { heute: Date }) {
  return (
    <Seite nummer={3} titel="Pattern Library · Bedienelemente">
      <div className="grid h-full grid-cols-[1fr_1fr_400px] gap-6">
        <div className="flex min-h-0 flex-col gap-6">
          <Gruppe titel="Primärer Button">
            <div className="grid grid-cols-2 gap-6">
              <Zustand label="Normal">
                <button type="button" className={knopfPrimaer}>Spiel starten</button>
              </Zustand>
              <Zustand label="Gedrückt" notiz="skaliert auf 97 %">
                <button type="button" className={`${knopfPrimaer} ist-gedrueckt`}>Spiel starten</button>
              </Zustand>
              <Zustand label="Deaktiviert" notiz="40 % Deckkraft (wie „Route bestätigen“)">
                <button type="button" disabled className={`${knopfPrimaer} disabled:cursor-not-allowed disabled:opacity-40`}>Route bestätigen</button>
              </Zustand>
              <Zustand label="Fokus" notiz="Umriss 2 px in Fokusfarbe">
                <button type="button" className={`${knopfPrimaer} ist-fokus`}>Spiel starten</button>
              </Zustand>
            </div>
          </Gruppe>
          <Gruppe titel="Sekundärer Button">
            <div className="grid grid-cols-2 gap-6">
              <Zustand label="Normal">
                <button type="button" className={knopfSekundaer}>Spiel verlassen</button>
              </Zustand>
              <Zustand label="Gedrückt" notiz="skaliert auf 97 %">
                <button type="button" className={`${knopfSekundaer} ist-gedrueckt`}>Spiel verlassen</button>
              </Zustand>
              <Zustand label="Deaktiviert" notiz="kommt in der App nicht vor, kein eigener Stil">
                <div className={`flex min-h-14 items-center justify-center rounded-pill border border-dashed border-[#dddddd] ${klein}`}>–</div>
              </Zustand>
              <Zustand label="Fokus" notiz="Umriss 2 px in Fokusfarbe">
                <button type="button" className={`${knopfSekundaer} ist-fokus`}>Spiel verlassen</button>
              </Zustand>
            </div>
          </Gruppe>
          <Gruppe titel="Glas-Button und Glas-Pille" className="flex-1">
            <div className="flex gap-6">
              <Zustand label="Glas-Button · Standard" notiz="48 px, Startseite und Spielleisten">
                <div className="flex h-[112px] w-[160px] items-center justify-center rounded-[28px]" style={{ background: buehnenVerlauf }}>
                  <button type="button" aria-label="Einstellungen" className={`flex size-12 items-center justify-center text-black ${glasPille}`}>
                    <Settings2 size={20} strokeWidth={1.5} aria-hidden />
                  </button>
                </div>
              </Zustand>
              <Zustand label="Glas-Pille · Standard" notiz="„Heute dran“, „Überspringen“, Spielleisten">
                <div className="flex h-[112px] w-[260px] items-center justify-center gap-3 rounded-[28px]" style={{ background: himmelVerlauf }}>
                  <span className={`flex h-8 items-center px-3 text-[12px] font-medium leading-3 text-black ${glasPille}`}>Heute dran</span>
                  <span className={`flex h-12 items-center px-4 text-[14px] font-medium leading-3 text-black ${glasPille}`}>Überspringen</span>
                </div>
              </Zustand>
            </div>
          </Gruppe>
        </div>

        <div className="flex min-h-0 flex-col gap-6">
          <Gruppe titel="Puls-Slider">
            <div className="flex flex-col gap-5">
              <Zustand label="Leer" notiz="Startwert 70 Schläge">
                <PulsRegler wert={wolken.messung.startPuls} />
              </Zustand>
              <Zustand label="Beim Ziehen" notiz="Füllung folgt dem Griff; kein eigener Stil fürs Ziehen">
                <PulsRegler wert={96} />
              </Zustand>
              <Zustand label="Eingerastet" notiz="Schritte zu 1 Schlag, der Wert bleibt stehen">
                <PulsRegler wert={112} />
              </Zustand>
            </div>
          </Gruppe>
          <Gruppe titel="Stimmungs-Slider" className="flex-1">
            <div className="flex flex-col gap-5">
              <Zustand label="Leer" notiz="heute noch keine Stimmung, Griff auf „Geht so“">
                <StimmungsKarte gespeichert={null} heute={heute} />
              </Zustand>
              <Zustand label="Beim Ziehen" notiz="Griff gleitet in 200 ms zur Stufe; kein eigener Stil fürs Ziehen">
                <StimmungsKarte gespeichert={4} heute={heute} offenErzwingen />
              </Zustand>
              <Zustand label="Eingerastet" notiz="nach 600 ms klappt die Karte zu einer Zeile zusammen">
                <StimmungsKarte gespeichert={4} heute={heute} />
              </Zustand>
            </div>
          </Gruppe>
        </div>

        <Gruppe titel="Sheet">
          <Zustand label="Offen, mit abgedunkeltem Hintergrund" notiz="20 % Abdunkeln, 8 px Weichzeichnen, Karte mit 8 px Rand">
            <Buehne breite={393} hoehe={852} skala={0.86}>
              {bild('screen-startseite') && <img src={bild('screen-startseite')} alt="" className="absolute inset-0 size-full" />}
              <SheetBewegung.Provider value="ruhig">
                <VerlassenSheet onFortsetzen={() => {}} onVerlassen={() => {}} />
              </SheetBewegung.Provider>
            </Buehne>
          </Zustand>
        </Gruppe>
      </div>
    </Seite>
  )
}

/* ── 4 · Himmelsroute und Onboarding ── */

function WegpunktZustand({ id, label, ...props }: { id: string; label: string } & Partial<ComponentProps<typeof Wegpunkt>>) {
  return (
    <Zustand label={label}>
      <LayoutGroup id={id}>
        <Buehne breite={120} hoehe={120} hintergrund={himmelVerlauf}>
          <Wegpunkt
            index={0}
            mitte={{ x: 60, y: 60 }}
            durchmesser={himmel.rueckweg.wegpunktMax}
            inhalt={null}
            inhaltSichtbar
            ergebnis={null}
            richtigerGegenstand="drachen"
            hervorgehoben={false}
            auswahlAktiv={false}
            gesperrt
            {...props}
          />
        </Buehne>
      </LayoutGroup>
    </Zustand>
  )
}

function Spielseite({ heute }: { heute: Date }) {
  const sitzungen = useMemo(() => ladeSitzungen(heute), [heute])
  const wert = (spiel: SpielId) => spielkartenWert(sitzungen, spiel)
  const g = himmel.rueckweg.karte
  const fortschritt = Array.from({ length: 6 }, (_, i) => ({ x: 60, y: 330 - i * 56 }))
  const karten = [
    { label: 'Normal', kennung: 'drachen', art: 'normal', notiz: 'im Haufen, leicht gedreht' },
    { label: 'Angehoben', kennung: 'rakete', art: 'gehoben', notiz: 'beim Ziehen: 105 %, stärkerer Schatten' },
    { label: 'Ausgewählt', kennung: 'ufo', art: 'gewaehlt', notiz: 'nach Antippen: Rahmen 2 px in Akzent' },
  ] as const
  return (
    <Seite nummer={4} titel="Pattern Library · Spiele und Onboarding">
      <div className="grid h-full grid-cols-[520px_1fr] grid-rows-[auto_1fr] gap-6">
        <Gruppe titel="Gegenstands-Karte" notiz="Himmelsroute, Rückweg-Sheet">
          <div className="flex gap-6">
            {karten.map((k) => (
              <Zustand key={k.art} label={k.label} notiz={k.notiz} breite={140}>
                <LayoutGroup id={`karte-${k.art}`}>
                  <Buehne breite={140} hoehe={120} hintergrund="#ffffff">
                    {k.art === 'gehoben' ? (
                      <GehobeneKarte kennung={k.kennung} links={70 - g / 2} oben={60 - g / 2} groesse={g} />
                    ) : (
                      <GegenstandsKarte kennung={k.kennung} mitte={{ x: 70, y: 60 }} groesse={g} drehung={k.art === 'normal' ? -4 : 3} ausgewaehlt={k.art === 'gewaehlt'} />
                    )}
                  </Buehne>
                </LayoutGroup>
              </Zustand>
            ))}
          </div>
        </Gruppe>
        <Gruppe titel="Wegpunkt" notiz="Himmelsroute, Übersicht und Auflösung">
          <div className="flex gap-6">
            <WegpunktZustand id="wp-leer" label="Leer" />
            <WegpunktZustand id="wp-hervor" label="Hervorgehoben" hervorgehoben />
            <WegpunktZustand id="wp-belegt" label="Belegt" inhalt="drachen" />
            <WegpunktZustand id="wp-richtig" label="Richtig" inhalt="drachen" ergebnis={true} />
            <WegpunktZustand id="wp-falsch" label="Falsch" inhalt="ufo" ergebnis={false} />
          </div>
        </Gruppe>
        <Gruppe titel="Fortschrittsroute im Onboarding">
          <Zustand label="Standard" notiz="Schritt 3 von 6: besucht in Akzent, aktuell größer">
            <Buehne breite={120} hoehe={380} hintergrund={himmelVerlauf}>
              <Fortschrittsroute wegpunkte={fortschritt} schritt={2} onGehe={() => {}} />
            </Buehne>
          </Zustand>
        </Gruppe>
        <Gruppe titel="Spielkarte" notiz="Startseite; umgedreht im Onboarding">
          <div className="flex gap-6">
            <Zustand label="Normal" breite={167}>
              <SpielKarte spiel="himmelsroute" wert={wert('himmelsroute')} heuteDran={false} onStart={() => {}} />
            </Zustand>
            <Zustand label="„Heute dran“" breite={167}>
              <SpielKarte spiel="wolkensammeln" wert={wert('wolkensammeln')} heuteDran onStart={() => {}} />
            </Zustand>
            <Zustand label="Umgedreht" notiz="Rückseite mit Modus und Spielidee" breite={167}>
              <WendeKarte spiel="wolkensammeln" gedreht onTippen={() => {}} />
            </Zustand>
          </div>
        </Gruppe>
      </div>
    </Seite>
  )
}

/* ── 5 · Startseite ── */

function beispielWoche(): WochenTag[] {
  const kurz = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const messung = [true, false, true, true, false, false, false]
  return kurz.map((k, i) => ({ datum: new Date(2026, 8, 21 + i), kurz: k, heute: i === 3, zukunft: i > 3, messung: messung[i] }))
}

function Startseitenseite({ heute }: { heute: Date }) {
  return (
    <Seite nummer={5} titel="Pattern Library · Startseite">
      <div className="grid h-full grid-cols-[440px_440px_1fr] grid-rows-[auto_1fr] gap-6">
        <Gruppe titel="Wochentag" notiz="Beispielwoche: Do ist heute" className="col-span-2">
          <div className="flex items-start gap-6">
            <div className="w-[393px] shrink-0 rounded-[28px]" style={{ background: kopfVerlauf }}>
              <Wochenleiste tage={beispielWoche()} pille="3 von 7 Tagen" kompakt={false} onTag={() => {}} />
            </div>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              <li>
                <span className="block text-[12px] font-semibold leading-4 text-black">Heute</span>
                <span className={klein}>Glas-Pille hinter dem Tag (Do)</span>
              </li>
              <li>
                <span className="block text-[12px] font-semibold leading-4 text-black">Mit Messung</span>
                <span className={klein}>Punkt in Akzentfarbe (Mo, Mi, Do), antippbar</span>
              </li>
              <li>
                <span className="block text-[12px] font-semibold leading-4 text-black">Zukunft</span>
                <span className={klein}>40 % Deckkraft (Fr–So)</span>
              </li>
            </ul>
          </div>
        </Gruppe>
        <Gruppe titel="Echoo" notiz="Zustand der letzten drei Messungen im Vergleich zum eigenen Schnitt" className="row-span-2">
          <div className="flex flex-col gap-4">
            {(
              [
                ['gedaempft', 'Gedämpft', 'unter dem Schnitt: schwächerer Schein'],
                ['normal', 'Wie gewohnt', 'im Schnitt'],
                ['heller', 'Heller', 'über dem Schnitt: stärkerer Schein'],
              ] as const
            ).map(([zustand, label, notiz]) => (
              <Zustand key={zustand} label={label} notiz={notiz}>
                <LayoutGroup id={`echoo-${zustand}`}>
                  <Buehne breite={393} hoehe={416} skala={0.52}>
                    <EchooKopf zustand={zustand} satz="" onOeffnen={() => {}} />
                  </Buehne>
                </LayoutGroup>
              </Zustand>
            ))}
          </div>
        </Gruppe>
        <Gruppe titel="Stimmungskarte · offen">
          <StimmungsKarte gespeichert={null} heute={heute} />
        </Gruppe>
        <Gruppe titel="Stimmungskarte · eingeklappt">
          <StimmungsKarte gespeichert={5} heute={heute} />
        </Gruppe>
      </div>
    </Seite>
  )
}

/* ── 6–7 · Bewegung ── */

const FILME: { name: string; titel: string; notiz: string }[] = [
  { name: 'aufgang', titel: 'Echoos Aufgang', notiz: 'Echoo steigt hinter der Erde auf (transform, opacity)' },
  { name: 'flug', titel: 'Flug zwischen zwei Haltepunkten', notiz: 'Echoo fliegt vor, die Kamera zieht nach (transform)' },
  { name: 'route', titel: 'Route zeichnen und Nachfliegen', notiz: 'Abschnitt für Abschnitt (stroke-dashoffset), dann der Heimflug' },
  { name: 'container', titel: 'Container Transform der Spielkarte', notiz: 'Das Kartenbild wächst zum Himmel des Spiels (transform, opacity)' },
  { name: 'stimmung', titel: 'Einklappen der Stimmungskarte', notiz: 'Die Karte klappt zu einer Zeile zusammen (grid-template-rows)' },
]

function Filmstreifen({ name, titel, notiz, hoehe }: { name: string; titel: string; notiz: string; hoehe: number }) {
  return (
    <Gruppe titel={titel} notiz={notiz}>
      <div className="flex gap-4">
        {[1, 2, 3, 4].map((n) => (
          <figure key={n} className="m-0 flex flex-col items-center gap-1">
            <Telefon name={`film-${name}-${n}`} hoehe={hoehe} alt={`${titel}, Bild ${n}`} />
            <figcaption className={klein}>{n}</figcaption>
          </figure>
        ))}
      </div>
    </Gruppe>
  )
}

function Bewegungsseite1() {
  return (
    <Seite nummer={6} titel="Bewegung · Filmstreifen">
      <div className="grid grid-cols-2 gap-6">
        {FILME.slice(0, 4).map((f) => (
          <Filmstreifen key={f.name} {...f} hoehe={290} />
        ))}
      </div>
    </Seite>
  )
}

function Bewegungsseite2() {
  const regeln = [
    ['Nur vier Eigenschaften', 'Animiert werden ausschließlich transform, opacity, stroke-dashoffset und grid-template-rows – nie Breite, Höhe, Position oder Farben im Layout.'],
    ['Dauerschleifen nur an Echoo', 'Die einzige Endlosbewegung ist Echoos Atmen (4,2 s, 1,2 % Größe). Alles andere bewegt sich nur als Antwort auf eine Handlung.'],
    ['Kein Nachfedern auf der Startseite', 'Sheets der Startseite und des Onboardings gleiten ohne Überschwingen herein.'],
    ['Reduzierte Bewegung', 'Mit „Bewegung reduzieren“ im System entfallen Flüge, Zoom und Federn; Inhalte blenden nur kurz über.'],
  ]
  return (
    <Seite nummer={7} titel="Bewegung · Filmstreifen und Regeln">
      <div className="grid grid-cols-2 gap-6">
        <Filmstreifen {...FILME[4]} hoehe={290} />
        <Gruppe titel="Regeln für Bewegung">
          <div className="flex flex-col gap-5">
            {regeln.map(([titel, text]) => (
              <div key={titel}>
                <h4 className="text-[18px] font-semibold leading-6 text-black">{titel}</h4>
                <p className={`mt-1 ${fliessStil}`}>{text}</p>
              </div>
            ))}
          </div>
        </Gruppe>
      </div>
    </Seite>
  )
}

/* ── 8–9 · Flowcharts ── */

function Diagramm({ name, titel, notiz }: { name: string; titel: string; notiz: string }) {
  const svg = flowchart(name)
  return (
    <div className={`flex h-full min-h-0 flex-col p-6 ${karte}`}>
      <h3 className={titelStil}>{titel}</h3>
      <p className={`mt-1 ${klein}`}>{notiz}</p>
      {svg ? (
        <div className="konzept-diagramm mt-4 min-h-0 flex-1" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className={`flex flex-1 items-center justify-center ${klein}`}>Flowchart fehlt: {name}.svg</div>
      )}
    </div>
  )
}

function Flowchartseite1() {
  return (
    <Seite nummer={8} titel="Flowcharts · App und Wolkensammeln">
      <div className="grid h-full grid-cols-[1fr_1.3fr] gap-6">
        <Diagramm name="app" titel="App-Ablauf" notiz="Aus App.tsx, Startsequenz.tsx und den Routen" />
        <Diagramm name="wolkensammeln" titel="Wolkensammeln" notiz="Aus den Phasen in Wolkensammeln.tsx und session.ts" />
      </div>
    </Seite>
  )
}

function Flowchartseite2() {
  return (
    <Seite nummer={9} titel="Flowchart · Himmelsroute">
      <Diagramm name="himmelsroute" titel="Himmelsroute" notiz="Aus der Zustandsmaschine games/himmelsroute/ablauf.ts" />
    </Seite>
  )
}

/* ── Seite ── */

export default function Konzept() {
  const heute = useMemo(() => new Date(), [])
  return (
    <div className="konzept min-h-dvh bg-[#f3efe6] py-12">
      <style>{`
        @page { size: A3 landscape; margin: 0; }
        @media print {
          html, body { background: none !important; height: auto !important; }
          .konzept { padding: 0 !important; background: none !important; }
          .konzept-seite { margin: 0 !important; break-after: page; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .konzept-diagramm svg { width: 100% !important; height: 100% !important; max-width: none !important; }
      `}</style>
      <Titelseite />
      <Grundlagenseite />
      <Bedienseite heute={heute} />
      <Spielseite heute={heute} />
      <Startseitenseite heute={heute} />
      <Bewegungsseite1 />
      <Bewegungsseite2 />
      <Flowchartseite1 />
      <Flowchartseite2 />
    </div>
  )
}
