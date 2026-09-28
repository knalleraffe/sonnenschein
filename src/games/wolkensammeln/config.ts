/*
  Wolkensammeln — alle Zahlen, Zeiten und Kurven an EINER Stelle.
  Keine dieser Zahlen darf irgendwo anders im Code direkt stehen.
*/

export const konfig = {
  /* Aufbau der Runde */
  wolkenAnzahl: 12,
  aufwaermDurchgaenge: 0,
  hauptDurchgaenge: 20,
  startLaenge: 3,
  minLaenge: 3,
  maxLaenge: 10,

  /* Zeiten in einem Durchgang (Millisekunden) */
  zeiten: {
    ruhephase: 1100,
    leuchten: 600,
    pauseZwischenWolken: 300,
    startsignal: 200,
    ersterTipp: 10000,
    weitererTipp: 6000,
    /** Rückmeldung richtig gesamt: 120 einfärben + 150 halten + 280 zurück */
    rueckmeldungRichtig: 550,
  },

  /* Licht (Spielwährung — erscheint NUR im Spiel) */
  licht: {
    proLaengenEinheit: 100,
    bezugszeitProSchritt: 900,
    maxTempobonus: 0.5,
    beiFehler: 0,
  },

  /* Unterbrechung */
  unterbrechung: {
    nachFehlernInFolge: 3,
    fruehestensAbHauptDurchgang: 0,
    sperrfristDurchgaenge: 0,
    maxProRunde: 20,
    /* Kein Elefanten-Modus vorhanden → Rückfallwert aus dem Briefing */
    dauer: 45000,
  },

  messung: {
    pulsMin: 40,
    pulsMax: 190,
    startPuls: 70,
    bewegungsPulsAbstand: 40,
    anzeigeMin: 200,
    anzeigeMax: 1500,
    anzeigeSchritt: 50,
    anzeigePauseMin: 100,
    anzeigePauseMax: 1000,
    anzeigePauseSchritt: 50,
    anzeigeDauer: 600,
    anzeigePause: 300,
  },

  /* Echoo taucht mit jedem richtig gemerkten Durchgang ein Stück weiter auf.
     Fehler nehmen nichts zurück — Echoo steigt nur. */
  echoo: {
    /** Echoo erscheint erst nach so vielen richtigen Durchgängen in Folge */
    startSerie: 3,
    /** danach so viele weitere richtige Durchgänge, bis Echoo voll strahlt (Figma Echoo3) */
    schritteBisStrahlend: 8,
    /** ab diesem Fortschritt lacht Echoo mit offenem Mund */
    lachenAb: 0.8,
    /**
      Stufen: Fortschritt → Abstand der höchsten Strahlenspitze über der
      Unterkante (Figma-Pixel, Rahmen 393 × 852) und Größe der Grafik.
      Echoo beginnt klein, aber gleich so hoch, dass sein Gesicht über
      der unteren Leiste zu sehen ist, und wächst bis zur Figma-Größe.
      Dazwischen wird gemischt, jede richtige Runde ist ein eigener Schritt.
    */
    verstecktUeberUnterkante: -40,
    stufen: [
      /** erstes Erscheinen: klein, ganz unten am Rand — das Gesicht knapp über der unteren Leiste */
      { ab: 0, ueberUnterkante: 325, skala: 0.55 },
      /** Figma Echoo2: Gesicht und Bauch sichtbar */
      { ab: 0.5, ueberUnterkante: 493, skala: 0.8175 },
      /** Figma Echoo3: volle Größe, lachend */
      { ab: 1, ueberUnterkante: 673.3, skala: 1 },
    ],
    /** Der Himmel bleibt blau — Echoo bringt nur sein eigenes Leuchten mit */
    leuchtenDauer: 1200,
    /** Leuchten hinter Echoo (Figma-Pixel) und seine Mindeststärke */
    leuchtenRadius: 460,
    leuchtenMin: 0.35,
    atmenSkala: 1.012,
    atmenDauer: 4200,
    /** Aufsteigen als weiche Feder mit leichtem Nachschwingen */
    feder: { stiffness: 60, damping: 13 },
    /** Wolken weichen zur Seite aus (Einheiten = % der Breite) — im Spiel und am Ende */
    schiebenSpiel: 7,
    schiebenEnde: 16,
    wolkenDauer: 1100,
    /** Wolken bis zu dieser Höhe (y-Einheiten 0–200) liegen hinter Echoo, darunter davor */
    hintenBisY: 75,
    /** beim Ausweichen behält jede Wolke mindestens diesen Anteil ihrer Breite auf dem Bildschirm */
    minSichtbar: 0.7,
    /** Wolken, die vor Echoos Gesicht lägen, weichen so weit aus, dass dieser Rand frei bleibt (px) */
    gesichtFreiraum: 10,
  },

  /* Gruppen-Erzeugung: die Reihenfolge ist egal, es zählt die Auswahl */
  gruppe: {
    /** Die Gruppe verteilt sich über mindestens so viele Reihen */
    minReihen: 3,
    /** Aus einer einzelnen Reihe stammen höchstens so viele Wolken */
    maxProReihe: 2,
    /** Ab dieser Gruppengröße: mindestens je 2 links und rechts der Mitte */
    seitenRegelAb: 4,
    minProSeite: 2,
    mitteX: 50,
    maxVersuche: 500,
  },

  /* Wolkengrößen: Breite in Einheiten (= % der Bildschirmbreite), Höhe = 40 % der Breite */
  wolken: {
    breiten: { gross: 58, mittel: 42, klein: 30 },
    hoehenFaktor: 0.4,
  },

  /* Die einzigen drei Bewegungskurven des Spiels */
  kurven: {
    /** Erscheinen, Verschwinden, Farbwechsel (400–700 ms) */
    standard: [0.16, 1, 0.3, 1],
    /** Himmel, Echoo, große Übergänge (700–1200 ms) */
    ruhig: [0.4, 0, 0.2, 1],
    /** Antippen, Druck-Rückmeldung (90–260 ms) */
    druck: [0.2, 0, 0, 1],
  } as Record<'standard' | 'ruhig' | 'druck', [number, number, number, number]>,

  /* Rückmeldung: nur die Füllfläche färbt sich, nie eine Kontur */
  rueckmeldungAnim: {
    richtigFarbe: '#DFF3D8',
    richtigEin: 120,
    richtigHalten: 150,
    richtigZurueck: 280,
    richtigSkala: 1.05,
    falschFarbe: '#FADDE1',
    falschEin: 120,
    /** Himmel dunkelt bei Fehler um 6 % ab */
    himmelAbdunkeln: 0.06,
    /** Auflösung nach einem Fehler: fehlende Wolken leuchten nacheinander auf */
    aufloesung: {
      start: 250,
      versatz: 80,
      einblenden: 120,
      halten: 500,
      zurueck: 400,
    },
  },

  /* Bewegungspaket im Durchgang */
  bewegung: {
    atmenDauerMin: 5000,
    atmenDauerMax: 7000,
    atmenSkalaMin: 0.985,
    atmenSkalaMax: 1.015,
    /** Ankündigung: die letzten 300 ms der Ruhephase */
    ankuendigungDauer: 300,
    /** Wolken dämpfen sich in der Ankündigung über die Helligkeit, nie über die Deckkraft */
    ankuendigungHelligkeit: 0.94,
    ankuendigungHimmel: 0.03,
    lichtringDauer: 700,
    lichtringSkala: 1.35,
    lichtringDeckkraft: 0.5,
    nachbarRadius: 34,
    nachbarSchein: 0.6,
    pulsScheinRadius: 14,
    nachbarVerzoegerung: 120,
    nachbarDauer: 400,
    tippDruckSkala: 0.96,
    tippDruckEin: 90,
    tippDruckAus: 350,
    tippRingSkala: 1.5,
    tippRingDeckkraft: 0.45,
    tippRingDauer: 450,
    lichtstandSkala: 1.08,
    lichtstandDauer: 300,
    pausePilleSkala: 0.94,
    /** Übergang zwischen zwei Durchgängen */
    durchgangsWechsel: 220,
    echooWolkenVersatz: 50,
    echooWolkenSchein: 0.8,
    /** Echoo-Aufstieg am Ende, bevor die Ergebniskarte kommt */
    echooAufstieg: 750,
    himmelHellerDauer: 1200,
    endeKarteVerzoegerung: 400,
    endeZeilenVersatz: 60,
    endeZahlDauer: 800,
  },

  /* Einstieg: eine einzige durchgehende Bewegung, gehört nicht zur Messung */
  einstieg: {
    /** Übergang vom Dashboard hin / zurück */
    uebergangHin: 520,
    uebergangZurueck: 380,
    uebergangDashboardSkala: 0.98,
    uebergangSpielSkala: 1.03,
    /** Erklär-Sheet öffnet erst, wenn der Übergang vom Dashboard steht */
    erklaerungVerzoegerung: 600,
    /** Wolkenebene als Ganzes: Weichzeichnung 10 → 0, Größe 1,06 → 1,0 */
    ebeneDauer: 900,
    ebeneBlur: 10,
    ebeneSkala: 1.06,
    /** jede Wolke einzeln, von unten nach oben */
    wolkeDauer: 620,
    wolkeVersatz: 45,
    wolkeSkala: 0.92,
    /** der Himmel atmet einmal ein */
    himmelDauer: 1100,
    himmelDunkler: 0.08,
    himmelEnger: 1.04,
    /** Bedienleiste */
    hudVerzoegerung: 340,
    hudDauer: 480,
    hudPillenVersatz: 60,
    hudHoehe: 12,
    /** warme Welle als Bereitschaftsmoment, dann beginnt der erste Durchgang */
    welleDauer: 600,
    gesamt: 2200,
    /** das Atmen setzt über dieses Fenster verteilt ein */
    atmenAnlauf: 800,
    /** der allererste Lichtring ist einmalig größer */
    ersterLichtringFaktor: 1.2,
  },
} as const

/** Gesamtdauer der Auflösung nach einem Fehler — Formel, keine feste Zahl */
export function aufloesungGesamt(anzahlFehlend: number): number {
  const a = konfig.rueckmeldungAnim.aufloesung
  return a.start + Math.max(0, anzahlFehlend - 1) * a.versatz + a.einblenden + a.halten + a.zurueck
}

/** Bewegungskurve als CSS-Text, z. B. für transition */
export function kurveCss(kurve: readonly [number, number, number, number]): string {
  return `cubic-bezier(${kurve.join(', ')})`
}