# educandu-plugin-flipbook

A native flipbook plugin for [educandu](https://github.com/educandu/educandu) / [Open Music Academy](https://openmusic.academy).

Displays pages as an interactive book with page-flip animation. Supports image pages, text pages (Markdown), combined image+text pages, and ABC music notation pages.

## Features

* **Image pages** — full-page images (photos, music manuscripts, scores)
* **Text pages** — Markdown text with paper-tone background
* **Image + text pages** — image and text combined; use `@IMG` in the text to position the image freely, with optional float (left/right) and size control
* **ABC + text pages** — ABC music notation rendered via [abcjs](https://www.abcjs.net), combined with Markdown text; use `@ABC` in the text to position the notation
* **Book cover** — configurable front and back cover with title, subtitle, and edition
* **Drag & drop** page reordering in the editor
* **Live preview** in the editor

## Prerequisites

* node.js ^20.0.0
* optional: globally installed gulp: `npm i -g gulp-cli`

## Installation

```sh
npm install @musikisum/educandu-plugin-flipbook
```

## Usage

Add the plugin info to your educandu custom resolvers module:

```js
import FlipbookPlugin from '@musikisum/educandu-plugin-flipbook';

export default {
  resolveCustomPluginInfos: () => [FlipbookPlugin]
};
```

Register the plugin type and translations in your server config:

```js
const flipbookTranslationsPath = require.resolve('@musikisum/educandu-plugin-flipbook/translations.json');

educandu({
  plugins: ['musikisum/educandu-plugin-flipbook'],
  resources: [flipbookTranslationsPath]
});
```

Import the plugin styles in your main LESS entry point:

```less
@import url('@musikisum/educandu-plugin-flipbook/flipbook.less');
```

## Development

```sh
git clone git@github.com:musikisum/educandu-plugin-flipbook.git
cd educandu-plugin-flipbook
npm install
npx gulp
```

---

## OER learning platform for music

Funded by 'Stiftung Innovation in der Hochschullehre'

<img src="https://stiftung-hochschullehre.de/wp-content/uploads/2020/07/logo_stiftung_hochschullehre_screenshot.jpg" alt="Logo der Stiftung Innovation in der Hochschullehre" width="200"/>

A project of the 'Hochschule für Musik und Theater München' (University for Music and Performing Arts)

<img src="https://upload.wikimedia.org/wikipedia/commons/d/d8/Logo_Hochschule_f%C3%BCr_Musik_und_Theater_M%C3%BCnchen_.png" alt="Logo der Hochschule für Musik und Theater München" width="200"/>

Project owner: Hochschule für Musik und Theater München  
Project management: Ulrich Kaiser
