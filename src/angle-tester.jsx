import React, { useState, useRef, useEffect } from "react";

// Reference data for each test: how to shoot it, which 3 points to tap, and pass ranges.
const TESTS = [
  {
    id: "slr",
    name: "Straight-leg raise",
    measures: "Hamstring length",
    shoot: "Lie on your back, camera side-on at hip height. Raise the straight leg as high as it goes. Film both legs.",
    points: ["Shoulder / floor line (down by hip)", "Hip joint (pivot)", "Ankle of raised leg"],
    ranges: [
      { label: "Restricted", max: 70, color: "#C8632D" },
      { label: "Adequate", max: 80, color: "#B8873A" },
      { label: "Good", max: 999, color: "#4A9D8E" },
    ],
    hint: "Angle measured from the floor. 80°+ is the common benchmark. Compare left vs right.",
  },
  {
    id: "hip_ir",
    name: "Seated hip internal rotation",
    measures: "Lead-hip IR — the key one",
    shoot: "Sit on a chair, knees together, camera straight down on your shins from above (or shoot the foot swing from the front). Swing the foot outward.",
    points: ["Knee (stays fixed)", "Ankle at start (vertical shin)", "Ankle at end (foot swung out)"],
    ranges: [
      { label: "Restricted", max: 20, color: "#C8632D" },
      { label: "Fair", max: 30, color: "#B8873A" },
      { label: "Healthy", max: 999, color: "#4A9D8E" },
    ],
    hint: "This measures how far the foot swings out. 30–40°+ is healthy; under 20° is a real restriction. If limited, this is likely why rotation feels tight in the hamstring.",
  },
  {
    id: "toe_touch",
    name: "Toe-touch hinge",
    measures: "Posterior chain",
    shoot: "Stand side-on to the camera, feet together, hinge and reach down.",
    points: ["Shoulder", "Hip", "Ankle"],
    ranges: [
      { label: "Stiff", max: 45, color: "#C8632D" },
      { label: "Moderate", max: 25, color: "#B8873A" },
      { label: "Mobile", max: 0, color: "#4A9D8E" },
    ],
    invert: true,
    hint: "Smaller angle between torso and legs = deeper fold = more mobile. Watch that the low back curls smoothly rather than staying flat.",
  },
  {
    id: "pelvic",
    name: "Pelvic rotation (dissociation)",
    measures: "Separation",
    shoot: "Golf posture, camera down-the-line (behind you). Dowel across hips. Rotate hips while shoulders stay still.",
    points: ["Left hip point at start", "Center of pelvis (pivot)", "Left hip point at end"],
    ranges: [
      { label: "Limited", max: 30, color: "#C8632D" },
      { label: "Fair", max: 45, color: "#B8873A" },
      { label: "Good", max: 999, color: "#4A9D8E" },
    ],
    hint: "How far the pelvis rotates while the shoulders stay quiet. Bigger separation between hip and shoulder turn is what you're after.",
  },
];

function angleOf(a, b, c) {
  // angle at vertex b, in degrees, between rays b->a and b->c
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const m1 = Math.hypot(v1.x, v1.y);
  const m2 = Math.hypot(v2.x, v2.y);
  if (!m1 || !m2) return null;
  const deg = (Math.acos(Math.max(-1, Math.min(1, dot / (m1 * m2)))) * 180) / Math.PI;
  return deg;
}

function classify(test, deg) {
  if (deg == null) return null;
  // For most tests larger = better and ranges use ascending max cutoffs.
  // For toe_touch (invert) smaller = better.
  if (test.invert) {
    if (deg > test.ranges[0].max) return test.ranges[0];
    if (deg > test.ranges[1].max) return test.ranges[1];
    return test.ranges[2];
  }
  for (const r of test.ranges) if (deg <= r.max) return r;
  return test.ranges[test.ranges.length - 1];
}

