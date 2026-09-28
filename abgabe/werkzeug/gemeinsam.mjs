/*
  Gemeinsame Hilfen für die Abgabe-Skripte:
  - startet den Vite-Server des Projekts,
  - öffnet Chrome (installiertes Google Chrome, kein eigener Browser-Download),
  - liest den Spielzustand direkt aus React (keine festen Koordinaten),
  - nimmt Bildfolgen über die Chrome-Bildschirmübertragung auf.
*/
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

export const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const ABGABE = path.join(WURZEL, 'abgabe')
export const TELEFON = { width: 393, height: 852 }
export const warte = (ms) => new Promise((r) => setTimeout(r, ms))

/** DATEINAME aus abgabe.config.ts */
export function dateiname() {
  const text = fs.readFileSync(path.join(ABGABE, 'abgabe.config.ts'), 'utf8')
  return text.match(/DATEINAME\s*=\s*'([^']*)'/)[1]
}

/** Vite-Server des Projekts (DEMO_DATA ist im Code an) */
export async function starteServer() {
  // vite liegt im Projekt, nicht im Werkzeug-Ordner
  const { createServer } = await import(path.join(WURZEL, 'node_modules/vite/dist/node/index.js'))
  const server = await createServer({ root: WURZEL, configFile: path.join(WURZEL, 'vite.config.ts'), logLevel: 'error', server: { port: 5310 } })
  await server.listen()
  const url = server.resolvedUrls.local[0].replace(/\/$/, '')
  return { server, url }
}

export async function starteBrowser() {
  return chromium.launch({ channel: 'chrome' })
}

/**
  Smartphone-Kontext 393 × 852 (doppelte Pixeldichte für scharfe Bilder).
  speicher: Einträge im Browser-Speicher, die vor dem ersten Laden gesetzt werden.
*/
export async function telefon(browser, speicher = {}) {
  const kontext = await browser.newContext({ viewport: TELEFON, deviceScaleFactor: 2 })
  await kontext.addInitScript((eintraege) => {
    if (sessionStorage.getItem('abgabe-init')) return
    sessionStorage.setItem('abgabe-init', '1')
    localStorage.clear()
    for (const [k, v] of Object.entries(eintraege)) localStorage.setItem(k, v)
  }, speicher)
  const seite = await kontext.newPage()
  const fehler = []
  seite.on('pageerror', (e) => fehler.push(e.message))
  seite.on('console', (m) => m.type() === 'error' && fehler.push(m.text()))
  return { kontext, seite, fehler }
}

export const SPEICHER = {
  einfuehrungGesehen: { 'sonnenschein.einstellungen.v1': JSON.stringify({ onboardingGesehen: true }) },
  proberundenGesehen: { 'sonnenschein.himmelsroute.proberundeGesehen': '1', 'sonnenschein.wolkensammeln.proberundeGesehen': '1' },
}

/* ── Spielzustand aus React lesen ── */

/** Hook-Werte der nächsten Komponente mit diesem Namen, gefunden über ein beliebiges Element darin */
async function hooks(seite, komponente) {
  return seite.evaluate((name) => {
    for (const el of document.querySelectorAll('main *')) {
      const schluessel = Object.keys(el).find((k) => k.startsWith('__reactFiber$'))
      let f = schluessel && el[schluessel]
      while (f) {
        if (typeof f.elementType === 'function' && f.elementType.name === name) {
          const werte = []
          for (let h = f.memoizedState; h; h = h.next) werte.push(h.memoizedState)
          // nur einfache, serialisierbare Werte weitergeben
          return werte.map((w) => {
            if (w && typeof w === 'object' && 'current' in w) {
              const c = w.current
              return { ref: Array.isArray(c) && c.every((x) => typeof x === 'number') ? c : null }
            }
            if (w && typeof w === 'object' && ('phase' in w || 'art' in w)) return JSON.parse(JSON.stringify(w))
            return null
          })
        }
        f = f.return
      }
    }
    return null
  }, komponente)
}

