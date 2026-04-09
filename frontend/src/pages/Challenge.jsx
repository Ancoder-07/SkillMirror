import React, { useEffect, useState } from "react";
import { nextQuestion, submitAnswer } from "../api/api";
import Editor from "@monaco-editor/react";

function Challenge({ skill, onSubmit }) {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [testId, setTestId] = useState(null);

  // ✅ LOAD FIRST QUESTION
  useEffect(() => {
    const storedTestId = localStorage.getItem("test_id");
    const storedQuestionRaw = localStorage.getItem("question");

    if (!storedTestId || !storedQuestionRaw) {
      console.error("Missing test data ❌");
      return;
    }

    try {
      const parsedQuestion = JSON.parse(storedQuestionRaw);
      setTestId(storedTestId);
      setQuestion(parsedQuestion);
    } catch (err) {
      console.error("Invalid JSON ❌", err);
    }
  }, []);

  // ✅ HANDLE SKILL SAFELY
  const getLanguage = (skill) => {
    const skillName =
      typeof skill === "string"
        ? skill
        : skill?.label || skill?.name || "";

    const s = skillName.toLowerCase();

    if (s.includes("python")) return "python";
    if (s.includes("java")) return "java";
    if (s.includes("c++")) return "cpp";
    if (s.includes("javascript")) return "javascript";

    return "javascript";
  };

  // ✅ NEXT BUTTON
  const handleNext = async () => {
    if (!answer.trim()) {
      alert("Write answer first!");
      return;
    }

    setLoading(true);

    try {
      // 🔥 Submit Answer
      await submitAnswer(testId, answer);

      // 🔥 Get Next Question
      const res = await nextQuestion(testId);

      if (res.message === "Test completed") {
        alert("Test Completed 🎉");
        onSubmit();
        return;
      }

      setQuestion(res.question);
      localStorage.setItem("question", JSON.stringify(res.question));
      setAnswer("");

    } catch (err) {
      console.error(err);
      alert("Something went wrong ❌");
    }

    setLoading(false);
  };

  if (!question) {
    return <p style={{ textAlign: "center" }}>Loading question...</p>;
  }

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "40px" }}>
      
      {/* HEADER */}
      <h2 style={{ marginBottom: "20px" }}>
        🧠 {typeof skill === "string" ? skill : skill?.label || "Test"}
      </h2>

      {/* QUESTION */}
      <div
        style={{
          border: "1px solid #444",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
          background: "#111",
        }}
      >
        <h3>Q{question.id || 1}:</h3>
        <p>{question.question}</p>
        <small>Difficulty: {question.difficulty}</small>
      </div>

      {/* CODE EDITOR */}
      <Editor
        height="400px"
        language={getLanguage(skill)}
        theme="vs-dark"
        value={answer || "\n\n# Write your code here\n"}
        onChange={(value) => setAnswer(value || "")}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />

      {/* BUTTON */}
      <button
        onClick={handleNext}
        disabled={loading}
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          background: "#6a0dad",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {loading ? "Loading..." : "Next →"}
      </button>
    </div>
  );
}

export default Challenge;