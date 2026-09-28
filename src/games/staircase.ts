export function naechsteStufe(
  aktuell: number,
  bestanden: boolean,
  richtigeSerie: number,
  min: number,
  max: number,
): number {
  if (bestanden && richtigeSerie >= 2) return Math.min(max, aktuell + 1)
  if (!bestanden) return Math.max(min, aktuell - 1)
  return aktuell
}
