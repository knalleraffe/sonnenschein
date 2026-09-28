/**
  Pfad zu einer Datei aus public/. Berücksichtigt den Unterordner, unter dem die
  App veröffentlicht ist (GitHub Pages: /sonnenschein/). Lokal bleibt der Pfad gleich.
*/
export const oeffentlich = (pfad: string) => `${import.meta.env.BASE_URL}${pfad.replace(/^\//, '')}`