/** Himmelsroute: Zustand der Zustandsmaschine (ablauf.ts) */
export async function himmelsroute(seite) {
  const werte = await hooks(seite, 'Himmelsroute')
  return werte?.find((w) => w && 'phase' in w && 'ziehung' in w) ?? null
}

/** Wolkensammeln: aktuelle Phase und die Folge der leuchtenden Wolken */
export async function wolkensammeln(seite) {
  const werte = await hooks(seite, 'Wolkensammeln')
  if (!werte) return null
  const phase = werte.find((w) => w && 'art' in w)
  const folge = werte.find((w) => w && 'ref' in w && w.ref)?.ref ?? []
  return { phase: phase?.art ?? null, folge }
}

export async function bisZustand(abfrage, bedingung, ms = 30000) {
  const start = Date.now()
  while (Date.now() - start < ms) {
    const z = await abfrage()
    if (z && bedingung(z)) return z
    await warte(80)
  }
  throw new Error('Zustand nicht erreicht')
}

/* ── Bildfolgen über die Chrome-Bildschirmübertragung (echte Zeit, keine Verlangsamung) ── */

export class Aufnahme {
  constructor(seite, { format = 'png', ordner = null, qualitaet = 85 } = {}) {
    this.seite = seite
    this.format = format
    this.ordner = ordner
    this.qualitaet = qualitaet
    this.bilder = []
    this.anzahl = 0
  }

  async start() {
    this.cdp = await this.seite.context().newCDPSession(this.seite)
    this.cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
      const t = metadata.timestamp * 1000
      if (this.ordner) {
        const datei = path.join(this.ordner, `${String(this.anzahl++).padStart(6, '0')}.${this.format === 'png' ? 'png' : 'jpg'}`)
        fs.writeFileSync(datei, Buffer.from(data, 'base64'))
        this.bilder.push({ t, datei })
      } else {
        this.bilder.push({ t, data })
      }
      await this.cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
    })
    await this.cdp.send('Page.startScreencast', {
      format: this.format,
      quality: this.qualitaet,
      maxWidth: TELEFON.width * 2,
      maxHeight: TELEFON.height * 2,
      everyNthFrame: 1,
    })
    this.beginn = Date.now()
  }

  /** Zeitmarke in ms seit Beginn (Wanduhr – passt zu den Bild-Zeitstempeln) */
  jetzt() {
    return Date.now()
  }

  async stopp() {
    await this.cdp.send('Page.stopScreencast').catch(() => {})
    await this.cdp.detach().catch(() => {})
  }

  /** Das Bild, das zum Zeitpunkt t (Wanduhr, ms) zu sehen war */
  bildBei(t) {
    let bestes = this.bilder[0]
    for (const b of this.bilder) if (b.t <= t) bestes = b
    return bestes
  }
}

/** Führt eine Handlung aus, nimmt dabei auf und speichert vier Bilder zu den Zeitpunkten (ms nach der Handlung) */
export async function filmstreifen(seite, name, handlung, zeiten, dauer) {
  const aufnahme = new Aufnahme(seite)
  await aufnahme.start()
  await warte(250)
  const t0 = Date.now()
  await handlung()
  await warte(dauer)
  await aufnahme.stopp()
  zeiten.forEach((z, i) => {
    const b = aufnahme.bildBei(t0 + z)
    fs.writeFileSync(path.join(ABGABE, 'bilder', `film-${name}-${i + 1}.png`), Buffer.from(b.data, 'base64'))
  })
  console.log(`Filmstreifen ${name}: ${aufnahme.bilder.length} Bilder aufgenommen, 4 gespeichert`)
}

/** Mittelpunkt eines Elements */
export async function mitte(locator) {
  const b = await locator.boundingBox()
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}

/** Mit der Maus ziehen, in menschlichem Tempo */
export async function ziehe(seite, von, nach, schritte = 18) {
  await seite.mouse.move(von.x, von.y)
  await seite.mouse.down()
  await warte(120)
  await seite.mouse.move(nach.x, nach.y, { steps: schritte })
  await warte(120)
  await seite.mouse.up()
}
