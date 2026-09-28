import { modi } from './modes'

/*
  Glossar-Inhalte. Erklärungen in einfachem Deutsch, 2–4 Sätze.
  Die Modus-Namen kommen aus modes.ts — ein Umbenennen dort
  ändert automatisch alle Glossartexte mit.
  Haltung: beschreiben, nicht bewerten.
*/

export type Kategorie = 'Gedächtnis' | 'Aufmerksamkeit' | 'Methode' | 'In dieser App'

export const kategorieListe: ('Alle' | Kategorie)[] = [
  'Alle',
  'Gedächtnis',
  'Aufmerksamkeit',
  'Methode',
  'In dieser App',
]

export interface GlossarEintrag {
  id: string
  begriff: string
  kategorie: Kategorie
  /** Eine Zeile Anriss für die Listenkarte */
  anriss: string
  /** Erklärung in 2–4 Sätzen */
  erklaerung: string
  /** „Warum das hier vorkommt" — ein Satz zum Bezug auf diese App */
  warum: string
  /** IDs verwandter Begriffe */
  verwandt: string[]
}

export const glossar: GlossarEintrag[] = [
  /* ── Gedächtnis ── */
  {
    id: 'arbeitsgedaechtnis',
    begriff: 'Arbeitsgedächtnis',
    kategorie: 'Gedächtnis',
    anriss: 'Der Kurzzeitspeicher für das Hier und Jetzt.',
    erklaerung:
      'Das Arbeitsgedächtnis hält Informationen für Sekunden bis Minuten bereit, während du mit ihnen arbeitest — etwa wenn du eine Zahl im Kopf behältst, um sie gleich einzutippen. Sein Platz ist begrenzt: Nur wenige Dinge passen gleichzeitig hinein. Wird es überladen, gehen Inhalte verloren.',
    warum: 'Mehrere Spiele in dieser App fordern gezielt dein Arbeitsgedächtnis.',
    verwandt: ['chunking', 'kognitive-belastung'],
  },
  {
    id: 'konsolidierung',
    begriff: 'Konsolidierung',
    kategorie: 'Gedächtnis',
    anriss: 'Wie aus Neuem festes Wissen wird.',
    erklaerung:
      'Konsolidierung ist der Vorgang, mit dem das Gehirn frische Eindrücke in dauerhaftes Wissen umwandelt. Das geschieht über Stunden und besonders im Schlaf. Ruhe und Wiederholung unterstützen diesen Vorgang.',
    warum: `Der ${modi.langsam.name} misst genau diese langsame, festigende Seite deines Gedächtnisses.`,
    verwandt: ['spacing-effekt', 'elefanten-modus'],
  },
  {
    id: 'vergessenskurve',
    begriff: 'Vergessenskurve',
    kategorie: 'Gedächtnis',
    anriss: 'Neues verblasst erst schnell, dann langsamer.',
    erklaerung:
      'Kurz nach dem Lernen geht am meisten verloren, danach flacht das Vergessen ab. Was mehrfach und mit Abstand wiederholt wurde, bleibt deutlich länger erhalten. Die Vergessenskurve beschreibt diesen typischen Verlauf.',
    warum: 'Die Verlaufsdiagramme in dieser App machen sichtbar, wie sich dein Behalten über Tage verändert.',
    verwandt: ['abrufuebung', 'spacing-effekt'],
  },
  {
    id: 'spacing-effekt',
    begriff: 'Spacing-Effekt',
    kategorie: 'Gedächtnis',
    anriss: 'Verteiltes Üben wirkt länger als gebündeltes.',
    erklaerung:
      'Wer denselben Stoff mit Pausen über mehrere Tage übt, behält ihn länger, als wenn er alles in einer einzigen langen Sitzung lernt — bei gleicher Gesamtzeit. Die Pausen geben dem Gehirn Zeit, das Gelernte zu festigen.',
    warum: 'Deshalb sind die Übungen hier auf viele kurze Tage verteilt statt auf wenige lange Sitzungen.',
    verwandt: ['konsolidierung', 'vergessenskurve'],
  },
  {
    id: 'chunking',
    begriff: 'Chunking',
    kategorie: 'Gedächtnis',
    anriss: 'Einzelteile zu sinnvollen Paketen bündeln.',
    erklaerung:
      'Statt sechs einzelner Ziffern wie 2-6-0-8-1-9 merkt man sich drei Pakete wie 26-08-19. Durch solches Bündeln passt mehr in das begrenzte Arbeitsgedächtnis. Je vertrauter die Pakete, desto besser funktioniert es.',
    warum: 'In den Merk-Spielen kannst du beobachten, ob dir Bündeln hilft.',
    verwandt: ['arbeitsgedaechtnis'],
  },
  {
    id: 'abrufuebung',
    begriff: 'Abrufübung',
    kategorie: 'Gedächtnis',
    anriss: 'Erinnern üben statt nur wieder anschauen.',
    erklaerung:
      'Wer sich Inhalte aktiv ins Gedächtnis zurückholt, festigt sie stärker, als wenn er sie nur erneut liest. Jeder gelungene Abruf wirkt wie ein kleines Training für die Gedächtnisspur.',
    warum: 'Die Spiele in dieser App fragen Inhalte aktiv ab, statt sie nur zu zeigen.',
    verwandt: ['vergessenskurve', 'konsolidierung'],
  },
  {
    id: 'interferenz',
    begriff: 'Interferenz',
    kategorie: 'Gedächtnis',
    anriss: 'Wenn sich Erinnerungen gegenseitig stören.',
    erklaerung:
      'Ähnliche Inhalte können einander überlagern: Neues erschwert den Zugriff auf Altes, und Altes kann sich vor Neues schieben. Das ist ein häufiger Grund für Verwechslungen — kein Zeichen für ein schlechtes Gedächtnis.',
    warum: 'Manche Aufgaben hier verwenden bewusst ähnliche Reize, dadurch wird dieser Effekt an dir selbst sichtbar.',
    verwandt: ['arbeitsgedaechtnis', 'vergessenskurve'],
  },
  {
    id: 'serieller-positionseffekt',
    begriff: 'Serieller Positionseffekt',
    kategorie: 'Gedächtnis',
    anriss: 'Anfang und Ende bleiben am besten hängen.',
    erklaerung:
      'Aus einer Liste merkt man sich die ersten und die letzten Einträge meist besser als die Mitte. Die ersten wurden öfter innerlich wiederholt, die letzten sind noch frisch im Arbeitsgedächtnis.',
    warum: 'Bei Listen-Aufgaben in dieser App kannst du diesen Effekt an deinen eigenen Ergebnissen prüfen.',
    verwandt: ['arbeitsgedaechtnis'],
  },

  /* ── Aufmerksamkeit ── */
  {
    id: 'daueraufmerksamkeit',
    begriff: 'Daueraufmerksamkeit',
    kategorie: 'Aufmerksamkeit',
    anriss: 'Über längere Zeit bei einer Sache bleiben.',
    erklaerung:
      'Gemeint ist die Fähigkeit, die Konzentration auch bei einer eintönigen Aufgabe zu halten. Sie schwankt im Tagesverlauf und mit dem eigenen Zustand — das ist normal und bei jedem Menschen anders.',
    warum: 'Die Karte „Tagesrhythmus" in den Statistiken zeigt dir solche Schwankungen über den Tag.',
    verwandt: ['aufmerksamkeitswechsel', 'ablenkbarkeit'],
  },
  {
    id: 'aufmerksamkeitswechsel',
    begriff: 'Aufmerksamkeitswechsel',
    kategorie: 'Aufmerksamkeit',
    anriss: 'Schnell zwischen Aufgaben umschalten.',
    erklaerung:
      'Jeder Wechsel zwischen zwei Aufgaben kostet einen kurzen Moment und etwas Genauigkeit — die sogenannten Umschaltkosten. Wer frisch und aktiviert ist, wechselt in der Regel leichter.',
    warum: `Der ${modi.schnell.name} bildet unter anderem diese Fähigkeit ab.`,
    verwandt: ['hasen-modus', 'kognitive-belastung'],
  },
  {
    id: 'kognitive-belastung',
    begriff: 'Kognitive Belastung',
    kategorie: 'Aufmerksamkeit',
    anriss: 'Wie voll der Kopf gerade ist.',
    erklaerung:
      'Jede Aufgabe beansprucht einen Teil der begrenzten geistigen Kapazität. Ist die Belastung zu hoch, sinken Tempo und Genauigkeit. Pausen und einfachere Teilschritte senken die Belastung.',
    warum: 'Die Spiele sind so gestuft, dass die Belastung langsam steigt statt sprunghaft.',
    verwandt: ['arbeitsgedaechtnis'],
  },
  {
    id: 'ablenkbarkeit',
    begriff: 'Ablenkbarkeit',
    kategorie: 'Aufmerksamkeit',
    anriss: 'Wie leicht dich Reize herausziehen.',
    erklaerung:
      'Geräusche, Gedanken oder Benachrichtigungen konkurrieren ständig um Aufmerksamkeit. Wie stark sie stören, unterscheidet sich von Person zu Person — und beim selben Menschen von Tag zu Tag.',
    warum: `Dein ${modi.schnell.name} kann an unruhigen Tagen sichtbar reagieren.`,
    verwandt: ['daueraufmerksamkeit'],
  },

  /* ── Methode ── */
  {
    id: 'n-gleich-1',
    begriff: 'N=1',
    kategorie: 'Methode',
    anriss: 'Eine Studie mit genau einer Person: dir.',
    erklaerung:
      'In Studien steht N für die Anzahl der Teilnehmenden. Bei N=1 erforscht eine Person sich selbst. Die Ergebnisse gelten für dich — nicht für alle Menschen. Statt des Durchschnitts vieler zählt dein eigener Verlauf über die Zeit.',
    warum: 'Alle Auswertungen in dieser App sind so gebaut: Beobachtungen über dich, keine allgemeinen Urteile.',
    verwandt: ['baseline', 'effektstaerke'],
  },
  {
    id: 'baseline',
    begriff: 'Baseline',
    kategorie: 'Methode',
    anriss: 'Dein Ausgangswert zum Vergleichen.',
    erklaerung:
      'Die ersten Messungen bilden eine Grundlinie. Spätere Werte werden daran gemessen — so wird sichtbar, was sich wirklich verändert und was nur normale Schwankung ist.',
    warum: 'Deine ersten Tage in der App dienen als diese Grundlinie.',
    verwandt: ['n-gleich-1'],
  },
  {
    id: 'bewegungsphase',
    begriff: 'Bewegungsphase',
    kategorie: 'Methode',
    anriss: 'Kurze körperliche Aktivierung zwischen den Aufgaben.',
    erklaerung:
      'Ein paar Minuten Bewegung zwischen zwei Aufgaben. Die App erfasst nur, ob eine Bewegungsphase stattgefunden hat. So kannst du vergleichen, wie deine Werte an Tagen mit und ohne ausfallen.',
    warum: 'Die Karte „Bewegungsphase" in den Statistiken zeigt genau diesen Vergleich — samt Anzahl der Tage.',
    verwandt: ['hasen-modus', 'effektstaerke'],
  },
  {
    id: 'effektstaerke',
    begriff: 'Effektstärke',
    kategorie: 'Methode',
    anriss: 'Wie groß ein Unterschied wirklich ist.',
    erklaerung:
      'Nicht jeder Unterschied bedeutet viel. Die Effektstärke ordnet ein, ob der Abstand zwischen zwei Werten klein oder groß ist — unabhängig davon, ob er zufällig zustande kam. Bei wenigen Messtagen ist besondere Vorsicht angebracht.',
    warum: 'Darum steht bei Vergleichen in dieser App immer dabei, auf wie vielen Tagen sie beruhen.',
    verwandt: ['n-gleich-1', 'baseline'],
  },

  /* ── In dieser App ── */
  {
    id: 'elefanten-modus',
    begriff: modi.langsam.name,
    kategorie: 'In dieser App',
    anriss: 'Das langsame, tiefe Behalten.',
    erklaerung:
      'So nennt diese App das tiefe, verknüpfende Behalten. Information wird über Stunden und besonders im Schlaf gefestigt. Dieser Modus ist stark, wenn du Ruhe und Wiederholung hast — und er ist dem schnellen Modus gleichwertig.',
    warum: 'Der braune Wert in deinen Statistiken ist dieser Modus.',
    verwandt: ['konsolidierung', 'hasen-modus'],
  },
  {
    id: 'hasen-modus',
    begriff: modi.schnell.name,
    kategorie: 'In dieser App',
    anriss: 'Die wache, flexible Aufmerksamkeit.',
    erklaerung:
      'So nennt diese App das schnelle Reagieren, Wechseln und Filtern. Dieser Modus ist stark, wenn du frisch und aktiviert bist — und er ist dem langsamen Modus gleichwertig. Es gibt kein „besser".',
    warum: 'Der orange Wert in deinen Statistiken ist dieser Modus.',
    verwandt: ['aufmerksamkeitswechsel', 'elefanten-modus'],
  },
  {
    id: 'vitalitaet',
    begriff: 'Vitalität',
    kategorie: 'In dieser App',
    anriss: 'Was die Sonne über deinen Zustand zeigt.',
    erklaerung:
      'Die Vitalität ist ein Messwert, der den erfassten Zustand spiegelt — Sättigung, Strahlen und Leuchten der Sonne richten sich danach. Sie ist keine Belohnung und kein Punktestand: Die Sonne will nichts von dir, sie zeigt nur.',
    warum: 'So siehst du deinen Zustand auf einen Blick, ohne Zahlen lesen zu müssen.',
    verwandt: ['elefanten-modus', 'hasen-modus'],
  },
]
