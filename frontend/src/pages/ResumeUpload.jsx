import React, { useState, useRef } from 'react';
import { StepHeader, BtnPrimary } from '../components/ui';
import { parseResume, parseText } from '../api/api'; // ✅ your fix: separate parseText import

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const TAG_LABELS = { high: 'High claim', med: 'Medium claim', low: 'Low claim' };

const TAG_COLORS = {
  high: { bg: '#FCEBEB', border: '#F09595', color: '#791F1F' },
  med:  { bg: '#FAEEDA', border: '#FAC775', color: '#633806' },
  low:  { bg: '#EAF3DE', border: '#C0DD97', color: '#27500A' },
};

const TABS = ['PDF upload', 'Paste text'];

/* ─────────────────────────────────────────
   TagSelector
───────────────────────────────────────── */
function TagSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
      {['high', 'med', 'low'].map((t) => {
        const active = value === t;
        return (
          <button
            key={t}
            onClick={(e) => { e.stopPropagation(); onChange(t); }}
            style={{
              padding: '3px 10px',
              borderRadius: 20,
              border: `0.5px solid ${active ? TAG_COLORS[t].border : 'var(--color-border-tertiary)'}`,
              background: active ? TAG_COLORS[t].bg : 'transparent',
              color: active ? TAG_COLORS[t].color : 'var(--color-text-secondary)',
              fontSize: 11,
              fontFamily: 'var(--font-mono, monospace)',
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            {TAG_LABELS[t]}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   Shared skill mapper (your logic, DRY'd)
───────────────────────────────────────── */
const mapSkills = (data, sourceLabel = 'resume') =>
  data.all_skills.map((skill) => ({
    name: skill,
    evidence: data.boldest_claims?.includes(skill)
      ? `Strong evidence in ${sourceLabel}`
      : `Mentioned in ${sourceLabel}`,
    tag: data.boldest_claims?.includes(skill) ? 'high' : 'med',
  }));

/* ─────────────────────────────────────────
   ResumeUpload
───────────────────────────────────────── */
function ResumeUpload({ onNext }) {
  const [activeTab, setActiveTab] = useState(0);
  const [file, setFile]           = useState(null);
  const [text, setText]           = useState('');
  const [claims, setClaims]       = useState([]);
  const [parsed, setParsed]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [dragging, setDragging]   = useState(false);
  const fileRef = useRef();

  /* ── Tab switch ── */
  const handleTabSwitch = (i) => {
    setActiveTab(i);
    setParsed(false);
    setClaims([]);
    setError(null);
  };

  /* ── PDF parse (your logic) ── */
  const handleFile = async (f) => {
    if (!f) return;
    if (!f.name.endsWith('.pdf')) {
      setError('Only PDF files are supported.');
      return;
    }
    setFile(f);
    setError(null);
    setLoading(true);
    setParsed(false);
    setClaims([]);

    try {
      const data = await parseResume(f);
      setClaims(mapSkills(data, 'resume'));
      setParsed(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Text parse (your fix: uses parseText, not blob hack) ── */
  const handleParseText = async () => {
    if (text.length < 10) return;
    setError(null);
    setLoading(true);
    setParsed(false);
    setClaims([]);

    try {
      const data = await parseText(text);           // ✅ correct API call
      setClaims(mapSkills(data, 'text'));
      setParsed(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Tag edit ── */
  const handleTagChange = (index, newTag) =>
    setClaims((prev) => prev.map((c, i) => (i === index ? { ...c, tag: newTag } : c)));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleNext = () => onNext({ claims, file: file?.name });

  const canProceed = parsed && claims.length > 0;

  /* ─── Styles ─── */
  const S = {
    wrap: { maxWidth: 860, margin: '0 auto', padding: '3rem 2rem' },
    tab: (active) => ({
      padding: '5px 16px',
      borderRadius: 20,
      border: `0.5px solid ${active ? '#AFA9EC' : 'var(--color-border-tertiary)'}`,
      background: active ? '#EEEDFE' : 'transparent',
      color: active ? '#3C3489' : 'var(--color-text-secondary)',
      fontSize: 13,
      cursor: 'pointer',
      transition: 'all .15s',
    }),
    dropZone: {
      border: `1px dashed ${dragging ? '#7F77DD' : 'var(--color-border-secondary)'}`,
      borderRadius: 16,
      padding: '3rem 2rem',
      textAlign: 'center',
      cursor: 'pointer',
      background: dragging ? '#EEEDFE22' : 'transparent',
      transition: 'all .2s',
      marginBottom: 20,
    },
    textarea: {
      width: '100%',
      padding: '12px 14px',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 8,
      fontSize: 14,
      background: 'var(--color-background-primary)',
      color: 'var(--color-text-primary)',
      resize: 'none',
      outline: 'none',
      fontFamily: 'var(--font-sans, sans-serif)',
      lineHeight: 1.6,
    },
    parseBtn: (disabled) => ({
      marginTop: 10,
      padding: '7px 18px',
      borderRadius: 8,
      border: '0.5px solid var(--color-border-secondary)',
      background: disabled ? 'var(--color-background-secondary)' : 'var(--color-background-primary)',
      color: disabled ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
      fontSize: 13,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    }),
    claimsCard: {
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 20,
    },
    claimsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 18px',
      borderBottom: '0.5px solid var(--color-border-tertiary)',
      background: 'var(--color-background-secondary)',
    },
    mono: { fontSize: 11, fontFamily: 'var(--font-mono, monospace)', letterSpacing: '.1em', color: 'var(--color-text-secondary)' },
    claimsCount: { fontSize: 12, fontFamily: 'var(--font-mono, monospace)', color: '#534AB7' },
    claimsHint: {
      padding: '7px 18px',
      fontSize: 12,
      fontFamily: 'var(--font-mono, monospace)',
      color: 'var(--color-text-secondary)',
      borderBottom: '0.5px solid var(--color-border-tertiary)',
      background: 'var(--color-background-secondary)',
    },
    claimRow: (last) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 18px',
      flexWrap: 'wrap',
      borderBottom: last ? 'none' : '0.5px solid var(--color-border-tertiary)',
    }),
  };

  return (
    <div style={S.wrap}>
      <StepHeader
        step="STEP 01 — PARSE"
        title="Upload your resume"
        subtitle="System reads your resume and extracts every skill claim. You can adjust the confidence level for each skill before proceeding."
      />

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => handleTabSwitch(i)} style={S.tab(activeTab === i)}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── PDF Upload tab ── */}
      {activeTab === 0 && (
        <div
          style={S.dropZone}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {/* Upload icon */}
          <div style={{
            width: 36, height: 36, margin: '0 auto 12px',
            border: '1.5px solid var(--color-border-secondary)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 0, height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderBottom: `10px solid ${dragging ? '#7F77DD' : 'var(--color-text-secondary)'}`,
            }} />
          </div>

          {loading && (
            <p style={{ fontSize: 13, fontFamily: 'var(--font-mono, monospace)', color: '#534AB7' }}>
              Parsing resume...
            </p>
          )}
          {error && (
            <p style={{ fontSize: 12, fontFamily: 'var(--font-mono, monospace)', color: '#A32D2D' }}>
              ✗ {error}
            </p>
          )}
          {file && !loading && !error && (
            <>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#3B6D11', marginBottom: 4 }}>
                ✓ {file.name}
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                {(file.size / 1024).toFixed(1)} KB · Click to replace
              </p>
            </>
          )}
          {!file && !loading && !error && (
            <>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                Drop your resume here
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>PDF only — max 5MB</p>
            </>
          )}
        </div>
      )}

      {/* ── Paste text tab ── */}
      {activeTab === 1 && (
        <div style={{ marginBottom: 20 }}>
          <textarea
            rows={8}
            placeholder="Paste your resume text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={S.textarea}
            onFocus={(e) => (e.target.style.borderColor = '#7F77DD')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--color-border-tertiary)')}
          />
          {text.length > 10 && (
            <button onClick={handleParseText} disabled={loading} style={S.parseBtn(loading)}>
              {loading ? 'Parsing...' : 'Parse text →'}
            </button>
          )}
          {error && (
            <p style={{ fontSize: 12, fontFamily: 'var(--font-mono, monospace)', color: '#A32D2D', marginTop: 8 }}>
              ✗ {error}
            </p>
          )}
        </div>
      )}

      {/* ── Extracted claims table ── */}
      {parsed && claims.length > 0 && (
        <div style={S.claimsCard}>
          <div style={S.claimsHeader}>
            <span style={S.mono}>EXTRACTED CLAIMS</span>
            <span style={S.claimsCount}>{claims.length} skills detected</span>
          </div>
          <div style={S.claimsHint}>
            Adjust confidence level for each skill before proceeding ↓
          </div>
          {claims.map((claim, i) => (
            <div key={claim.name} style={S.claimRow(i === claims.length - 1)}>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', minWidth: 100 }}>
                {claim.name}
              </div>
              <div style={{ flex: 2, fontSize: 12, color: 'var(--color-text-secondary)', minWidth: 120 }}>
                {claim.evidence}
              </div>
              <TagSelector value={claim.tag} onChange={(tag) => handleTagChange(i, tag)} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <BtnPrimary onClick={handleNext} disabled={!canProceed}>
          Build skill map →
        </BtnPrimary>
      </div>
    </div>
  );
}

export default ResumeUpload;