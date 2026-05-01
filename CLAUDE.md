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
- **page-flip** v2.0.7 (npm: `page-flip`, NICHT `react-pageflip` – das ist veraltet)
- DOM wird imperativ in `useEffect` erstellt (kein React/page-flip-Konflikt)
- Navigation: Vor/Zurück-Buttons selbst gebaut; Seitenklick und Drag durch die Library

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
- `src/flipbook-display.js` — Display-Komponente (zeigt FlipBook oder Platzhaltertext)
- `src/flipbook-editor.js` — Editor mit Drag&Drop-Seitenliste und Live-Preview
- `src/flipbook-page-flip.js` — React-Wrapper um page-flip (imperativer DOM, kein Konflikt)
- `src/flipbook.less` — Styles, Namespace: `EP_Musikisum_Flipbook_`
- `src/flipbook.yml` — Übersetzungen EN/DE (wird zu translations.json kompiliert, JSON nie manuell bearbeiten)

## Kritische Implementierungsdetails
- `FlipbookPageFlip` initialisiert page-flip jedes Mal auf einem **frisch erstellten** `bookEl` (kein Reuse des React-ref-Elements) — sonst schlägt die Reinitialisierung nach Drag&Drop stumm fehl
- `pagesKey` = alle Seiten als `key:type:image:text` verknüpft — löst komplette Neuinitialisierung bei jeder inhaltlichen Änderung aus
- `getAccessibleUrl` aus Educandu für alle Bild-URLs (CDN + extern) — nie direkte URLs verwenden

## Wichtige Konvention
Educandu-Framework-Dateien werden **nie verändert** — nur öffentliche APIs werden genutzt (`useService`, `getAccessibleUrl`, Komponenten aus `components/` usw.), damit Framework-Updates das Plugin nicht brechen.

## Status (Stand 2026-05-01)
- Repo auf musikisum-Account ✓
- Plugin läuft im dev-server ✓
- Bilder (externe URLs + CDN) funktionieren stabil ✓
- Drag&Drop-Reorder funktioniert, Preview bleibt erhalten ✓
- Erste Seite erscheint sofort im Preview nach dem Hinzufügen ✓
- Übersetzungen vollständig (EN/DE): name, noPages, page, image, text, pageType, pageType_*, addPage_*, height, preview ✓

## Offene Punkte
- Text-Seiten und Bild+Text-Seiten noch nicht vollständig getestet
- Text-Rendering: aktuell `textContent` (plain text), kein Markdown — Verbesserung nötig
- Editor-Preview zeigt leeres Element wenn noch keine Seiten da (sichtbarer Abstand) — evtl. Platzhalter
- Noch kein npm-Publish / kein Einsatz in Produktion
