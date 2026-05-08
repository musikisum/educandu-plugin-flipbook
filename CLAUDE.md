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
- **Auto/Manuell-Toggle**: `autoFlip`-State (default `true`). Button erscheint nur wenn `audioUrl` und mindestens ein Timecode gesetzt. Bei `autoFlip=false`: kein automatisches Blättern, Overlay deaktiviert, Nav-Buttons immer aktiv.
- **`isPlayingRef`-Pattern**: `isPlaying`-State wird per `useEffect` in `isPlayingRef.current` gespiegelt, damit `handleProgress` (useCallback) den Zustand ohne Dep-Array-Eintrag lesen kann — verhindert Callback-Neuerstellung bei jedem Play/Pause.
- **`handleProgress`-Guard**: `if (!isPlayingRef.current || !autoFlip || !audioTimecodes?.length) return;` — kein Flip wenn gestoppt oder Auto-Flip deaktiviert
- **Blättern sperren**: `isPlaying && autoFlip` → transparentes Overlay; Nav-Buttons `disabled` wenn `isPlaying && autoFlip`
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
- Alle optionalen Seitenfelder im Joi-Schema erlauben `null`: `.allow('', null).optional()` (bzw. `.allow(null).optional()` für Number/String-Enums) — Pflicht wegen alter gespeicherter Inhalte

## Portrait-Modus (Einzelseite auf kleinen Displays)
- `PORTRAIT_THRESHOLD = 600` (px) in `flipbook-page-flip.js`
- page-flip wechselt in Portrait, wenn `containerWidth < 2 * minWidth`. `usePortrait: true` allein reicht nicht zuverlässig.
- **Trick**: `minWidth: isSinglePage ? Math.ceil(containerWidth / 2) + 1 : 100` — über der Hälfte erzwingt Portrait-Modus
- `isSinglePage`-State wird im `ResizeObserver` gesetzt: `setIsSinglePage(w > 0 && w < PORTRAIT_THRESHOLD)`
- **`disablePortrait`-Prop** auf `FlipbookPageFlip`: Editor-Preview (320px) bleibt immer zweiseitig; ResizeObserver und `isSinglePage`-Logik werden übersprungen wenn `disablePortrait=true`

## Dynamisches Content-Scaling (Display-Ansicht)
- `CONTENT_SCALE_REF = 500` (px) in `flipbook-page-flip.js` — Referenzbreite für 1×-Zoom
- `ResizeObserver` (im selben Effect wie Portrait-Logik, nur wenn `!disablePortrait`) berechnet und setzt CSS-Variable auf `wrapperRef.current`:
  ```js
  const pageWidth = w < PORTRAIT_THRESHOLD ? w : w / 2;
  const scale = Math.min(1, pageWidth / CONTENT_SCALE_REF);
  wrapperRef.current.style.setProperty('--ep-flipbook-content-scale', String(scale));
  ```
- Initiales Setzen beim Mount: `updateContentScale(container.offsetWidth)`
- CSS in `.EP_Musikisum_Flipbook_Display` auf `PageText`, `PageAbcLayout`, `PageImageText`, `CoverContent`:
  ```css
  zoom: var(--ep-flipbook-content-scale, 1);
  height: calc(100% / var(--ep-flipbook-content-scale, 1));
  ```
  Der `height`-Trick kompensiert: das Div ist `100%/scale` groß, nach Zoom ergibt das wieder 100% Füllhöhe.
- Kein Upscaling — `Math.min(1, ...)` — auf großen Displays bleibt scale=1
- **Print-Fix**: `zoom: 1 !important` in `@media print` für dieselben Divs (CSS-Variable würde sonst Druck-Scaling beeinflussen)

