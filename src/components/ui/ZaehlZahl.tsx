import { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'motion/react'
import { zaehlen } from '../../lib/motion'
import { useSofort } from './Erscheinen'

/*
  Zeigt eine Zahl, die beim ersten Erscheinen von 0 hochzählt (800 ms,
  mit Abbremsen) und bei Wertänderung von alt nach neu zählt.
  Feste Ziffernbreite (tabular-nums), damit beim Zählen nichts springt.
  Bei „Bewegung reduzieren" springt sie direkt auf den Zielwert.
*/
export default function ZaehlZahl({ wert }: { wert: number }) {
  const reduziert = useReducedMotion()
  const sofort = useSofort()
  const still = reduziert || sofort
  const [anzeige, setAnzeige] = useState(still ? wert : 0)
  const vorher = useRef(still ? wert : 0)

  useEffect(() => {
    if (reduziert) {
      vorher.current = wert
      setAnzeige(wert)
      return
    }
    const animation = animate(vorher.current, wert, {
      ...zaehlen,
      onUpdate: (v) => setAnzeige(Math.round(v)),
    })
    vorher.current = wert
    return () => animation.stop()
  }, [wert, reduziert])

  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{anzeige}</span>
}
