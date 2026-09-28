# Screens ohne Figma-Design

Diese Screens und Bausteine von Startseite und Statistiken sind ohne eigenes Figma-Design entstanden. Sie bestehen nur aus Werten, die es schon gibt: aus den Spielen (Sheet, Buttons, Glas-Pille, Puls-Slider, Mini-Route, Kurven) und aus Figma 180:37 (Wochenleiste) und 513:1427 (Startseite: Echoo, Stimmungskarte, Karten) sowie 513:1605 und 513:1606 (fester Kopf mit Wochenleiste). Neue Farben, Schriftgrößen oder Schatten sind nicht dazugekommen.

| Screen / Baustein | Kurzbeschreibung | Verwendete Komponenten und Werte | Pfad im Code |
|---|---|---|---|
| Eingeklappte Stimmungszeile | „Stimmung heute: {Stufe}“ mit kleiner Skala, klappt per `grid-template-rows` auf und zu. | Kartenraster, Titelstil 16 px | wie oben |
| Inhalt der Spielkarten (Karte selbst aus 513:1427) | Bild aus der Spielszene (Himmel aus 315:3007 mit Wolken bzw. Mini-Route mit Erde), Name, Modus, letzter Vor-Wert, Glas-Pille „Heute dran“. | Kartenraster, `MiniRoute`, Wolken aus Wolkensammeln | `src/components/start/SpielKarte.tsx` |
| Container Transform ins Spiel | Das Kartenbild wächst in 500 ms bildschirmfüllend auf (transform) und blendet in den Himmel des Spiels über (opacity). | Himmelsverlauf der Szene, Kurve `ruhig` | `src/screens/Dashboard.tsx` |
| Tages-Sheet (über die Wochentage im festen Kopf) | Datum als Titel, je Sitzung eine Zeile, „Zur Statistik“. | Sheet `karte`, Zeilenstil 460:347, primärer Button | `src/components/start/TagesSheet.tsx` |
| Spiel-Tabs und Zeitraum-Umschalter | Glas-Pille mit gleitender weißer Wahl-Pille. | Glas-Pille | `src/components/statistik/GlasUmschalter.tsx` |
| Sitzungs-Ebene | Datum mit runden Glas-Pfeilen, Wischen, große Zahl „Vor → Nach“ (Stil 460:347), Einheit und Δ, Zeilen. | Glas-Button, Ergebnis-Zahl 56 px, Zeilenstil 460:347 | `src/screens/Statistiken.tsx`, `src/components/statistik/SitzungsAnsicht.tsx` |
| Stufenverlauf (Wolkensammeln) | Linie der Stufen je Durchgang, gestrichelte Pausenmarke. | Akzent, Grau `#6a6a6a` | `src/components/statistik/Diagramme.tsx` |
| Zwei Mini-Routen (Himmelsroute) | Vor und nach der Pause nebeneinander. | `MiniRoute` | `SitzungsAnsicht.tsx` |
| Verlaufsdiagramm | Vor-Werte als Linie mit antippbaren Punkten. | Akzent, Linie per `stroke-dashoffset` | `Diagramme.tsx` |
| Bewegung oder Ruhe? | Zwei Spalten, ein Punkt pro Sitzung (Bewegung Kreis in Akzent, Ruhe Quadrat in Grau), Mittelwert-Linien. | Akzent, Grau | `Diagramme.tsx`, `Statistiken.tsx` |
| Wie stark bewegen? und Stimmung und Leistung | Streudiagramme; der beste Pulsbereich ist hell hinterlegt. | Akzent | `Diagramme.tsx` |
| Fortschrittszustand | Zwei Balken „Bewegung“ und „Ruhe“ bis zur ersten Auswertung. | Spur und Füllung des Puls-Sliders (`#dddddd` / `#ffba3a`, 6 px) | `Diagramme.tsx` |
| Sitzungs-Sheet | Sitzung aus Verlauf oder Zusammenhängen als Sheet. | Sheet `karte`, `SitzungsAnsicht` | `Statistiken.tsx` |
