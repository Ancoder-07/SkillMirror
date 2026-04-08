import React, { useState, useEffect } from 'react';
import { Card, StepHeader, SkillBar, BtnPrimary } from '../components/ui';

const SKILL_DATA = [
  { id: 'python',    label: 'Python',         value: 90, color: 'var(--purple)', difficulty: 'Hard',   time: '20 min' },
  { id: 'cpp',       label: 'C++ / DSA',      value: 85, color: 'var(--purple)', difficulty: 'Hard',   time: '25 min' },
  { id: 'pandas',    label: 'NumPy / Pandas', value: 80, color: 'var(--purple)', difficulty: 'Medium', time: '15 min' },
  { id: 'js',        label: 'JavaScript',     value: 70, color: 'var(--amber)',  difficulty: 'Medium', time: '15 min' },
  { id: 'ml',        label: 'Machine Learning',value: 75, color: 'var(--amber)',  difficulty: 'Hard',   time: '30 min' },
  { id: 'html',      label: 'HTML / CSS',     value: 65, color: 'var(--green)',  difficulty: 'Easy',   time: '10 min' },
];

const RADAR_POINTS = [
  { label: 'Python', x: 110, y: 20,  cx: 110, cy: 32 },
  { label: 'C++',    x: 208, y: 70,  cx: 192, cy: 80 },
  { label: 'JS',     x: 208, y: 152, cx: 186, cy: 140 },
  { label: 'ML',     x: 110, y: 214, cx: 110, cy: 188 },
  { label: 'DSA',    x: 4,   y: 152, cx: 34,  cy: 140 },
  { label: 'Pandas', x: 4,   y: 70,  cx: 28,  cy: 80 },
];

function RadarChart() {
  return (
    <svg width="220" height="220" viewBox="0 0 220 220">
      <style>{`.axis-text{font-family:'JetBrains Mono',monospace;font-size:9px;fill:#666}`}</style>
      {/* Grid polygons */}
      <polygon points="110,20 200,72 200,148 110,200 20,148 20,72" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <polygon points="110,48 181,86 181,134 110,172 39,134 39,86" fill="none" stroke="rgba(255,255,255,0.063)" strokeWidth="1"/>
      <polygon points="110,76 162,100 162,120 110,144 58,120 58,100" fill="none" stroke="rgba(255,255,255,0.047)" strokeWidth="1"/>
      {/* Axes */}
      <line x1="110" y1="20" x2="110" y2="200" stroke="rgba(255,255,255,0.047)" strokeWidth="1"/>
      <line x1="20"  y1="72" x2="200" y2="148" stroke="rgba(255,255,255,0.047)" strokeWidth="1"/>
      <line x1="20"  y1="148" x2="200" y2="72" stroke="rgba(255,255,255,0.047)" strokeWidth="1"/>
      {/* Claimed polygon */}
      <polygon
        points="110,32 192,80 186,140 110,188 34,140 28,80"
        fill="rgba(124,109,248,0.125)"
        stroke="#7c6df8"
        strokeWidth="1.5"
        opacity="0.8"
      />
      {/* Actual polygon (smaller) */}
      <polygon
        points="110,55 171,94 168,128 110,158 52,128 48,94"
        fill="rgba(34,201,126,0.125)"
        stroke="#22c97e"
        strokeWidth="1.5"
        opacity="0.8"
      />
      {/* Labels */}
      {RADAR_POINTS.map((p) => (
        <text key={p.label} x={p.x} y={p.y} textAnchor="middle" className="axis-text">
          {p.label}
        </text>
      ))}
    </svg>
  );
}

function SkillSelection({ resumeData, onSelect }) {
  const [selected, setSelected] = useState(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const handleSelect = (skill) => {
    setSelected(skill.id);
  };

  const handleStart = () => {
    const skill = SKILL_DATA.find((s) => s.id === selected);
    onSelect(skill);
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 2rem' }}>
      <StepHeader
        step="STEP 02 — SKILL MAP"
        title="Your confidence map"
        subtitle="NLP ranks each claim by evidence strength. This becomes the baseline 'claimed' score to compare against execution."
      />

      {/* Radar + Legend */}
      <Card className="p-8 flex flex-wrap items-center gap-12 mb-6">
        <RadarChart />

        <div className="flex flex-col gap-4 flex-1" style={{ minWidth: 220 }}>
          {/* Legend */}
          <div className="flex flex-col gap-2">
            {[
              { color: 'var(--purple)', label: 'Claimed (resume)' },
              { color: 'var(--green)',  label: 'Actual (post-test)' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>

          {/* Biggest gap */}
          <div>
            <div className="text-xs font-mono mb-2" style={{ color: 'var(--dim)', letterSpacing: '0.1em' }}>
              BIGGEST GAP PREDICTED
            </div>
            <div
              className="p-3 rounded-lg"
              style={{
                background: 'var(--red-dim)',
                border: '0.5px solid var(--red)',
                maxWidth: 200,
              }}
            >
              <div className="text-xs font-bold" style={{ color: 'var(--red)' }}>DSA / C++</div>
              <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--muted)' }}>
                High claim, group project context
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Skill bars */}
      <div className="flex flex-col gap-3 mb-6">
        {SKILL_DATA.map((skill, i) => (
          <div key={skill.id} style={{ animationDelay: `${i * 80}ms` }}>
            <SkillBar
              label={skill.label}
              value={animated ? skill.value : 0}
              color={skill.color}
            />
          </div>
        ))}
      </div>

      {/* Select which skill to be challenged on */}
      <Card className="p-6">
        <div
          className="text-xs font-mono tracking-widest mb-4"
          style={{ color: 'var(--dim)', letterSpacing: '0.12em' }}
        >
          SELECT SKILL TO BE CHALLENGED ON
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
          {SKILL_DATA.map((skill) => (
            <button
              key={skill.id}
              onClick={() => handleSelect(skill)}
              className="p-3 rounded-lg text-left transition-all duration-200 cursor-pointer"
              style={
                selected === skill.id
                  ? {
                      background: 'var(--purple-dim)',
                      border: '0.5px solid var(--purple)',
                      fontFamily: 'var(--font)',
                    }
                  : {
                      background: 'transparent',
                      border: '0.5px solid var(--border)',
                      fontFamily: 'var(--font)',
                    }
              }
            >
              <div
                className="text-xs font-bold mb-1"
                style={{ color: selected === skill.id ? 'var(--text)' : 'var(--muted)' }}
              >
                {skill.label}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs font-mono px-1.5 py-0.5 rounded"
                  style={{
                    background:
                      skill.difficulty === 'Hard' ? 'var(--red-dim)' :
                      skill.difficulty === 'Medium' ? 'var(--amber-dim)' : 'var(--green-dim)',
                    color:
                      skill.difficulty === 'Hard' ? 'var(--red)' :
                      skill.difficulty === 'Medium' ? 'var(--amber)' : 'var(--green)',
                  }}
                >
                  {skill.difficulty}
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--dim)' }}>
                  {skill.time}
                </span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="flex justify-end mt-5">
        <BtnPrimary onClick={handleStart} disabled={!selected}>
          Start challenge →
        </BtnPrimary>
      </div>
    </div>
  );
}

export default SkillSelection;
