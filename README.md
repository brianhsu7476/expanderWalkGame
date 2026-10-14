# Expander Race

A one-minute game on graphs from Vadhan, *Pseudorandomness*, Chapter 4. Pick a graph, start at
a vertex `s`, and walk along edges to the target `t`. Each solved pair spawns a new one; count
how many you solve in 60 seconds.

Levels: hypercube Q₄, lazy 29-cycle vs. 29-cycle with inverse chords (4.26), grid torus vs.
discrete torus Z₁₁² (4.25), LPS Ramanujan graph p = 5, q = 89 (4.27), squaring (4.30),
tensoring (4.33), zig-zag (4.34).

Controls: number keys `1`–`D` (or click a neighbor / an edge button) take an edge, `S` skips a
pair, `Enter` starts. Best scores are kept in the browser's `localStorage`.

## Files

- `index.html` – page markup
- `style.css` – styles (light and dark theme via `prefers-color-scheme`)
- `game.js` – graphs, BFS distances, rendering and game loop (no dependencies)

## Run locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server -d expanderWalkGame 8000
```

## Deploy on GitHub Pages

Push this folder as the root of a repository (or into `docs/`), then in the repository's
Settings → Pages choose the branch and folder. `.nojekyll` disables Jekyll processing.
