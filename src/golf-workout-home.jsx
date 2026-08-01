import React, { useState, useEffect, useRef } from "react";

// ── At-home workout: adjustable DBs only (50 lb), no bands, no slams/throws ──
// Built around lead-side posting + lead-hip external rotation.
const WORKOUT = [
  {
    id: "warmup",
    label: "Warm-up & Hip Prep",
    tag: "Prime the lead hip",
    dur: 6 * 60,
    color: "#4A9D8E",
    note: "This is where you open up the lead hip. All bodyweight — don't rush it.",
    exercises: [
      { name: "90/90 hip switches", scheme: "8 / side" },
      { name: "Half-kneeling lead-hip rotations", scheme: "8 / side" },
      { name: "World's greatest stretch", scheme: "5 / side" },
      { name: "Prone/standing scap squeezes", scheme: "15 reps" },
      { name: "Leg swings (front + lateral)", scheme: "10 / side" },
    ],
  },
  {
    id: "separation",
    label: "Block A — Separation & Dissociation",
    tag: "Loaded mobility · 2 rounds",
    dur: 9 * 60,
    color: "#B8873A",
    note: "Hips and trunk move independently here. Go slow, own each end range, pause where noted. This trains the X-factor stretch — quality over load.",
    exercises: [
      { name: "DB half-kneeling T-spine rotation (hips locked)", scheme: "8 / side · 2s hold", sets: 2 },
      { name: "Seated trunk rotation, hips pinned (DB at chest)", scheme: "8 / side", sets: 2 },
      { name: "90/90 hip switch, loaded end-range pause", scheme: "6 / side · 3s hold", sets: 2 },
      { name: "Adductor rockback (trail-hip IR)", scheme: "8 / side", sets: 2 },
    ],
  },
  {
    id: "blockA",
    label: "Block B — Posting Power",
    tag: "3 rounds · controlled",
    dur: 9 * 60,
    color: "#C8632D",
    note: "No slamming — power comes from the lateral step-off and a hard, frozen landing on the lead leg. Rest 60s.",
    exercises: [
      { name: "Skater step → stick (onto lead leg)", scheme: "6 / side", sets: 3 },
      { name: "DB lead-side hip hinge → rotate & press", scheme: "8 / side", sets: 3 },
    ],
  },
  {
    id: "blockB",
    label: "Block C — Lead-Leg Strength",
    tag: "Superset · 3 rounds",
    dur: 9 * 60,
    color: "#C8632D",
    note: "Load the lead side. Last 2 reps should be a grind. Rest 60s.",
    exercises: [
      { name: "DB single-leg RDL (lead leg)", scheme: "8 / leg", sets: 3 },
      { name: "DB step-back lunge (brace the front leg)", scheme: "8 / leg", sets: 3 },
    ],
  },
  {
    id: "blockC",
    label: "Block D — Anti-Rotation & Post Control",
    tag: "Superset · 3 rounds",
    dur: 7 * 60,
    color: "#C8632D",
    note: "Hold the trunk still while load tries to twist you — same skill as keeping the trunk back in transition. Rest 45s.",
    exercises: [
      { name: "DB suitcase hold (heavy, resist the lean)", scheme: "25s / side", sets: 3 },
      { name: "DB side plank (or bodyweight)", scheme: "20s / side", sets: 3 },
    ],
  },
  {
    id: "blockD",
    label: "Block E — Rotational Finisher",
    tag: "2 rounds · slow eccentric",
    dur: 5 * 60,
    color: "#C8632D",
    note: "3-second lowering on every chop — owning the deceleration is what teaches the trunk to stay back instead of dumping early. Post into the lead leg each rep.",
    exercises: [
      { name: "DB half-kneeling wood chop (3s eccentric)", scheme: "8 / side", sets: 2 },
      { name: "Side plank reach-through", scheme: "10 / side", sets: 2 },
    ],
  },
  {
    id: "shoulder",
    label: "Block F — Trail-Shoulder ER (Prehab)",
    tag: "Shallowing capacity · 2 rounds",
    dur: 5 * 60,
    color: "#6C8EBF",
    note: "LIGHT weight only — this is the cuff, not the big muscles. Use the low end of your adjustable DBs (5–15 lb). Slow, no momentum, own the end range.",
    exercises: [
      { name: "Side-lying DB external rotation (trail arm)", scheme: "10 / side", sets: 2 },
      { name: "90/90 shoulder ER hold (light DB)", scheme: "20s / side", sets: 2 },
      { name: "Bottoms-up DB hold (cuff stability)", scheme: "20s / side", sets: 2 },
      { name: "Sleeper + cross-body stretch", scheme: "30s / side · no DB" },
    ],
  },
  {
    id: "cooldown",
    label: "Cooldown",
    tag: "Reset",
    dur: 3 * 60,
    color: "#4A9D8E",
    exercises: [
      { name: "90/90 lead-hip stretch (lean forward)", scheme: "45s / side" },
      { name: "Standing hip flexor stretch", scheme: "30s / side" },
    ],
  },
];

