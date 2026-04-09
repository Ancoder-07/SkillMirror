import React, { useState, useEffect } from "react";
import { Card, StepHeader, BtnPrimary } from "../components/ui";
import { startTest } from "../api/api";

function SkillSelection({ onSelect }) {
  const [skills, setSkills] = useState([]);
  const [selected, setSelected] = useState(null);

  // ✅ LOAD SKILLS FROM LOCAL STORAGE (SAFE)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("skills");

      if (!stored) {
        console.error("No skills in localStorage ❌");
        return;
      }

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        console.error("Invalid skills format ❌");
        return;
      }

      const formatted = parsed.map((s, i) => ({
        id: i,
        label: s,
      }));

      setSkills(formatted);
    } catch (err) {
      console.error("Error loading skills ❌", err);
    }
  }, []);

  // ✅ START TEST
  const handleStart = async () => {
    const skill = skills.find((s) => s.id === selected);

    if (!skill) return;

    try {
      const res = await startTest(skill.label, "medium");

      console.log("START TEST RESPONSE:", res);

      // ❌ safety check
      if (!res || !res.test_id || !res.question) {
        alert("Backend error ❌");
        return;
      }

      // ✅ STORE DATA
      localStorage.setItem("test_id", res.test_id);
      localStorage.setItem("question", JSON.stringify(res.question));

      // ✅ NAVIGATE
      onSelect(skill.label);

    } catch (err) {
      console.error(err);
      alert("Failed to start test ❌");
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 2rem" }}>
      <StepHeader
        step="STEP 02 — SKILL MAP"
        title="Select skill for test"
        subtitle="Choose one skill to begin the challenge"
      />

      {/* SKILLS */}
      <Card className="p-6">
        {skills.length === 0 ? (
          <p>No skills found ❌</p>
        ) : (
          skills.map((skill) => (
            <button
              key={skill.id}
              onClick={() => setSelected(skill.id)}
              style={{
                display: "block",
                width: "100%",
                margin: "10px 0",
                padding: "10px",
                border:
                  selected === skill.id
                    ? "2px solid purple"
                    : "1px solid gray",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {skill.label}
            </button>
          ))
        )}
      </Card>

      {/* START BUTTON */}
      <div style={{ marginTop: "20px", textAlign: "right" }}>
        <BtnPrimary onClick={handleStart} disabled={selected === null}>
          Start Test →
        </BtnPrimary>
      </div>
    </div>
  );
}

export default SkillSelection;