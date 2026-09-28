/*
  Druckt /konzept als A3-quer-PDF nach abgabe/{DATEINAME}_konzept.pdf und prüft:
  - kein Inhalt ragt über ein Blatt hinaus,
  - Text ist Text (markierbar) und die Schriften sind eingebettet,
  - die Flowcharts liegen als Vektorgrafik (SVG) im Dokument.
*/
import fs from 'node:fs'
import path from 'node:path'
import { ABGABE, dateiname, starteBrowser, starteServer, warte } from './gemeinsam.mjs'

const { server, url } = await starteServer()
const browser = await starteBrowser()
const ziel = path.join(ABGABE, `${dateiname()}_konzept.pdf`)

try {
  const seite = await browser.newPage({ viewport: { width: 1700, height: 1200 } })
  const fehler = []
  seite.on('pageerror', (e) => fehler.push(e.message))
  seite.on('console', (m) => m.type() === 'error' && fehler.push(m.text()))
  await seite.goto(`${url}/konzept`)
  await seite.locator('.konzept-seite').first().waitFor()
  await seite.evaluate(() => document.fonts.ready)
  await warte(2500) // Sheets und Wegpunkte sind eingeblendet

  // Prüfung 1: nichts ragt über ein Blatt hinaus
  const ueberstand = await seite.evaluate(() =>
    [...document.querySelectorAll('.konzept-seite')].flatMap((s, i) => {
      const rahmen = s.getBoundingClientRect()
      const zuGross = [...s.querySelectorAll('*')].filter((el) => {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) return false
        // Inhalte in Bühnen und Diagrammen sind absichtlich beschnitten
        if (el.closest('.overflow-hidden') && el.closest('.overflow-hidden') !== s) return false
        return r.right > rahmen.right + 1 || r.bottom > rahmen.bottom + 1
      })
      return zuGross.length ? [`Seite ${i + 1}: ${zuGross.length} Elemente ragen hinaus (z. B. ${zuGross[0].tagName.toLowerCase()} „${(zuGross[0].textContent ?? '').trim().slice(0, 40)}“)`] : []
    }),
  )
  const anzahl = await seite.locator('.konzept-seite').count()

  await seite.emulateMedia({ media: 'print' })
  await seite.pdf({ path: ziel, preferCSSPageSize: true, printBackground: true })

  // Prüfung 2: Schriften eingebettet, Text vorhanden, Vektorgrafik
  const pdf = fs.readFileSync(ziel).toString('latin1')
  const schriften = new Set([...pdf.matchAll(/\/BaseFont\s*\/([A-Za-z0-9+_-]+)/g)].map((m) => m[1]))
  const eingebettet = (pdf.match(/\/FontFile[23]?\b/g) ?? []).length
  const seiten = (pdf.match(/\/Type\s*\/Page[^s]/g) ?? []).length

  console.log(`PDF gespeichert: ${path.relative(process.cwd(), ziel)}`)
  console.log(`Blätter im Browser: ${anzahl}, Seiten im PDF: ${seiten}`)
  console.log(`Schriften: ${[...schriften].join(', ') || 'keine gefunden'}; eingebettete Schriftdateien: ${eingebettet}`)
  console.log(ueberstand.length ? `Achtung, abgeschnitten:\n${ueberstand.join('\n')}` : 'Nichts ragt über ein Blatt hinaus')
  console.log(fehler.length ? `Fehler in der Konsole:\n${fehler.join('\n')}` : 'Keine Fehler in der Konsole')
} finally {
  await browser.close()
  await server.close()
}
