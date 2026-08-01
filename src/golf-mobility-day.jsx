import React, { useState, useEffect, useRef } from "react";

// ── Day 3 · Mobility, Stability & Skill (light) · with persistent screen log ──
const WORKOUT = [
  {
    id: "warmup",
    label: "Easy Warm-up",
    tag: "Blood flow",
    dur: 5 * 60,
    color: "#4A9D8E",
    note: "Get warm before you screen or push range — cold tissue tests short and skews everything.",
    exercises: [
      { name: "Bike or brisk walk", scheme: "4 min" },
      { name: "Cat-cow + hip circles", scheme: "8 / side" },
    ],
  },
  {
    id: "mobility",
    label: "Loaded Mobility — Hips & Trunk",
    tag: "Stretch intensity · 2 rounds",
    dur: 10 * 60,
    color: "#B8873A",
    note: "Push RANGE, not effort. Long end-range pauses. Gently test that left hip — don't force it.",
    exercises: [
      { name: "90/90 hip switch, long pause", scheme: "6 / side · 3s hold", sets: 2 },
      { name: "Half-kneeling T-spine rotation", scheme: "8 / side", sets: 2 },
      { name: "Adductor rockback", scheme: "8 / side", sets: 2 },
      { name: "World's greatest stretch", scheme: "5 / side" },
    ],
  },
  {
    id: "stability",
    label: "Stability & Slider Work",
    tag: "Light · 2 rounds",
    dur: 8 * 60,
    color: "#4A9D8E",
    note: "Control, not load. Stop a set the moment form breaks. Great posting-stability work without fatigue.",
    exercises: [
      { name: "Single-leg balance (eyes open→closed)", scheme: "30s / side", sets: 2 },
      { name: "Slider reverse lunge (short range)", scheme: "8 / side", sets: 2 },
      { name: "Slider bodysaw (easy)", scheme: "8 reps", sets: 2 },
    ],
  },
  {
    id: "skill",
    label: "Dowel Dissociation Drills",
    tag: "Skill · slow reps",
    dur: 8 * 60,
    color: "#6C8EBF",
    note: "This is skill rehearsal, not a workout — slow, deliberate, in front of a mirror or filmed. Feel the hips and trunk move independently.",
    exercises: [
      { name: "Dowel-across-shoulders separation turns", scheme: "8 reps" },
      { name: "Step drill (lower starts, trunk lags)", scheme: "6 / side" },
      { name: "Hip-turn, dowel down spine (stable posture)", scheme: "8 reps" },
    ],
  },
  {
    id: "cooldown",
    label: "Cooldown",
    tag: "Reset",
    dur: 3 * 60,
    color: "#4A9D8E",
    exercises: [
      { name: "90/90 lead-hip stretch", scheme: "45s / side" },
      { name: "Seated figure-4 glute stretch", scheme: "30s / side" },
    ],
  },
];

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// ── Screen tests (persist to storage) ──
const SCREEN_TESTS = [
  { id: "slr_L", name: "Straight-leg raise — LEFT", unit: "°", hint: "Side-on camera at hip height. Hamstring length. 80°+ good." },
  { id: "slr_R", name: "Straight-leg raise — RIGHT", unit: "°", hint: "Same setup. Compare to left." },
  { id: "hipIR_L", name: "Seated hip IR — LEFT", unit: "°", hint: "Overhead camera. Foot swings out, knee still. 30°+ healthy, <20 restricted." },
  { id: "hipIR_R", name: "Seated hip IR — RIGHT", unit: "°", hint: "Same setup. Left vs right is the answer to the hamstring question." },
  { id: "tspine", name: "Seated torso rotation", unit: "° each way", hint: "Dowel across shoulders, hips locked. ~45°+ each way." },
  { id: "shoulderER", name: "Trail-shoulder 90/90 ER", unit: "°", hint: "On back, arm at 90°, rotate forearm to floor. Shallowing capacity." },
];

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
            border: done[i] ? "1px solid #B8873A" : "1px solid #3a3a3a",
            background: done[i] ? "#B8873A" : "transparent",
            color: done[i] ? "#0d0d0d" : "#777", fontWeight: 700, fontSize: 13, transition: "all .12s",
          }}>
          {i + 1}
        </button>
      ))}
    </div>
  );
}