export default function App() {
  const [testId, setTestId] = useState(TESTS[0].id);
  const [side, setSide] = useState("Left");
  const [img, setImg] = useState(null);
  const [pts, setPts] = useState([]); // up to 3 {x,y} in image coords
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [saved, setSaved] = useState([]); // {test, side, deg, date}
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);
  const wrapRef = useRef(null);

  const test = TESTS.find((t) => t.id === testId);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("angles");
        if (r && r.value) setSaved(JSON.parse(r.value));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setImg(url);
    setPts([]);
  };

  const onImgLoad = () => {
    if (imgRef.current) {
      setNatural({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight });
    }
  };

  const tap = (e) => {
    if (!img || pts.length >= 3) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setPts([...pts, { x, y }]);
  };

  const deg =
    pts.length === 3 ? angleOf(pts[0], pts[1], pts[2]) : null;
  const band = deg != null ? classify(test, deg) : null;

  const save = async () => {
    if (deg == null) return;
    const rec = { test: test.name, side, deg: Math.round(deg), date: new Date().toISOString() };
    const next = [rec, ...saved].slice(0, 40);
    setSaved(next);
    try { await window.storage.set("angles", JSON.stringify(next)); } catch (e) {}
  };

  const reset = () => setPts([]);
  const undo = () => setPts(pts.slice(0, -1));

  const labelColors = ["#6C8EBF", "#C8632D", "#4A9D8E"];

  return (
    <div style={{
      minHeight: "100vh", background: "#101216", color: "#e8eaed",
      fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 16px 60px",
    }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ fontSize: 11, color: "#6C8EBF", textTransform: "uppercase", letterSpacing: ".2em", fontWeight: 700 }}>
          Mobility Screen
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "4px 0 2px", letterSpacing: "-.02em" }}>
          Angle Tester
        </h1>
        <p style={{ fontSize: 13, color: "#8b9099", margin: "0 0 20px" }}>
          Photograph the test position, tap three points, read the degrees.
        </p>

        {/* Test picker */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {TESTS.map((t) => (
            <button key={t.id} onClick={() => { setTestId(t.id); setPts([]); }}
              style={{
                padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12.5, fontWeight: 600,
                border: t.id === testId ? "1px solid #6C8EBF" : "1px solid #2a2e35",
                background: t.id === testId ? "#1a2530" : "transparent",
                color: t.id === testId ? "#cfe0f0" : "#9aa0a8",
              }}>
              {t.name}
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div style={{ background: "#161a20", border: "1px solid #23272e", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "#6C8EBF", fontWeight: 700, marginBottom: 6 }}>{test.measures}</div>
          <p style={{ fontSize: 13, color: "#b7bcc4", margin: "0 0 10px", lineHeight: 1.5 }}>{test.shoot}</p>
          <div style={{ fontSize: 12.5, color: "#8b9099" }}>
            Tap in order:
            {test.points.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                <span style={{ width: 18, height: 18, borderRadius: 9, background: labelColors[i], color: "#101216", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                <span style={{ color: pts.length > i ? "#e8eaed" : "#8b9099" }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["Left", "Right"].map((s) => (
            <button key={s} onClick={() => setSide(s)}
              style={{
                flex: 1, padding: "9px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13,
                border: side === s ? "none" : "1px solid #2a2e35",
                background: side === s ? "#6C8EBF" : "transparent",
                color: side === s ? "#101216" : "#9aa0a8",
              }}>
              {s} side
            </button>
          ))}
        </div>

        {/* Image / tap area */}
        {!img ? (
          <label style={{
            display: "block", border: "1.5px dashed #333941", borderRadius: 12, padding: "40px 20px",
            textAlign: "center", cursor: "pointer", background: "#13161b", marginBottom: 14,
          }}>
            <input type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: "#cfe0f0" }}>Add a photo</div>
            <div style={{ fontSize: 12.5, color: "#8b9099", marginTop: 4 }}>Take or upload the test-position image</div>
          </label>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <div ref={wrapRef} onClick={tap}
              style={{ position: "relative", borderRadius: 12, overflow: "hidden", cursor: pts.length < 3 ? "crosshair" : "default", lineHeight: 0 }}>
              <img ref={imgRef} src={img} onLoad={onImgLoad} alt="test" style={{ width: "100%", display: "block" }} />
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                {pts.length >= 2 && (
                  <line x1={`${pts[0].x * 100}%`} y1={`${pts[0].y * 100}%`} x2={`${pts[1].x * 100}%`} y2={`${pts[1].y * 100}%`} stroke="#6C8EBF" strokeWidth="2.5" />
                )}
                {pts.length === 3 && (
                  <line x1={`${pts[1].x * 100}%`} y1={`${pts[1].y * 100}%`} x2={`${pts[2].x * 100}%`} y2={`${pts[2].y * 100}%`} stroke="#6C8EBF" strokeWidth="2.5" />
                )}
                {pts.map((p, i) => (
                  <circle key={i} cx={`${p.x * 100}%`} cy={`${p.y * 100}%`} r="7" fill={labelColors[i]} stroke="#101216" strokeWidth="2" />
                ))}
              </svg>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={undo} disabled={!pts.length}
                style={{ flex: 1, padding: "9px", borderRadius: 8, cursor: pts.length ? "pointer" : "default", border: "1px solid #2a2e35", background: "transparent", color: pts.length ? "#cfd3d9" : "#555", fontSize: 13, fontWeight: 600 }}>
                Undo point
              </button>
              <button onClick={reset}
                style={{ flex: 1, padding: "9px", borderRadius: 8, cursor: "pointer", border: "1px solid #2a2e35", background: "transparent", color: "#cfd3d9", fontSize: 13, fontWeight: 600 }}>
                Clear points
              </button>
              <label style={{ flex: 1, padding: "9px", borderRadius: 8, cursor: "pointer", border: "1px solid #2a2e35", background: "transparent", color: "#cfd3d9", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
                <input type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
                New photo
              </label>
            </div>
          </div>
        )}

        {/* Result */}
        {deg != null && (
          <div style={{ background: "#161a20", border: `1px solid ${band.color}`, borderRadius: 12, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: band.color, fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em" }}>
                {Math.round(deg)}°
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: band.color }}>{band.label}</span>
            </div>
            <p style={{ fontSize: 12.5, color: "#9aa0a8", margin: "8px 0 0", lineHeight: 1.5 }}>{test.hint}</p>
            <button onClick={save}
              style={{ marginTop: 12, padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13.5, background: band.color, color: "#101216" }}>
              Log {side} · {test.name}
            </button>
          </div>
        )}

        {/* History */}
        {saved.length > 0 && (
          <div style={{ background: "#13161b", border: "1px solid #23272e", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, color: "#8b9099", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700, marginBottom: 8 }}>
              Logged
            </div>
            {saved.slice(0, 12).map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: i ? "1px solid #1e2229" : "none", fontSize: 13 }}>
                <span style={{ color: "#c7ccd3" }}>{r.side} · {r.test}</span>
                <span style={{ fontVariantNumeric: "tabular-nums", color: "#e8eaed" }}>
                  {r.deg}° <span style={{ color: "#666", fontSize: 11.5 }}>{new Date(r.date).toLocaleDateString()}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontSize: 11.5, color: "#5a5f66", textAlign: "center", marginTop: 18, lineHeight: 1.6 }}>
          Photo angles are an estimate — keep the camera square to your body and consistent between tests so your trend is reliable.<br />
          One-sided restriction or any pain: see a TPI pro or physio rather than drilling against it.
        </p>
      </div>
    </div>
  );
}
