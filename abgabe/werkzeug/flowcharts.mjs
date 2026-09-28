/*
  Rendert die Mermaid-Dateien in abgabe/flowcharts/*.mmd als SVG
  (Farben und Schrift der App stehen in den Dateien selbst).
  Nutzt das installierte Google Chrome, kein eigener Browser-Download.
*/
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { ABGABE } from './gemeinsam.mjs'

const hier = path.dirname(fileURLToPath(import.meta.url))
const ordner = path.join(ABGABE, 'flowcharts')
const puppeteer = path.join(hier, 'puppeteer.json')
fs.writeFileSync(puppeteer, JSON.stringify({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--no-sandbox'] }))
const mmdc = path.join(hier, 'node_modules/.bin/mmdc')

for (const datei of fs.readdirSync(ordner).filter((d) => d.endsWith('.mmd'))) {
  const svg = datei.replace(/\.mmd$/, '.svg')
  execFileSync(mmdc, ['-q', '-p', puppeteer, '-i', path.join(ordner, datei), '-o', path.join(ordner, svg), '-b', 'transparent'], { stdio: 'inherit' })
  console.log(`${svg} gespeichert`)
}
