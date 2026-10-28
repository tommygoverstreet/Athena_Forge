# Athena Forge

Visual HTML / CSS / JSON / JavaScript builder — plus Canvas drawing and a 3D
scene builder. No dependencies, no build step, no server.
Open `index.html` in a modern browser, or install it from its hosted page
(manifest + service worker) and use it from your home screen.

> Renamed from WebForge. Your old saves, mode, and custom components carry
> over: Athena Forge reads the legacy `webforge:` browser keys and writes
> `athena:` keys from then on. Old project files (`webforge-project`) still open.

## See it Live
Here: [https://tommygoverstreet.github.io/Athena_Forge/]
(after the repository is renamed; see "Publishing" below)

## What is new in Athena Forge

- **Greek theme, lightly applied.** Marble and gold, a serif brand mark
  (Α), a Temple landing template, and a Greek column shape in the 3D builder.
  The tool stays a tool — no costume, no invented content.
- **Canvas Studio (Canvas tab).** Draw with pen, line, rectangle, circle,
  text, and eraser — finger, stylus, or mouse. Undo/redo, PNG download, and
  "Insert into page" drops the art into your page as an image. Work is saved
  in the browser as you draw.
- **Forge3D (3D tab).** A zero-dependency 3D engine (projection, painter
  sort, shading) with an editor: box, pyramid, cylinder, sphere, and Greek
  column. Drag to orbit, tune position/size/turn/colour, export a standalone
  HTML page that runs anywhere, or insert a snapshot image into your page.
- **True mobile nomad.** Touch drag in the structure tree (long-press to
  drag on touch, so taps still select and swipes still scroll), larger tap
  targets on small screens, installable PWA with offline app shell when
  served over http(s), and **Export single page**: one self-contained HTML
  file, because phones fumble five simultaneous downloads.
- **Fixes.** Theme toggle no longer sniffs a hex colour (it broke under a
  retheme); project files now carry your custom components with them, and
  loading normalizes ragged rules and events instead of trusting the file.
  Placeholder `Desc.txt` files are gone.

## File structure
- `index.html` : app shell (toolbar, three panes, dialogs); loads the scripts below in order
- `css/athena.css` : theme variables (marble/gold light/dark), layout, mobile layout, studio styles
- `manifest.json`, `sw.js`, `icon.svg`, `icon-192.png`, `icon-512.png` : PWA install + offline shell
- `js/definitions.js` : element definitions (`DEFS`), events, actions, starter templates
- `js/state.js` : state object, history (undo/redo), helpers, storage with legacy migration
- `js/generator.js` : HTML, CSS, JSON and JavaScript generators
- `js/validator.js` : validation and accessibility checks
- `js/renderer.js` : tree, preview, problems list, editor tabs
- `js/builder.js` : edit actions, save/open/import/export, project format
- `js/events.js` : toolbar and tree event wiring, theme toggle, single-page export
- `js/css-builder.js`, `js/component-builder.js`, `js/docs.js`, `js/ui.js` : style helper, components, docs, search and dialogs
- `js/json-builder.js`, `js/js-builder.js` : JSON tree editor, JavaScript builder
- `js/templates.js` : extra starter templates, including Temple
- `js/importer.js` : Beginner/Intermediate/Advanced modes, paste-HTML import
- `js/editor.js` : syntax highlighting, line numbers, copy and download in the Code tab
- `js/a11y.js` : nesting, contrast and keyboard-access checks
- `js/dnd.js` : pointer drag and drop in the tree (mouse + touch long-press)
- `js/definitions-io.js` : load/export definition JSON (see `data/`)
- `js/canvas-studio.js` : Canvas Studio tab
- `js/forge3d.js` : 3D engine + Forge3D tab
- `js/app.js` : start-up, service worker registration (http(s) only)

The scripts are plain (not ES modules) so the app works from `file://`. They share one global scope, so keep the load order in `index.html`.

## How state works
One object `S` holds everything: `tree` (elements), `css` (rules), `json` (text), `events`, `js` (your script).
Every change calls `mut()`, which saves a snapshot for undo, applies the change, then refreshes the tree,
problems list and (debounced) preview. Undo and redo restore snapshots; nothing reverses DOM edits by hand.
The preview is a sandboxed iframe (`sandbox="allow-scripts"`) loaded from `srcdoc`, so generated code never runs in the builder.
Canvas art and 3D scenes live outside `S` (browser keys `athena:canvas`, `athena:forge3d`) and travel with the
page only when you insert them as images or export them.

## Definitions
- **HTML elements:** the `DEFS` object. Each entry has `cat`, optional `text` (default text), `void`, and `fields`.
- **JavaScript constructs:** the `JSC` array. Each has `f` (fields) and `t` (a template with `{field}` placeholders).
- **Components:** the `CMPS` object. Each returns `{nodes, css}`.
- **Templates:** the `TEMPLATES` object. Each returns a full state.
- **Style helper:** the `VF` array of `[css property, label, placeholder or options]`.

## Add an element
Add an entry to `DEFS`, e.g. `"figure":{"cat":"Media"}`. It appears in the Add list, search, and docs.
Give it `fields` for extra attributes and add a sentence to `DOCS`.

## Add a CSS property
Add `['letter-spacing','Letter spacing','0.05em']` to `VF`. Use an array of strings as the third item for a dropdown, or `'color'` for a picker.

## Add a JavaScript construct
Add an object to `JSC`: `{k:'key',l:'Label',f:[['name','Label','default']],t:'code with {name}'}`.

## Create a template or component
Copy `TEMPLATES.hello` or `CMPS.Card`. Build elements with `n(tag,{text,attrs,children})`.
Users can also save any selected element as a custom component. These are kept in the browser (localStorage key `athena:components`).

## Saving and exporting
Save and Open use localStorage (`athena:project`). Import reads a `.athena-forge.json` file.
Export downloads `index.html`, `style.css`, `script.js`, `data.json` and the project file — or use
**Export single page** for one self-contained HTML file (inline CSS, script, and data).
Place `style.css` in `css/` and `script.js` in `js/` to match the links in the multi-file `index.html`.
The exported code has no Athena Forge dependency.

## Publishing
Published: [https://tommygoverstreet.github.io/Athena_Forge/](https://tommygoverstreet.github.io/Athena_Forge/)
— GitHub Pages deploys via the Actions workflow in `.github/workflows/pages.yml`
on every push to `main` (repo Settings → Pages → Source: GitHub Actions).
The service worker and install prompt activate on that HTTPS origin; from
`file://` everything works except install and offline.

## Honest limits
- The 3D engine is a small software renderer (flat-shaded triangles), not a
  game engine: no textures, no lighting rigs, no model import. It exports a
  page that runs anywhere with no dependencies.
- Canvas art inserted into a page becomes a PNG data URL; very large art
  (over ~900 KB) is refused on insert — download the PNG instead.
- The service worker caches the app shell, not your saves; saves live in
  localStorage on the device that made them.
