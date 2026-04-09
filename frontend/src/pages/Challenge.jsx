import React, { useEffect, useState, useRef } from "react";
import { nextQuestion, submitAnswer, evaluateSession } from "../api/api";
import Editor from "@monaco-editor/react";

function Challenge({ skill, onSubmit }) {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [testId, setTestId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 min per question

  // Live display counters
  const [displayKeystrokes, setDisplayKeystrokes] = useState(0);
  const [displayRewrites, setDisplayRewrites] = useState(0);
  const [displayTabSwitches, setDisplayTabSwitches] = useState(0);

  // Behavioural refs
  const sessionAnswers = useRef([]);
  const questionStartTime = useRef(Date.now());
  const tabSwitchCount = useRef(0);
  const rewriteCount = useRef(0);
  const keystrokeCount = useRef(0);
  const lastAnswerLength = useRef(0);

  // ✅ LOAD FIRST QUESTION
  useEffect(() => {
    const storedTestId = localStorage.getItem("test_id");
    const storedQuestionRaw = localStorage.getItem("question");
    if (!storedTestId || !storedQuestionRaw) return;
    try {
      const parsedQuestion = JSON.parse(storedQuestionRaw);
      setTestId(storedTestId);
      setQuestion(parsedQuestion);
      setAnswer(getBoilerplate(parsedQuestion, skill));
      questionStartTime.current = Date.now();
    } catch (err) {
      console.error("Invalid JSON ❌", err);
    }
  }, []);

  // ✅ Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [question]);

  // ✅ Tab switch tracking
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

  // ✅ Boilerplate based on question
  const getBoilerplate = (q, skill) => {
    const lang = getLanguage(skill);
    if (lang === "python") {
      return `import pandas as pd\n\ndef solution():\n    # your code here\n    pass\n`;
    }
    if (lang === "java") {
      return `public class Solution {\n    public static void main(String[] args) {\n        // your code here\n    }\n}\n`;
    }
    if (lang === "cpp") {
      return `#include <iostream>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}\n`;
    }
    return `function solution() {\n  // your code here\n}\n`;
  };

  // ✅ Editor change handler
  const handleAnswerChange = (value) => {
    const newVal = value || "";
    const currentLen = newVal.length;
    const prevLen = lastAnswerLength.current;

    keystrokeCount.current += 1;
    setDisplayKeystrokes(keystrokeCount.current);

    if (prevLen - currentLen > 30) {
      rewriteCount.current += 1;
      setDisplayRewrites(rewriteCount.current);
    }

    lastAnswerLength.current = currentLen;
    setAnswer(newVal);
  };

  const getLanguage = (skill) => {
    const s = (typeof skill === "string" ? skill : skill?.label || skill?.name || "").toLowerCase();
    if (s.includes("python")) return "python";
    if (s.includes("java")) return "java";
    if (s.includes("c++")) return "cpp";
    if (s.includes("javascript")) return "javascript";
    return "python";
  };

  const getSkillName = () =>
    typeof skill === "string" ? skill : skill?.label || skill?.name || "unknown";

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ✅ NEXT BUTTON
  const handleNext = async () => {
    if (!answer.trim()) {
      alert("Write answer first!");
      return;
    }
    setLoading(true);

    try {
      const timeTaken = Math.floor((Date.now() - questionStartTime.current) / 1000);

      sessionAnswers.current.push({
        question: question.question,
        user_code: answer,
        time_taken_seconds: timeTaken,
        rewrite_count: rewriteCount.current,
        tab_switches: tabSwitchCount.current,
      });

      // Reset trackers
      questionStartTime.current = Date.now();
      tabSwitchCount.current = 0;
      rewriteCount.current = 0;
      keystrokeCount.current = 0;
      lastAnswerLength.current = 0;
      setDisplayKeystrokes(0);
      setDisplayRewrites(0);
      setDisplayTabSwitches(0);
      setTimeLeft(20 * 60);

      await submitAnswer(testId, answer);
      const res = await nextQuestion(testId);

      if (res.message === "Test completed") {
        const evaluation = await evaluateSession({
          skill: getSkillName(),
          level: skill?.level || "medium",
          evaluation_type: "code",
          questions_and_answers: sessionAnswers.current,
        });

        localStorage.setItem("result", JSON.stringify(evaluation));
        localStorage.removeItem("question");
        localStorage.removeItem("test_id");
        onSubmit();
        return;
      }

      setQuestion(res.question);
      setAnswer(getBoilerplate(res.question, skill));
      localStorage.setItem("question", JSON.stringify(res.question));

    } catch (err) {
      console.error(err);
      alert("Something went wrong ❌");
    }

    setLoading(false);
  };

  if (!question) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", color: "#fff" }}>
        Loading question...
      </div>
    );
  }

  const timerColor = timeLeft < 60 ? "#ff4444" : timeLeft < 300 ? "#ffaa00" : "#f0a500";

  return (
    <div style={{
      maxWidth: "900px",
      margin: "auto",
      padding: "30px 20px",
      fontFamily: "'Inter', sans-serif",
      color: "#fff",
    }}>

      {/* ── QUESTION CARD ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f0f1a, #1a1a2e)",
        border: "1px solid #2a2a4a",
        borderRadius: "16px",
        padding: "28px 32px",
        marginBottom: "16px",
        position: "relative",
      }}>
        {/* Badges + Timer row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            {/* Difficulty badge */}
            <span style={{
              background: question.difficulty?.toLowerCase() === "hard" ? "#ff444422" : question.difficulty?.toLowerCase() === "medium" ? "#ffaa0022" : "#44ff8822",
              color: question.difficulty?.toLowerCase() === "hard" ? "#ff6666" : question.difficulty?.toLowerCase() === "medium" ? "#ffcc44" : "#44ffaa",
              border: `1px solid ${question.difficulty?.toLowerCase() === "hard" ? "#ff4444" : question.difficulty?.toLowerCase() === "medium" ? "#ffaa00" : "#44ff88"}`,
              padding: "4px 14px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "600",
            }}>
              {question.difficulty || "Medium"}
            </span>
            {/* Skill badge */}
            <span style={{
              background: "#6a0dad22",
              color: "#bb88ff",
              border: "1px solid #6a0dad",
              padding: "4px 14px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "600",
            }}>
              {getSkillName()}
            </span>
          </div>

          {/* Timer */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "32px", fontWeight: "800", color: timerColor, lineHeight: 1 }}>
              {formatTime(timeLeft)}
            </div>
            <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>remaining</div>
          </div>
        </div>

        {/* Question title */}
        <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "12px", color: "#fff" }}>
          {question.title || `Q${question.id || 1}`}
        </h2>

        {/* Question body — render numbered list if array, else paragraph */}
        {Array.isArray(question.steps) ? (
          <ol style={{ paddingLeft: "20px", color: "#ccc", lineHeight: "1.8" }}>
            {question.steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        ) : (
          <p style={{ color: "#ccc", lineHeight: "1.7", marginBottom: "12px" }}>
            {question.question}
          </p>
        )}

        {/* Bonus hint */}
        {question.bonus && (
          <div style={{
            marginTop: "16px",
            background: "#ffffff08",
            borderLeft: "3px solid #6a0dad",
            padding: "10px 16px",
            borderRadius: "6px",
            color: "#aaa",
            fontSize: "13px",
            fontFamily: "monospace",
          }}>
            Bonus: {question.bonus}
          </div>
        )}
      </div>

      {/* ── EDITOR ── */}
      <div style={{
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #2a2a4a",
        marginBottom: "16px",
      }}>
        {/* Editor top bar */}
        <div style={{
          background: "#1e1e2e",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #2a2a4a",
        }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
            
          </div>
        </div>

        <Editor
          height="380px"
          language={getLanguage(skill)}
          theme="vs-dark"
          value={answer}
          onChange={handleAnswerChange}
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

      {/* ── MONITORING BAR ── */}
      <div style={{
        background: "#0f0f1a",
        border: "1px solid #2a2a4a",
        borderRadius: "12px",
        padding: "14px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#44ff88",
            boxShadow: "0 0 6px #44ff88",
            animation: "pulse 2s infinite",
          }} />
          <span style={{ color: "#888", fontSize: "13px" }}>AI monitoring silently</span>
        </div>

        <div style={{ display: "flex", gap: "28px" }}>
          {[
            { label: "keystrokes", value: displayKeystrokes },
            { label: "rewrites", value: displayRewrites },
            { label: "tab-switches", value: displayTabSwitches },
          ].map(({ label, value }) => (
            <div key={label} style={{ fontSize: "13px", color: "#666" }}>
              {label}{" "}
              <span style={{
                color: value > 0 ? "#ff6b6b" : "#fff",
                fontWeight: "700",
                fontSize: "15px",
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── NEXT BUTTON ── */}
      <button
        onClick={handleNext}
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px",
          background: loading ? "#333" : "linear-gradient(135deg, #6a0dad, #9b30ff)",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "700",
          fontSize: "16px",
          letterSpacing: "0.5px",
          transition: "opacity 0.2s",
        }}
      >
        {loading ? "Evaluating..." : "Next →"}
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

export default Challenge;