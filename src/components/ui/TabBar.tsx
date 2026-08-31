import { NavLink, useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

/*
  Schwebende Tab-Leiste unten:
  eine Pille mit „Dashboard" und „Statistiken" sowie daneben
  ein runder Knopf mit Buch-Symbol (führt zum Glossar).
*/

const tabs = [
  { to: '/', label: 'Dashboard' },
  { to: '/statistiken', label: 'Statistiken' },
]

export default function TabBar() {
  const navigate = useNavigate()

  return (
    <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex items-center justify-center gap-3 pb-6">
      {/* Pille mit den beiden Tabs */}
      <div
        className="pointer-events-auto flex items-center gap-1 rounded-pill p-1.5 shadow-card backdrop-blur-md"
        style={{ background: 'rgba(255, 255, 255, 0.75)' }}
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `rounded-pill px-5 py-2.5 text-sm font-semibold transition-colors ${
                isActive ? 'bg-cream text-ink' : 'text-ink-muted'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      {/* Separater runder Knopf: Glossar */}
      <button
        type="button"
        aria-label="Glossar öffnen"
        onClick={() => navigate('/glossar')}
        className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-pill shadow-card backdrop-blur-md"
        style={{ background: 'rgba(255, 255, 255, 0.75)' }}
      >
        <BookOpen size={20} className="text-ink" />
      </button>
    </nav>
  )
}
