import React, { useState } from "react";
import { StepHeader, BtnPrimary } from "../components/ui";
import { startTest } from "../api/api";

const TAG_COLORS = {
  high: { bg: '#ff444422', border: '#ff4444', color: '#ff6666' },
  med:  { bg: '#ffaa0022', border: '#ffaa00', color: '#ffcc44' },
  low:  { bg: '#44ff8822', border: '#44ff88', color: '#44ffaa' },
};

const TAG_LABELS = {
  high: 'High claim',
  med:  'Medium claim',
  low:  'Low claim',
};

function SkillSelection({ resumeData, onSelect }) {
  const [selected, setSelected] = useState(null); // stores index

  // ✅ Read claims directly from resumeData prop
  const claims = resumeData?.claims || [];

  const handleStart = async () => {
    if (selected === null) return;

    const claim = claims[selected];
    if (!claim) return;

    // Map tag to level
    const levelMap = { high: "hard", med: "medium", low: "easy" };
    const level = levelMap[claim.tag] || "medium";

    try {
      const res = await startTest(claim.name, level);

      console.log("START TEST RESPONSE:", res);

      if (!res || !res.test_id || !res.question) {
        alert("Backend error ❌");
        return;
      }

      localStorage.setItem("test_id", res.test_id);
      localStorage.setItem("question", JSON.stringify(res.question));

      // ✅ Pass full skill info: name + level
      onSelect({ label: claim.name, level });

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

      {/* Skills list */}
      <div style={{
        background: 'var(--card)',
        border: '0.5px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '0.5px solid var(--border)',
          background: 'var(--surface)',
        }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font)', color: 'var(--dim)', letterSpacing: '0.12em' }}>
            SKILL
          </span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font)', color: 'var(--purple)' }}>
            {claims.length} skills detected
          </span>
        </div>

        {claims.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--dim)', fontFamily: 'var(--font)', fontSize: '13px' }}>
            No skills found ❌ — go back and upload your resume
          </div>
        ) : (
          claims.map((claim, i) => (
            <div
              key={claim.name}
              onClick={() => setSelected(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 20px',
                gap: '16px',
                borderBottom: i < claims.length - 1 ? '0.5px solid var(--border)' : 'none',
                cursor: 'pointer',
                background: selected === i ? 'var(--purple-dim)' : 'transparent',
                borderLeft: selected === i ? '2px solid var(--purple)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {/* Radio dot */}
              <div style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: selected === i ? '2px solid var(--purple)' : '2px solid var(--border)',
                background: selected === i ? 'var(--purple)' : 'transparent',
                flexShrink: 0,
                transition: 'all 0.15s',
              }} />

              {/* Skill name */}
              <div style={{ flex: 1, fontSize: '14px', fontWeight: '700' }}>
                {claim.name}
              </div>

              {/* Evidence */}
              <div style={{ flex: 2, fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font)' }}>
                {claim.evidence}
              </div>

              {/* Tag badge */}
              <span style={{
                background: TAG_COLORS[claim.tag]?.bg,
                border: `0.5px solid ${TAG_COLORS[claim.tag]?.border}`,
                color: TAG_COLORS[claim.tag]?.color,
                padding: '3px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontFamily: 'var(--font)',
                fontWeight: '600',
                whiteSpace: 'nowrap',
              }}>
                {TAG_LABELS[claim.tag]}
              </span>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <BtnPrimary onClick={handleStart} disabled={selected === null}>
          Start Test →
        </BtnPrimary>
      </div>
    </div>
  );
}

export default SkillSelection;