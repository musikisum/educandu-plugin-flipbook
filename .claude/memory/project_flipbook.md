---
name: FlipBook Plugin – Projektkontext
description: Ziel, Architekturentscheidungen, aktueller Stand und offene Aufgaben für das native educandu-plugin-flipbook
type: project
---
Natives FlipBook-Plugin für die Open Music Academy, gebaut mit dem Educandu-Plugin-Template. Kein iFrame — vollständig nativer React-Ansatz.

**Why:** Das embedded-html-Plugin hat ein FlipBook via iFrame gezeigt — das neue Plugin soll dasselbe nativ tun, um besser in das Educandu-Ökosystem integriert zu sein.

**How to apply:** Alle Entscheidungen orientieren sich am embedded-html-Plugin als Referenz-Implementierung (gleicher Plugin-Aufbau, gleiche Konventionen).

## Repository
- **Remote:** git@github.com:musikisum/educandu-plugin-flipbook.git
- **Lokal (Arbeit):** d:\dev\educandu-plugin-flipbook
- **Branch:** main

## Referenz-Plugin
- **Pfad:** d:\dev\educandu-plugin-embedded-html (NICHT C:\dev\...)
- Vollständig implementiertes Plugin mit Info-Klasse, Editor, Display, LESS, Übersetzungen (EN/DE)

## Bibliothek
- **page-flip v2.0.7** (npm-Paket `page-flip`, NICHT `react-pageflip`)
- Imperatives DOM-Rendering in `flipbook-page-flip.js`, kein React/page-flip-Konflikt
- Navigation: Seitenklick, Drag (aus Library), Vor/Zurück-Buttons

## Content-Modell (Seiten)
Jede Seite ist eines von drei Typen:
1. **image** – ein Bild (CDN oder externe URL)
2. **text** – reines Markdown-Textfeld
3. **image+text** – Bild + Markdown kombiniert

## Implementierungsstand (2026-05-01)

### Was funktioniert ✓
- Plugin läuft im dev-server
- `page-flip` eingebunden, Display funktioniert
- Bilder (externe URLs + CDN) werden angezeigt
- `object-fit: cover` auf Bildern (füllt Seite, schneidet ggf. Ränder)
- Editor: DragAndDropContainer + ItemPanel (wie Ear-Training-Plugin)
- Editor: zentrierte 320px-Vorschau oben, debounced (400ms)
- Scrollbalken-Fix: `.stf__parent { overflow: hidden }` in Display und EditorPreviewBook

### Wichtige Erkenntnis: page-flip überschreibt display
Die Library setzt `display: block` via `style.cssText` (inline) direkt auf das Seiten-Element — das überschreibt `display: flex` aus CSS-Klassen. Deshalb können keine Flex-Layouts direkt auf `.EP_Musikisum_Flipbook_Page` verwendet werden. Lösungsansatz für später: innerer Wrapper-Div mit `position: absolute; inset: 0; display: flex` — aber noch NICHT implementiert, da es den Display verschlechtert hat (Bilder sahen schlechter aus). Aktuell bleibt das simple `img`-Layout.

### Offene Aufgaben (nächste Session)
1. **Text-Rendering**: Aktuell `textContent = page.text` (plain text). Markdown muss noch gerendert werden. Prüfen welche Markdown-Bibliothek in Educandu vorhanden ist (`marked`?).
2. **Übersetzungsschlüssel**: `pageType` und `preview` fehlen in `translations.json` — werden im Editor als Rohschlüssel angezeigt. Müssen noch ergänzt werden (DE/EN).
3. **Bild-Clipping im Editor-Preview**: Der kleine 320px-Preview schneidet Bilder ab. Im Display (volle Breite) sieht alles gut aus. Das `PageInner`-Wrapper-Konzept (position absolute, inset 0, flex) wäre der richtige Fix, hat aber den Display-Look verschlechtert — muss sorgfältig getestet werden.

## Dateistruktur
- `src/flipbook-info.js` — Plugin-Klasse, typeName: `musikisum/educandu-plugin-flipbook`
- `src/flipbook-display.js` — Display-Komponente
- `src/flipbook-editor.js` — Editor mit DragAndDrop + debounced Preview
- `src/flipbook-page-flip.js` — Imperatives React-Wrapper um page-flip
- `src/flipbook.less` — Styles, Namespace: `EP_Musikisum_Flipbook_`
- `src/translations.json` — Übersetzungen EN/DE

## Wichtige Konvention
Educandu-Framework-Dateien werden **nie verändert** — nur öffentliche APIs genutzt.
