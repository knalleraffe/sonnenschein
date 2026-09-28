import { lazy, Suspense, useState } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import TabBar from './components/ui/TabBar'
import Dashboard from './screens/Dashboard'
import Avatar from './screens/Avatar'
import Playground from './screens/Playground'
import Statistiken from './screens/Statistiken'
import Glossar from './screens/Glossar'
import Wolkensammeln from './screens/Wolkensammeln'
import Himmelsroute from './screens/Himmelsroute'
import { konfig } from './games/wolkensammeln/config'
import Startsequenz from './einfuehrung/Startsequenz'
import { EinfuehrungKontext } from './einfuehrung/kontext'

/*
  Grundgerüst der App:
  Auf dem Desktop wird die App zentriert in einem Telefonrahmen
  (393 × 852 px) angezeigt, auf dem Handy füllt sie den Bildschirm.
  Der Wechsel ins Spiel und zurück ist EINE Überblendung — beide
  Bildschirme laufen gleichzeitig, kein Weiß dazwischen. Der Rückweg
  ist kürzer als der Hinweg.
*/

const e = konfig.einstieg

/** Konzeptseite für die Abgabe: eigene Route, nicht in der Navigation, ohne Telefonrahmen */
const Konzept = lazy(() => import('./konzept/Konzept'))

const wrapperVarianten = {
  sichtbar: (zielIstSpiel: boolean) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: (zielIstSpiel ? e.uebergangHin : e.uebergangZurueck) / 1000,
      ease: konfig.kurven.ruhig,
    },
  }),
  spielVersteckt: (zielIstSpiel: boolean) => ({
    opacity: 0,
    scale: e.uebergangSpielSkala,
    transition: {
      duration: (zielIstSpiel ? e.uebergangHin : e.uebergangZurueck) / 1000,
      ease: konfig.kurven.ruhig,
    },
  }),
  appVersteckt: (zielIstSpiel: boolean) => ({
    opacity: 0,
    scale: e.uebergangDashboardSkala,
    /* Weg in die Session: die Inhalte sinken nach unten weg statt hart zu schneiden */
    y: zielIstSpiel ? 24 : 0,
    transition: {
      duration: (zielIstSpiel ? e.uebergangHin : e.uebergangZurueck) / 1000,
      ease: konfig.kurven.ruhig,
    },
  }),
}

export default function App() {
  const location = useLocation()
  const reduziert = useReducedMotion()
  const navigate = useNavigate()
  const istSpiel = location.pathname.startsWith('/spiel') || location.pathname === '/himmelsroute'
  /* Splash nur beim Laden der Startseite; die Einführung lässt sich aus den Einstellungen erneut öffnen */
  const [sequenz, setSequenz] = useState<'splash' | 'einfuehrung' | null>(() => (location.pathname === '/' ? 'splash' : null))
  const zeigeEinfuehrung = () => {
    navigate('/')
    setSequenz('einfuehrung')
  }

  if (location.pathname === '/konzept') {
    return (
      <Suspense fallback={null}>
        <Konzept />
      </Suspense>
    )
  }

  return (
    <EinfuehrungKontext.Provider value={zeigeEinfuehrung}>
    <div className="flex min-h-dvh items-center justify-center">
      <div
        className="relative flex h-dvh w-full flex-col overflow-hidden bg-surface sm:h-[852px] sm:max-h-[90vh] sm:w-[393px] sm:rounded-[64px] sm:shadow-2xl"
      >
        <main className="relative h-full overflow-hidden">
          <AnimatePresence initial={false} custom={istSpiel}>
            <motion.div
              key={istSpiel ? 'spiel' : 'app'}
              className="absolute inset-0 overflow-y-auto"
              custom={istSpiel}
              variants={reduziert ? undefined : wrapperVarianten}
              initial={istSpiel ? 'spielVersteckt' : 'appVersteckt'}
              animate="sichtbar"
              exit={istSpiel ? 'spielVersteckt' : 'appVersteckt'}
            >
              <Routes location={location}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sonnenschein" element={<Avatar />} />
                <Route path="/playground" element={<Playground />} />
                <Route path="/statistiken" element={<Statistiken />} />
                <Route path="/glossar" element={<Glossar />} />
                <Route path="/spiel/wolkensammeln" element={<Wolkensammeln />} />
                <Route path="/himmelsroute" element={<Himmelsroute />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
        <TabBar />
        {sequenz && <Startsequenz key={sequenz} modus={sequenz} onFertig={() => setSequenz(null)} />}
      </div>
    </div>
    </EinfuehrungKontext.Provider>
  )
}
