import Sonnenschein from '../components/avatar/Sonnenschein'

/* Avatar-Seite: die Sonne füllt den Screen, ihr Körper läuft unten hinaus */
export default function Avatar() {
  return (
    <div className="h-full" style={{ background: 'var(--grad-avatar)' }}>
      <Sonnenschein emotion="froehlich" vitality={1} size="full" />
    </div>
  )
}
