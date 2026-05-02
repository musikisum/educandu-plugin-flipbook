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

1. **image** – UrlInput, Bild füllt die ganze Seite. Für reine Bildsammlungen (Notenmanuskripte, Fotos).
2. **text** – Educandus `MarkdownInput`-Komponente, bringt alles mit: Filepicker, CDN-Zugriff, Bild/Audio/Video-Einbettung. Kein eigener Renderer nötig — nur `gfm.render(text)` beim Anzeigen.
3. **image+text** – GUI-Layout: CDN-Bild (UrlInput) mit Größen-Slider (% der Seitenbreite) und Positionswahl (links/rechts), Markdown-Text fließt drumherum (CSS float). Sinnvoll wenn man das Layout GUI-gesteuert haben will statt selbst in Markdown zu layouten.

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

## Status (Stand 2026-05-03)
- Repo auf musikisum-Account ✓
- Plugin läuft im dev-server ✓
- Bilder (externe URLs + CDN) funktionieren stabil ✓
- Drag&Drop-Reorder funktioniert, Preview bleibt erhalten ✓
- Erste Seite erscheint sofort im Preview nach dem Hinzufügen ✓
- Übersetzungen vollständig (EN/DE): name, noPages, page, image, text, pageType, pageType_*, addPage_*, height, preview, showCover, coverTitle, coverSubtitle, coverEdition ✓
- Markdown-Rendering für Textseiten implementiert (`gfm.render()` + `renderMedia: true`) ✓
- Papierton (#f9f6ee) für Textseiten (auf outer page-div per inline style + CSS) ✓
- Buchsatzspiegel-Padding auf Textseiten: `padding: 8% 10% 13%` ✓
- Overflow: hidden auf Textseiten (Buchseite clippt bei Überlauf) ✓
- MIN_PAGES = 4 (soft flip statt hard end-of-book animation bei wenigen Seiten) ✓
- Äußerer Buch-Schatten (box-shadow links/rechts auf .EP_Musikisum_Flipbook_Book) ✓
- Knickfalte (Buchfalte): ::before gradient auf jeder Seite, 8px, flipped mit Seite mit ✓
- Buchdeckel implementiert: showCover, coverTitle (Markdown, 40px), coverSubtitle (Markdown, 28px), coverEdition (24px, unten) ✓
- Vorderdeckel: padding-top 30%, 10% horizontaler Rand für alle Inhalte ✓
- Rückdeckel: nur "openmusic.academy" (24px), unten ausgerichtet ✓
- page-flip showCover:true für korrektes Aufklappen als Einzelseite ✓
- Joi-Schema allowUnknown:true für Rückwärtskompatibilität mit altem Content ✓
- LESS-Watch-Bug behoben: restartServer nach CSS-Recompile (Hash im Dateinamen war Ursache) ✓

## Offene Punkte
- Text-Seiten und Bild+Text-Seiten noch nicht vollständig getestet
- Noch kein npm-Publish / kein Einsatz in Produktion

## Bekannte Limitation: Editor-Preview für Textseiten
Der Preview (320px) zeigt Text-Seiten nicht maßstabsgetreu zum Display. Grund: page-flip skaliert die Seitengeometrie mit dem Container, aber CSS-Schriftgrößen skalieren nicht mit. Außerdem wechselt page-flip bei unterschiedlichen Containerbreiten zwischen Portrait- (1 Seite) und Landscape-Modus (2 Seiten nebeneinander), was zusätzlich den Zeilenumbruch verändert. Workaround: Überlauf in der Display-Ansicht prüfen.

## Nächste Implementierungsschritte (Reihenfolge)
1. **image+text-Typ** — Bild mit Größen-Slider + Links/Rechts-Position, Text fließt drumherum (CSS float)
2. **Audioplayer** — unter dem Buch, einfache Audio-URL + optionaler Timecode-Overlay

## Geplante Erweiterung: Audioplayer

Player sitzt **unter dem Flipbook** (nicht auf einer Seite). Zwei Modi — beide optional, per Checkbox aktiviert:

**Modus 1 — Einfacher Player:** Eine Audio-URL, spielt durch, kein Sync. Gleiche URL-Input-Komponente wie bei Bildseiten.

**Modus 2 — Timecode-Sync:** Zusätzlich zu Modus 1 kann der Nutzer Timecodes eingeben, bei denen automatisch weitergeblättert wird (`timeupdate`-Event → `currentTime >= timecodes[currentPage]` → `pageFlip.flipNext()`). Timecodes sind absolute Zeitangaben (z.B. `0:32`) ab Audio-Start.

**UI für Timecode-Eingabe:** Separates Overlay (Modal/Drawer) — kein Inline-Feld pro Seite, da das Feature nur selten gebraucht wird. Ein ähnliches Overlay wurde bereits in einem anderen OMA-Plugin realisiert → dort abkupfern (Plugin noch zu identifizieren).

**Content-Modell (neue Felder):**
- `audioUrl: ''`
- `audioTimecodes: []` — Array von Sekunden (eine Zahl pro Seite)
