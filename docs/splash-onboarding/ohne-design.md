# Screens ohne Figma-Design

Splash und Onboarding sind ohne eigenes Figma-Design entstanden. Sie bestehen nur aus Werten, die es schon gibt: aus der Himmelsroute (Himmel, Wolken, Erde, Kamera mit 480 px Abstand je Stufe, Kurve `ruhig`), aus den Sheets der Spiele (Karte, primärer und sekundärer Button, Glas-Pille, Puls-Slider), aus der Startseite 513:1427 (Spielkarten) und Echoo als EchooMini.png aus der Himmelsroute. Neue Farben, Schriftgrößen oder Schatten sind nicht dazugekommen.

| Screen / Baustein | Kurzbeschreibung | Verwendete Komponenten und Werte | Pfad im Code |
|---|---|---|---|
| Splash-Anordnung | Himmel und Erde der Himmelsroute; Echoo (EchooMini mit Leuchten) geht über der Erde auf (Linie bei 36 % der Höhe), darunter der Name „Sonnenschein“. Der Name liegt über den unteren Strahlen. | `SzeneHinten`, `SzeneErde`, `EchooMini`, Titelstil 26 px | `src/einfuehrung/Startsequenz.tsx` |
| Übergang Splash → Startseite | Szene und Echoo wachsen in 500 ms leicht (auf 106 %) und blenden aus, darunter liegt schon die Startseite. Kein Flug, weil die beiden Echoo-Versionen verschieden aussehen. | Kurve `ruhig` | `Startsequenz.tsx` |
| Onboarding-Gerüst | Die Himmelsroute als Hintergrund, je Schritt eine Stufe höher. Unten eine Inhaltskarte, so hoch wie ihr Inhalt (ohne Scrollen, mindestens 80 px Abstand nach oben); beim Schrittwechsel gleitet ihre Höhe in 350 ms weich auf die neue Höhe, oben rechts „Überspringen“. | Sheet-Karte (Radien 40/56, Schatten der Sheets), Glas-Pille, primärer Button | `Startsequenz.tsx` |
| Fortschrittsroute | Sechs Wegpunkte senkrecht am rechten Rand, gestrichelt verbunden; der aktuelle ist größer, erledigte sind in Akzent. Jeder Punkt ist ein 44 px großes Ziel. | Punkte und Strichlinie der Mini-Route, Akzent `#ffba3a` | `Startsequenz.tsx` |
| Schritt 1 · Hallo | Echoo groß in der Mitte, Hinweis-Pille „Zieh mich nach oben.“ darüber. | Glas-Pille | `Startsequenz.tsx` |
| Schritt 2 · Sitzung | Vier Wegpunkte im Zickzack über der Karte, darunter in der Karte vier aufklappbare Zeilen. | Wegpunkte der Himmelsroute, Zeilenstil 460:347 | `src/einfuehrung/Schritte.tsx` |
| Schritt 3 · Mittipp-Button mit Ring | Runder Glas-Button (132 px) mit Herzsymbol, Ring (r 76, 6 px) zeigt die 15 Sekunden. Das Ergebnis erscheint als Zeile, dazu der Puls-Slider. | Glas-Pille, Akzent, Puls-Slider der Spiele | `Schritte.tsx` |
| Schritt 4 · Kartenrückseiten | Vorderseite wie die Spielkarte der Startseite, Rückseite mit Modus und einem Satz (12 px): Wolkensammeln mit dem ersten Satz seiner Erklärung, Himmelsroute mit „Präge dir ein, wem und was Echoo begegnet ist, …“. | Kartenraster und Spielbilder aus 513:1427 | `Schritte.tsx` |
| Schritt 5 · Spiegel | Titel und Text, Echoo etwas größer. Der Stufen-Regler ist auf Wunsch entfallen. | Sheet-Karte, primärer Button | `Startsequenz.tsx` |
| Schritt 6 · Bereit? | Titel, Text und „Los geht's“, ohne weitere Bedienelemente. | primärer Button | `Startsequenz.tsx` |
| Einstellungen-Knopf und Sheet | Runder Glas-Knopf oben rechts auf der Startseite. Er öffnet das Sheet „Einstellungen“ mit dem Eintrag „Einführung ansehen“. | Glas-Button, Sheet `karte`, sekundärer Button | `src/screens/Dashboard.tsx`, `src/components/start/EinstellungenSheet.tsx` |
