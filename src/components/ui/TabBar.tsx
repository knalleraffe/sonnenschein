import { NavLink, useNavigate } from 'react-router-dom'
import { BookMarked, ChartLine, WalletCards } from 'lucide-react'

/*
  Schwebende Tab-Leiste unten:
  eine Pille mit „Dashboard" und „Statistiken" (Symbol über Text) sowie
  daneben ein runder Knopf mit Buch-Symbol (führt zum Glossar).
*/

const tabs = [
  { to: '/', label: 'Dashboard', Icon: WalletCards },
  { to: '/statistiken', label: 'Statistiken', Icon: ChartLine },
]

export default function TabBar() {
  const navigate = useNavigate()

  return (
    <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex items-end justify-between px-6 pb-4">
      {/* Pille mit den beiden Tabs */}
      <div
        className="pointer-events-auto flex items-center rounded-pill p-1.5 shadow-card backdrop-blur-md"
        style={{ background: 'rgba(255, 240, 210, 0.72)' }}
      >
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-pill px-6 py-2 transition-colors ${
                isActive ? 'bg-surface-card shadow-card' : ''
              }`
            }
          >
            <Icon size={18} className="text-ink" strokeWidth={1.8} />
            <span className="text-[11px] font-medium leading-none text-ink">{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Separater runder Knopf: Glossar */}
      <button
        type="button"
        aria-label="Glossar öffnen"
        onClick={() => navigate('/glossar')}
        className="pointer-events-auto flex h-[60px] w-[60px] items-center justify-center rounded-pill shadow-card backdrop-blur-md"
        style={{ background: 'rgba(255, 240, 210, 0.72)' }}
      >
        <BookMarked size={22} className="text-ink" strokeWidth={1.8} />
      </button>
    </nav>
  )
}
