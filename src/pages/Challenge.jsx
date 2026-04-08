import React, { useState, useEffect, useRef } from 'react';
import { Card, Code, BtnPrimary, StepHeader } from '../components/ui';

const CHALLENGE = {
  title: 'SMS fraud classifier — data pipeline',
  difficulty: 'Hard',
  tag: 'Python + Pandas',
  time: 20 * 60, // 20 min in seconds
  description: (
    <>
      You are given a CSV with columns <Code>message</Code> and <Code>label</Code> (spam/ham).
      Write a Python function <Code>preprocess(df)</Code> that:
    </>
  ),
  requirements: [
    'Drops null rows',
    'Converts label to binary (spam=1, ham=0)',
    <>Adds a column <Code>msg_length</Code> (character count)</>,
    'Returns a cleaned DataFrame',
  ],
  bonus: 'Bonus: handle edge case where label column has mixed casing (e.g. "Spam", "SPAM")',
  starterCode: `import pandas as pd\n\ndef preprocess(df):\n    # your code here\n    pass`,
};

function MonacoPlaceholder({ code, onChange }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#0d1117', border: '0.5px solid var(--border)' }}
    >
      {/* IDE title bar */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{ background: '#161b22', borderBottom: '0.5px solid var(--border)' }}
      >
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
        <span className="text-xs font-mono ml-1.5" style={{ color: 'var(--muted)' }}>
          solution.py
        </span>
        <span
          className="ml-auto text-xs font-mono px-2 py-0.5 rounded"
          style={{ background: 'var(--purple-dim)', color: 'var(--purple)', border: '0.5px solid var(--purple)' }}
        >
          Python 3.11
        </span>
      </div>

      {/* Monaco placeholder */}
      <div className="relative" style={{ minHeight: 280 }}>
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full p-5 resize-none outline-none text-xs leading-7"
          style={{
            background: '#0d1117',
            color: '#e6edf3',
            fontFamily: "'JetBrains Mono', monospace",
            minHeight: 280,
            caretColor: '#7c6df8',
          }}
          spellCheck={false}
        />
        {/* Monaco placeholder overlay (shown when textarea is empty) */}
        <div
          className="absolute top-4 right-4 text-xs font-mono px-2 py-1 rounded pointer-events-none"
          style={{
            background: 'rgba(124,109,248,0.063)',
            border: '0.5px solid rgba(124,109,248,0.3)',
            color: 'var(--dim)',
          }}
        >
          Monaco Editor placeholder
        </div>
      </div>
    </div>
  );
}

function Timer({ seconds }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds < 5 * 60;
  return (
    <div className="text-right">
      <div
        className="text-2xl font-black font-mono"
        style={{ color: isLow ? 'var(--red)' : 'var(--amber)', letterSpacing: '-1px' }}
      >
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
        remaining
      </div>
    </div>
  );
}

