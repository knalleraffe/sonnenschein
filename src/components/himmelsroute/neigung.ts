import { useEffect } from 'react'
import { useMotionValue, useSpring, useTransform } from 'motion/react'
import { konfig } from '../../games/himmelsroute/config'
import type { Neigung } from './Szene'

/*
  Optionaler Gyroskop-Effekt (GYRO_PARALLAX): Wolken verschieben sich je nach
  Neigung um höchstens ±12 px, Sterne um die Hälfte — geglättet, ohne
  Überschwingen. Kein Einfluss auf Logik oder Messung. Ohne Sensor oder ohne
  Erlaubnis passiert still nichts.
*/

type MitErlaubnis = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> }

let erlaubt: boolean | null = null

/** iOS: Erlaubnis muss beim Tippen erfragt werden (z. B. „Spiel starten") */
export function frageNeigungAn(): void {
  if (!konfig.gyroParallax || typeof DeviceOrientationEvent === 'undefined') return
  const ereignis = DeviceOrientationEvent as MitErlaubnis
  if (typeof ereignis.requestPermission !== 'function') return
  ereignis
    .requestPermission()
    .then((antwort) => {
      erlaubt = antwort === 'granted'
      window.dispatchEvent(new Event('himmelsroute-neigung'))
    })
    .catch(() => {
      erlaubt = false
    })
}

/** gedämpft ohne Überschwingen (Dämpfungsgrad > 1) */
const glaettung = { stiffness: 60, damping: 22, mass: 1 }

export function useNeigung(): Neigung {
  const rohX = useMotionValue(0)
  const rohY = useMotionValue(0)
  const x = useSpring(rohX, glaettung)
  const y = useSpring(rohY, glaettung)
  const xHalb = useTransform(x, (w) => w / 2)
  const yHalb = useTransform(y, (w) => w / 2)

  useEffect(() => {
    if (!konfig.gyroParallax || typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return
    const max = konfig.szene.neigungMax
    const begrenze = (w: number) => Math.max(-max, Math.min(max, w))
    let ruhe: { beta: number; gamma: number } | null = null
    const bei = (e: DeviceOrientationEvent) => {
      if (erlaubt === false || e.beta === null || e.gamma === null) return
      // Bezug ist die Haltung beim ersten Messwert
      ruhe ??= { beta: e.beta, gamma: e.gamma }
      rohX.set(begrenze(((e.gamma - ruhe.gamma) / 30) * max))
      rohY.set(begrenze(((e.beta - ruhe.beta) / 30) * max))
    }
    const verbinde = () => window.addEventListener('deviceorientation', bei)
    verbinde()
    window.addEventListener('himmelsroute-neigung', verbinde)
    return () => {
      window.removeEventListener('deviceorientation', bei)
      window.removeEventListener('himmelsroute-neigung', verbinde)
    }
  }, [rohX, rohY])

  return { x, y, xHalb, yHalb }
}
