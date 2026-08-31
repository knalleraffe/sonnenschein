import { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'motion/react'
import { zaehlen } from '../../lib/motion'

/*
  Zeigt eine Zahl, die beim ersten Erscheinen von 0 hochzählt
  und bei Wertänderung von alt nach neu zählt.
  Bei „Bewegung reduzieren" springt sie direkt auf den Zielwert.
*/
export default function ZaehlZahl({ wert }: { wert: number }) {
  const reduziert = useReducedMotion()
  const [anzeige, setAnzeige] = useState(reduziert ? wert : 0)
  const vorher = useRef(reduziert ? wert : 0)

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

  return <>{anzeige}</>
}