function Block({ block, expanded, onExpand, done, setDone }) {
  const t = useTimer();
  const totalSets = block.exercises.reduce((n, e) => n + (e.sets || 0), 0);
  const doneSets = (done || []).flat().filter(Boolean).length;
  const overtime = t.elapsed > block.dur;
  const toggle = (ei, si) =>
    setDone(block.id, (done || block.exercises.map((e) => Array.from({ length: e.sets || 0 }, () => false)))
      .map((row, i) => (i === ei ? row.map((v, j) => (j === si ? !v : v)) : row)));

  const logs = done || block.exercises.map((e) => Array.from({ length: e.sets || 0 }, () => false));

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
                <span style={{ fontSize: 13, color: "#B8873A", fontVariantNumeric: "tabular-nums" }}>{e.scheme}</span>
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

function ScreenPanel() {
  const [history, setHistory] = useState([]);
  const [entry, setEntry] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get("screens"); if (r && r.value) setHistory(JSON.parse(r.value)); } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const last = history[0];
  const start = () => setEntry(Object.fromEntries(SCREEN_TESTS.map((t) => [t.id, ""])));
  const save = async () => {
    const rec = { date: new Date().toISOString(), results: entry };
    const next = [rec, ...history].slice(0, 24);
    setHistory(next); setEntry(null); setExpanded(true);
    try { await window.storage.set("screens", JSON.stringify(next)); } catch (e) {}
  };
  const prevVal = (id) => (history[1]?.results?.[id]) || null;

  return (
    <div style={{ background: "#141414", border: "1px solid #6C8EBF", borderRadius: 14, padding: "18px 22px", marginBottom: 20 }}>
      <div onClick={() => setExpanded((e) => !e)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: 8, background: "#6C8EBF" }} />
            <span style={{ fontSize: 16, fontWeight: 700 }}>Self-Screen</span>
          </div>
          <span style={{ fontSize: 12, color: "#8a8a8a", marginLeft: 18 }}>
            {loading ? "Loading…" : last ? `Last: ${new Date(last.date).toLocaleDateString()}` : "Run today while you're light"}
          </span>
        </div>
        <span style={{ fontSize: 18, color: "#6C8EBF" }}>{expanded ? "−" : "+"}</span>
      </div>

      {expanded && !entry && (
        <div style={{ marginTop: 14 }}>
          {last && SCREEN_TESTS.map((t) => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderTop: "1px solid #222", fontSize: 13 }}>
              <span style={{ color: "#ccc" }}>{t.name}</span>
              <span style={{ color: "#e8eaed", fontVariantNumeric: "tabular-nums" }}>{last.results[t.id] || "—"}{t.unit === "°" ? "°" : ""}</span>
            </div>
          ))}
          {!last && <p style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>Today's the day to capture these properly — hip IR from overhead, straight-leg raise from the side at hip height. Measure with the angle tester, then log here.</p>}
          <button onClick={start} style={{ marginTop: 14, padding: "10px 22px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, background: "#6C8EBF", color: "#101216" }}>
            {last ? "New screen" : "Log baseline"}
          </button>
        </div>
      )}

      {entry && (
        <div style={{ marginTop: 14 }}>
          {SCREEN_TESTS.map((t) => (
            <div key={t.id} style={{ padding: "10px 0", borderTop: "1px solid #222" }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
              <div style={{ fontSize: 11.5, color: "#888", margin: "3px 0 7px", lineHeight: 1.4 }}>
                {t.hint}{prevVal(t.id) ? ` · was ${prevVal(t.id)}` : ""}
              </div>
              <input value={entry[t.id]} onChange={(e) => setEntry((E) => ({ ...E, [t.id]: e.target.value }))} placeholder={t.unit}
                style={{ width: 130, padding: "8px 10px", borderRadius: 7, border: "1px solid #333", background: "#0d0d0d", color: "#f0f0f0", fontSize: 14 }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={save} style={{ padding: "10px 22px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, background: "#6C8EBF", color: "#101216" }}>Save</button>
            <button onClick={() => setEntry(null)} style={{ padding: "10px 18px", borderRadius: 8, cursor: "pointer", border: "1px solid #333", background: "transparent", color: "#888", fontSize: 14, fontWeight: 600 }}>Cancel</button>
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
  const [doneMap, setDoneMap] = useState({});
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  // Load persisted block completion (keyed by today's date so it resets each day)
  const todayKey = "mobility_done_" + new Date().toISOString().slice(0, 10);
  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get(todayKey); if (r && r.value) setDoneMap(JSON.parse(r.value)); } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  const setDone = async (blockId, arr) => {
    const next = { ...doneMap, [blockId]: arr };
    setDoneMap(next);
    try { await window.storage.set(todayKey, JSON.stringify(next)); } catch (e) {}
  };

  useEffect(() => {
    if (sessionOn) ref.current = setInterval(() => setSessionElapsed((e) => e + 1), 1000);
    return () => clearInterval(ref.current);
  }, [sessionOn]);

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#f0f0f0", fontFamily: "'Inter', system-ui, sans-serif", padding: "28px 18px 60px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#B8873A", textTransform: "uppercase", letterSpacing: ".18em", fontWeight: 700 }}>
            Day 3 · Mobility & Skill · Light
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: "6px 0 0", letterSpacing: "-.03em" }}>Screen & Restore</h1>
          <p style={{ fontSize: 13, color: "#888", margin: "8px 0 0", lineHeight: 1.5 }}>
            The week's light day. Push mobility range, run your screens, groove the swing pattern. Progress saves automatically.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#161616", border: "1px solid #262626", borderRadius: 14, padding: "16px 22px", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: "#777", textTransform: "uppercase", letterSpacing: ".1em" }}>Total session</div>
            <div style={{ fontSize: 32, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em" }}>{fmt(sessionElapsed)}</div>
          </div>
          <button onClick={() => setSessionOn((r) => !r)} style={{ padding: "11px 26px", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 15, background: sessionOn ? "#2a2a2a" : "#B8873A", color: sessionOn ? "#eee" : "#0d0d0d" }}>
            {sessionOn ? "Pause" : sessionElapsed ? "Resume" : "Start session"}
          </button>
        </div>

        <ScreenPanel />

        {WORKOUT.map((b) => (
          <Block key={b.id} block={b} expanded={open === b.id} onExpand={() => setOpen(open === b.id ? null : b.id)}
            done={doneMap[b.id]} setDone={setDone} />
        ))}

        <p style={{ fontSize: 12, color: "#555", textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          Block completion and screen results save and persist across sessions.<br />
          Gently test the left hip today — don't force it into pain.
        </p>
      </div>
    </div>
  );
}
