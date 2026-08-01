# Golf Workout App — "Post & Clear"

A single-file, offline, mobile-first workout logger for a golf-specific training block.
Consolidates a set of standalone React workout artifacts into one persistent app you can
run and log in over time — built around rotational power, lead-side posting,
separation/dissociation, and working around a left-side hip/hamstring restriction.

**The whole app is one file: [`index.html`](index.html).** No build step, no dependencies,
no server required. Open it in any browser.

## Features

- **5-day training week** — Power / Upper / Mobility+Screen / Lower / Golf-Power, with
  today highlighted, plus a **Library** of extra days (Foundation, Active Recovery, at-home DB day) you can swap in.
- **Shared workout logger** — expandable blocks, a total-session timer, per-block timers,
  and tappable set trackers that now capture **weight + reps** per set.
- **Persistent history** — every finished session is saved; autosaves as you go, so a
  mid-workout refresh loses nothing.
- **Self-screen** — one unified mobility screen (straight-leg raise, hip IR, T-spine,
  shoulder ER, toe-touch, pelvic rotation, anti-rotation hold), with a ~21-day retest reminder.
- **Angle Tool** — load a photo, tap three joint points, read the joint angle, and log it
  straight into your screen history.
- **Progress trends** — inline charts of each mobility metric over time (left vs right
  overlaid), top-set-by-lift, and recent sessions.
- **Backup & restore** — one-tap JSON export/import. Your data lives in `localStorage`
  on the device; the data model is namespaced (`golffit.v1`) so cloud sync can be added later.

## Run it

Just open `index.html`:

- **Locally:** double-click the file, or open it in a mobile browser and use
  *Share → Add to Home Screen* for a fullscreen, app-like launcher.
- **Hosted (static):** deploy `index.html` to any static host (GitHub Pages, Cloudflare
  Pages, Netlify, Railway, …). A stable URL is the cleanest way to install it to your home
  screen and get automatic updates. *(For true offline from a URL, add a service worker /
  PWA manifest — see Roadmap.)*

## Data & privacy

All data is stored locally in the browser under the `golffit.v1` key. Nothing is sent
anywhere. Use the **Data** tab to export a backup file you keep, and to restore it on another
device. Because storage is per-browser, open the app the same way each time (e.g. always the
home-screen icon).

## Repo layout

```
index.html      → the app (self-contained)
src/            → the original standalone React (.jsx) artifacts this was consolidated from
docs/           → data model & consolidation notes
```

## Roadmap / ideas

- Installable **PWA** (manifest + service worker) for true offline from a hosted URL.
- Rest timer that auto-starts between sets.
- Per-session notes; volume (not just top-set) trends.
- Optional **cloud sync** (backend + DB + light auth) for phone↔laptop.

## License

MIT — see [LICENSE](LICENSE).
