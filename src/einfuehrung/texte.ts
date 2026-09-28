/*
  Texte für Splash und Onboarding (Master splash-onboarding, Abschnitt 5),
  zeichengenau. Beim Wegpunkt-Text steht der Teil vor dem Gedankenstrich
  als Beschriftung am Wegpunkt, der Rest als aufgeklappter Text.
*/

export const APP_NAME = 'Sonnenschein'

export const einfuehrungsTexte = {
  splash: APP_NAME,
  ueberspringen: 'Überspringen',
  weiter: 'Weiter',
  schritte: [
    {
      titel: 'Hallo, ich bin Echoo.',
      text: 'Mit kurzen Spielen findest du heraus, ob Bewegung dir beim Denken hilft.',
      hinweis: 'Zieh mich nach oben.',
    },
    {
      titel: 'So läuft eine Sitzung',
      text: null,
      hinweis: 'Tippe auf die Wegpunkte.',
      wegpunkte: [
        'Puls – Du trägst deinen Puls ein.',
        'Spiel – Du spielst den ersten Teil.',
        'Pause – Du bewegst dich oder ruhst dich aus. Was dran ist, entscheidet der Zufall – nur so lässt sich später vergleichen.',
        'Puls und Spiel – Du trägst deinen Puls noch einmal ein und spielst den zweiten Teil.',
      ],
    },
    {
      titel: 'Deinen Puls messen',
      text: 'Leg zwei Finger an dein Handgelenk und tippe 15 Sekunden lang bei jedem Schlag auf den Kreis.',
      ergebnis: '{x} Schläge pro Minute',
      link: 'Ich lese meinen Puls von der Uhr ab.',
      hinweis: 'Nur eine Übung – nichts wird gespeichert.',
    },
    {
      titel: 'Zwei Spiele',
      text: 'Jedes Spiel fordert dich anders. Tippe auf eine Karte.',
    },
    {
      titel: 'Ich bin dein Spiegel',
      text: 'Ich zeige, wie deine letzten Messungen im Vergleich zu deinem Schnitt liegen. Pflegen musst du mich nicht – Pausen sind okay.',
    },
    {
      titel: 'Bereit?',
      text: 'Die Einführung findest du jederzeit in den Einstellungen.',
      primaer: "Los geht's",
    },
  ],
  einstellungenEintrag: 'Einführung ansehen',
} as const

/** „Puls – Du trägst …" → Beschriftung und aufgeklappter Text */
export function wegpunktTeile(text: string): { beschriftung: string; text: string } {
  const [beschriftung, ...rest] = text.split(' – ')
  return { beschriftung, text: rest.join(' – ') }
}
