import React, { useState, useRef } from 'react';
import { StepHeader, BtnPrimary } from '../components/ui';
import { parseResume } from "../api/api";

const TAG_LABELS = { high: 'High claim', med: 'Medium claim', low: 'Low claim' };
const TAG_STYLES = {
  high: {
    active:   { bg: 'rgba(226,75,74,0.12)',  border: '#E24B4A', color: '#E24B4A' },
    inactive: { bg: 'transparent',            border: 'var(--border)', color: 'var(--dim)' },
  },
  med: {
    active:   { bg: 'rgba(239,159,39,0.12)', border: '#EF9F27', color: '#EF9F27' },
    inactive: { bg: 'transparent',            border: 'var(--border)', color: 'var(--dim)' },
  },
  low: {
    active:   { bg: 'rgba(99,153,34,0.12)',  border: '#639922', color: '#639922' },
    inactive: { bg: 'transparent',            border: 'var(--border)', color: 'var(--dim)' },
  },
};

const TABS = ['PDF upload', 'Paste text'];

function TagSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {['high', 'med', 'low'].map((t) => {
        const active = value === t;
        const s = active ? TAG_STYLES[t].active : TAG_STYLES[t].inactive;
        return (
          <button
            key={t}
            onClick={(e) => { e.stopPropagation(); onChange(t); }}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontFamily: 'var(--font)',
              fontWeight: active ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: s.bg,
              border: `0.5px solid ${s.border}`,
              color: s.color,
              whiteSpace: 'nowrap',
            }}
          >
            {active ? '✓ ' : ''}{TAG_LABELS[t]}
          </button>
        );
      })}
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

  const handleFile = async (f) => {
    if (!f) return;
    if (!f.name.endsWith('.pdf')) { setError('Only PDF files are supported.'); return; }
    setFile(f); setError(null); setLoading(true); setParsed(false); setClaims([]);
    try {
      const data = await parseResume(f);
      const mapped = data.all_skills.map((skill) => ({
        name: skill,
        evidence: data.boldest_claims?.includes(skill) ? 'Strong evidence in resume' : 'Mentioned in resume',
        tag: data.boldest_claims?.includes(skill) ? 'high' : 'med',
      }));
      setClaims(mapped); setParsed(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleParseText = async () => {
    if (text.length < 50) return;
    setError(null); setLoading(true); setParsed(false); setClaims([]);
    try {
      const blob = new Blob([text], { type: 'application/pdf' });
      const textFile = new File([blob], 'resume.txt', { type: 'text/plain' });
      const data = await parseResume(textFile);
      const mapped = data.all_skills.map((skill) => ({
        name: skill,
        evidence: data.boldest_claims?.includes(skill) ? 'Strong evidence in resume' : 'Mentioned in resume',
        tag: data.boldest_claims?.includes(skill) ? 'high' : 'med',
      }));
      setClaims(mapped); setParsed(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleTagChange = (index, newTag) => {
    setClaims((prev) => prev.map((c, i) => (i === index ? { ...c, tag: newTag } : c)));
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleNext = () => onNext({ claims, file: file?.name });
  const canProceed = parsed && claims.length > 0;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 2rem' }}>
      <StepHeader
        step="STEP 01 — PARSE"
        title="Upload your resume"
        subtitle="System reads your resume and extracts every skill claim. You can adjust the confidence level for each skill before proceeding."
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(i); setParsed(false); setClaims([]); setError(null); }}
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'var(--font)',
              fontWeight: activeTab === i ? 600 : 400,
              background: activeTab === i ? 'var(--purple-dim)' : 'transparent',
              border: activeTab === i ? '0.5px solid var(--purple)' : '0.5px solid var(--border)',
              color: activeTab === i ? 'var(--text)' : 'var(--muted)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* PDF Upload Tab */}
      {activeTab === 0 && (
        <div
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `1.5px dashed ${dragging ? 'var(--purple)' : file && !error ? '#639922' : 'var(--border2)'}`,
            borderRadius: 16,
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'var(--purple-dim)' : 'var(--surface)',
            transition: 'all 0.2s',
            marginBottom: 24,
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {/* Upload icon */}
          {!file && !loading && (
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'var(--purple-dim)',
              border: '0.5px solid var(--purple)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, marginBottom: 16,
            }}>
              ⬆
            </div>
          )}

          {loading && (
            <div style={{ marginBottom: 8 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '2px solid var(--purple-dim)',
                borderTop: '2px solid var(--purple)',
                display: 'inline-block',
                animation: 'spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ color: 'var(--purple)', fontSize: 12, fontFamily: 'monospace', marginTop: 12 }}>
                Parsing resume...
              </p>
            </div>
          )}

          {error && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(226,75,74,0.10)',
              border: '0.5px solid #E24B4A',
              borderRadius: 8, padding: '8px 16px',
              color: '#E24B4A', fontSize: 12, fontFamily: 'monospace',
            }}>
              ✗ {error}
            </div>
          )}

          {file && !loading && !error && (
            <>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(99,153,34,0.12)',
                border: '0.5px solid #639922',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, marginBottom: 12,
              }}>
                ✓
              </div>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#639922', margin: '0 0 4px' }}>
                {file.name}
              </p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                {(file.size / 1024).toFixed(1)} KB · Click to replace
              </p>
            </>
          )}

          {!file && !loading && (
            <>
              <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>
                Drop your resume here
              </p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                PDF only — max 5MB
              </p>
            </>
          )}
        </div>
      )}

      {/* Paste Text Tab */}
      {activeTab === 1 && (
        <div style={{ marginBottom: 24 }}>
          <textarea
            placeholder="Paste your resume text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 10,
              fontSize: 13,
              outline: 'none',
              resize: 'vertical',
              background: 'var(--surface)',
              border: '0.5px solid var(--border2)',
              color: 'var(--text)',
              fontFamily: 'var(--font)',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--purple)')}
            onBlur={(e)  => (e.target.style.borderColor = 'var(--border2)')}
          />
          {text.length > 50 && (
            <button
              onClick={handleParseText}
              disabled={loading}
              style={{
                marginTop: 10,
                padding: '8px 20px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none',
                fontFamily: 'var(--font)',
                background: loading ? 'var(--surface)' : 'var(--purple)',
                color: loading ? 'var(--dim)' : '#fff',
                transition: 'opacity 0.15s',
              }}
            >
              {loading ? 'Parsing...' : 'Parse text →'}
            </button>
          )}
          {error && (
            <p style={{
              marginTop: 8, fontSize: 12, fontFamily: 'monospace',
              color: '#E24B4A',
            }}>
              ✗ {error}
            </p>
          )}
        </div>
      )}

      {/* Extracted Claims Table */}
      {parsed && claims.length > 0 && (
        <div style={{
          borderRadius: 12,
          overflow: 'hidden',
          border: '0.5px solid var(--border)',
          background: 'var(--card)',
          marginBottom: 24,
        }}>
          {/* Table Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderBottom: '0.5px solid var(--border)',
            background: 'var(--surface)',
          }}>
            <span style={{
              fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.12em',
              color: 'var(--dim)', textTransform: 'uppercase',
            }}>
              Extracted Claims
            </span>
            <span style={{
              fontSize: 11, fontFamily: 'monospace',
              color: 'var(--purple)', fontWeight: 600,
            }}>
              {claims.length} skills detected
            </span>
          </div>

          {/* Instruction hint */}
          <div style={{
            padding: '8px 20px',
            fontSize: 11,
            fontFamily: 'monospace',
            color: 'var(--dim)',
            borderBottom: '0.5px solid var(--border)',
            background: 'var(--surface)',
            letterSpacing: '0.02em',
          }}>
            Adjust confidence level for each skill before proceeding ↓
          </div>

          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr auto',
            padding: '8px 20px',
            borderBottom: '0.5px solid var(--border)',
            background: 'var(--surface)',
            gap: 16,
          }}>
            {['Skill', 'Evidence', 'Confidence'].map((h) => (
              <span key={h} style={{
                fontSize: 10, fontFamily: 'monospace',
                color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {claims.map((claim, i) => (
            <div
              key={claim.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr auto',
                alignItems: 'center',
                padding: '12px 20px',
                gap: 16,
                borderBottom: i < claims.length - 1 ? '0.5px solid var(--border)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 13, fontWeight: 700 }}>{claim.name}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{claim.evidence}</span>
              <TagSelector value={claim.tag} onChange={(t) => handleTagChange(i, t)} />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!parsed && !loading && (
        <div style={{
          textAlign: 'center', fontSize: 12,
          fontFamily: 'monospace', color: 'var(--dim)',
          padding: '24px 0',
        }}>
          Upload a resume to see extracted skill claims
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <BtnPrimary onClick={handleNext} disabled={!canProceed}>
          Build skill map →
        </BtnPrimary>
      </div>
    </div>
  );
}

export default ResumeUpload;