## Controls-Layout (drei Spalten)
```
[Auto-Blättern | Manuell]    [◀ Seite X/N ▶]    [Drucken]
    ControlsLeft                ControlsCenter      ControlsRight
```
- `.EP_Musikisum_Flipbook_Controls`: `display: flex; align-items: center`
- `ControlsLeft` / `ControlsRight`: `flex: 1`
- `ControlsCenter`: `display: flex; align-items: center; gap: 16px`
- `ControlsRight`: `display: flex; justify-content: flex-end`
- Auto-Flip-Button mit `.is-active`-Klasse (blaue Umrandung + Hintergrund `#e6f4ff`) wenn aktiv

## GitHub Actions
- `verify.yml` — jeder Push: lint → test → build
- `publish.yml` — Tag `v*` pushen: lint → test → build → `npm publish --access public` (Secret `NPM_TOKEN` ist hinterlegt)

## Wichtige Konvention
Educandu-Framework-Dateien werden **nie verändert** — nur öffentliche APIs (`useService`, `getAccessibleUrl`, Komponenten aus `components/` usw.).

## Status (Stand 2026-05-08)

### v1.4.0 (committed, gepusht, getaggt)
- Alle vier Seitentypen (image, text, image+text, abc) ✓
- Buchdeckel (showCover, coverTitle, coverSubtitle, coverEdition) ✓
- Drag&Drop-Reorder ✓
- Live-Preview im Editor (320px, zoom: 0.25, immer zweiseitig via `disablePortrait`) ✓
- Audioplayer (HTML5 + YouTube, Von/Bis, Timecode-Sync, Breiten-Slider) ✓
- Auto/Manuell-Toggle für Audio-Blättern ✓
- Controls drei-spaltig (Auto/Manuell | Nav | Druck) ✓
- PDF-Druck ✓
- Plugin-Icon (FlipbookIcon, React SVG) ✓
- Portrait-Modus auf kleinen Displays (PORTRAIT_THRESHOLD=600) ✓
- Joi-Schema: alle optionalen Felder erlauben `null` ✓
- 21 Tests, ESLint sauber ✓
- GitHub Actions Workflows ✓

### v1.5.0 (in Arbeit — noch NICHT committed)
Implementiert, aber noch nicht getestet/committed:
- **Dynamisches Content-Scaling**: CSS-Variable `--ep-flipbook-content-scale`, ResizeObserver, CONTENT_SCALE_REF=500
- **Print-Fix**: `zoom: 1 !important` in `@media print`

**Noch zu testen vor Commit:**
- Audio + Timecodes mit aktivem Scaling
- Resize während Audio läuft
- Druck / PDF (Print-Fix)

**Bekanntes Problem (nicht kritisch):** Cover-Feld "Ausgabe" (`coverEdition`) verschwindet beim Zoomen.

## Bekanntes Vitest-Quirk
Erster Lauf nach Cache-Leerung kann mit "Expression expected" (Rollup) fehlschlagen → einfach nochmal `npx vitest run` ausführen.

## Roadmap
- v1.0.0 auf npm veröffentlicht ✓
- v1.2.0 — Plugin-Icon hinzugefügt ✓
- v1.3.0 — Joi null-Fix, Portrait-Modus, Editor-Preview-Scaling ✓
- v1.4.0 — Auto/Manuell-Toggle, Controls-Layout drei-spaltig, disablePortrait-Fix ✓
- v1.5.0 — Dynamisches Content-Scaling für Display (in Arbeit)

## Editor-Preview
- Feste Breite 320px, immer zweiseitig (`disablePortrait={true}` auf `FlipbookPageFlip`)
- Zoom: `zoom: 0.25; height: 400%` auf `PageText`, `PageAbcLayout`, `PageImageText`, `CoverContent` im Kontext `.EP_Musikisum_Flipbook_EditorPreviewBook` — kein dynamisches Scaling, fixer Wert
- Bilder in Image+Text: Selektor `.EP_Musikisum_Flipbook_Page > img` (direktes Kind) — verhindert, dass `height: 100%` auf Bilder innerhalb von Layout-Divs wirkt

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
