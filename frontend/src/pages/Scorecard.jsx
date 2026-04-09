import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const getSkillName = (skill) =>
  typeof skill === "string" ? skill : skill?.label || skill?.name || "unknown";

const levelColor = {
  Advanced:     { bg: "#EAF3DE", text: "#3B6D11", border: "#97C459" },
  Intermediate: { bg: "#FAEEDA", text: "#854F0B", border: "#FAC775" },
  Beginner:     { bg: "#FCEBEB", text: "#A32D2D", border: "#F09595" },
};

const gapColor = {
  Accurate:      { bg: "#EAF3DE", text: "#3B6D11", border: "#97C459" },
  Overestimated: { bg: "#FCEBEB", text: "#A32D2D", border: "#F09595" },
  Underestimated:{ bg: "#FAEEDA", text: "#854F0B", border: "#FAC775" },
};

const verdictColor = {
  Excellent: "#1D9E75",
  Good:      "#3B6D11",
  Average:   "#BA7517",
  Poor:      "#A32D2D",
};

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

// Animated score circle
function ScoreCircle({ percentage }) {
  const radius      = 54;
  const circumf     = 2 * Math.PI * radius;
  const strokeDash  = (percentage / 100) * circumf;
  const color       = percentage >= 75 ? "#1D9E75" : percentage >= 45 ? "#BA7517" : "#A32D2D";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Track */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="var(--color-border-tertiary, #2a2a4a)"
          strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumf}`}
          strokeDashoffset={circumf * 0.25}   /* start from top */
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <text
          x="70" y="66"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: 26, fontWeight: 600, fill: "var(--color-text-primary, #fff)", fontFamily: "Inter, sans-serif" }}
        >
          {percentage}
        </text>
        <text
          x="70" y="86"
          textAnchor="middle"
          style={{ fontSize: 11, fill: "var(--color-text-secondary, #888)", fontFamily: "Inter, sans-serif" }}
        >
          out of 100
        </text>
      </svg>
    </div>
  );
}

// Single question review card
function QuestionCard({ item, index }) {
  const [open, setOpen] = useState(false);

  const isCorrect = item.is_correct;
  const scoreColor = isCorrect
    ? "#1D9E75"
    : item.score > 0
      ? "#BA7517"
      : "#A32D2D";

  const typeLabel = {
    mcq:       "MCQ",
    coding:    "Coding",
    numerical: "Numerical",
  }[item.type] || item.type;

  return (
    <div style={{
      background: "var(--color-background-secondary, #0f0f1a)",
      border: `0.5px solid ${isCorrect ? "#97C459" : item.score > 0 ? "#FAC775" : "#F09595"}`,
      borderRadius: 12,
      marginBottom: 10,
      overflow: "hidden",
    }}>
      {/* Header row — always visible */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Status dot */}
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: isCorrect ? "#1D9E75" : item.score > 0 ? "#BA7517" : "#A32D2D",
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary, #fff)" }}>
            Q{index + 1}.&nbsp;
          </span>
          <span style={{
            fontSize: 13,
            color: "var(--color-text-secondary, #ccc)",
            maxWidth: 420,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}>
            {item.question_text}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* Type badge */}
          <span style={{
            fontSize: 11,
            padding: "2px 9px",
            borderRadius: 20,
            background: "var(--color-background-primary, #1a1a2e)",
            border: "0.5px solid var(--color-border-tertiary, #2a2a4a)",
            color: "var(--color-text-secondary, #888)",
          }}>
            {typeLabel}
          </span>
          {/* Score */}
          <span style={{ fontSize: 14, fontWeight: 600, color: scoreColor, minWidth: 40, textAlign: "right" }}>
            {item.score}/{item.max_score}
          </span>
          {/* Chevron */}
          <span style={{
            fontSize: 12,
            color: "var(--color-text-secondary, #888)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            display: "inline-block",
          }}>▼</span>
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{
          padding: "0 18px 18px",
          borderTop: "0.5px solid var(--color-border-tertiary, #2a2a4a)",
        }}>

          {/* Your answer */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary, #888)", marginBottom: 4 }}>Your answer</div>
            <div style={{
              background: "var(--color-background-primary, #1a1a2e)",
              border: "0.5px solid var(--color-border-tertiary, #2a2a4a)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              color: "var(--color-text-primary, #fff)",
              fontFamily: item.type === "coding" ? "monospace" : "inherit",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: 180,
              overflowY: "auto",
            }}>
              {item.user_answer || "—"}
            </div>
          </div>

          {/* Correct answer (show if wrong or coding) */}
          {(!isCorrect || item.type === "coding") && item.correct_answer && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "#1D9E75", marginBottom: 4 }}>Correct answer</div>
              <div style={{
                background: "#04342C",
                border: "0.5px solid #0F6E56",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: "#9FE1CB",
                fontFamily: item.type === "coding" ? "monospace" : "inherit",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}>
                {item.correct_answer}
              </div>
            </div>
          )}

          {/* Explanation */}
          {item.explanation && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary, #888)", marginBottom: 4 }}>Explanation</div>
              <p style={{
                margin: 0,
                fontSize: 13,
                color: "var(--color-text-secondary, #ccc)",
                lineHeight: 1.6,
                borderLeft: "2px solid #AFA9EC",
                paddingLeft: 12,
              }}>
                {item.explanation}
              </p>
            </div>
          )}

          {/* Improvement tip */}
          {item.improvement_tip && (
            <div style={{
              marginTop: 12,
              background: "#FAEEDA",
              border: "0.5px solid #FAC775",
              borderRadius: 8,
              padding: "9px 14px",
              fontSize: 13,
              color: "#854F0B",
            }}>
              💡 {item.improvement_tip}
            </div>
          )}

          {/* Coding: strengths + weaknesses */}
          {item.type === "coding" && (item.strengths?.length > 0 || item.weaknesses?.length > 0) && (
            <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
              {item.strengths?.length > 0 && (
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: 11, color: "#1D9E75", marginBottom: 6 }}>Strengths</div>
                  {item.strengths.map((s, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#9FE1CB", marginBottom: 4 }}>✓ {s}</div>
                  ))}
                </div>
              )}
              {item.weaknesses?.length > 0 && (
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: 11, color: "#A32D2D", marginBottom: 6 }}>Weaknesses</div>
                  {item.weaknesses.map((w, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#F09595", marginBottom: 4 }}>✗ {w}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Verdict for coding */}
          {item.verdict && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "var(--color-text-secondary, #888)" }}>Verdict:</span>
              <span style={{
                fontSize: 12,
                fontWeight: 500,
                color: verdictColor[item.verdict] || "#fff",
              }}>
                {item.verdict}
              </span>
              {item.confidence_flag && (
                <>
                  <span style={{ fontSize: 11, color: "var(--color-text-secondary, #888)", marginLeft: 8 }}>Confidence:</span>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary, #aaa)" }}>{item.confidence_flag}</span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Scorecard
───────────────────────────────────────── */
function Scorecard({ skill, onRestart }) {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("result");
      if (raw) setResult(JSON.parse(raw));
    } catch (e) {
      console.error("Could not load result", e);
    }
  }, []);

  if (!result) {
    return (
    <div style={{
        textAlign: "center", marginTop: 100,
        color: "var(--color-text-secondary, #888)",
        fontFamily: "Inter, sans-serif",
      }}>
        No result found.
      </div> 
    );
  }

  const skillName  = result.skill || getSkillName(skill);
  const levelC     = levelColor[result.skill_level]  || levelColor.Beginner;
  const gapC       = gapColor[result.skill_gap]       || gapColor.Accurate;
  const questions  = result.questions || [];

  const correctCount = questions.filter((q) => q.is_correct).length;
  const downloadPDF = async () => {
  const input = document.getElementById("report-content");

  const canvas = await html2canvas(input);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save(`SkillMirror-${skillName}-Report.pdf`);
};

  return (
  <div id="report-content">
    <div style={{
      maxWidth: 860,
      margin: "0 auto",
      padding: "32px 16px 60px",
      fontFamily: "'Inter', sans-serif",
      color: "var(--color-text-primary, #fff)",
    }}>

      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, margin: "0 0 6px" }}>
          Evaluation Complete
        </h1>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary, #888)", margin: 0 }}>
          {skillName} · {result.claimed_level}
        </p>
      </div>

      {/* ── Score + level + gap (top strip) ── */}
      <div style={{
        display: "flex",
        gap: 20,
        alignItems: "stretch",
        marginBottom: 24,
        flexWrap: "wrap",
      }}>
        {/* Score circle */}
        <div style={{
          background: "var(--color-background-secondary, #0f0f1a)",
          border: "0.5px solid var(--color-border-tertiary, #2a2a4a)",
          borderRadius: 16,
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          flex: "0 0 auto",
        }}>
          <ScoreCircle percentage={result.percentage} />
          <div style={{ fontSize: 13, color: "var(--color-text-secondary, #888)", textAlign: "center" }}>
            {result.total_score} / {result.max_score} points
          </div>
        </div>

        {/* Right stats */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 200 }}>

          {/* Skill level */}
          <div style={{
            background: "var(--color-background-secondary, #0f0f1a)",
            border: "0.5px solid var(--color-border-tertiary, #2a2a4a)",
            borderRadius: 12,
            padding: "16px 18px",
            flex: 1,
          }}>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary, #888)", marginBottom: 6 }}>
              Evaluated skill level
            </div>
            <span style={{
              fontSize: 20,
              fontWeight: 600,
              padding: "3px 14px",
              borderRadius: 20,
              background: levelC.bg,
              color: levelC.text,
              border: `0.5px solid ${levelC.border}`,
            }}>
              {result.skill_level}
            </span>
          </div>

          {/* Skill gap */}
          <div style={{
            background: "var(--color-background-secondary, #0f0f1a)",
            border: "0.5px solid var(--color-border-tertiary, #2a2a4a)",
            borderRadius: 12,
            padding: "16px 18px",
            flex: 1,
          }}>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary, #888)", marginBottom: 6 }}>
              Skill gap
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontSize: 16,
                fontWeight: 600,
                padding: "2px 12px",
                borderRadius: 20,
                background: gapC.bg,
                color: gapC.text,
                border: `0.5px solid ${gapC.border}`,
              }}>
                {result.skill_gap}
              </span>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary, #888)" }}>
                {result.skill_gap === "Overestimated"
                  ? `Claimed ${result.claimed_level}, performed ${result.skill_level}`
                  : result.skill_gap === "Underestimated"
                    ? `Better than expected!`
                    : `Your claim matches your performance`}
              </span>
            </div>
          </div>

          {/* Questions correct */}
          <div style={{
            background: "var(--color-background-secondary, #0f0f1a)",
            border: "0.5px solid var(--color-border-tertiary, #2a2a4a)",
            borderRadius: 12,
            padding: "16px 18px",
            flex: 1,
          }}>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary, #888)", marginBottom: 6 }}>
              Questions correct
            </div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {correctCount}
              <span style={{ fontSize: 13, fontWeight: 400, color: "var(--color-text-secondary, #888)", marginLeft: 4 }}>
                / {questions.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Impostor flag ── */}
      {result.impostor_flag && (
        <div style={{
          background: "#FCEBEB",
          border: "0.5px solid #F09595",
          borderRadius: 12,
          padding: "14px 18px",
          marginBottom: 20,
          fontSize: 14,
          color: "#791F1F",
        }}>
          ⚠️ Your performance didn't match your claimed level. Consider updating your skill level on your profile.
        </div>
      )}

      {/* ── Strengths & Weaknesses (aggregated) ── */}
      {(result.strengths?.length > 0 || result.weaknesses?.length > 0) && (
        <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          {result.strengths?.length > 0 && (
            <div style={{
              flex: 1, minWidth: 200,
              background: "var(--color-background-secondary, #0f0f1a)",
              border: "0.5px solid #0F6E56",
              borderRadius: 12,
              padding: "16px 18px",
            }}>
              <div style={{ fontSize: 12, color: "#1D9E75", fontWeight: 500, marginBottom: 10 }}>Overall strengths</div>
              {result.strengths.map((s, i) => (
                <div key={i} style={{ fontSize: 13, color: "#9FE1CB", marginBottom: 6 }}>✓ {s}</div>
              ))}
            </div>
          )}
          {result.weaknesses?.length > 0 && (
            <div style={{
              flex: 1, minWidth: 200,
              background: "var(--color-background-secondary, #0f0f1a)",
              border: "0.5px solid #993C1D",
              borderRadius: 12,
              padding: "16px 18px",
            }}>
              <div style={{ fontSize: 12, color: "#D85A30", fontWeight: 500, marginBottom: 10 }}>Areas to improve</div>
              {result.weaknesses.map((w, i) => (
                <div key={i} style={{ fontSize: 13, color: "#F0997B", marginBottom: 6 }}>✗ {w}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Per-question breakdown ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 14 }}>
          Question breakdown
        </h2>
        {questions.map((item, i) => (
          <QuestionCard key={i} item={item} index={i} />
        ))}
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => {
            localStorage.removeItem("result");
            if (onRestart) onRestart();
            navigate("/skill-map"); // 🔥 ADD THIS
          }}
          style={{
            flex: 1,
            padding: "13px 20px",
            background: "var(--color-background-secondary, #0f0f1a)",
            border: "0.5px solid var(--color-border-secondary, #444)",
            borderRadius: 8,
            color: "var(--color-text-primary, #fff)",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Try another skill
        </button>
        <button
          onClick={downloadPDF}
          style={{
            flex: 1,
            padding: "13px 20px",
            background: "var(--color-background-secondary, #0f0f1a)",
            border: "0.5px solid var(--color-border-secondary, #444)",
            borderRadius: 8,
            color: "var(--color-text-secondary, #aaa)",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Download report
        </button>
      </div>
    </div></div>
  );
}

export default Scorecard;