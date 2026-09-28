/*
  Einstellungen der App im Browser-Speicher (gleiches Muster wie die Spiele).
  Bisher nur der Merker „Onboarding gesehen".
*/

const SCHLUESSEL = 'sonnenschein.einstellungen.v1'

interface Einstellungen {
  onboardingGesehen?: boolean
}

function lese(): Einstellungen {
  try {
    const roh = localStorage.getItem(SCHLUESSEL)
    const daten = roh ? JSON.parse(roh) : {}
    return daten && typeof daten === 'object' ? daten : {}
  } catch {
    return {}
  }
}

function schreibe(neu: Einstellungen): void {
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify({ ...lese(), ...neu }))
  } catch {
    // Speicher gesperrt — das Onboarding erscheint dann beim nächsten Start erneut
  }
}

export function onboardingGesehen(): boolean {
  return lese().onboardingGesehen === true
}

export function merkeOnboardingGesehen(): void {
  schreibe({ onboardingGesehen: true })
}
