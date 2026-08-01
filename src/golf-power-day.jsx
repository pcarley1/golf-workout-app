import React, { useState, useEffect, useRef } from "react";

// ── Full-gym POWER day · med balls + cables + single-leg ──
// Comes after: Day2 heavy bilateral strength, Day3 recovery. Fresh legs.
// Emphasis: rotational speed (the standing gap), posting, cable rotation.
const WORKOUT = [
  {
    id: "warmup",
    label: "Warm-up & Rotation Prep",
    tag: "Prime for speed",
    dur: 7 * 60,
    color: "#4A9D8E",
    note: "Get warm and open the hips/trunk before anything explosive. Don't skip — power work on cold tissue is how you tweak something.",
    exercises: [
      { name: "Bike or row, easy", scheme: "3 min" },
      { name: "90/90 hip switches", scheme: "8 / side" },
      { name: "Half-kneeling T-spine rotation", scheme: "8 / side" },
      { name: "Walking lunge w/ reach + twist", scheme: "6 / side" },
      { name: "Light med ball warm-up throws", scheme: "10 / side" },
    ],
  },
  {
    id: "power",
    label: "Block A — Rotational Power (Med Ball)",
    tag: "4 rounds · MAX intent",
    dur: 12 * 60,
    color: "#C8632D",
    note: "This is the whole point of today. Every rep is 100% explosive — full rest, quality over fatigue. Post HARD into the lead leg as you throw. Rest 75–90s.",
    exercises: [
      { name: "Rotational med ball throw (side-on to wall)", scheme: "6 / side", sets: 4 },
      { name: "Step-behind rotational scoop toss", scheme: "5 / side", sets: 4 },
    ],
  },
  {
    id: "posting",
    label: "Block B — Posting & Ground Force",
    tag: "Superset · 3 rounds",
    dur: 11 * 60,
    color: "#C8632D",
    note: "Explosive up, controlled down. Trap-bar lets you move real load fast. Rest 75s.",
    exercises: [
      { name: "Trap-bar jump (light) or squat jump", scheme: "4 reps", sets: 3 },
      { name: "DB/barbell reverse lunge (lead-leg focus)", scheme: "8 / leg", sets: 3 },
    ],
  },
  {
    id: "cable",
    label: "Block C — Cable Rotation & Anti-Rotation",
    tag: "Superset · 3 rounds",
    dur: 10 * 60,
    color: "#C8632D",
    note: "Cables give constant tension a band can't. Chop is controlled and rotational; Pallof resists rotation. Rest 60s.",
    exercises: [
      { name: "Cable rotational chop (high→low)", scheme: "10 / side", sets: 3 },
      { name: "Half-kneeling cable Pallof press", scheme: "10 / side · 2s hold", sets: 3 },
    ],
  },
  {
    id: "posterior",
    label: "Block D — Posterior Chain & Hip",
    tag: "Superset · 3 rounds",
    dur: 9 * 60,
    color: "#C8632D",
    note: "Single-leg RDL with a slow eccentric doubles as lead-hamstring length work. Rest 60s.",
    exercises: [
      { name: "DB single-leg RDL (3s eccentric)", scheme: "8 / leg", sets: 3 },
      { name: "Cable or machine hip abduction", scheme: "12 / side", sets: 3 },
    ],
  },
  {
    id: "cooldown",
    label: "Cooldown",
    tag: "Reset",
    dur: 4 * 60,
    color: "#4A9D8E",
    exercises: [
      { name: "90/90 lead-hip stretch", scheme: "45s / side" },
      { name: "Standing hip flexor stretch", scheme: "30s / side" },
      { name: "Doorway pec stretch", scheme: "30s / side" },
    ],
  },
];

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function useTimer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (running) ref.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(ref.current);
  }, [running]);
  return { running, elapsed, setRunning, reset: () => { setElapsed(0); setRunning(false); } };
}

function SetTracker({ sets, done, onToggle }) {
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
      {Array.from({ length: sets }).map((_, i) => (
        <button key={i} onClick={() => onToggle(i)} aria-label={`Set ${i + 1}`}
          style={{
            width: 30, height: 30, borderRadius: 6, cursor: "pointer",
            border: done[i] ? "1px solid #C8632D" : "1px solid #3a3a3a",
            background: done[i] ? "#C8632D" : "transparent",
            color: done[i] ? "#0d0d0d" : "#777", fontWeight: 700, fontSize: 13, transition: "all .12s",
          }}>
          {i + 1}
        </button>
      ))}
    </div>
  );
}

