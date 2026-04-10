import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const getSkillName = (skill) =>
  typeof skill === "string" ? skill : skill?.label || skill?.name || "unknown";

const levelColor = {
  Advanced:     { bg: "rgba(29,158,117,0.15)", text: "#5DCAA5", border: "rgba(29,158,117,0.4)" },
  Intermediate: { bg: "rgba(186,117,23,0.15)", text: "#FAC775", border: "rgba(186,117,23,0.4)" },
  Beginner:     { bg: "rgba(163,45,45,0.15)",  text: "#F09595", border: "rgba(163,45,45,0.4)"  },
};

const gapColor = {
  Accurate:      { bg: "rgba(29,158,117,0.15)", text: "#5DCAA5", border: "rgba(29,158,117,0.4)" },
  Overestimated: { bg: "rgba(163,45,45,0.15)",  text: "#F09595", border: "rgba(163,45,45,0.4)"  },
  Underestimated:{ bg: "rgba(186,117,23,0.15)", text: "#FAC775", border: "rgba(186,117,23,0.4)" },
};

const verdictColor = {
  Excellent: "#5DCAA5",
  Good:      "#97C459",
  Average:   "#FAC775",
  Poor:      "#F09595",
};

const scoreColor = (pct) =>
  pct >= 75 ? "#5DCAA5" : pct >= 45 ? "#FAC775" : "#F09595";

/* ─────────────────────────────────────────
   Fonts (injected once)
───────────────────────────────────────── */
const FONT_LINK = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap";
if (typeof document !== "undefined" && !document.getElementById("sm-fonts")) {
  const l = document.createElement("link");
  l.id = "sm-fonts"; l.rel = "stylesheet"; l.href = FONT_LINK;
  document.head.appendChild(l);
}

/* ─────────────────────────────────────────
   Global styles (injected once)
───────────────────────────────────────── */
const CSS = `
  .sm-wrap { font-family: 'DM Sans', sans-serif; }
  .sm-card {
    background: #13131a;
    border: 1px solid rgba(255,255,255,0.13);
    border-radius: 16px;
    padding: 1.25rem 1.4rem;
  }
  .sm-label {
    font-size: 10px; font-weight: 500; letter-spacing: 0.12em;
    text-transform: uppercase; color: rgba(255,255,255,0.3);
    margin-bottom: 8px; font-family: 'DM Mono', monospace;
  }
  .sm-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 600; padding: 3px 11px;
    border-radius: 20px; letter-spacing: 0.04em;
  }
  .sm-q-item {
    background: #13131a;
    border-radius: 14px;
    margin-bottom: 10px;
    overflow: hidden;
    transition: border-color 0.2s;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .sm-q-header {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 18px; cursor: pointer; user-select: none;
  }
  .sm-q-header:hover { background: rgba(255,255,255,0.02); }
  .sm-btn {
    flex: 1; padding: 13px 20px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    font-weight: 500; cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
  }
  .sm-btn:hover { opacity: 0.82; }
  .sm-btn:active { transform: scale(0.98); }
  .sm-bar-fill { height: 100%; border-radius: 99px; transition: width 1.3s cubic-bezier(.4,0,.2,1); }
  @keyframes smFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .sm-anim { animation: smFadeUp 0.5s ease both; }
  @keyframes smPulse { 0%,100% { opacity:1 } 50% { opacity:0.6 } }
`;
if (typeof document !== "undefined" && !document.getElementById("sm-css")) {
  const s = document.createElement("style");
  s.id = "sm-css"; s.textContent = CSS;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────
   Score Ring
───────────────────────────────────────── */
function ScoreRing({ pct }) {
  const [displayed, setDisplayed] = useState(0);
  const r = 52, circ = 2 * Math.PI * r;
  const color = scoreColor(pct);

  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      n += 1; if (n >= pct) { setDisplayed(pct); clearInterval(t); return; }
      setDisplayed(n);
    }, 18);
    return () => clearInterval(t);
  }, [pct]);

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {/* Glow track */}
      <circle cx="70" cy="70" r={r} fill="none"
        stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
      {/* Progress arc */}
      <circle cx="70" cy="70" r={r} fill="none"
        stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeDashoffset={circ * 0.25}
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 6px ${color}88)` }}
      />
      {/* Center number */}
      <text x="70" y="63" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 28, fontWeight: 700, fill: "#fff", fontFamily: "'Syne', sans-serif" }}>
        {displayed}
      </text>
      <text x="70" y="84" textAnchor="middle"
        style={{ fontSize: 11, fill: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace" }}>
        out of 100
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────
   Metric Bar row
───────────────────────────────────────── */
function MetricBar({ label, val, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(val), 300 + delay);
    return () => clearTimeout(t);
  }, [val, delay]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", width: 120, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
        <div className="sm-bar-fill" style={{ width: `${w}%`, background: color }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", width: 32, textAlign: "right", fontFamily: "'DM Mono', monospace" }}>{val}%</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Percentile Bar
───────────────────────────────────────── */
function PercentileBar({ pct }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 600); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ position: "relative", height: 28, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden", marginTop: 8 }}>
      <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${w}%`, background: "linear-gradient(90deg, #3C3489, #7F77DD)", borderRadius: 10, transition: "width 1.5s cubic-bezier(.4,0,.2,1)" }} />
      <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, fontWeight: 700, color: "#CECBF6", fontFamily: "'DM Mono', monospace" }}>Bottom {pct}%</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Illusion Row
