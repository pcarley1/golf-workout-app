# Data model & architecture

## Storage
Everything persists in `localStorage` under a single root key: **`golffit.v1`** — one JSON
object. One blob keeps export/import trivial and leaves a clean seam for future cloud sync.

```js
{
  meta:     { version, createdAt, updatedAt },
  settings: { units: "lb" },

  sessions: [{                       // completed workouts (history + trends)
    id, dayId, dayLabel, date, durationSec,
    blocks: [{ blockId, label,
      exercises: [{ name, scheme,
        sets: [{ done, weight, reps }] }] }]
  }],

  activeSession: {                   // in-progress autosave (survives refresh)
    id, dayId, date, accumSec, running, lastResume, log
  } | null,

  screens: [{ id, date, values: {    // unified self-screen retests
    slr_L, slr_R, hipIR_L, hipIR_R, tspine, shoulderER,
    toeTouch, pelvicRot, antiRot_L, antiRot_R } }],

  angles: [{ id, testId, side, deg, date }]   // photo angle measurements
}
```

## App structure (bottom-nav)
- **Week** — 5-day plan + today highlight + screen-due badge + Library.
- **Day** — blocks with session/per-block timers and weight+reps set logging; *Finish* writes to `sessions[]`.
- **Screen** — log the canonical self-screen; opens the **Angle Tool**.
- **Progress** — screen trends (L vs R overlaid), top-set-by-lift, recent sessions, streak tiles.
- **Data** — export / import / erase.

## Consolidation notes
Built from 9 standalone React artifacts (`../src/*.jsx`). Each shared an identical
timer/`SetTracker`/`Block`/`App` shell; only the workout data differed. Consolidation =
one engine + a `DAYS` data array. Fixes folded in along the way:
- Resolved a `localStorage` key collision between two screen panels that used incompatible shapes.
- Merged three different screen taxonomies into one.
- Added per-set **weight + reps** (originals tracked done/not-done only).
- Added persisted **session history** and **activeSession autosave**.
- Replaced the placeholder `window.storage` API with real `localStorage`.

## Training profile encoded in the programming
Five days/week, full gym. Priorities: rotational power (med-ball), lead-side posting,
separation/dissociation, and a left-side restriction (limited hip IR; ~60–63° straight-leg
raise, left worse). Core principle: **open the hips before loading them; let the left
hamstring govern load.**