function Block({ block, expanded, onExpand }) {
  const t = useTimer();
  const [logs, setLogs] = useState(
    block.exercises.map((e) => Array.from({ length: e.sets || 0 }, () => false))
  );
  const totalSets = block.exercises.reduce((n, e) => n + (e.sets || 0), 0);
  const doneSets = logs.flat().filter(Boolean).length;
  const overtime = t.elapsed > block.dur;
  const toggle = (ei, si) =>
    setLogs((L) => L.map((row, i) => (i === ei ? row.map((v, j) => (j === si ? !v : v)) : row)));

  return (
    <div style={{
      background: "#161616", border: `1px solid ${expanded ? block.color : "#262626"}`,
      borderRadius: 14, padding: expanded ? "20px 22px" : "16px 22px", marginBottom: 12, transition: "border-color .2s",
    }}>
      <div onClick={onExpand} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: 8, background: block.color }} />
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-.01em" }}>{block.label}</span>
          </div>
          <span style={{ fontSize: 12, color: "#8a8a8a", marginLeft: 18, textTransform: "uppercase", letterSpacing: ".08em" }}>
            {block.tag} · target {fmt(block.dur)}
          </span>
        </div>
        {totalSets > 0 && (
          <span style={{ fontSize: 13, color: doneSets === totalSets ? block.color : "#666", fontWeight: 600 }}>
            {doneSets}/{totalSets}
          </span>
        )}
      </div>

      {expanded && (
        <div style={{ marginTop: 18 }}>
          {block.note && <p style={{ fontSize: 13, color: "#9a9a9a", margin: "0 0 16px", lineHeight: 1.5 }}>{block.note}</p>}
          {block.exercises.map((e, ei) => (
            <div key={ei} style={{ padding: "12px 0", borderTop: ei ? "1px solid #232323" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{e.name}</span>
                <span style={{ fontSize: 13, color: "#C8632D", fontVariantNumeric: "tabular-nums" }}>{e.scheme}</span>
              </div>
              {e.sets && <SetTracker sets={e.sets} done={logs[ei]} onToggle={(si) => toggle(ei, si)} />}
            </div>
          ))}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: 18, padding: "14px 16px", background: "#0d0d0d", borderRadius: 10,
          }}>
            <span style={{
              fontSize: 30, fontWeight: 700, fontVariantNumeric: "tabular-nums",
              color: overtime ? "#C8632D" : "#f0f0f0", letterSpacing: "-.02em",
            }}>
              {fmt(t.elapsed)}
              <span style={{ fontSize: 13, color: "#555", fontWeight: 500, marginLeft: 8 }}>/ {fmt(block.dur)}</span>
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => t.setRunning((r) => !r)}
                style={{
                  padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14,
                  background: t.running ? "#2a2a2a" : block.color, color: t.running ? "#eee" : "#0d0d0d",
                }}>
                {t.running ? "Pause" : t.elapsed ? "Resume" : "Start"}
              </button>
              <button onClick={t.reset}
                style={{
                  padding: "9px 16px", borderRadius: 8, cursor: "pointer",
                  border: "1px solid #333", background: "transparent", color: "#888", fontSize: 14, fontWeight: 600,
                }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [open, setOpen] = useState("warmup");
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [sessionOn, setSessionOn] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (sessionOn) ref.current = setInterval(() => setSessionElapsed((e) => e + 1), 1000);
    return () => clearInterval(ref.current);
  }, [sessionOn]);

  return (
    <div style={{
      minHeight: "100vh", background: "#0d0d0d", color: "#f0f0f0",
      fontFamily: "'Inter', system-ui, sans-serif", padding: "28px 18px 60px",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#C8632D", textTransform: "uppercase", letterSpacing: ".18em", fontWeight: 700 }}>
            Full Gym · Power · ~55 min
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: "6px 0 0", letterSpacing: "-.03em" }}>
            Speed Day
          </h1>
          <p style={{ fontSize: 13, color: "#888", margin: "8px 0 0", lineHeight: 1.5 }}>
            Med-ball rotational power first, then posting, cable rotation, and posterior chain.
          </p>
        </div>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#161616", border: "1px solid #262626", borderRadius: 14,
          padding: "16px 22px", marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: 11, color: "#777", textTransform: "uppercase", letterSpacing: ".1em" }}>Total session</div>
            <div style={{ fontSize: 32, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em" }}>
              {fmt(sessionElapsed)}
            </div>
          </div>
          <button onClick={() => setSessionOn((r) => !r)}
            style={{
              padding: "11px 26px", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 15,
              background: sessionOn ? "#2a2a2a" : "#C8632D", color: sessionOn ? "#eee" : "#0d0d0d",
            }}>
            {sessionOn ? "Pause" : sessionElapsed ? "Resume" : "Start session"}
          </button>
        </div>

        {WORKOUT.map((b) => (
          <Block key={b.id} block={b} expanded={open === b.id} onExpand={() => setOpen(open === b.id ? null : b.id)} />
        ))}

        <p style={{ fontSize: 12, color: "#555", textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          Tap a block to expand · tap set numbers to log them<br />
          Power work only counts if it's fast — rest fully and never grind the throws.
        </p>
      </div>
    </div>
  );
}
