import { oeffentlich } from '../../lib/pfad'
/*
  Illustration des Erklär-Sheets (Figma 344:4324): Nachthimmel mit Sternen,
  Wolken und Erde, randlos oben im Sheet.
*/

/* Illustration des Erklär-Sheets — Maße und Positionen 1:1 aus Figma (377 px breit) */
const erklaerSterne: { left: number; top: number; groesse: 'gross' | 'mittel' | 'klein' }[] = [
  { left: 239.49, top: 14.73, groesse: 'gross' },
  { left: 306.32, top: 78.02, groesse: 'gross' },
  { left: 323.55, top: 70.37, groesse: 'klein' },
  { left: 127.71, top: 65.51, groesse: 'klein' },
  { left: 190.17, top: 26.1, groesse: 'klein' },
  { left: 166.66, top: 52.27, groesse: 'klein' },
  { left: 157.51, top: 38.21, groesse: 'klein' },
  { left: 180.21, top: 43.93, groesse: 'klein' },
  { left: 348, top: 114, groesse: 'klein' },
  { left: 259.26, top: 110.73, groesse: 'klein' },
  { left: 162.65, top: 96.44, groesse: 'klein' },
  { left: 313.18, top: 66.88, groesse: 'mittel' },
  { left: 25, top: 112, groesse: 'mittel' },
  { left: 237.38, top: 68.41, groesse: 'mittel' },
  { left: 214.98, top: 47.8, groesse: 'mittel' },
  { left: 223.72, top: 24.74, groesse: 'mittel' },
  { left: 233.88, top: 25.46, groesse: 'mittel' },
  { left: 74.69, top: 78.54, groesse: 'mittel' },
  { left: 52.29, top: 57.94, groesse: 'mittel' },
  { left: 61.03, top: 34.87, groesse: 'mittel' },
  { left: 71.19, top: 35.6, groesse: 'mittel' },
]
/** Rahmen- und Kreisgröße je Stern (Figma: gedrehter Rahmen um einen kleineren Kreis) */
const sternMasse = {
  gross: { rahmen: 3.267, kreis: 2.373 },
  mittel: { rahmen: 1.96, kreis: 1.424 },
  klein: { rahmen: 1.307, kreis: 0.949 },
}

export default function ErklaerIllustration() {
  return (
    <div
      className="relative -mx-6 -mt-8 h-[370px] w-[calc(100%+48px)] overflow-hidden rounded-t-[40px]"
      role="img"
      aria-label="Nachthimmel mit Sternen und Wolken über der Erde"
    >
      <div className="absolute left-1/2 top-0 h-full w-[377px] -translate-x-1/2">
        <div
          className="absolute left-0 top-0 h-[366px] w-[377px] rounded-t-[40px]"
          style={{ background: 'linear-gradient(180deg, #050b2e 3.365%, #9fe1ff 56.25%, #defcff 83.173%)' }}
        />
        <img src={oeffentlich('/himmelsroute/erklaerung/erde.svg')} alt="" className="absolute left-[15px] top-[121px] block h-[245px] w-[346px] max-w-none" />
        {erklaerSterne.map((stern) => {
          const { rahmen, kreis } = sternMasse[stern.groesse]
          const rand = (rahmen - kreis) / 2
          return (
            <img
              key={`${stern.left}-${stern.top}`}
              src={oeffentlich(`/himmelsroute/erklaerung/stern-${stern.groesse}.svg`)}
              alt=""
              className="absolute block max-w-none"
              style={{ left: stern.left + rand, top: stern.top + rand, width: kreis, height: kreis }}
            />
          )
        })}
        <div className="absolute left-[22px] top-[91px] h-[103.559px] w-[333.775px]">
          <div className="absolute" style={{ inset: '0 -4.23% -33.75% -5.55%' }}>
            <img src={oeffentlich('/himmelsroute/erklaerung/wolken.svg')} alt="" className="block size-full max-w-none" />
          </div>
        </div>
        {/* zwei weiche Übergänge ins Weiß, wie in Figma übereinander */}
        <div className="absolute left-0 top-[266px] h-[100px] w-[377px] bg-gradient-to-b from-white/0 to-white to-[81.731%]" />
        <div className="absolute left-0 top-[209px] h-[157px] w-[377px] bg-gradient-to-b from-white/0 to-white to-[81.731%]" />
      </div>
    </div>
  )
}
