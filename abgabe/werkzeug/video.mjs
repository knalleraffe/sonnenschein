/*
  Screencapture-Video als Smartphone (393 × 852) mit Demodaten, in menschlichem Tempo:
  Splash und Onboarding (kurz) → Startseite mit Stimmungscheck → Himmelsroute
  (eine richtige, eine falsche Route) → eine Runde Wolkensammeln → Statistiken
  (Sitzung, Verlauf, Zusammenhänge).

  Spielzüge kommen aus dem Spielzustand (welche Wolken leuchten, welche
  Gegenstände Echoo begegnet sind), nicht aus festen Koordinaten.
  Eine Wolkensammeln-Runde hat 20 Durchgänge; zwei Abschnitte davon laufen
  im Video dreimal so schnell, damit es unter 4 Minuten bleibt.

  Ergebnis: abgabe/{DATEINAME}_video.mp4
*/
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import {
  ABGABE,
  Aufnahme,
  SPEICHER,
  bisZustand,
  dateiname,
  himmelsroute,
  mitte,
  starteBrowser,
  starteServer,
  telefon,
  warte,
  wolkensammeln,
  ziehe,
} from './gemeinsam.mjs'

const ZEITRAFFER = 3
const ordner = fs.mkdtempSync(path.join(os.tmpdir(), 'sonnenschein-video-'))
const ziel = path.join(ABGABE, `${dateiname()}_video.mp4`)

const { server, url } = await starteServer()
const browser = await starteBrowser()
const { seite, fehler } = await telefon(browser, SPEICHER.proberundenGesehen)
const aufnahme = new Aufnahme(seite, { format: 'jpeg', ordner, qualitaet: 88 })
/** Abschnitte im Zeitraffer: [von, bis] in Wanduhr-ms */
const raffer = []
const knopf = (name) => seite.getByRole('button', { name, exact: true })
const imSheet = (name) => seite.getByRole('dialog').getByRole('button', { name, exact: true })

