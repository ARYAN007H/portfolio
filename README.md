# Aryan™ Press — portfolio

A static portfolio styled as a riso-printed catalogue: ink on paper, with a front page, twelve project spec sheets, tear-off download slips and an optional dark “ink” mode. No framework and no build step, just HTML, CSS and a little JavaScript.

## Structure

```
├── index.html          # front page: hero, catalogue, journal, language shelf
├── 404.html            # shown by GitHub Pages for missing URLs
├── style.css           # design system (tokens at the top)
├── fonts.css           # self-hosted font faces
├── script.js           # theme, filter, tilt, lightbox, nav state
├── favicon.svg
├── assets/             # fonts and screenshots (real captures, mocks are labelled)
└── projects/*.html     # one spec sheet per project
```

## Run locally

```bash
python3 -m http.server 8001
# open http://localhost:8001
```

## Editing

- Colours, shadows and spacing live in the `:root` block at the top of `style.css`. Dark mode overrides them in `:root[data-theme="dark"]`.
- Adding a project means a new page in `projects/`, a card (and optionally a pin) in `index.html`, and an updated count under “On the shelf”.
- Bump the `?v=` query on `style.css` and `script.js` in every page when you change them, so browsers fetch the new files.

## Deploying

The site is served as-is by GitHub Pages (`.nojekyll` is included).

## Data

Stars were copied from GitHub on 7 Nov 2026 and stay static. Release versions, dates and download links hydrate from the public GitHub Releases API in `script.js` via the `data-repo` attribute on each `#download` block, and pinned-card versions use `data-release-tag` on the front page. The HTML keeps a static fallback for no-JS or API failures.

## Type

Fraunces, Space Mono and Caveat, self-hosted in `assets/fonts/`.
