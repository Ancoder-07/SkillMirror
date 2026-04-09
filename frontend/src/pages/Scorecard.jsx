import React, { useEffect, useState } from "react";

function Scorecard({ onRestart }) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const storedResult = localStorage.getItem("result");

    if (!storedResult) {
      console.error("No result found ❌");
      return;
    }

    try {
      const parsed = JSON.parse(storedResult);
      console.log("Result:", parsed);
      setResult(parsed);
    } catch (err) {
      console.error("Invalid result JSON ❌", err);
    }
  }, []);

  if (!result) {
    return <p style={{ textAlign: "center" }}>Loading result...</p>;
  }

  // ✅ SAFE FALLBACKS
  const score = result.score ?? 0;
  const verdict = result.verdict ?? "Not Evaluated";

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "40px" }}>
      
      <h1 style={{ textAlign: "center" }}>🎯 Skill Mirror Result</h1>

      {/* BASIC INFO */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Skill: {result.skill || "N/A"}</h2>
        <h3>Final Score: {score}/100</h3>
        <p><strong>Verdict:</strong> {verdict}</p>
      </div>

      {/* ⚠️ SHOW MESSAGE IF EMPTY RESULT */}
      {!result.correctness && (
        <p style={{ color: "orange" }}>
          ⚠️ Evaluation incomplete. Try submitting proper code.
        </p>
      )}

      {/* DETAILS */}
      <div
        style={{
          border: "1px solid #444",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "15px",
        }}
      >
        <h3>Evaluation Details</h3>

        <p><strong>Correctness:</strong> {result.correctness || "N/A"}</p>
        <p><strong>Efficiency:</strong> {result.efficiency || "N/A"}</p>
        <p><strong>Edge Cases:</strong> {result.edge_cases || "N/A"}</p>
        <p><strong>Code Quality:</strong> {result.code_quality || "N/A"}</p>

        <p><strong>Confidence:</strong> {result.confidence_flag || "N/A"}</p>

        {/* STRENGTHS */}
        <div>
          <strong>Strengths:</strong>
          <ul>
            {(result.strengths || []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        {/* WEAKNESSES */}
        <div>
          <strong>Weaknesses:</strong>
          <ul>
            {(result.weaknesses || []).map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>

        {/* NEXT STEPS */}
        <div>
          <strong>Next Steps:</strong>
          <ul>
            {(result.next_steps || []).map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>

        <p>
          <strong>Impostor Flag:</strong>{" "}
          {result.impostor_flag ? "⚠️ Yes" : "✅ No"}
        </p>
      </div>

      {/* RESTART */}
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button
          onClick={onRestart}
          style={{
            padding: "10px 20px",
            background: "purple",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🔄 Test Another Skill
        </button>
      </div>
    </div>
  );
}

export default Scorecard;