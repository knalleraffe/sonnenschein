/* Avatar-Seite — die animierte Sonne entsteht in Meilenstein 3 und 4 */
export default function Avatar() {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center"
      style={{ background: 'linear-gradient(to bottom, var(--sun-light), var(--surface))' }}
    >
      <h1 className="text-2xl font-bold">Sonnenschein</h1>
      <p className="text-sm text-ink-muted">
        Platzhalter — die Sonne entsteht in Meilenstein 3.
      </p>
    </div>
  )
}
