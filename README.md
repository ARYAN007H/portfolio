# ARYAN™ Press — Portfolio V2 · The Paper Edition

The **alternative version** of the portfolio. Where V1 is a dark, screen-native poster, V2 is a
**digital riso catalogue**: ink on paper. Same 12 projects, same data, completely different soul.

## Why this isn't AI slop

- **No gradients, no glass, no glow.** Spot inks on paper: Cobalt, Tomato, Mustard on cream.
- **Type does the talking:** Fraunces serif + Space Mono typewriter + Caveat handwriting.
  No generic Inter/Syne screen look.
- **Imperfection is the point:** rotated cards, tape, stamps, coffee ring, red margin rule,
  ruled lines. You can tell a human touched this.
- **Voice, not template copy:** masthead, catalogue cards, spec sheets, journal entries,
  tear-off download slips. It reads like a zine, because it is one.
- **Quiet interactions:** paper tilt, stamp slams, page-turn reveals. Native cursor,
  no preloader, no magnetic buttons, no custom cursor theatre.
- **Default light.** V2 defaults to paper; “lights off” flips to ink mode (persisted).

## Structure

```
portfolio-v2/
├── index.html          # Front page — masthead, hero collage, catalogue drawer, journal, shelf
├── style.css           # The paper design system
├── script.js           # Theme, tabs, tilt, lightbox
├── favicon.svg
├── assets/screenshots/ # Self-contained copies (real captures + labelled mocks)
└── projects/*.html     # 12 spec sheets with screenshots + tear-slip downloads
```

## Run

```bash
cd ~/Downloads/portfolio0/portfolio-v2
python3 -m http.server 8001
# http://localhost:8001
```

## Compare

| | V1 (`../`) | V2 (`./`) |
|---|---|---|
| Vibe | Dark poster / screen | Paper / riso zine |
| Default | Dark | Light (paper) |
| Type | Syne + Space Grotesk | Fraunces + Space Mono + Caveat |
| Accent | Vermilion | Cobalt + Tomato + Mustard |
| Work list | Editorial table + float preview | Index-card drawer + stamps |
| Downloads | Download Centre (bone panel) | Tear-off slips (“Take one home”) |
| Extras | Custom cursor, preloader, marquee | Polaroids, tape, coffee ring, barcode |

Same GitHub data (fetched 7 Nov 2026). Screenshots live in
`assets/screenshots/` — real captures from each repo, mocks labelled as mocks.
