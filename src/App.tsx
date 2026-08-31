import { Routes, Route } from 'react-router-dom'
import TabBar from './components/ui/TabBar'
import Dashboard from './screens/Dashboard'
import Avatar from './screens/Avatar'
import Playground from './screens/Playground'

/* Platzhalterseiten für Routen, die erst später gestaltet werden */
function Platzhalter({ titel }: { titel: string }) {
  return (
    <div className="flex h-full items-center justify-center px-6 text-center">
      <p className="text-sm text-ink-muted">[{titel} — folgt später]</p>
    </div>
  )
}

/*
  Grundgerüst der App:
  Auf dem Desktop wird die App zentriert in einem Telefonrahmen
  (393 × 852 px) angezeigt, auf dem Handy füllt sie den Bildschirm.
*/
export default function App() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div
        className="relative flex h-dvh w-full flex-col overflow-hidden bg-surface sm:h-[852px] sm:max-h-[90vh] sm:w-[393px] sm:rounded-[40px] sm:shadow-2xl"
      >
        <main className="h-full overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sonnenschein" element={<Avatar />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/statistiken" element={<Platzhalter titel="Statistiken" />} />
            <Route path="/glossar" element={<Platzhalter titel="Glossar" />} />
          </Routes>
        </main>
        <TabBar />
      </div>
    </div>
  )
}
