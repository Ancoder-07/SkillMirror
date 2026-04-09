import React, { useEffect, useState, useRef } from "react";
import { nextQuestion, submitAnswer, evaluateSession } from "../api/api";
import Editor from "@monaco-editor/react";

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const getLanguage = (skill) => {
  const s = (typeof skill === "string" ? skill : skill?.label || skill?.name || "").toLowerCase();
  if (s.includes("python"))     return "python";
  if (s.includes("java"))       return "java";
  if (s.includes("c++"))        return "cpp";
  if (s.includes("javascript")) return "javascript";
  return "";
};

const getSkillName = (skill) =>
  typeof skill === "string" ? skill : skill?.label || skill?.name || "unknown";

const getBoilerplate = (q, skill) => {
  // Only show boilerplate for coding questions
  if (q?.type !== "coding") return "";
  const lang = getLanguage(skill);
  if (lang === "python")
    return `import pandas as pd\n\ndef solution():\n    # your code here\n    pass\n`;
  if (lang === "java")
    return `public class Solution {\n    public static void main(String[] args) {\n        // your code here\n    }\n}\n`;
  if (lang === "cpp")
    return `#include <iostream>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}\n`;
  return `function solution() {\n  // your code here\n}\n`;
};

const formatTime = (seconds) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

/* ─────────────────────────────────────────
   Styles (inline — no CSS file needed)
───────────────────────────────────────── */
const S = {
  wrap: {
    maxWidth: 860,
    margin: "0 auto",
    padding: "24px 16px",
    fontFamily: "'Inter', sans-serif",
    color: "var(--color-text-primary, #fff)",
  },
  qCard: {
    background: "var(--color-background-secondary, #0f0f1a)",
    border: "0.5px solid var(--color-border-tertiary, #2a2a4a)",
    borderRadius: 16,
    padding: "24px 28px",
    marginBottom: 14,
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  badges: { display: "flex", gap: 8, flexWrap: "wrap" },
  badge: (color) => ({
    fontSize: 12,
    fontWeight: 500,
    padding: "3px 12px",
    borderRadius: 20,
    border: `0.5px solid ${color.border}`,
    background: color.bg,
    color: color.text,
  }),
  timerVal: (timeLeft) => ({
    fontSize: 30,
    fontWeight: 500,
    lineHeight: 1,
    color: timeLeft < 60 ? "#A32D2D" : timeLeft < 300 ? "#BA7517" : "var(--color-text-primary, #fff)",
  }),
  timerLbl: { fontSize: 11, color: "var(--color-text-secondary, #888)", marginTop: 2, textAlign: "right" },
  qTitle: { fontSize: 19, fontWeight: 500, marginBottom: 10 },
  qBody: { fontSize: 14, color: "var(--color-text-secondary, #ccc)", lineHeight: 1.7 },
  hintBox: {
    marginTop: 14,
    background: "var(--color-background-primary, #ffffff08)",
    borderLeft: "2px solid #AFA9EC",
    borderRadius: "0 6px 6px 0",
    padding: "9px 14px",
    fontSize: 13,
    color: "var(--color-text-secondary, #aaa)",
  },
  editorWrap: {
    border: "0.5px solid var(--color-border-tertiary, #2a2a4a)",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
  },
  editorBar: {
    background: "var(--color-background-secondary, #1e1e2e)",
    padding: "9px 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "0.5px solid var(--color-border-tertiary, #2a2a4a)",
  },
  dots: { display: "flex", gap: 6 },
  dot: (color) => ({ width: 11, height: 11, borderRadius: "50%", background: color }),
  langTag: { fontSize: 12, color: "var(--color-text-secondary, #888)", fontFamily: "monospace" },
  mcqOption: (selected) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 14px",
    border: `0.5px solid ${selected ? "#AFA9EC" : "var(--color-border-tertiary, #2a2a4a)"}`,
    borderRadius: 8,
    marginBottom: 8,
    cursor: "pointer",
    background: selected ? "#EEEDFE" : "var(--color-background-primary, #1a1a2e)",
    color: selected ? "#3C3489" : "var(--color-text-primary, #fff)",
    fontSize: 14,
    transition: "background 0.15s",
  }),
  radioCircle: (selected) => ({
    width: 16, height: 16, borderRadius: "50%",
    border: `1.5px solid ${selected ? "#7F77DD" : "var(--color-border-secondary, #555)"}`,
    background: selected ? "#7F77DD" : "transparent",
    flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  }),
  numInput: {
    width: "100%",
    padding: "11px 14px",
    border: "0.5px solid var(--color-border-tertiary, #2a2a4a)",
    borderRadius: 8,
    fontSize: 14,
    background: "var(--color-background-primary, #1a1a2e)",
    color: "var(--color-text-primary, #fff)",
    fontFamily: "monospace",
    outline: "none",
    marginBottom: 14,
  },
  monitorBar: {
    background: "var(--color-background-secondary, #0f0f1a)",
    border: "0.5px solid var(--color-border-tertiary, #2a2a4a)",
    borderRadius: 16,
    padding: "12px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pulseRow: { display: "flex", alignItems: "center", gap: 8 },
  pulseDot: {
    width: 7, height: 7, borderRadius: "50%",
    background: "#1D9E75",
    animation: "pulse 2s infinite",
  },
  pulseLbl: { fontSize: 12, color: "var(--color-text-secondary, #888)" },
  stats: { display: "flex", gap: 24 },
  statItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  statVal: (hot) => ({
    fontSize: 17, fontWeight: 500,
    color: hot ? "#D85A30" : "var(--color-text-primary, #fff)",
  }),
  statKey: { fontSize: 11, color: "var(--color-text-secondary, #888)" },
  nextBtn: (loading) => ({
    width: "100%",
    padding: 13,
    background: loading ? "var(--color-background-secondary, #333)" : "var(--color-background-primary, #1a1a2e)",
    border: "0.5px solid var(--color-border-secondary, #444)",
    borderRadius: 8,
    color: "var(--color-text-primary, #fff)",
    fontSize: 15,
    fontWeight: 500,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.5 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  }),
};

const DIFFICULTY_COLORS = {
  hard:   { bg: "#FCEBEB", text: "#A32D2D", border: "#F09595" },
  medium: { bg: "#FAEEDA", text: "#854F0B", border: "#FAC775" },
  easy:   { bg: "#EAF3DE", text: "#3B6D11", border: "#97C459" },
};

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
function Challenge({ skill, onSubmit }) {
  const [question, setQuestion]   = useState(null);
  const [answer, setAnswer]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [testId, setTestId]       = useState(null);
  const [timeLeft, setTimeLeft]   = useState(20 * 60);

  // Live monitoring display
  const [displayKeystrokes, setDisplayKeystrokes]   = useState(0);
  const [displayRewrites, setDisplayRewrites]       = useState(0);
  const [displayTabSwitches, setDisplayTabSwitches] = useState(0);

  // Refs (behavioural tracking — your logic)
  const sessionAnswers      = useRef([]);
  const questionStartTime   = useRef(Date.now());
  const tabSwitchCount      = useRef(0);
  const rewriteCount        = useRef(0);
  const keystrokeCount      = useRef(0);
  const lastAnswerLength    = useRef(0);

  /* ── Load first question (your logic) ── */
  useEffect(() => {
    const storedTestId       = localStorage.getItem("test_id");
    const storedQuestionRaw  = localStorage.getItem("question");
    if (!storedTestId || !storedQuestionRaw) return;

    try {
      const parsedQuestion = JSON.parse(storedQuestionRaw);
      setTestId(storedTestId);
      setQuestion(parsedQuestion);
      setAnswer(getBoilerplate(parsedQuestion, skill));
      questionStartTime.current = Date.now();
    } catch (err) {
      console.error("Invalid stored question JSON", err);
    }
  }, []);

  /* ── Timer (your logic) ── */
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [question]);

  /* ── Tab-switch tracking (your friend's feature) ── */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCount.current += 1;
        setDisplayTabSwitches(tabSwitchCount.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  /* ── Editor change: keystrokes + rewrite detection ── */
  const handleEditorChange = (value) => {
    const newVal   = value || "";
    const currLen  = newVal.length;
    const prevLen  = lastAnswerLength.current;

    keystrokeCount.current += 1;
    setDisplayKeystrokes(keystrokeCount.current);

    if (prevLen - currLen > 30) {
      rewriteCount.current += 1;
      setDisplayRewrites(rewriteCount.current);
    }

    lastAnswerLength.current = currLen;
    setAnswer(newVal);
  };

  /* ── Reset per-question trackers ── */
  const resetTrackers = () => {
    questionStartTime.current = Date.now();
    tabSwitchCount.current    = 0;
    rewriteCount.current      = 0;
    keystrokeCount.current    = 0;
    lastAnswerLength.current  = 0;
    setDisplayKeystrokes(0);
    setDisplayRewrites(0);
    setDisplayTabSwitches(0);
    setTimeLeft(20 * 60);
  };

  /* ── Next button (your logic, all three question types) ── */
  const handleNext = async () => {
    if (!answer || (typeof answer === "string" && !answer.trim())) {
      alert("Answer required!");
      return;
    }
    setLoading(true);

    try {
      const timeTaken = Math.floor((Date.now() - questionStartTime.current) / 1000);

      // Build payload that works for all types (your structure)
      sessionAnswers.current.push({
        question:            question.question,
        answer:              answer,          // unified key (your code)
        type:                question.type,
        time_taken_seconds:  timeTaken,
        rewrite_count:       rewriteCount.current,
        tab_switches:        tabSwitchCount.current,
      });

      resetTrackers();

      await submitAnswer(testId, answer);
      const res = await nextQuestion(testId);

      if (res.message === "Test completed") {
        const evaluation = await evaluateSession({
          skill:                 getSkillName(skill),
          level:                 skill?.level || "medium",
          questions_and_answers: sessionAnswers.current,
        });

        localStorage.setItem("result", JSON.stringify(evaluation));
        localStorage.removeItem("question");
        localStorage.removeItem("test_id");
        onSubmit();
        return;
      }

      // Advance to next question
      const nextQ = res.question;
      setQuestion(nextQ);
      setAnswer(getBoilerplate(nextQ, skill)); // empty string for mcq/numerical
      localStorage.setItem("question", JSON.stringify(nextQ));

    } catch (err) {
      console.error(err);
      alert("Something went wrong ❌");
    }

    setLoading(false);
  };

  if (!question) {
    return (
      <div style={{ textAlign: "center", marginTop: 100, color: "var(--color-text-secondary, #888)" }}>
        Loading question...
      </div>
    );
  }

  const diffKey   = (question.difficulty || "medium").toLowerCase();
  const diffColor = DIFFICULTY_COLORS[diffKey] || DIFFICULTY_COLORS.medium;

  return (
    <div style={S.wrap}>

      {/* ── Question card ── */}
      <div style={S.qCard}>
        <div style={S.metaRow}>
          <div style={S.badges}>
            <span style={S.badge(diffColor)}>{question.difficulty || "Medium"}</span>
            <span style={S.badge({ bg: "#EEEDFE", text: "#3C3489", border: "#AFA9EC" })}>
              {getSkillName(skill)}
            </span>
          </div>
          <div>
            <div style={S.timerVal(timeLeft)}>{formatTime(timeLeft)}</div>
            <div style={S.timerLbl}>remaining</div>
          </div>
        </div>

        <h2 style={S.qTitle}>{question.title || question.question}</h2>

        {/* Show body only if there's a separate title */}
        {question.title && (
          <p style={S.qBody}>{question.question}</p>
        )}

        {/* Numbered steps (your friend's pattern) */}
        {Array.isArray(question.steps) && (
          <ol style={{ paddingLeft: 20, color: "var(--color-text-secondary, #ccc)", lineHeight: 1.8, fontSize: 14 }}>
            {question.steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        )}

        {question.bonus && (
          <div style={S.hintBox}>Bonus: {question.bonus}</div>
        )}
      </div>

      {/* ── Answer area — switches by type (your logic) ── */}

      {question.type === "coding" && (
        <div style={S.editorWrap}>
          <div style={S.editorBar}>
            <div style={S.dots}>
              <div style={S.dot("#ff5f57")} />
              <div style={S.dot("#febc2e")} />
              <div style={S.dot("#28c840")} />
            </div>
            <span style={S.langTag}>{getLanguage(skill)}</span>
          </div>
          <Editor
            height="360px"
            language={getLanguage(skill)}
            theme="vs-dark"
            value={answer}
            onChange={handleEditorChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineNumbers: "on",
              padding: { top: 16 },
            }}
          />
        </div>
      )}

      {question.type === "mcq" && (
        <div style={{ marginBottom: 14 }}>
          {question.options?.map((opt, i) => {
            const selected = answer === opt;
            return (
              <div
                key={i}
                style={S.mcqOption(selected)}
                onClick={() => setAnswer(opt)}
              >
                <div style={S.radioCircle(selected)}>
                  {selected && (
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
                  )}
                </div>
                <span>{opt}</span>
              </div>
            );
          })}
        </div>
      )}

      {question.type === "numerical" && (
        <input
          type="text"
          placeholder="Enter your numerical answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          style={S.numInput}
        />
      )}

      {/* ── Monitoring bar (your friend's feature) ── */}
      <div style={S.monitorBar}>
        <div style={S.pulseRow}>
          <div style={S.pulseDot} />
          <span style={S.pulseLbl}>AI monitoring active</span>
        </div>
        <div style={S.stats}>
          {[
            { label: "keystrokes",   value: displayKeystrokes },
            { label: "rewrites",     value: displayRewrites },
            { label: "tab switches", value: displayTabSwitches },
          ].map(({ label, value }) => (
            <div key={label} style={S.statItem}>
              <span style={S.statVal(value > 0)}>{value}</span>
              <span style={S.statKey}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Next button ── */}
      <button onClick={handleNext} disabled={loading} style={S.nextBtn(loading)}>
        {loading ? "Evaluating..." : "Next question →"}
      </button>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.25 } }
      `}</style>
    </div>
  );
}

export default Challenge;