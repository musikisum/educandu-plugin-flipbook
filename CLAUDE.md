# Flipbook Plugin – Projektkontext

Natives FlipBook-Plugin für die Open Music Academy, gebaut mit dem Educandu-Plugin-Template. Kein iFrame — vollständig nativer React-Ansatz.

## Repository
- **Remote:** git@github.com:musikisum/educandu-plugin-flipbook.git
- **Lokal:** C:\dev\educandu-plugin-flipbook
- **Branch:** main

## Referenz-Plugin
- **Pfad:** C:\dev\educandu-plugin-embedded-html
- Vollständig implementiertes Plugin mit gleicher Struktur (Info-Klasse, Editor, Display, LESS, Übersetzungen EN/DE)

## Bibliothek
- **StPageFlip** in der React-Variante (`react-pageflip`)
- Navigation: Seitenklick, Drag und Vor/Zurück-Buttons (alles in der Library eingebaut)

## Content-Modell (Seiten)
Jede Seite ist eines von drei Typen:
1. **image** – ein Bild (Upload ins Educandu-CDN)
2. **text** – reines Markdown-Textfeld
3. **image+text** – Bild + Markdown kombiniert

- Seitenanzahl: beliebig dynamisch
- PDF: vorerst weggelassen

## Editor-UI
- Drag&Drop-Liste mit Plus-Button zum Hinzufügen von Seiten
- Für Bilder: Educandu File-Upload-Dialog / File-Select
- Für Text und Bild+Text: Educandu MarkdownInput
- Alle Komponenten aus dem Educandu-Framework (keine Eigenbauten)

## Dateistruktur
- `src/flipbook-info.js` — Plugin-Klasse, typeName: `musikisum/educandu-plugin-flipbook`
- `src/flipbook-display.js` — Display-Komponente (Platzhalter, noch nicht implementiert)
- `src/flipbook-editor.js` — Editor-Komponente (Platzhalter, noch nicht implementiert)
- `src/flipbook.less` — Styles, Namespace: `EP_Musikisum_Flipbook_`
- `src/translations.json` — Übersetzungen EN/DE

## Status
- Repo auf musikisum-Account ✓
- Template-Dateien umbenannt, Plugin läuft im dev-server ✓
- **Nächster Schritt:** `react-pageflip` einbinden, Display- und Editor-Komponente implementieren
