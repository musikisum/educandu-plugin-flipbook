---
name: FlipBook Plugin – Projektkontext
description: Ziel, Architekturentscheidungen und offene Aufgaben für das native educandu-plugin-flipbook
type: project
originSessionId: 8cc1f2d6-c67d-44f2-bef5-450d997bd245
---
Natives FlipBook-Plugin für die Open Music Academy, gebaut mit dem Educandu-Plugin-Template. Es soll keine iFrame-Lösung sein, sondern ein vollständig nativer React-Ansatz.

**Why:** Das embedded-html-Plugin (C:\dev\educandu-plugin-embedded-html) hat ein FlipBook via iFrame gezeigt — das neue Plugin soll dasselbe nativ tun, um besser in das Educandu-Ökosystem integriert zu sein.

**How to apply:** Alle Entscheidungen orientieren sich am embedded-html-Plugin als Referenz-Implementierung (gleicher Plugin-Aufbau, gleiche Konventionen).

## Repository
- **Remote:** git@github.com:musikisum/educandu-plugin-flipbook.git
- **Lokal:** C:\dev\educandu-plugin-flipbook
- **Branch:** main

## Referenz-Plugin
- **Pfad:** C:\dev\educandu-plugin-embedded-html
- Vollständig implementiertes Plugin mit Info-Klasse, Editor, Display, LESS, Übersetzungen (EN/DE)
- Selbes Template-Grundgerüst

## Bibliothek
- **StPageFlip** in der React-Variante (wahrscheinlich `react-pageflip` / `@dflect/react-pageflip`)
- Navigation: Seitenklick, Drag (aus Library), Vor/Zurück-Buttons
- Der User bestätigte: die Library sieht sehr gut aus und hat eine React-Version

## Content-Modell (Seiten)
Jede Seite ist eines von drei Typen:
1. **image** – ein Bild (Upload ins Educandu-CDN)
2. **text** – reines Markdown-Textfeld
3. **image+text** – Bild + Markdown kombiniert

- Seitenanzahl: beliebig (dynamisch)
- PDF: vorerst weggelassen (zu aufwendig)

## Editor-UI
- Drag&Drop-Zone mit Plus-Button zum Hinzufügen von Seiten
- Für Bilder: Educandu File-Upload-Dialog / File-Select
- Für Text und Bild+Text: Educandu Markdown-Eingabefeld (MarkdownInput)
- Alle Editor-Komponenten sollen aus dem Educandu-Framework kommen (keine Eigenbauten wo es geht)

## Dateinamen-Konvention (angelehnt an embedded-html)
- `flipbook-info.js`
- `flipbook-display.js`
- `flipbook-editor.js`
- `flipbook-icon.js`
- `flipbook.less`
- `translations.json`
- CSS-Klassen-Namespace: `EP_Musikisum_Flipbook_`

## Status (Stand 2026-05-01)
- Repo umgebogen auf musikisum-Account ✓
- Architektur besprochen ✓
- Template-Dateien umbenannt, Plugin läuft im dev-server ✓
- Nächster Schritt: react-pageflip einbinden, Display- und Editor-Komponente implementieren
