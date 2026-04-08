import React from 'react';

/* ── Button variants ── */
export function BtnPrimary({ children, onClick, className = '', disabled = false, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-7 py-3 rounded-lg text-sm font-bold text-white transition-opacity duration-200 border-none cursor-pointer ${className}`}
      style={{ background: disabled ? 'var(--dim)' : 'var(--purple)', opacity: disabled ? 0.5 : 1 }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}

export function BtnGhost({ children, onClick, className = '', style = {} }) {
  return (
    <button
      onClick={onClick}
      className={`px-7 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${className}`}
      style={{
        background: 'transparent',
        border: '0.5px solid var(--border2)',
        color: 'var(--muted)',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--text)';
        e.currentTarget.style.color = 'var(--text)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border2)';
        e.currentTarget.style.color = 'var(--muted)';
      }}
    >
      {children}
    </button>
  );
}

/* ── Card ── */
export function Card({ children, className = '', style = {} }) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background: 'var(--card)',
        border: '0.5px solid var(--border)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Step header ── */
export function StepHeader({ step, title, subtitle }) {
  return (
    <div className="mb-10">
      <div
        className="text-xs font-mono tracking-widest mb-2"
        style={{ color: 'var(--purple)', letterSpacing: '0.1em' }}
      >
        {step}
      </div>
      <h2
        className="text-4xl font-black"
        style={{ letterSpacing: '-1.5px', lineHeight: 1.1 }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--muted)' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ── Section label ── */
export function SectionLabel({ children }) {
  return (
    <div
      className="text-center text-xs font-mono tracking-widest my-10"
      style={{ color: 'var(--dim)', letterSpacing: '0.2em' }}
    >
      {children}
    </div>
  );
}

/* ── Tag variants ── */
export function Tag({ children, variant = 'high' }) {
  const styles = {
    high: { background: 'rgba(124,109,248,0.133)', color: 'var(--purple)', borderColor: 'var(--purple)' },
    med:  { background: 'rgba(245,166,35,0.094)',  color: 'var(--amber)',  borderColor: 'var(--amber)'  },
    low:  { background: 'rgba(255,90,90,0.094)',   color: 'var(--red)',    borderColor: 'var(--red)'    },
  };
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono"
      style={{ border: '0.5px solid', ...styles[variant] }}
    >
      {children}
    </span>
  );
}

/* ── Input field ── */
export function Input({ label, type = 'text', value, onChange, placeholder, name, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-mono" style={{ color: 'var(--muted)', letterSpacing: '0.05em' }}>
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200"
        style={{
          background: 'var(--surface)',
          border: '0.5px solid var(--border2)',
          color: 'var(--text)',
          fontFamily: 'var(--font)',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--purple)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border2)'; }}
      />
    </div>
  );
}

/* ── Select ── */
export function Select({ label, value, onChange, options, name }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-mono" style={{ color: 'var(--muted)', letterSpacing: '0.05em' }}>
          {label}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200 appearance-none cursor-pointer"
        style={{
          background: 'var(--surface)',
          border: '0.5px solid var(--border2)',
          color: value ? 'var(--text)' : 'var(--muted)',
          fontFamily: 'var(--font)',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--purple)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border2)'; }}
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            style={{ background: 'var(--surface)', color: 'var(--text)' }}
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── Skill bar ── */
export function SkillBar({ label, value, color = 'var(--purple)' }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-mono w-36 flex-shrink-0" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-xs font-mono w-6 text-right" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

/* ── Flag chip ── */
export function Flag({ children, variant = 'warn' }) {
  const styles = {
    warn: { background: 'rgba(245,166,35,0.082)', color: 'var(--amber)', borderColor: 'var(--amber)' },
    bad:  { background: 'rgba(255,90,90,0.082)',  color: 'var(--red)',   borderColor: 'var(--red)'   },
    good: { background: 'rgba(34,201,126,0.094)', color: 'var(--green)', borderColor: 'var(--green)' },
  };
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-mono"
      style={{ border: '0.5px solid', ...styles[variant] }}
    >
      {children}
    </span>
  );
}

/* ── Inline code ── */
export function Code({ children }) {
  return (
    <code
      className="px-1.5 py-0.5 rounded text-xs font-mono"
      style={{ background: 'rgba(255,255,255,0.063)' }}
    >
      {children}
    </code>
  );
}
