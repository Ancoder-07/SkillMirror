import React, { useState, useRef } from 'react';
import { StepHeader, BtnPrimary } from '../components/ui';
import { parseResume } from "../api/api";

const TAG_LABELS = { high: 'High claim', med: 'Medium claim', low: 'Low claim' };
const TAG_COLORS = {
  high: { bg: 'var(--red-dim)',    border: 'var(--red)',    color: 'var(--red)'    },
  med:  { bg: 'var(--amber-dim)',  border: 'var(--amber)',  color: 'var(--amber)'  },
  low:  { bg: 'var(--green-dim)',  border: 'var(--green)',  color: 'var(--green)'  },
};

const TABS = ['PDF upload', 'Paste text'];

function TagSelector({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {['high', 'med', 'low'].map((t) => (
        <button
          key={t}
          onClick={(e) => { e.stopPropagation(); onChange(t); }}
          className="px-2 py-0.5 rounded text-xs font-mono cursor-pointer transition-all duration-150"
          style={
            value === t
              ? {
                  background: TAG_COLORS[t].bg,
                  border: `0.5px solid ${TAG_COLORS[t].border}`,
                  color: TAG_COLORS[t].color,
                  fontFamily: 'var(--font)',
                }
              : {
                  background: 'transparent',
                  border: '0.5px solid var(--border)',
                  color: 'var(--dim)',
                  fontFamily: 'var(--font)',
                }
          }
        >
          {TAG_LABELS[t]}
        </button>
      ))}
    </div>
  );
}

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

  // ── Call backend to parse PDF ──────────────────────────
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

      // Map backend all_skills array into claim objects
      // boldest_claims from backend → high, rest → med
      const mapped = data.all_skills.map((skill) => ({
        name: skill,
        evidence: data.boldest_claims?.includes(skill)
          ? 'Strong evidence in resume'
          : 'Mentioned in resume',
        tag: data.boldest_claims?.includes(skill) ? 'high' : 'med',
      }));

      setClaims(mapped);
      setParsed(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Parse pasted text ──────────────────────────────────
  const handleParseText = async () => {
    if (text.length < 50) return;
    setError(null);
    setLoading(true);
    setParsed(false);
    setClaims([]);

    try {
      // Convert text to a blob so we can send it as a file
      const blob = new Blob([text], { type: 'application/pdf' });
      const textFile = new File([blob], 'resume.txt', { type: 'text/plain' });
      const data = await parseResume(textFile);

      const mapped = data.all_skills.map((skill) => ({
        name: skill,
        evidence: data.boldest_claims?.includes(skill)
          ? 'Strong evidence in resume'
          : 'Mentioned in resume',
        tag: data.boldest_claims?.includes(skill) ? 'high' : 'med',
      }));

      setClaims(mapped);
      setParsed(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── User manually changes a tag ────────────────────────
  const handleTagChange = (index, newTag) => {
    setClaims((prev) =>
      prev.map((c, i) => (i === index ? { ...c, tag: newTag } : c))
    );
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleNext = () => {
    onNext({ claims, file: file?.name });
  };

  const canProceed = parsed && claims.length > 0;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 2rem' }}>
      <StepHeader
        step="STEP 01 — PARSE"
        title="Upload your resume"
        subtitle="System reads your resume and extracts every skill claim. You can adjust the confidence level for each skill before proceeding."
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(i);
              setParsed(false);
              setClaims([]);
              setError(null);
            }}
            className="px-4 py-1.5 rounded-lg text-xs cursor-pointer transition-all duration-200"
            style={
              activeTab === i
                ? { background: 'var(--purple-dim)', border: '0.5px solid var(--purple)', color: 'var(--text)', fontFamily: 'var(--font)' }
                : { border: '0.5px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontFamily: 'var(--font)' }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── PDF Upload Tab ── */}
      {activeTab === 0 && (
        <div
          className="rounded-2xl text-center cursor-pointer transition-all duration-200 mb-6"
          style={{
            border: `1px dashed ${dragging ? 'var(--purple)' : 'var(--border2)'}`,
            padding: '3rem 2rem',
            background: dragging ? 'var(--purple-dim)' : 'transparent',
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div className="text-3xl mb-3">⬆</div>

          {loading && (
            <p className="text-xs font-mono" style={{ color: 'var(--purple)' }}>
              Parsing resume...
            </p>
          )}
          {error && (
            <p className="text-xs font-mono" style={{ color: 'var(--red)' }}>
              ✗ {error}
            </p>
          )}
          {file && !loading && !error && (
            <>
              <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--green)' }}>
                ✓ {file.name}
              </h3>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {(file.size / 1024).toFixed(1)} KB · Click to replace
              </p>
            </>
          )}
          {!file && !loading && (
            <>
              <h3 className="text-sm font-bold mb-1">Drop your resume here</h3>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>PDF only — max 5MB</p>
            </>
          )}
        </div>
      )}

      {/* ── Paste Text Tab ── */}
      {activeTab === 1 && (
        <div className="mb-6">
          <textarea
            placeholder="Paste your resume text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none"
            style={{
              background: 'var(--surface)',
              border: '0.5px solid var(--border2)',
              color: 'var(--text)',
              fontFamily: 'var(--font)',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--purple)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
          />
          {text.length > 50 && (
            <button
              onClick={handleParseText}
              disabled={loading}
              className="mt-3 px-5 py-2 rounded-lg text-xs font-bold cursor-pointer"
              style={{
                background: loading ? 'var(--surface)' : 'var(--purple)',
                color: loading ? 'var(--dim)' : '#fff',
                border: 'none',
                fontFamily: 'var(--font)',
              }}
            >
              {loading ? 'Parsing...' : 'Parse text →'}
            </button>
          )}
          {error && (
            <p className="text-xs font-mono mt-2" style={{ color: 'var(--red)' }}>
              ✗ {error}
            </p>
          )}
        </div>
      )}

      {/* ── Extracted Claims Table ── */}
      {parsed && claims.length > 0 && (
        <div
          className="rounded-xl overflow-hidden animate-fade-in"
          style={{ background: 'var(--card)', border: '0.5px solid var(--border)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: '0.5px solid var(--border)' }}
          >
            <span className="text-xs font-mono" style={{ color: 'var(--dim)', letterSpacing: '0.12em' }}>
              EXTRACTED CLAIMS
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--purple)' }}>
              {claims.length} skills detected
            </span>
          </div>

          {/* instruction hint */}
          <div
            className="px-5 py-2 text-xs font-mono"
            style={{ color: 'var(--dim)', borderBottom: '0.5px solid var(--border)', background: 'var(--surface)' }}
          >
            Adjust confidence level for each skill before proceeding ↓
          </div>

          {claims.map((claim, i) => (
            <div
              key={claim.name}
              className="flex items-center px-5 py-3.5 gap-4 flex-wrap"
              style={{
                borderBottom: i < claims.length - 1 ? '0.5px solid var(--border)' : 'none',
              }}
            >
              {/* Skill name */}
              <div className="flex-1 text-sm font-bold" style={{ minWidth: 120 }}>
                {claim.name}
              </div>

              {/* Evidence */}
              <div className="text-xs" style={{ color: 'var(--muted)', flex: 2, minWidth: 140 }}>
                {claim.evidence}
              </div>

              {/* Tag selector — user can change this */}
              <TagSelector
                value={claim.tag}
                onChange={(newTag) => handleTagChange(i, newTag)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!parsed && !loading && (
        <div className="text-center text-xs font-mono py-4" style={{ color: 'var(--dim)' }}>
          Upload a resume to see extracted skill claims
        </div>
      )}

      <div className="flex justify-end mt-5">
        <BtnPrimary onClick={handleNext} disabled={!canProceed}>
          Build skill map →
        </BtnPrimary>
      </div>
    </div>
  );
}

export default ResumeUpload;