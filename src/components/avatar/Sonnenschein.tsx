import { emotionen, type Emotion } from './emotions'

/*
  Die Sonne als handgeschriebenes, geschichtetes SVG.
  Jedes bewegliche Teil ist ein eigenes Element mit sprechendem Namen:
  sun-body, ray-1 … ray-5, eye-left, eye-right, mouth, highlight.
  Geometrie nach design/screens/SONNENSCHEIN-MAXIMUM.jpg (393×852).
*/

interface SonnenscheinProps {
  emotion?: Emotion
  /** 0..1 — steuert Sättigung, Strahlenlänge/-deckkraft und Glanzlicht */
  vitality?: number
  /** full: ganzer Screen; compact: Ausschnitt; kopf: breiter Ausschnitt mit Körperbogen (Startseite, wie Figma 180:37) */
  size?: 'full' | 'compact' | 'kopf'
}

/* Mittelpunkt des Sonnenkörpers (liegt weit unter dem Bildrand) */
const CX = 196.5
const CY = 890
/* Strahl in Grundstellung (zeigt senkrecht nach oben), Basis bei y=312 */
const STRAHL_PFAD = 'M 172.5 312 L 196.5 230 L 220.5 312 Z'
const STRAHL_WINKEL = [-28, -14, 0, 14, 28]

export default function Sonnenschein({
  emotion = 'froehlich',
  vitality = 1,
  size = 'full',
}: SonnenscheinProps) {
  const gesicht = emotionen[emotion]

  // vitality wirkt kontinuierlich, ohne dass die Sonne traurig aussieht
  const koerperFarbe = `color-mix(in srgb, var(--sun-core) ${Math.round(55 + 45 * vitality)}%, #ecd9ae)`
  const strahlLaenge = 0.7 + 0.3 * vitality
  const strahlDeckkraft = 0.55 + 0.45 * vitality
  const glanzGroesse = 0.7 + 0.3 * vitality

  return (
    <svg
      viewBox={size === 'full' ? '0 0 393 852' : size === 'kopf' ? '-195 200 783 330' : '0 200 393 340'}
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
      role="img"
      aria-label={`Sonnenschein-Avatar, Stimmung: ${emotion}`}
    >
      {/* Strahlen — jeder einzeln benannt und einzeln animierbar */}
      <g id="rays">
        {STRAHL_WINKEL.map((winkel, i) => (
          <g key={winkel} id={`ray-${i + 1}`} transform={`rotate(${winkel} ${CX} ${CY})`}>
            <path
              d={STRAHL_PFAD}
              fill={koerperFarbe}
              style={{
                opacity: strahlDeckkraft,
                transform: `scaleY(${strahlLaenge})`,
                transformOrigin: '196.5px 312px',
              }}
            />
          </g>
        ))}
      </g>

      {/* Sonnenkörper: großer Kreis, läuft unten aus dem Bild */}
      <g id="sun-body">
        <circle cx={CX} cy={CY} r="560" fill={koerperFarbe} />
        {/* hellere innere Ringe wie im Design */}
        <circle id="glow-outer" cx={CX} cy={CY} r="270" fill="#fbbe58" opacity="0.7" />
        <circle id="glow-inner" cx={CX} cy={CY} r="160" fill="#fbd48a" opacity="0.7" />
        {/* Glanzlicht oben rechts */}
        <ellipse
          id="highlight"
          cx="337"
          cy="388"
          rx="44"
          ry="23"
          fill="#fdf0c7"
          style={{
            transform: `rotate(-18deg) scale(${glanzGroesse})`,
            transformOrigin: '337px 388px',
          }}
        />
      </g>

      {/* Gesicht */}
      <g
        id="face"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path id="eye-left" d={gesicht.eyeLeft} />
        <path id="eye-right" d={gesicht.eyeRight} />
        <path id="mouth" d={gesicht.mouth} />
      </g>
    </svg>
  )
}