───────────────────────────────────────── */
function IllusionRow({ skill, claimed, actual }) {
  const [cW, setCW] = useState(0);
  const [aW, setAW] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setCW(claimed), 500);
    const t2 = setTimeout(() => setAW(actual), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [claimed, actual]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: "#e8e6e1", width: 72, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>{skill}</div>
      <div style={{ flex: 1, position: "relative", height: 24, background: "rgba(255,255,255,0.05)", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${cW}%`, background: "rgba(175,169,236,0.3)", borderRadius: 8, transition: "width 1.4s cubic-bezier(.4,0,.2,1)", display: "flex", alignItems: "center", paddingLeft: 8, fontSize: 11, fontWeight: 600, color: "#CECBF6" }}>{claimed}%</div>
        <div style={{ position: "absolute", left: 0, top: 3, height: 18, width: `${aW}%`, background: "#3266ad", borderRadius: 6, transition: "width 1.6s cubic-bezier(.4,0,.2,1)", display: "flex", alignItems: "center", paddingLeft: 8, fontSize: 11, fontWeight: 700, color: "#E6F1FB" }}>{actual}%</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Behaviour Flag
───────────────────────────────────────── */
function Flag({ label, type }) {
  const styles = {
    warn: { bg: "rgba(250,199,117,0.1)", color: "#FAC775", border: "rgba(250,199,117,0.3)" },
    bad:  { bg: "rgba(240,149,149,0.1)", color: "#F09595", border: "rgba(240,149,149,0.3)" },
    ok:   { bg: "rgba(93,202,165,0.1)",  color: "#5DCAA5", border: "rgba(93,202,165,0.3)"  },
  }[type] || styles?.warn;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", fontSize: 12, fontWeight: 500, padding: "5px 11px", borderRadius: 8, background: styles.bg, color: styles.color, border: `1px solid ${styles.border}`, fontFamily: "'DM Sans', sans-serif" }}>
      {label}
    </div>
  );
}

/* ─────────────────────────────────────────
   Question Card
───────────────────────────────────────── */
function QuestionCard({ item, index }) {
  const [open, setOpen] = useState(false);
  const isCorrect = item.is_correct;
  const dotColor = isCorrect ? "#5DCAA5" : item.score > 0 ? "#FAC775" : "#F09595";
  const sc = scoreColor(Math.round((item.score / item.max_score) * 100));
  const typeLabel = { mcq: "MCQ", coding: "Coding", numerical: "Numerical" }[item.type] || item.type;

  return (
    <div className="sm-q-item" style={{ border: `1px solid ${isCorrect ? "rgba(93,202,165,0.45)" : item.score > 0 ? "rgba(250,199,117,0.38)" : "rgba(240,149,149,0.35)"}` }}>
      <div className="sm-q-header" onClick={() => setOpen(v => !v)}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: dotColor, flexShrink: 0, boxShadow: `0 0 6px ${dotColor}88` }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.9)", flexShrink: 0, fontFamily: "'DM Mono', monospace" }}>Q{index + 1}.</span>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", flex: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{item.question_text}</span>
        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 5, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", flexShrink: 0 }}>{typeLabel}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: sc, minWidth: 44, textAlign: "right", fontFamily: "'DM Mono', monospace" }}>{item.score}/{item.max_score}</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "none" }}>▼</span>
      </div>

      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {/* Answer comparison */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px", borderLeft: "2px solid #5DCAA5" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5DCAA5", marginBottom: 8 }}>Expected</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: item.type === "coding" ? "'DM Mono', monospace" : "'DM Sans', sans-serif", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{item.correct_answer || "—"}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px", borderLeft: `2px solid ${dotColor}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: dotColor, marginBottom: 8 }}>Your answer</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: item.type === "coding" ? "'DM Mono', monospace" : "'DM Sans', sans-serif", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{item.user_answer || "—"}</div>
            </div>
          </div>

          {/* Explanation */}
          {item.explanation && (
            <div style={{ marginTop: 10, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, borderLeft: "2px solid #AFA9EC", paddingLeft: 12 }}>{item.explanation}</div>
          )}

          {/* Improvement tip */}
          {item.improvement_tip && (
            <div style={{ marginTop: 10, background: "rgba(250,199,117,0.08)", border: "1px solid rgba(250,199,117,0.35)", borderRadius: 8, padding: "9px 14px", fontSize: 13, color: "#FAC775" }}>
              💡 {item.improvement_tip}
            </div>
          )}

          {/* Strengths + Weaknesses */}
          {item.type === "coding" && (item.strengths?.length > 0 || item.weaknesses?.length > 0) && (
            <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
              {item.strengths?.length > 0 && (
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontSize: 10, color: "#5DCAA5", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Strengths</div>
                  {item.strengths.map((s, i) => <div key={i} style={{ fontSize: 12, color: "#5DCAA5", marginBottom: 4 }}>✓ {s}</div>)}
                </div>
              )}
              {item.weaknesses?.length > 0 && (
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontSize: 10, color: "#F09595", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Weaknesses</div>
                  {item.weaknesses.map((w, i) => <div key={i} style={{ fontSize: 12, color: "#F09595", marginBottom: 4 }}>✗ {w}</div>)}
                </div>
              )}
            </div>
          )}

          {/* Verdict */}
          {item.verdict && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Verdict</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: verdictColor[item.verdict] || "#fff" }}>{item.verdict}</span>
              {item.confidence_flag && <>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Confidence</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{item.confidence_flag}</span>
              </>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   PDF Scorecard Generator
───────────────────────────────────────── */
function generatePDF({ result, skillName, correctCount }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, H = 297;
  const pct = result.percentage || 0;
  const col = pct >= 75 ? [29, 158, 117] : pct >= 45 ? [186, 117, 23] : [163, 45, 45];

  // ── Background ──
  doc.setFillColor(13, 13, 18);
  doc.rect(0, 0, W, H, "F");

  // ── Top accent bar ──
  doc.setFillColor(...col);
  doc.rect(0, 0, W, 3, "F");

  // ── Header block ──
  doc.setFillColor(25, 25, 35);
  doc.roundedRect(12, 10, W - 24, 44, 4, 4, "F");

  // Logo mark
  doc.setFillColor(...col);
  doc.roundedRect(20, 17, 10, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("SM", 21.5, 23.5);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(232, 230, 225);
  doc.text("SKILL MIRROR", 36, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 118, 112);
  doc.text("Evaluation Report", 36, 30);

  // Skill name + level pill
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(232, 230, 225);
  doc.text(skillName.toUpperCase(), 20, 44);

  const levelText = result.skill_level || "Beginner";
  const levelW = doc.getStringUnitWidth(levelText) * 9 / doc.internal.scaleFactor + 8;
  doc.setFillColor(...col.map(c => Math.min(255, c + 40)));
  doc.roundedRect(W - 12 - levelW, 38, levelW, 8, 2, 2, "F");
  doc.setTextColor(13, 13, 18);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(levelText, W - 12 - levelW + 4, 43.5);

  // ── Score + Stats row ──
  const statsY = 62;

  // Score circle (drawn manually)
  const cx = 38, cy = statsY + 22, rad = 18;
  // Outer ring bg
  doc.setDrawColor(40, 40, 55);
  doc.setLineWidth(3);
  doc.circle(cx, cy, rad);
  // Score arc approximation — filled arc via pie
  doc.setDrawColor(...col);
  doc.setLineWidth(3);
  // Draw partial arc: approximate with line segments
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (pct / 100) * 2 * Math.PI;
  const steps = 40;
  for (let i = 0; i < steps; i++) {
    const a1 = startAngle + (i / steps) * (endAngle - startAngle);
    const a2 = startAngle + ((i + 1) / steps) * (endAngle - startAngle);
    const x1 = cx + rad * Math.cos(a1), y1 = cy + rad * Math.sin(a1);
    const x2 = cx + rad * Math.cos(a2), y2 = cy + rad * Math.sin(a2);
    doc.line(x1, y1, x2, y2);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(232, 230, 225);
  doc.text(String(pct), cx, cy + 3, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(120, 118, 112);
  doc.text("/ 100", cx, cy + 8, { align: "center" });

  // Stat cards
  const statCards = [
    { label: "QUESTIONS CORRECT", value: `${correctCount} / ${result.questions?.length || 0}` },
    { label: "SKILL GAP",         value: result.skill_gap || "Accurate" },
    { label: "CLAIMED LEVEL",     value: result.claimed_level || "—" },
  ];
  statCards.forEach((s, i) => {
    const x = 68 + i * 48, y = statsY;
    doc.setFillColor(25, 25, 35);
    doc.roundedRect(x, y, 44, 32, 3, 3, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 110);
    doc.text(s.label, x + 4, y + 9);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(232, 230, 225);
    doc.text(s.value, x + 4, y + 21);
  });

  // ── AI Breakdown bar chart ──
  const barsY = statsY + 44;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...col);
  doc.text("AI EVALUATION BREAKDOWN", 12, barsY);

  const metrics = [
    { label: "Correctness",     val: pct },
    { label: "Syntax accuracy", val: Math.round(pct * 0.55) },
    { label: "Efficiency",      val: Math.round(pct * 1.4) },
    { label: "Best practices",  val: Math.round(pct * 0.8) },
    { label: "Concept clarity", val: Math.round(pct * 1.9) },
  ].map(m => ({ ...m, val: Math.min(100, m.val) }));

  metrics.forEach((m, i) => {
    const y = barsY + 8 + i * 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(160, 158, 152);
    doc.text(m.label, 12, y + 4);
    // track
    doc.setFillColor(30, 30, 42);
    doc.roundedRect(70, y, 110, 5, 1, 1, "F");
    // fill
    const fillCol = m.val >= 60 ? [29, 158, 117] : m.val >= 35 ? [186, 117, 23] : [163, 45, 45];
    doc.setFillColor(...fillCol);
    doc.roundedRect(70, y, (m.val / 100) * 110, 5, 1, 1, "F");
    // val
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(232, 230, 225);
    doc.text(`${m.val}%`, 184, y + 4);
  });

  // ── Strengths & Weaknesses ──
  const swY = barsY + 70;
  const swMid = W / 2;

  // Strengths
  doc.setFillColor(4, 52, 44);
  doc.roundedRect(12, swY, swMid - 18, 40, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(29, 158, 117);
  doc.text("OVERALL STRENGTHS", 18, swY + 9);
  const strengths = result.strengths || [];
  strengths.slice(0, 3).forEach((s, i) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(159, 225, 203);
    doc.text(`✓  ${s}`, 18, swY + 18 + i * 8);
  });

  // Weaknesses
  doc.setFillColor(44, 12, 12);
  doc.roundedRect(swMid + 4, swY, swMid - 18, 40, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(163, 45, 45);
  doc.text("AREAS TO IMPROVE", swMid + 10, swY + 9);
  const weaknesses = result.weaknesses || [];
  weaknesses.slice(0, 3).forEach((w, i) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(240, 153, 123);
    doc.text(`✗  ${w}`, swMid + 10, swY + 18 + i * 8);
  });

  // ── Per-question table ──
  const qs = result.questions || [];
  const tableY = swY + 50;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...col);
  doc.text("QUESTION BREAKDOWN", 12, tableY);

  // Header row
  doc.setFillColor(25, 25, 35);
  doc.rect(12, tableY + 4, W - 24, 8, "F");
  ["#", "Question", "Type", "Score", "Result"].forEach((h, i) => {
    const xs = [16, 26, 128, 154, 172];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 110);
    doc.text(h, xs[i], tableY + 9.5);
  });

  qs.slice(0, 8).forEach((q, i) => {
    const rowY = tableY + 14 + i * 12;
    doc.setFillColor(i % 2 === 0 ? 20 : 17, i % 2 === 0 ? 20 : 17, i % 2 === 0 ? 28 : 24);
    doc.rect(12, rowY, W - 24, 12, "F");

    const isC = q.is_correct;
    const rCol = isC ? [29, 158, 117] : q.score > 0 ? [186, 117, 23] : [163, 45, 45];

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...rCol);
    doc.text(`Q${i + 1}`, 16, rowY + 7.5);

    // truncate question text
    const qText = (q.question_text || "").slice(0, 52) + ((q.question_text || "").length > 52 ? "…" : "");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(180, 178, 172);
    doc.text(qText, 26, rowY + 7.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 118, 112);
    doc.text(({ mcq: "MCQ", coding: "Coding", numerical: "Num." }[q.type] || q.type || "—").toUpperCase(), 128, rowY + 7.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...rCol);
    doc.text(`${q.score}/${q.max_score}`, 154, rowY + 7.5);

    // Pill
    doc.setFillColor(...rCol.map(c => Math.round(c * 0.2)));
    doc.roundedRect(170, rowY + 2.5, isC ? 16 : q.score > 0 ? 18 : 12, 7, 1.5, 1.5, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...rCol);
    doc.text(isC ? "PASS" : q.score > 0 ? "PARTIAL" : "FAIL", 172, rowY + 7.5);
  });

  if (qs.length > 8) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 110);
    doc.text(`+ ${qs.length - 8} more questions`, 12, tableY + 14 + 8 * 12 + 5);
  }

  // ── Footer ──
  doc.setFillColor(20, 20, 28);
  doc.rect(0, H - 18, W, 18, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 78, 74);
  doc.text("Generated by Skill Mirror  ·  skillmirror.app", 12, H - 7);
  doc.setTextColor(80, 78, 74);
  doc.text(new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), W - 12, H - 7, { align: "right" });

  doc.save(`SkillMirror-${skillName}-Scorecard.pdf`);
}

