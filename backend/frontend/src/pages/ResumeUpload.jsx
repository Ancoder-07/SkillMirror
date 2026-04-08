import React, { useState, useRef } from 'react';
import { Card, StepHeader, Tag, BtnPrimary } from '../components/ui';

const DEMO_CLAIMS = [
  { name: 'Python',                 evidence: 'used in ML project, listed primary',       tag: 'high' },
  { name: 'C++',                    evidence: 'listed first, DSA in C++',                  tag: 'high' },
  { name: 'JavaScript',             evidence: 'used in NGO project',                       tag: 'med'  },
  { name: 'NumPy / Pandas',         evidence: 'listed in both skills + project',           tag: 'high' },
  { name: 'HTML / CSS / Bootstrap', evidence: 'project-backed',                            tag: 'med'  },
  { name: 'Data Structures & Algo', evidence: '"CS Fundamentals" section',                 tag: 'high' },
  { name: 'Machine Learning',       evidence: 'group project, preprocessing + training',   tag: 'med'  },
];

const TAG_LABELS = { high: 'High claim', med: 'Medium claim', low: 'Low claim' };

const TABS = ['PDF upload', 'LinkedIn URL', 'Paste text'];

function ResumeUpload({ onNext }) {
  const [activeTab, setActiveTab] = useState(0);
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    // Simulate parsing delay
    setTimeout(() => setParsed(true), 800);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const canProceed = parsed || (activeTab === 1 && url) || (activeTab === 2 && text.length > 50);

  const simulateParse = () => {
    setParsed(true);
  };

  const handleNext = () => {
    onNext({ claims: DEMO_CLAIMS, file: file?.name });
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 2rem' }}>
      <StepHeader
        step="STEP 01 — PARSE"
        title="Upload your resume"
        subtitle="System reads your resume and extracts every skill claim, ranking confidence based on language cues — 'led', 'built' vs 'familiar with', 'exposure to'."
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(i); setParsed(false); }}
            className="px-4 py-1.5 rounded-lg text-xs cursor-pointer transition-all duration-200"
            style={
              activeTab === i
                ? {
                    background: 'var(--purple-dim)',
                    border: '0.5px solid var(--purple)',
                    color: 'var(--text)',
                    fontFamily: 'var(--font)',
                  }
                : {
                    border: '0.5px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--muted)',
                    fontFamily: 'var(--font)',
                  }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
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
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div className="text-3xl mb-3">⬆</div>
          {file ? (
            <>
              <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--green)' }}>
                ✓ {file.name}
              </h3>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {(file.size / 1024).toFixed(1)} KB · Click to replace
              </p>
            </>
          ) : (
            <>
              <h3 className="text-sm font-bold mb-1">Drop your resume here</h3>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                PDF, DOCX, or TXT — max 5MB
              </p>
            </>
          )}
        </div>
      )}

      {activeTab === 1 && (
        <div className="mb-6">
          <input
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--surface)',
              border: '0.5px solid var(--border2)',
              color: 'var(--text)',
              fontFamily: 'var(--font)',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--purple)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
          />
          {url && (
            <button
              onClick={simulateParse}
              className="mt-3 px-5 py-2 rounded-lg text-xs font-bold cursor-pointer"
              style={{ background: 'var(--purple)', color: '#fff', border: 'none', fontFamily: 'var(--font)' }}
            >
              Parse LinkedIn →
            </button>
          )}
        </div>
      )}

      {activeTab === 2 && (
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
              onClick={simulateParse}
              className="mt-3 px-5 py-2 rounded-lg text-xs font-bold cursor-pointer"
              style={{ background: 'var(--purple)', color: '#fff', border: 'none', fontFamily: 'var(--font)' }}
            >
              Parse text →
            </button>
          )}
        </div>
      )}

      {/* Extracted claims */}
      {(parsed || canProceed) && (
        <div
          className="rounded-xl overflow-hidden animate-fade-in"
          style={{ background: 'var(--card)', border: '0.5px solid var(--border)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: '0.5px solid var(--border)' }}
          >
            <span
              className="text-xs font-mono tracking-widest"
              style={{ color: 'var(--dim)', letterSpacing: '0.12em' }}
            >
              EXTRACTED CLAIMS
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--purple)' }}>
              {DEMO_CLAIMS.length} skills detected
            </span>
          </div>

          {DEMO_CLAIMS.map((claim, i) => (
            <div
              key={claim.name}
              className="flex items-center px-5 py-3.5 gap-4"
              style={{
                borderBottom: i < DEMO_CLAIMS.length - 1 ? '0.5px solid var(--border)' : 'none',
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div className="flex-1 text-sm font-bold">{claim.name}</div>
              <div className="flex-2 text-xs" style={{ color: 'var(--muted)', flex: 2 }}>
                {claim.evidence}
              </div>
              <Tag variant={claim.tag}>{TAG_LABELS[claim.tag]}</Tag>
            </div>
          ))}
        </div>
      )}

      {!parsed && !canProceed && (
        <div
          className="text-center text-xs font-mono py-4"
          style={{ color: 'var(--dim)' }}
        >
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
