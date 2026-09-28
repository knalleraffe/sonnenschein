import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BookMarked, ChartLine } from 'lucide-react'
import { easeAus } from '../../lib/motion'
import { oeffentlich } from '../../lib/pfad'

/*
  Schwebende Tab-Leiste (Figma 120:582, 345 × 64): links die Glas-Pille mit
  Dashboard und Statistiken (208 × 62), rechts der runde Glas-Knopf fürs
  Glossar (64 × 64). Hinter dem aktiven Ziel liegt eine zweite Glas-Pille
  (104 × 54), die zwischen Dashboard und Statistiken gleitet (layoutId,
  ohne Nachfedern). Ist das Glossar aktiv, liegt sie im runden Knopf.
  Icons 24 px (Strich 1,5), Beschriftung 10 px semibold, schwarz.
*/

const glas = 'bg-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.12)] backdrop-blur-md'
const gleiten = { duration: 0.35, ease: easeAus }

/** lucide „playing-cards-fan" (in der installierten lucide-Version nicht enthalten, daher aus Figma) */
function KartenFaecher() {
  return <img src={oeffentlich('/nav/playing-cards-fan.svg')} alt="" aria-hidden className="block size-6" />
}

const tabs = [
  { to: '/', label: 'Dashboard', Icon: KartenFaecher },
  { to: '/statistiken', label: 'Statistiken', Icon: () => <ChartLine size={24} strokeWidth={1.5} aria-hidden /> },
]

function Hervorhebung({ reduziert }: { reduziert: boolean }) {
  return (
    <motion.span
      layoutId="nav-pille"
      className={`absolute rounded-[80px] ${glas}`}
      initial={reduziert ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ layout: gleiten, opacity: { duration: 0.25, ease: easeAus } }}
      style={{ inset: 0 }}
    />
  )
}

export default function TabBar() {
  const navigate = useNavigate()
  const reduziert = Boolean(useReducedMotion())
  const { pathname } = useLocation()

  // Im Spiel gibt es keine Tab-Leiste — der Rückweg läuft über Pause/Ergebnis
  if (pathname.startsWith('/spiel') || pathname === '/himmelsroute') return null

  const glossarAktiv = pathname.startsWith('/glossar')

  return (
    <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex items-center justify-between px-6 pb-7" aria-label="Hauptnavigation">
      <div className={`pointer-events-auto relative mt-0.5 flex h-[62px] w-[208px] items-center rounded-[80px] px-1 ${glas}`}>
        {tabs.map(({ to, label, Icon }) => {
          const aktiv = !glossarAktiv && (to === '/' ? pathname === '/' : pathname.startsWith(to))
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              aria-current={aktiv ? 'page' : undefined}
              className="relative flex h-[54px] w-[104px] flex-col items-center justify-center gap-1.5"
            >
              <AnimatePresence initial={false}>{aktiv && <Hervorhebung key="h" reduziert={reduziert} />}</AnimatePresence>
              <span className="relative text-black">
                <Icon />
              </span>
              <span className="relative text-[10px] font-semibold leading-3 text-black">{label}</span>
            </NavLink>
          )
        })}
      </div>

      <motion.button
        type="button"
        aria-label="Glossar öffnen"
        aria-current={glossarAktiv ? 'page' : undefined}
        onClick={() => navigate('/glossar')}
        whileTap={reduziert ? undefined : { scale: 0.94 }}
        transition={{ duration: 0.15, ease: easeAus }}
        className={`pointer-events-auto relative flex size-16 items-center justify-center rounded-[80px] ${glas}`}
      >
        <AnimatePresence initial={false}>
          {glossarAktiv && (
            <span key="glossar" className="absolute inset-1">
              <Hervorhebung key="h" reduziert={reduziert} />
            </span>
          )}
        </AnimatePresence>
        <BookMarked size={24} strokeWidth={1.5} className="relative text-black" aria-hidden />
      </motion.button>
    </nav>
  )
}