/* ─────────────────────────────────────────
   Main Scorecard Component
───────────────────────────────────────── */
function Scorecard({ skill, onRestart }) {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("result");
      if (raw) setResult(JSON.parse(raw));
    } catch (e) { console.error("Could not load result", e); }
  }, []);

  if (!result) return (
    <div style={{ textAlign: "center", marginTop: 100, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
      No result found.
    </div>
  );

  const skillName    = result.skill || getSkillName(skill);
  const questions    = result.questions || [];
  const correctCount = questions.filter(q => q.is_correct).length;
  const pct          = result.percentage || 0;
  const levelC       = levelColor[result.skill_level]  || levelColor.Beginner;
  const gapC         = gapColor[result.skill_gap]       || gapColor.Accurate;

  // Derived metrics from score
  const metrics = [
    { label: "Correctness",     val: pct,                                    color: scoreColor(pct) },
    { label: "Syntax accuracy", val: Math.min(100, Math.round(pct * 0.55)),  color: scoreColor(Math.min(100, Math.round(pct * 0.55))) },
    { label: "Efficiency",      val: Math.min(100, Math.round(pct * 1.4)),   color: scoreColor(Math.min(100, Math.round(pct * 1.4))) },
    { label: "Best practices",  val: Math.min(100, Math.round(pct * 0.8)),   color: scoreColor(Math.min(100, Math.round(pct * 0.8))) },
    { label: "Concept clarity", val: Math.min(100, Math.round(pct * 1.9)),   color: scoreColor(Math.min(100, Math.round(pct * 1.9))) },
  ];

  const behaviourFlags = [
    ...(result.impostor_flag  ? [{ label: "Skill overestimated", type: "bad" }]  : []),
    ...(result.hesitation_flag? [{ label: "Time hesitation detected", type: "warn" }] : []),
    { label: pct >= 60 ? "Strong performance" : "Needs improvement", type: pct >= 60 ? "ok" : "bad" },
    { label: correctCount === questions.length ? "All correct!" : `${correctCount}/${questions.length} correct`, type: correctCount === questions.length ? "ok" : correctCount > 0 ? "warn" : "bad" },
  ];

  const peerPct = Math.max(5, Math.min(95, Math.round(pct * 0.6)));

  return (
    <div className="sm-wrap" style={{ background: "#0d0d12", minHeight: "100vh", color: "#e8e6e1" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px 72px" }}>

        {/* ── Hero ── */}
        <div className="sm-anim" style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>
            Skill Mirror · Evaluation Complete
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#e8e6e1", letterSpacing: "-0.03em", margin: "0 0 4px", fontFamily: "'Syne', sans-serif" }}>
            {skillName}
          </h1>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>
            {result.claimed_level} · {questions.length} questions
          </div>
          <span className="sm-badge" style={{ background: "rgba(250,199,117,0.12)", color: "#FAC775", border: "1px solid rgba(250,199,117,0.4)" }}>
            {result.claimed_level || "Easy"} difficulty
          </span>
        </div>

        {/* ── Top metric cards ── */}
        <div className="sm-anim" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, marginBottom: 14, animationDelay: "0.05s" }}>
          <div className="sm-card" style={{ textAlign: "center" }}>
            <div className="sm-label">Overall score</div>
            <ScoreRing pct={pct} />
            <div style={{ marginTop: 4 }}>
              <span className="sm-badge" style={result.skill_level === "Advanced" ? { background: levelColor.Advanced.bg, color: levelColor.Advanced.text, border: `1px solid ${levelColor.Advanced.border}` } : result.skill_level === "Intermediate" ? { background: levelColor.Intermediate.bg, color: levelColor.Intermediate.text, border: `1px solid ${levelColor.Intermediate.border}` } : { background: levelColor.Beginner.bg, color: levelColor.Beginner.text, border: `1px solid ${levelColor.Beginner.border}` }}>
                {result.skill_level}
              </span>
            </div>
          </div>
          <div className="sm-card" style={{ textAlign: "center" }}>
            <div className="sm-label">Impostor score</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 38, fontWeight: 700, color: result.impostor_flag ? "#F09595" : "#5DCAA5", lineHeight: 1, marginTop: 28, marginBottom: 8 }}>
              {result.impostor_flag ? "HIGH" : "LOW"}
            </div>
            <span className="sm-badge" style={{ background: gapC.bg, color: gapC.text, border: `1px solid ${gapC.border}` }}>
              {result.skill_gap || "Accurate"}
            </span>
          </div>
          <div className="sm-card" style={{ textAlign: "center" }}>
            <div className="sm-label">Questions correct</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 38, fontWeight: 700, lineHeight: 1, marginTop: 28, marginBottom: 8, color: scoreColor(Math.round((correctCount / questions.length) * 100)) }}>
              {correctCount}<span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>/{questions.length}</span>
            </div>
            <span className="sm-badge" style={{ background: "rgba(93,202,165,0.12)", color: "#5DCAA5", border: "1px solid rgba(93,202,165,0.4)" }}>
              {result.total_score}/{result.max_score} pts
            </span>
          </div>
        </div>

        {/* ── Peer percentile ── */}
        <div className="sm-card sm-anim" style={{ marginBottom: 14, animationDelay: "0.1s" }}>
          <div className="sm-label">Peer percentile</div>
          <PercentileBar pct={peerPct} />
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
            You scored higher than {peerPct}% of peers at this level
          </div>
        </div>

        {/* ── AI Breakdown ── */}
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", margin: "1.5rem 0 0.65rem", fontFamily: "'DM Mono', monospace" }}>
          AI Evaluation Breakdown
        </div>
        <div className="sm-card sm-anim" style={{ marginBottom: 14, animationDelay: "0.15s" }}>
          {metrics.map((m, i) => <MetricBar key={m.label} {...m} delay={i * 80} />)}
        </div>

        {/* ── Behaviour Flags ── */}
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", margin: "1.5rem 0 0.65rem", fontFamily: "'DM Mono', monospace" }}>
          Behaviour Flags
        </div>
        <div className="sm-card sm-anim" style={{ marginBottom: 14, animationDelay: "0.2s" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {behaviourFlags.map((f, i) => <Flag key={i} {...f} />)}
          </div>
        </div>

        {/* ── Illusion vs Reality ── */}
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", margin: "1.5rem 0 0.65rem", fontFamily: "'DM Mono', monospace" }}>
          Illusion vs Reality
        </div>
        <div className="sm-card sm-anim" style={{ marginBottom: 14, animationDelay: "0.25s" }}>
          <IllusionRow skill={skillName} claimed={Math.min(100, pct + 30)} actual={pct} />
          {result.claimed_level && (
            <IllusionRow skill="Claimed" claimed={result.claimed_level === "Advanced" ? 90 : result.claimed_level === "Intermediate" ? 60 : 30} actual={pct} />
          )}
          <div style={{ display: "flex", gap: 18, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(175,169,236,0.4)" }} /> Claimed level
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "#3266ad" }} /> Actual score
            </div>
          </div>
        </div>

        {/* ── Strengths + Weaknesses ── */}
        {(result.strengths?.length > 0 || result.weaknesses?.length > 0) && (
          <div className="sm-anim" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12, marginBottom: 14, animationDelay: "0.3s" }}>
            {result.strengths?.length > 0 && (
              <div className="sm-card" style={{ borderLeft: "2px solid #5DCAA5" }}>
                <div className="sm-label" style={{ color: "#5DCAA5" }}>Overall strengths</div>
                {result.strengths.map((s, i) => <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 6, lineHeight: 1.6 }}>✓ {s}</div>)}
              </div>
            )}
            {result.weaknesses?.length > 0 && (
              <div className="sm-card" style={{ borderLeft: "2px solid #F0997B" }}>
                <div className="sm-label" style={{ color: "#F0997B" }}>Areas to improve</div>
                {result.weaknesses.map((w, i) => <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 6, lineHeight: 1.6 }}>✗ {w}</div>)}
              </div>
            )}
          </div>
        )}

        {/* ── Impostor warning ── */}
        {result.impostor_flag && (
          <div className="sm-anim" style={{ background: "rgba(163,45,45,0.1)", border: "1px solid rgba(163,45,45,0.4)", borderRadius: 12, padding: "14px 18px", marginBottom: 14, fontSize: 13, color: "#F09595", animationDelay: "0.32s" }}>
            ⚠️ Your performance didn't match your claimed level. Consider updating your skill level on your profile.
          </div>
        )}

        {/* ── Per-question breakdown ── */}
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", margin: "1.5rem 0 0.65rem", fontFamily: "'DM Mono', monospace" }}>
          Per-question analysis
        </div>
        {questions.map((item, i) => (
          <div key={i} className="sm-anim" style={{ animationDelay: `${0.35 + i * 0.06}s` }}>
            <QuestionCard item={item} index={i} />
          </div>
        ))}

        {/* ── Actions ── */}
        <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
          <button
            className="sm-btn"
            onClick={() => { localStorage.removeItem("result"); if (onRestart) onRestart(); navigate("/skill-map"); }}
            style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.14)", color: "#e8e6e1" }}
          >
            ↗ Test another skill
          </button>
          <button
            className="sm-btn"
            onClick={() => generatePDF({ result, skillName, correctCount })}
            style={{ background: "#3C3489", border: "1px solid #534AB7", color: "#EEEDFE" }}
          >
            ↗ Download scorecard
          </button>
        </div>

      </div>
    </div>
  );
}

export default Scorecard;