// ── Baseline screen: periodic re-test, pass/fail + a number, logged w/ dates ──
const SCREEN_TESTS = [
  {
    id: "shoulder_er",
    name: "Trail-shoulder ER at 90°",
    unit: "° from vertical",
    how: "Lie on back, upper arm out at shoulder height, elbow bent 90°. Rotate forearm back toward floor keeping shoulder blade flat. Measure how far back the forearm reaches. Pass ≈ forearm reaches roughly flat / near the floor.",
  },
  {
    id: "lead_hip_ir",
    name: "Lead-hip internal rotation",
    unit: "° (seated)",
    how: "Sit on a chair, knee forward. Rotate the lower leg outward (foot away from midline) so the hip internally rotates. Estimate the angle. Pass ≈ 30–40°+.",
  },
  {
    id: "tspine_rot",
    name: "Seated T-spine rotation",
    unit: "° each way",
    how: "Sit tall, dowel across shoulders, hips locked. Rotate the ribcage each way. Pass ≈ 45°+ each side, symmetrical.",
  },
  {
    id: "sep_hold",
    name: "Anti-rotation hold (separation proxy)",
    unit: "sec / side",
    how: "Heavy suitcase hold, stay perfectly upright. Time how long you hold clean posture per side. Track the trend, not a fixed pass mark.",
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
    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
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

const RECHECK_DAYS = 21; // re-screen every ~3 weeks

function ScreenPanel() {
  const [history, setHistory] = useState([]); // [{date, results:{id:{val,pass}}}]
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(null); // in-progress screen
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("screens");
        if (r && r.value) setHistory(JSON.parse(r.value));
      } catch (e) { /* first run, no data */ }
      setLoading(false);
    })();
  }, []);

  const last = history[0];
  const daysSince = last
    ? Math.floor((Date.now() - new Date(last.date).getTime()) / 86400000)
    : null;
  const due = daysSince === null || daysSince >= RECHECK_DAYS;

  const startEntry = () =>
    setEntry(Object.fromEntries(SCREEN_TESTS.map((t) => [t.id, { val: "", pass: null }])));

  const save = async () => {
    const rec = { date: new Date().toISOString(), results: entry };
    const next = [rec, ...history].slice(0, 24);
    setHistory(next);
    setEntry(null);
    setExpanded(true);
    try { await window.storage.set("screens", JSON.stringify(next)); }
    catch (e) { /* keep in memory even if save fails */ }
  };

  const prev = (id) => {
    // most recent value before the top entry, for trend arrows
    if (history.length < 2) return null;
    return history[1].results?.[id]?.val;
  };

  return (
    <div style={{
      background: "#141414", border: `1px solid ${due ? "#6C8EBF" : "#262626"}`,
      borderRadius: 14, padding: "18px 22px", marginBottom: 20,
    }}>
      <div onClick={() => setExpanded((e) => !e)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: 8, background: "#6C8EBF" }} />
            <span style={{ fontSize: 16, fontWeight: 700 }}>Baseline Screen</span>
          </div>
          <span style={{ fontSize: 12, color: "#8a8a8a", marginLeft: 18 }}>
            {loading ? "Loading…"
              : last ? `Last: ${new Date(last.date).toLocaleDateString()} · ${daysSince}d ago`
              : "Not yet tested"}
          </span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: due ? "#6C8EBF" : "#555" }}>
          {due ? "DUE" : `in ${RECHECK_DAYS - daysSince}d`}
        </span>
      </div>

      {expanded && !entry && (
        <div style={{ marginTop: 16 }}>
          {history.length === 0 && (
            <p style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>
              Run this before your first session to set a baseline, then re-test every ~3 weeks.
              It tells you whether a limitation is mobility (trainable here) or a swing pattern (coach territory).
            </p>
          )}
          {last && (
            <div style={{ marginTop: 4 }}>
              {SCREEN_TESTS.map((t) => {
                const r = last.results?.[t.id] || {};
                const p = prev(t.id);
                return (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid #222" }}>
                    <span style={{ fontSize: 13, color: "#ccc" }}>{t.name}</span>
                    <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", color: r.pass ? "#4A9D8E" : "#C8632D" }}>
                      {r.val || "—"} {t.unit.startsWith("°") ? "" : t.unit.split(" ")[0]}
                      {p && p !== r.val && <span style={{ color: "#666", marginLeft: 6 }}>(was {p})</span>}
                      <span style={{ marginLeft: 8 }}>{r.pass === true ? "✓" : r.pass === false ? "✕" : ""}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <button onClick={startEntry}
            style={{
              marginTop: 14, padding: "10px 22px", borderRadius: 8, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 14, background: "#6C8EBF", color: "#0d0d0d",
            }}>
            {last ? "Run new screen" : "Run baseline screen"}
          </button>
        </div>
      )}

      {entry && (
        <div style={{ marginTop: 16 }}>
          {SCREEN_TESTS.map((t) => (
            <div key={t.id} style={{ padding: "12px 0", borderTop: "1px solid #222" }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: "#888", margin: "4px 0 8px", lineHeight: 1.45 }}>{t.how}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  value={entry[t.id].val}
                  onChange={(e) => setEntry((E) => ({ ...E, [t.id]: { ...E[t.id], val: e.target.value } }))}
                  placeholder={t.unit}
                  style={{
                    width: 110, padding: "8px 10px", borderRadius: 7, border: "1px solid #333",
                    background: "#0d0d0d", color: "#f0f0f0", fontSize: 14,
                  }}
                />
                {["Pass", "Fail"].map((lbl) => {
                  const isPass = lbl === "Pass";
                  const active = entry[t.id].pass === isPass;
                  return (
                    <button key={lbl}
                      onClick={() => setEntry((E) => ({ ...E, [t.id]: { ...E[t.id], pass: isPass } }))}
                      style={{
                        padding: "8px 16px", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 13,
                        border: active ? "none" : "1px solid #333",
                        background: active ? (isPass ? "#4A9D8E" : "#C8632D") : "transparent",
                        color: active ? "#0d0d0d" : "#888",
                      }}>
                      {lbl}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={save}
              style={{ padding: "10px 22px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, background: "#6C8EBF", color: "#0d0d0d" }}>
              Save screen
            </button>
            <button onClick={() => setEntry(null)}
              style={{ padding: "10px 18px", borderRadius: 8, cursor: "pointer", border: "1px solid #333", background: "transparent", color: "#888", fontSize: 14, fontWeight: 600 }}>
              Cancel
            </button>
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
            At Home · Dumbbells Only · 45 min
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: "6px 0 0", letterSpacing: "-.03em" }}>
            Post & Clear
          </h1>
          <p style={{ fontSize: 13, color: "#888", margin: "8px 0 0", lineHeight: 1.5 }}>
            Separation in transition, lead-side posting, and hip rotation. Dumbbells only.
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

        <ScreenPanel />

        {WORKOUT.map((b) => (
          <Block key={b.id} block={b} expanded={open === b.id} onExpand={() => setOpen(open === b.id ? null : b.id)} />
        ))}

        <p style={{ fontSize: 12, color: "#555", textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          Tap a block to expand · tap set numbers to log them<br />
          Everything here uses only your adjustable dumbbells and the floor.
        </p>
      </div>
    </div>
  );
}
