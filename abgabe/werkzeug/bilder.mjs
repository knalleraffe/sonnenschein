/*
  Screens und Filmstreifen für die Konzeptseite, als Smartphone (393 × 852)
  mit Demodaten. Ergebnis: abgabe/bilder/*.png
    screen-startseite, screen-himmelsroute, screen-zusammenhaenge
    film-{aufgang|flug|route|container|stimmung}-{1..4}
*/
import fs from 'node:fs'
import path from 'node:path'
import {
  ABGABE,
  SPEICHER,
  bisZustand,
  filmstreifen,
  himmelsroute,
  mitte,
  starteBrowser,
  starteServer,
  telefon,
  warte,
  ziehe,
} from './gemeinsam.mjs'

fs.mkdirSync(path.join(ABGABE, 'bilder'), { recursive: true })
const ziel = (name) => path.join(ABGABE, 'bilder', `${name}.png`)

const { server, url } = await starteServer()
const browser = await starteBrowser()
const alleFehler = []

try {
  /* ── Startseite, Stimmungskarte, Container Transform ── */
  {
    const { kontext, seite, fehler } = await telefon(browser, { ...SPEICHER.einfuehrungGesehen, ...SPEICHER.proberundenGesehen })
    await seite.goto(`${url}/`)
    await seite.getByRole('button', { name: 'Himmelsroute starten' }).waitFor()
    await warte(2500) // Splash-Ausgang und Einblenden abwarten
    await seite.screenshot({ path: ziel('screen-startseite') })
    console.log('screen-startseite gespeichert')

    // Stimmungskarte: Griff nach rechts ziehen, loslassen – die Karte klappt nach 600 ms zu
    const regler = seite.getByRole('slider', { name: 'Wie fühlst du dich heute?' })
    const box = await regler.boundingBox()
    const von = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    const nach = { x: box.x + box.width - 20, y: von.y }
    await seite.mouse.move(von.x, von.y)
    await seite.mouse.down()
    await seite.mouse.move(nach.x, nach.y, { steps: 12 })
    await warte(300)
    await filmstreifen(seite, 'stimmung', () => seite.mouse.up(), [0, 700, 820, 1100], 1400)

    await warte(500)
    await filmstreifen(seite, 'container', () => seite.getByRole('button', { name: 'Himmelsroute starten' }).click(), [0, 160, 320, 480], 700)
    alleFehler.push(...fehler)
    await kontext.close()
  }

  /* ── Himmelsroute: Aufgang, Flug, Nachbauen, Route ── */
  {
    const { kontext, seite, fehler } = await telefon(browser, { ...SPEICHER.einfuehrungGesehen, ...SPEICHER.proberundenGesehen })
    await seite.goto(`${url}/himmelsroute`)
    await seite.getByRole('button', { name: 'Weiter' }).click()
    await seite.getByRole('button', { name: 'Spiel starten' }).waitFor()
    await warte(600)
    await filmstreifen(seite, 'aufgang', () => seite.getByRole('button', { name: 'Spiel starten' }).click(), [450, 850, 1250, 1750], 2200)

    const pfeil = seite.locator('button[aria-label="Zum nächsten Haltepunkt"]:not([disabled])')
    let erster = true
    for (;;) {
      const z = await himmelsroute(seite)
      if (z.phase === 'rueckweg') break
      if (z.phase === 'aufstieg' && !z.begegnungLaeuft && z.begegnungen < z.laenge && (await pfeil.count())) {
        await warte(400)
        if (erster) {
          erster = false
          await filmstreifen(seite, 'flug', () => pfeil.click(), [0, 200, 420, 850], 1100)
        } else await pfeil.click()
      }
      await warte(150)
    }

    // Nachbauen: die ersten beiden Gegenstände legen, dann der Screen
    const z = await bisZustand(() => himmelsroute(seite), (s) => s.phase === 'rueckweg')
    await warte(1600)
    const namen = await seite.evaluate(async (folge) => {
      const m = await import('/src/games/himmelsroute/gegenstaende.ts')
      return folge.map((k) => m.gegenstand(k).name)
    }, z.ziehung.folge)
    const lege = async (i) => {
      const karte = seite.getByRole('dialog').getByRole('button', { name: namen[i], exact: true })
      const wegpunkt = seite.getByRole('button', { name: `Wegpunkt ${i + 1}, leer` })
      await ziehe(seite, await mitte(karte), await mitte(wegpunkt))
      await warte(500)
    }
    await lege(0)
    await lege(1)
    await warte(400)
    await seite.screenshot({ path: ziel('screen-himmelsroute') })
    console.log('screen-himmelsroute gespeichert')
    for (let i = 2; i < namen.length; i++) await lege(i)
    await warte(400)
    await filmstreifen(seite, 'route', () => seite.getByRole('button', { name: 'Route bestätigen' }).click(), [700, 1500, 3000, 4700], 5200)
    alleFehler.push(...fehler)
    await kontext.close()
  }

  /* ── Statistik „Zusammenhänge“ ── */
  {
    const { kontext, seite, fehler } = await telefon(browser, SPEICHER.einfuehrungGesehen)
    await seite.goto(`${url}/statistiken?ebene=zusammenhaenge&spiel=wolkensammeln`)
    await warte(2500)
    await seite.screenshot({ path: ziel('screen-zusammenhaenge') })
    console.log('screen-zusammenhaenge gespeichert')
    alleFehler.push(...fehler)
    await kontext.close()
  }
} finally {
  await browser.close()
  await server.close()
}

console.log(alleFehler.length ? `Fehler in der Konsole:\n${alleFehler.join('\n')}` : 'Keine Fehler in der Konsole')
