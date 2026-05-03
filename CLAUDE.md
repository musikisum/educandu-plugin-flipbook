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
- `src/flipbook-icon.js` — Plugin-Icon (React SVG-Komponente, quadratisches 100×100 viewBox, Farben `#f2f2f2`/`#666` wie educandu Image-Icon)
- `src/flipbook-icon.svg` — Quell-SVG (Inkscape), wird nicht direkt eingebunden
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
- PDF-Druck ✓
- Plugin-Icon (FlipbookIcon, React SVG, Farben an educandu Image-Icon angelehnt) ✓
- 21 Tests, ESLint sauber ✓
- GitHub Actions Workflows ✓

## Bekannte Limitation: Editor-Preview
Der Preview (320px) zeigt Text/ABC-Seiten nicht maßstabsgetreu — CSS-Schriftgrößen skalieren nicht mit page-flip. Workaround: in Display-Ansicht prüfen.

## Bekanntes Vitest-Quirk
Erster Lauf nach Cache-Leerung kann mit "Expression expected" (Rollup) fehlschlagen → einfach nochmal `npx vitest run` ausführen.

## Roadmap
- v1.0.0 auf npm veröffentlicht ✓
- v1.2.0 — Plugin-Icon hinzugefügt

## PDF-Druck

Button „Drucken / Als PDF speichern" neben den Navigationsbuttons ruft `window.print()` auf.

**Implementierung:**
- Seiten werden im `useEffect` **nach** `abcjs.renderAbc()` aber **vor** `new PageFlip()` geklont — zu diesem Zeitpunkt ist der Inhalt fertig gerendert, page-flip hat noch keine Transforms angewendet
- Klone landen in `EP_Musikisum_Flipbook_PrintView` (normaler div, `display: none` im Screen-Modus)
- Beim Klick: Klasse `EP_Musikisum_Flipbook_IsPrinting` auf den eigenen Container-Div setzen → nach Druck via `afterprint`-Event wieder entfernen. Damit druckt bei mehreren Flipbooks auf einer Seite nur das angeklickte.
- `@page { margin: 0 }` unterdrückt Browser-Metadaten (URL, Datum, Seitenzahl) in Chrome
- `@media print`: `body { visibility: hidden }` + nur `IsPrinting`-Container sichtbar schalten; `EP_Musikisum_Flipbook_Display { overflow: visible }` verhindert Clipping

**Kritische CSS-Details:**
- `break-inside: avoid` + `break-after: page` auf jeder Druckseite — kein Umbrechen mitten in einer Seite
- `padding: 20mm 10mm` auf der Druckseite (statt `@page`-Margin) → Rand ohne Browser-Metadaten
- `CoverContent/PageText/PageAbcLayout/PageImageText`: `padding: 0` im Druck (das Seiten-Padding übernimmt)
- `padding-top: 30%` auf dem Cover-CoverContent ist für schmale Flipbook-Seiten (~400px) berechnet — im Druck wäre das ~240px. Wird durch `padding: 0 !important` neutralisiert (Seiten-Padding greift)
- Reine Bildseiten: `img` ist direktes Kind des Page-Div → `.EP_Musikisum_Flipbook_Page > img { max-height: calc(100vh - 40mm) }` begrenzt auf Seitenhöhe. `> img` (direktes Kind) schließt Bilder in Image+Text-Seiten aus — deren Inline-Styles (Breite, Float) bleiben unberührt
