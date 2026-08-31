# Design-Tokens

Farb- und Maßwerte der App. Die Werte hier sind die **Quelle der Wahrheit** —
sie werden in `src/styles/tokens.css` übernommen.

> Status: Startwerte aus dem Auftrag (geschätzt). Bitte mit den echten
> Figma-Werten überschreiben, dann übertrage ich sie in den Code.

## Farben

| Token          | Wert                          | Verwendung                       |
| -------------- | ----------------------------- | -------------------------------- |
| --sun-core     | #FBB03B                       | Sonnenkörper                     |
| --sun-deep     | #F59E1B                       | dunklere Sonnentöne, Akzente     |
| --sun-light    | #FFCE6A                       | helle Sonnentöne, Verläufe       |
| --surface      | #FFFDF8                       | Seitenhintergrund                |
| --surface-card | #FFFFFF                       | Kartenhintergrund                |
| --cream        | #FFF4E0                       | cremefarbene Flächen             |
| --ink          | #1A1A1A                       | Text                             |
| --ink-muted    | #8A8578                       | gedämpfter Text                  |

## Radien

| Token         | Wert  |
| ------------- | ----- |
| --radius-card | 28px  |
| --radius-pill | 999px |

## Schatten

| Token         | Wert                              |
| ------------- | --------------------------------- |
| --shadow-card | 0 2px 12px rgba(180,120,20,0.08)  |

## Verläufe (aus Frame.jpg nachgemessen)

| Token         | Wert                                                      | Verwendung        |
| ------------- | --------------------------------------------------------- | ----------------- |
| --grad-header | linear-gradient(180deg, #FFF8E1, #FBE3AD 45%, #F6C364)    | Kopfbereich       |
| --grad-points | linear-gradient(180deg, #FFE3A9, #FFFFFF 62%)             | Punktekarte       |
| --grad-avatar | linear-gradient(180deg, var(--sun-light), var(--surface)) | Avatar-Hintergrund|

## Basis-Frame

393 × 852 px (iPhone), auf Mobil optimiert, am Desktop im Telefonrahmen zentriert.
