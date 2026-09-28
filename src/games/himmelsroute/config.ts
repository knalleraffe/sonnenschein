/*
  Himmelsroute — alle Zahlen an EINER Stelle (Master-Spezifikation, Abschnitt 3).
  Keine dieser Zahlen darf irgendwo anders im Code direkt stehen.
*/

export const konfig = {
  /** Spielname überall in der App */
  spielName: 'Himmelsroute',
  /** Begegnungen in Runde 1 jedes Durchgangs */
  startLaenge: 3,
  /** Längste Route (12 Familien minus Zusatzgegenstand) */
  maxLaenge: 11,
  /** Versuche pro Länge */
  versucheProLaenge: 2,
  /** Durchgänge: vor und nach der Pause */
  durchgaenge: 2,
  /** Zeigedauer pro Gegenstand (ms) — Standard; in den Einstellungen änderbar */
  zeigedauer: 1500,
  /** Regler „Anzeigedauer“ in den Einstellungen */
  zeigedauerRegler: { min: 1000, max: 4000, schritt: 100 },
  /** Abstand der Haltepunkte in Szenen-Pixeln */
  haltepunktAbstand: 480,
  /** Optionaler Gyroskop-Effekt (Teil 6) */
  gyroParallax: true,

  /** Proberunde: fest, nur beim allerersten Start, wird nicht gewertet */
  proberunde: {
    folge: ['drachen', 'rakete'],
    zusatz: 'ufo',
  },

  /** Größenrahmen der Gegenstände (px), fest pro Gegenstand im Katalog */
  gegenstandGroesse: { min: 96, max: 140 },

  /* ── Szene und Aufstieg (Abschnitt 4) ── */
  szene: {
    /** Frame „Spiel 2 Scroll" (315:3007) */
    breite: 393,
    hoehe: 6002,
    /** Höhe, auf der Echoo nach dem Aufgang steht; Haltepunkt k = start − k × haltepunktAbstand */
    start: 5650,
    /** Oberkante der Erde in der Szene */
    erdeOben: 5772,
    /** Echoo steht auf dem Bildschirm fest bei diesem Anteil der Höhe */
    echooBildschirm: 0.62,
    /** Körperbreite von Echoo (px) */
    echooGroesse: 72,
    /** Parallax: Sterne fern und nah langsamer, Wolken und Vordergrund schneller als der Himmelsverlauf */
    parallax: { sterneFern: 0.3, sterne: 0.6, himmel: 1, wolken: 1.15, vordergrund: 1.8 },
    /** Höhen, an denen die Ebenen genau wie im Figma-Frame liegen — Sterne am obersten Haltepunkt */
    parallaxAnker: { sterne: 370, wolken: 2950 },
    /** bis zu dieser Szenenhöhe ist der Himmel dunkel genug für weiße Schrift */
    nachtBis: 2150,
    /** Gyroskop: höchste Verschiebung der Wolken (px); Sterne halb so viel */
    neigungMax: 12,
  },
  aufgang: {
    /** Echoo steigt hinter der Erde auf (translateY und opacity) */
    dauer: 1200,
    /** Startversatz unter der Endlage (px) — liegt hinter der Erde */
    versatz: 220,
    /** Rundenstart-Anzeige */
    anzeigeEin: 300,
    anzeigeStehen: 900,
    anzeigeAus: 400,
    /** Übersicht blendet zur Szene an der Erde über, bevor der Aufgang beginnt */
    ueberblendung: 400,
  },
  fortbewegung: {
    /** ab diesem Anteil der Strecke rastet die Szene am nächsten Haltepunkt ein */
    einrasten: 0.3,
    /** Einrasten oder Zurückgleiten nach dem Loslassen */
    rastDauer: 380,
    /** Mausrad: so lange Ruhe, dann wird eingerastet */
    radRuhe: 160,
    /** Deckkraft des gesperrten Pfeils */
    gesperrt: 0.4,
  },
  /* Flug zwischen zwei Haltepunkten: Echoo fliegt vor, die Kamera zieht nach */
  flug: {
    dauer: 850,
    /** so weit steigt Echoo auf dem Bildschirm über seine Ruhelage (px) … */
    vorlauf: 96,
    /** … in diesem Anteil der Flugzeit; danach bringt die Kamera ihn zurück */
    vorlaufAnteil: 0.35,
    /** Kamera: langsamer Anlauf, dann holt sie auf — kommt nicht zum Stehen, sondern geht ins Nachgleiten über */
    kameraKurve: [0.45, 0, 0.4, 0.9] as [number, number, number, number],
    /** Nachgleiten wie in Zeitlupe während der Begegnung (Szenen-px) und Auslauf danach (ms) */
    nachgleiten: 110,
    nachgleitenAuslauf: 500,
    /** Seitliche Ruhelage je Haltepunkt (px, ungerades k links, gerades rechts) und Neigung im Flug (Grad) */
    seitlich: 28,
    neigung: 7,
    /** Streckung am schnellsten Punkt */
    streckungY: 1.08,
    streckungX: 0.95,
    /** Tempo (Szenen-px/s), bei dem Streckung und Schweif voll ausschlagen */
    vollesTempo: 1300,
    /** Lichtschweif unter Echoo: Länge (px), Breite (× Körperbreite), höchste Deckkraft */
    schweifLaenge: 170,
    schweifBreite: 0.62,
    schweifDeckkraft: 0.6,
    /** Beim Ziehen läuft Echoo je nach Zuggeschwindigkeit bis zu so weit vor (px) */
    zugVorlauf: 40,
    /** Zuggeschwindigkeit (px/s), bei der der Vorlauf voll ist */
    zugVollesTempo: 900,
    /** kürzeste Flugdauer beim Einrasten nach Ziehen oder Mausrad */
    minDauer: 450,
    /** prefers-reduced-motion: kurze Fahrt ohne Vorlauf, Streckung und Schweif */
    reduziertDauer: 400,
  },
  begegnung: {
    eintritt: 500,
    weiterflug: 400,
    /** Ruhelage über Echoo und seitlicher Versatz (px) */
    ueberEchoo: 180,
    seitlich: 55,
    /** Übergang in die Übersicht nach dem letzten Gegenstand */
    uebersichtNach: 250,
  },

  /* ── Rückweg, Auflösung, Heimkehr (Abschnitt 5) ── */
  rueckweg: {
    /** Erde fährt von unten ins Bild */
    erdeFahrt: 900,
    /** Anteil der Bildschirmhöhe, den das Rückweg-Sheet bedeckt */
    sheetAnteil: 0.44,
    wegpunktMax: 56,
    wegpunktMin: 44,
    wegpunktStaffel: 60,
    /** Karten im Haufen: Größe, Drehung, erlaubte Überlappung an den Rändern */
    karte: 72,
    drehung: 6,
    ueberlappung: 8,
    /** Anheben beim Greifen, Hervorheben des Wegpunkts */
    anheben: 1.05,
    hervorheben: 1.1,
    /** Bewegung in px, ab der aus Antippen Ziehen wird */
    ziehSchwelle: 6,
  },
  aufloesung: {
    abschnitt: 350,
    ergebnis: 250,
    linienBreite: 4,
    /** Gleiten entlang der Route: weich anfahren, lang und weich auslaufen */
    gleiten: 1800,
    gleitenKurve: [0.45, 0, 0.15, 1] as [number, number, number, number],
    pauseVorHeimkehr: 300,
  },
  /* Ankunft nach richtiger Route: Echoo hebt sich über den Horizont, grinst und strahlt */
  jubel: {
    /** so weit steigt Echoo über den Horizont (px) und so groß wird er */
    hub: 72,
    skala: 1.3,
    dauer: 500,
    /** so lange strahlt er, bevor das Sheet kommt */
    halten: 1400,
    /** Lichtringe: Anzahl, Dauer, Versatz, Endgröße (× Anfang) */
    ringe: 2,
    ringDauer: 1000,
    ringVersatz: 280,
    ringSkala: 2.6,
    /** das Leuchten wird so viel größer */
    glanz: 1.6,
  },

  /** Akzentfarbe (primärer Button, Figma) und neutrales Grau der App (Fließtext) für „falsch" */
  farben: { akzent: '#ffba3a', neutral: '#6a6a6a' },
  /** Kurve, wo keine aus Wolkensammeln passt (Abschnitt 7) */
  kurve: [0.22, 1, 0.36, 1] as [number, number, number, number],
} as const