function Challenge({ skill, onSubmit }) {
  const [code, setCode] = useState(CHALLENGE.starterCode);
  const [timeLeft, setTimeLeft] = useState(CHALLENGE.time);
  const [stats, setStats] = useState({ keystrokes: 0, rewrites: 0, tabSwitches: 0 });
  const [running, setRunning] = useState(false);
  const [testOutput, setTestOutput] = useState('');
  const prevCode = useRef(code);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(interval); onSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onSubmit]);

  // Track tab switches
  useEffect(() => {
    const onBlur = () => setStats((s) => ({ ...s, tabSwitches: s.tabSwitches + 1 }));
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, []);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setStats((s) => ({ ...s, keystrokes: s.keystrokes + 1 }));
    // Naive rewrite detection: detect if user deleted >10 chars
    if (prevCode.current.length - newCode.length > 10) {
      setStats((s) => ({ ...s, rewrites: s.rewrites + 1 }));
    }
    prevCode.current = newCode;
  };

  const handleRun = () => {
    setRunning(true);
    setTestOutput('');
    setTimeout(() => {
      setRunning(false);
      setTestOutput(
        code.includes('dropna')
          ? '✓ Test 1 passed: dropna() called\n✓ Test 2 passed: label mapping found\n✗ Test 3 failed: msg_length column missing'
          : '✗ Test 1 failed: no null handling found\n✗ Test 2 failed: label not mapped\n✗ Test 3 failed: msg_length column missing'
      );
    }, 1200);
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 2rem' }}>
      <StepHeader
        step={`STEP 03 — CHALLENGE · ${skill?.label || 'Python + Pandas'}`}
        title="Prove it."
        subtitle="No hints. No AI chat. Just the problem and the editor. The AI watches silently and tracks every keystroke."
      />

      {/* Problem card */}
      <Card
        className="p-5 mb-5 flex flex-wrap justify-between gap-4"
        style={{ border: '0.5px solid var(--purple)' }}
      >
        <div className="flex-1" style={{ minWidth: 260 }}>
          {/* Tags */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <span
              className="px-3 py-0.5 rounded-full text-xs font-bold font-mono"
              style={{ background: 'var(--red-dim)', color: 'var(--red)', border: '0.5px solid var(--red)' }}
            >
              {CHALLENGE.difficulty}
            </span>
            <span
              className="px-3 py-0.5 rounded-full text-xs font-bold font-mono"
              style={{ background: 'var(--purple-dim)', color: 'var(--purple)', border: '0.5px solid var(--purple)' }}
            >
              {skill?.tag || CHALLENGE.tag}
            </span>
          </div>

          <h3 className="text-base font-black mb-2" style={{ letterSpacing: '-0.5px' }}>
            {CHALLENGE.title}
          </h3>
          <p className="text-xs leading-7" style={{ color: 'var(--muted)' }}>
            {CHALLENGE.description}
          </p>

          {/* Requirements */}
          <ol className="mt-3 flex flex-col gap-1" style={{ counterReset: 'req' }}>
            {CHALLENGE.requirements.map((req, i) => (
              <li
                key={i}
                className="text-xs pl-5 relative"
                style={{ color: 'var(--muted)', counterIncrement: 'req' }}
              >
                <span
                  className="absolute left-0 font-mono font-bold text-xs"
                  style={{ color: 'var(--purple)' }}
                >
                  {i + 1}.
                </span>
                {req}
              </li>
            ))}
          </ol>

          {/* Bonus */}
          <div
            className="mt-3 text-xs font-mono px-3 py-2 rounded-lg"
            style={{
              color: 'var(--dim)',
              background: 'var(--surface)',
              borderLeft: '2px solid var(--amber)',
            }}
          >
            {CHALLENGE.bonus}
          </div>
        </div>

        <Timer seconds={timeLeft} />
      </Card>

      {/* Editor */}
      <MonacoPlaceholder code={code} onChange={handleCodeChange} />

      {/* Test output */}
      {testOutput && (
        <div
          className="mt-3 px-4 py-3 rounded-lg text-xs font-mono leading-6 animate-fade-in"
          style={{ background: '#0d1117', border: '0.5px solid var(--border)', color: '#e6edf3' }}
        >
          {testOutput.split('\n').map((line, i) => (
            <div
              key={i}
              style={{ color: line.startsWith('✓') ? 'var(--green)' : 'var(--red)' }}
            >
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Monitoring bar */}
      <div
        className="flex items-center gap-3 flex-wrap mt-3 px-4 py-3 rounded-xl"
        style={{ background: 'var(--card)', border: '0.5px solid var(--border)' }}
      >
        <div
          className="w-2 h-2 rounded-full animate-pulse2"
          style={{ background: 'var(--green)' }}
        />
        <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
          AI monitoring silently
        </span>
        <div className="flex gap-4 ml-auto flex-wrap">
          {[
            { label: 'keystrokes', val: stats.keystrokes },
            { label: 'rewrites',   val: stats.rewrites   },
            { label: 'tab-switches', val: stats.tabSwitches },
          ].map((s) => (
            <span key={s.label} className="text-xs font-mono" style={{ color: 'var(--dim)' }}>
              {s.label} <span style={{ color: 'var(--amber)' }}>{s.val}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={handleRun}
          disabled={running}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
          style={{
            border: '0.5px solid var(--border2)',
            background: 'transparent',
            color: running ? 'var(--dim)' : 'var(--text)',
            fontFamily: 'var(--font)',
          }}
        >
          {running ? 'Running...' : 'Run tests'}
        </button>
        <BtnPrimary onClick={onSubmit}>Submit →</BtnPrimary>
      </div>
    </div>
  );
}

export default Challenge;
