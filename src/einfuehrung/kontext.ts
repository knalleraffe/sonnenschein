import { createContext, useContext } from 'react'

/** Öffnet die Einführung (Onboarding) erneut — aus den Einstellungen */
export const EinfuehrungKontext = createContext<() => void>(() => {})

export const useEinfuehrung = () => useContext(EinfuehrungKontext)
