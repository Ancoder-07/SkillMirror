import React from 'react';
import { BtnPrimary, BtnGhost, SectionLabel } from '../components/ui';

const FEATURES = [
  {
    color: 'var(--purple)', dimColor: 'var(--purple-dim)', icon: '⬡', badge: 'NEW', badgeStyle: 'purple',
    title: 'Impostor score',
    desc: 'High claim + slow execution + hesitation = flagged. One compound metric that tells the real story.',
  },
  {
    color: 'var(--green)', dimColor: 'var(--green-dim)', icon: '↺', badge: 'NEW', badgeStyle: 'purple',
    title: 'Skill decay tracker',
    desc: 'Re-challenge at 30/60/90 days. Skills fade. We track if improvement is real or confidence-theatre.',
  },
  {
    color: 'var(--amber)', dimColor: 'var(--amber-dim)', icon: '⇡', badge: 'AI', badgeStyle: 'blue',
    title: 'Adaptive difficulty',
    desc: 'Pass L1 in 2 min? Jump to L3 instantly. Fail L1? Drop to diagnostic. AI calibrates in real-time.',
  },
  {
    color: 'var(--red)', dimColor: 'var(--red-dim)', icon: '⬤', badge: 'AI', badgeStyle: 'blue',
    title: 'Plagiarism detection',
    desc: 'Suspiciously clean first drafts, LeetCode patterns, copy-paste timing bursts — all flagged.',
  },
  {
    color: 'var(--purple)', dimColor: 'var(--purple-dim)', icon: '↗', badge: null,
    title: 'Shareable scorecard',
    desc: 'Public verified URL that replaces the self-assessed skills section. Attach to any application.',
  },
  {
    color: 'var(--green)', dimColor: 'var(--green-dim)', icon: '◎', badge: null,
    title: 'Peer benchmarking',
    desc: '"You\'re in the 34th percentile of self-proclaimed Python intermediates." Anonymous cohort data.',
  },
  {
    color: 'var(--amber)', dimColor: 'var(--amber-dim)', icon: '♨', badge: null,
    title: 'Frustration heatmap',
    desc: 'Visualize exactly which lines caused most rewrites, rage-deletes, and pauses during your session.',
  },
  {
    color: 'var(--red)', dimColor: 'var(--red-dim)', icon: '⟳', badge: null,
    title: 'Learning path',
    desc: 'Post-test AI generates a personalized roadmap targeting your exact weak spots. Brutal but useful.',
  },
];

function FeatureCard({ feat }) {
  const badgeColors = {
    purple: { background: 'rgba(124,109,248,0.125)', color: 'var(--purple)', border: '0.5px solid var(--purple)' },
    blue:   { background: 'rgba(74,158,255,0.094)',  color: 'var(--blue)',   border: '0.5px solid var(--blue)'   },
  };

  return (
    <div
      className="relative rounded-xl p-5 overflow-hidden"
      style={{ background: 'var(--card)', border: '0.5px solid var(--border)' }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: feat.color }}
      />

      {/* Badge */}
      {feat.badge && (
        <span
          className="absolute top-4 right-4 text-xs font-mono font-bold px-2 py-0.5 rounded"
          style={badgeColors[feat.badgeStyle]}
        >
          {feat.badge}
        </span>
      )}

      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm mb-3"
        style={{ background: feat.dimColor, color: feat.color }}
      >
        {feat.icon}
      </div>

      <h3 className="text-sm font-bold mb-1">{feat.title}</h3>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
        {feat.desc}
      </p>
    </div>
  );
}

function Landing({ onStart, onDemo }) {
  return (
    <div>
      {/* Hero */}
      <div
        className="relative text-center overflow-hidden px-8 pt-20 pb-12"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,109,248,0.082) 0%, transparent 70%)',
        }}
      >
        {/* Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-mono mb-6"
          style={{ border: '0.5px solid var(--border2)', color: 'var(--muted)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse2"
            style={{ background: 'var(--green)' }}
          />
          ai-powered skill auditor · beta
        </div>

        {/* Headline */}
        <h1
          className="font-black leading-none mb-4"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-2px' }}
        >
          Stop lying on
          <br />
          your <span style={{ color: 'var(--purple)' }}>resume.</span>
        </h1>

        <p
          className="text-base leading-relaxed mb-10 mx-auto"
          style={{ color: 'var(--muted)', maxWidth: 540 }}
        >
          Skill Mirror intercepts your boldest claims and forces you to prove them — in real-time.
          No chatbots. No hints. Just execution.
        </p>

        {/* CTA */}
        <div className="flex gap-3 justify-center flex-wrap">
          <BtnPrimary onClick={onStart}>Upload my resume →</BtnPrimary>
          <BtnGhost onClick={onDemo}>See a live challenge</BtnGhost>
        </div>

        {/* Stats strip */}
        <div
          className="grid grid-cols-3 mx-auto mt-12 overflow-hidden rounded-xl"
          style={{
            maxWidth: 560,
            border: '0.5px solid var(--border)',
            background: 'var(--border)',
            gap: 1,
          }}
        >
          {[
            { num: '73%',   label: 'avg illusion gap',   color: 'var(--purple)' },
            { num: '12k+',  label: 'resumes audited',    color: 'var(--green)'  },
            { num: '4.2min',label: 'avg session',        color: 'var(--amber)'  },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center py-5"
              style={{ background: 'var(--surface)' }}
            >
              <div
                className="text-3xl font-black"
                style={{ color: s.color, letterSpacing: '-1px' }}
              >
                {s.num}
              </div>
              <div
                className="text-xs font-mono mt-0.5"
                style={{ color: 'var(--muted)' }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <SectionLabel>CORE FEATURES</SectionLabel>
      <div
        className="grid gap-3 px-8 mx-auto pb-16"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          maxWidth: 1000,
        }}
      >
        {FEATURES.map((feat) => (
          <FeatureCard key={feat.title} feat={feat} />
        ))}
      </div>
    </div>
  );
}

export default Landing;
