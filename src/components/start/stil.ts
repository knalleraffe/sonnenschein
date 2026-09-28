import type { Emotion } from '../avatar/emotions'
import type { EchooZustand } from '../../lib/kennzahlen'
import { konfig as wolken } from '../../games/wolkensammeln/config'

/*
  Gestaltungswerte der Startseite — ausschließlich aus den Spielen und aus
  Figma 180:37 (Wochenleiste) und 513:1427 (Layout, Karten). Keine neuen Werte.
*/

/** Karte aus Figma 513:1427: weiß, Radius 28, weicher Schatten — überall gleich */
export const karte = 'rounded-[28px] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)]'
export const weisseKarte = karte
/** Seitenhintergrund der Startseite (513:1427) und Verlauf unter Echoo */
export const seitenFarbe = '#fff9ed'
export const buehnenVerlauf = 'linear-gradient(180deg, #ffba3a, #fff9ed)'
/** Glas-Pille aus den Spielen (infoOverlay) */
export const glasPille = 'rounded-pill bg-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.12)] backdrop-blur-sm'
/** Kopf aus 180:37: Verlauf Weiß → Akzent, unten rund */
export const kopfVerlauf = 'linear-gradient(0deg, #ffba3a, #ffffff)'
/** Himmel der Spielszene (315:3007) */
export const himmelVerlauf = 'linear-gradient(180deg, #9fe1ff, #defcff)'
export const titelStil = 'text-[16px] font-semibold leading-5 text-ink'
export const fliessStil = 'text-[14px] leading-5 text-[#6a6a6a]'
/** Kurven der Spiele: Standard (Erscheinen) und ruhig (große Übergänge) */
export const kurve = wolken.kurven.standard
export const kurveRuhig = wolken.kurven.ruhig

/** Echoos Zustand → Stimmung und Vitalität des Sonnenschein-Avatars (nie traurig) */
export const echooAussehen: Record<EchooZustand, { emotion: Emotion; vitality: number }> = {
  heller: { emotion: 'froehlich', vitality: 1 },
  normal: { emotion: 'froehlich', vitality: 0.8 },
  gedaempft: { emotion: 'neutral', vitality: 0.55 },
  neutral: { emotion: 'neutral', vitality: 0.8 },
}

/** Atmen wie die Spiel-Echoo — die einzige Dauerschleife */
export const echooAtmen = { skala: wolken.echoo.atmenSkala, dauer: wolken.echoo.atmenDauer }
