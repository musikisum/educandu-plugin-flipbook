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
Jede Seite ist einer von vier Typen:

1. **image** – UrlInput, Bild füllt die ganze Seite.
2. **text** – Markdown-Text (`gfm.render()` + `renderMedia: true`). Papierton, Buchsatzspiegel-Padding.
3. **image+text** – Bild + Markdown-Text. `imagePosition` (none/left/right), `imageSize` (%). `@IMG`-Platzhalter positioniert das Bild im Text. Float-Fix: Text-Paragraphen direkt als Kinder des Layout-Divs (kein Wrapper-Div → kein BFC).
4. **abc** – ABC-Notation (abcjs) + Markdown-Text. `@ABC`-Platzhalter positioniert die Notation im Text. Hintergrund: `background: #f9f6ee` auf Layout-Div, SVG-Rect via `.abcjs-background { fill: transparent }` transparent.

## Content-Modell (globale Felder)
```js
{
  pages: [],
  width: 100,           // Gesamtbreite des Flipbooks (u-width-*)
  height: 550,          // Höhe in px
  showCover: false,
  coverTitle: '',       // Markdown
  coverSubtitle: '',    // Markdown
  coverEdition: '',
  audioUrl: '',
  audioPlaybackRange: [0, 1],  // normalisiert, Von/Bis-Ausschnitt
  audioWidth: 100,             // Breite des Audio-Players in %
  audioTimecodes: []           // Array von Sekunden (null = leer), eine Zahl pro Seite
}
```

## Audioplayer
- **MediaPlayer** (educandu-Komponente) statt raw `<audio>` → unterstützt HTML5, externe URLs und **YouTube** (`SOURCE_TYPE.youtube` in `AUDIO_SOURCE_TYPES`)
- **Von/Bis**: `audioPlaybackRange [0,1]`; `MediaRangeSelector` direkt inline im Editor (kein Modal)
- **Timecode-Sync**: `onProgress(ms)` liefert Millisekunden relativ zum Ausschnittsbeginn → `progressMs / 1000 >= timecodes[i]`. `currentPageRef.current` wird sofort beim Flip gesetzt (verhindert wiederholtes Flip alle 20ms durch das 20ms-Interval des MediaPlayers)
- **Blättern sperren**: `isPlaying`-State via `onPlay`/`onPause`/`onEnded`; transparentes Overlay (`.EP_Musikisum_Flipbook_PlayingOverlay`) auf `.EP_Musikisum_Flipbook_BookArea` — liegt nicht über dem Player
- **Breite**: `audioWidth` mit `ObjectWidthSlider`; `style={{ width: '${audioWidth}%' }}` auf dem Wrapper-Div; `margin: auto` zentriert
- URL-Wechsel setzt `audioPlaybackRange` auf `[0, 1]` zurück
- Timecodes im Modal: Format `m:ss`, eine Eingabe pro Seite. Im Doppelseitenmodus (breite Displays) braucht man nur jeden zweiten Timecode.

## Dateistruktur
- `src/flipbook-info.js` — Plugin-Klasse, typeName: `musikisum/educandu-plugin-flipbook`
- `src/flipbook-display.js` — Display-Komponente
- `src/flipbook-editor.js` — Editor mit Drag&Drop-Seitenliste, Live-Preview, Audio-Sektion
- `src/flipbook-page-flip.js` — React-Wrapper um page-flip (imperativer DOM)
- `src/flipbook.less` — Styles, Namespace: `EP_Musikisum_Flipbook_`
- `src/flipbook.yml` — Übersetzungen EN/DE (→ translations.json, JSON nie manuell bearbeiten)
- `src/flipbook-info.spec.js` — 21 Vitest-Tests (validateContent, redactContent, getCdnResources)

## Kritische Implementierungsdetails
- `FlipbookPageFlip` initialisiert page-flip jedes Mal auf einem **frisch erstellten** `bookEl` — kein Reuse des React-ref-Elements, sonst schlägt Reinitialisierung nach Drag&Drop stumm fehl
- `pagesKey` verknüpft alle Seitenfelder als String — löst komplette Neuinitialisierung bei jeder inhaltlichen Änderung aus
- `getAccessibleUrl` aus Educandu für alle Bild- und Audio-URLs — nie direkte URLs verwenden
- Joi-Schema mit `allowUnknown: true` — Rückwärtskompatibilität mit altem Content

## GitHub Actions
- `verify.yml` — jeder Push: lint → test → build
- `publish.yml` — Tag `v*` pushen: lint → test → build → `npm publish --access public` (Secret `NPM_TOKEN` ist hinterlegt)

## Wichtige Konvention
Educandu-Framework-Dateien werden **nie verändert** — nur öffentliche APIs (`useService`, `getAccessibleUrl`, Komponenten aus `components/` usw.).

## Status (Stand 2026-05-03)
Alle Features implementiert und getestet:
- Alle vier Seitentypen (image, text, image+text, abc) ✓
- Buchdeckel (showCover, coverTitle, coverSubtitle, coverEdition) ✓
- Drag&Drop-Reorder ✓
- Live-Preview im Editor ✓
- Audioplayer (HTML5 + YouTube, Von/Bis, Timecode-Sync, Breiten-Slider, Blättern-Sperre) ✓
- 21 Tests, ESLint sauber ✓
- GitHub Actions Workflows ✓

## Bekannte Limitation: Editor-Preview
Der Preview (320px) zeigt Text/ABC-Seiten nicht maßstabsgetreu — CSS-Schriftgrößen skalieren nicht mit page-flip. Workaround: in Display-Ansicht prüfen.

## Bekanntes Vitest-Quirk
Erster Lauf nach Cache-Leerung kann mit "Expression expected" (Rollup) fehlschlagen → einfach nochmal `npx vitest run` ausführen.

## Roadmap
- **npm publish** — Tag `v1.0.0` gepusht → CI veröffentlicht automatisch auf npm.

## Nächste Implementierung: PDF-Druck

Button „Drucken / Als PDF speichern" ruft `window.print()` auf — Browser öffnet nativen Druckdialog.

**Technischer Plan:**
- Page-flip rendert Seiten mit absoluter Positionierung + CSS-Transforms — `@media print` kann das nicht direkt überschreiben
- Lösung: Nach dem Aufbau des Flipbooks im `useEffect` alle `.EP_Musikisum_Flipbook_Page`-Elemente in einen versteckten `EP_Musikisum_Flipbook_PrintView`-Container **klonen**
- `@media print`: nur PrintView sichtbar, alles andere `display: none`; Seiten als gestapelte Divs mit `page-break-after: always`
- Vorteil: Inhalte (Bilder, ABC-Notation, Markdown) sind bereits fertig gerendertes DOM — kein Neu-Rendern nötig
- Button sitzt unterhalb des Buches (neben den Controls oder separat)
- Übersetzungsschlüssel: `printButton` (EN: "Print / Save as PDF", DE: "Drucken / Als PDF speichern")