try {
  await seite.goto(`${url}/`)
  await aufnahme.start()

  /* ── Splash und Onboarding (kurz) ── */
  await knopf('Weiter').waitFor({ timeout: 10000 })
  await warte(1800)
  for (let i = 0; i < 5; i++) {
    await knopf('Weiter').click()
    await warte(1700)
  }
  await knopf("Los geht's").click()
  await warte(2200)

  /* ── Startseite mit Stimmungscheck ── */
  const regler = seite.getByRole('slider', { name: 'Wie fühlst du dich heute?' })
  const box = await regler.boundingBox()
  const griff = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  await ziehe(seite, griff, { x: box.x + box.width * 0.78, y: griff.y }, 14)
  await warte(2200)

  /* ── Himmelsroute: eine richtige und eine falsche Route ── */
  await knopf('Himmelsroute starten').click()
  await imSheet('Weiter').waitFor()
  await warte(2500) // Erklärung lesen
  await imSheet('Weiter').click()
  await imSheet('Spiel starten').waitFor()
  await warte(1500)
  await imSheet('Spiel starten').click()

  const namenVon = (kennungen) =>
    seite.evaluate(async (liste) => {
      const m = await import('/src/games/himmelsroute/gegenstaende.ts')
      return liste.map((k) => m.gegenstand(k).name)
    }, kennungen)

  async function runde({ falsch }) {
    const pfeil = seite.locator('button[aria-label="Zum nächsten Haltepunkt"]:not([disabled])')
    for (;;) {
      const z = await himmelsroute(seite)
      if (z?.phase === 'rueckweg') break
      if (z?.phase === 'aufstieg' && !z.begegnungLaeuft && z.begegnungen < z.laenge && (await pfeil.count())) {
        await warte(500)
        await pfeil.click().catch(() => {})
      }
      await warte(150)
    }
    const z = await bisZustand(() => himmelsroute(seite), (s) => s.phase === 'rueckweg')
    await warte(1800)
    const namen = await namenVon(z.ziehung.folge)
    // falsche Route: die unteren beiden Gegenstände vertauscht (2 von 4 falsch → zweiter Versuch)
    const reihenfolge = namen.map((_, i) => i)
    if (falsch) [reihenfolge[0], reihenfolge[1]] = [reihenfolge[1], reihenfolge[0]]
    for (let wegpunkt = 0; wegpunkt < namen.length; wegpunkt++) {
      const karte = seite.getByRole('dialog').getByRole('button', { name: namen[reihenfolge[wegpunkt]], exact: true })
      const ziel = seite.getByRole('button', { name: `Wegpunkt ${wegpunkt + 1}, leer` })
      await ziehe(seite, await mitte(karte), await mitte(ziel))
      await warte(600)
    }
    await warte(500)
    await imSheet('Route bestätigen').click()
  }

  await runde({ falsch: false })
  await imSheet('Nächste Runde').waitFor({ timeout: 20000 })
  await warte(2000)
  await imSheet('Nächste Runde').click()
  await runde({ falsch: true })
  await imSheet('Zweiter Versuch').waitFor({ timeout: 20000 })
  await warte(2500)
  await imSheet('Zweiter Versuch').click()
  await warte(1200)
  await seite.locator('button[aria-label="Spiel verlassen"]').click()
  await imSheet('Spiel verlassen').waitFor()
  await warte(1000)
  await imSheet('Spiel verlassen').click()
  await warte(2000)

  /* ── Eine Runde Wolkensammeln ── */
  await knopf('Wolkensammeln starten').click()
  await imSheet('Spiel starten').waitFor()
  await warte(2500)
  await imSheet('Spiel starten').click()
  await warte(900)
  await imSheet('Spiel starten').waitFor()
  await warte(1300)
  await imSheet('Spiel starten').click()

  // R = richtig, F = falsch; drei Fehler in Folge (9–11) führen zur Bewegungspause
  const plan = 'RRFRRFRRFFFRRFRRFRRR'
  const wolkenIds = async () =>
    (await seite.locator('[aria-label^="Wolke "]').evaluateAll((els) => els.map((e) => Number(e.getAttribute('aria-label').replace('Wolke ', '')) - 1)))
  const tippe = async (id) => {
    const wolke = seite.locator(`[aria-label="Wolke ${id + 1}"]`)
    const p = await mitte(wolke)
    await wolke.dispatchEvent('pointerdown', { button: 0, pointerType: 'mouse', clientX: p.x, clientY: p.y })
  }

  for (let n = 1; n <= plan.length; n++) {
    if (n === 4 || n === 13) raffer.push([Date.now(), null])
    const z = await bisZustand(() => wolkensammeln(seite), (s) => s.phase === 'eingabe', 60000)
    await warte(600)
    const folge = z.folge
    if (plan[n - 1] === 'R') {
      for (const id of folge) {
        await tippe(id)
        await warte(450)
      }
    } else {
      await tippe(folge[0])
      await warte(500)
      const falsch = (await wolkenIds()).find((id) => !folge.includes(id))
      await tippe(falsch)
    }
    await bisZustand(() => wolkensammeln(seite), (s) => s.phase !== 'eingabe')
    if (n === 8 || n === 19) raffer[raffer.length - 1][1] = Date.now() + 1500

    // Bewegungspause nach drei Fehlern in Folge
    if (n === 11) {
      await imSheet('Ich habe mich bewegt').waitFor({ timeout: 10000 })
      await warte(2500)
      await imSheet('Ich habe mich bewegt').click()
      await imSheet('Spiel fortsetzen').waitFor()
      await warte(1500)
      await imSheet('Spiel fortsetzen').click()
    }
  }
  await imSheet('Statistiken').waitFor({ timeout: 20000 })
  await warte(4000)
  await imSheet('Statistiken').click()

  /* ── Statistiken: Sitzung, Verlauf, Zusammenhänge ── */
  await warte(2500)
  for (const ebene of ['Sitzung', 'Verlauf', 'Zusammenhänge']) {
    await seite.getByRole('button', { name: ebene, exact: true }).first().click()
    await warte(2500)
    if (ebene === 'Zusammenhänge') {
      await seite.mouse.move(196, 500)
      for (let i = 0; i < 6; i++) {
        await seite.mouse.wheel(0, 180)
        await warte(500)
      }
      await warte(1500)
    }
  }
  await aufnahme.stopp()
} finally {
  await browser.close()
  await server.close()
}

/* ── Bilder zu MP4: Dauer je Bild aus den Zeitstempeln, im Zeitraffer gedrittelt ── */
const bilder = aufnahme.bilder
const imRaffer = (t) => raffer.some(([a, b]) => t >= a && t <= (b ?? Infinity))
let summe = 0
const zeilen = ['ffconcat version 1.0']
bilder.forEach((b, i) => {
  const naechstes = bilder[i + 1]
  let dauer = naechstes ? (naechstes.t - b.t) / 1000 : 1
  if (imRaffer(b.t)) dauer /= ZEITRAFFER
  dauer = Math.max(dauer, 0.001)
  summe += dauer
  zeilen.push(`file '${b.datei}'`, `duration ${dauer.toFixed(4)}`)
})
zeilen.push(`file '${bilder[bilder.length - 1].datei}'`)
const liste = path.join(ordner, 'liste.txt')
fs.writeFileSync(liste, zeilen.join('\n'))

let ffmpeg = 'ffmpeg'
try {
  ffmpeg = (await import('ffmpeg-static')).default ?? ffmpeg
} catch {
  // ffmpeg aus dem System
}
execFileSync(
  ffmpeg,
  ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', liste, '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '20', '-movflags', '+faststart', ziel],
  { stdio: 'inherit' },
)
fs.rmSync(ordner, { recursive: true, force: true })

const minuten = Math.floor(summe / 60)
const sekunden = String(Math.round(summe % 60)).padStart(2, '0')
console.log(`Video gespeichert: ${path.relative(process.cwd(), ziel)} (${minuten}:${sekunden} min, ${bilder.length} Bilder)`)
if (summe < 120 || summe > 240) console.log('Achtung: Das Video sollte 2–4 Minuten lang sein.')
console.log(fehler.length ? `Fehler in der Konsole:\n${fehler.join('\n')}` : 'Keine Fehler in der Konsole')
