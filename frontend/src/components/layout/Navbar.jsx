import React from 'react';

function Navbar({ page, showAuthNav, navigate, user, onLogout, PAGES, NAV_STEPS }) {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-8"
      style={{
        height: 52,
        background: 'rgba(10,10,11,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid var(--border)',
      }}
    >
      {/* Logo */}
      <button
        onClick={() => navigate(PAGES.LANDING)}
        className="flex items-center gap-2 font-black tracking-tight text-sm cursor-pointer bg-transparent border-none"
        style={{ color: 'var(--text)', letterSpacing: '-0.5px' }}
      >
        <div
          className="flex items-center justify-center text-xs rounded-md"
          style={{
            width: 26,
            height: 26,
            background: 'linear-gradient(135deg,#7c6df8,#4a9eff)',
          }}
        >
          ◈
        </div>
        SKILL MIRROR
      </button>

      {/* Step pills — shown only on workflow pages */}
      {showAuthNav && (
        <div className="flex gap-1">
          {NAV_STEPS.map((step) => (
            <button
              key={step.key}
              onClick={() => navigate(step.key)}
              className="px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer"
              style={
                page === step.key
                  ? {
                      background: 'var(--purple)',
                      color: '#fff',
                      borderColor: 'var(--purple)',
                    }
                  : {
                      background: 'transparent',
                      color: 'var(--muted)',
                      borderColor: 'transparent',
                    }
              }
            >
              {step.label}
            </button>
          ))}
        </div>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {user ? (
  <div
    className="flex items-center gap-3 text-xs font-mono"
    style={{ color: 'var(--muted)' }}
  >
    {/* Avatar */}
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
      style={{
        background: 'var(--purple-dim)',
        color: 'var(--purple)',
        border: '0.5px solid var(--purple)'
      }}
    >
      {user.name ? user.name[0].toUpperCase() : 'U'}
    </div>

    {/* Name */}
    {user.name || user.email}

    {/* 🔥 LOGOUT BUTTON */}
    <button
      onClick={onLogout}
      className="text-xs px-2 py-1 rounded"
      style={{
        border: '0.5px solid var(--border)',
        cursor: 'pointer'
      }}
    >
      Logout
    </button>
  </div> ): page !== PAGES.LANDING && page !== PAGES.LOGIN ? null : (
          page === PAGES.LANDING && (
            <button
              onClick={() => navigate(PAGES.LOGIN)}
              className="text-xs font-medium transition-colors duration-200"
              style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--text)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--muted)')}
            >
              Sign in →
            </button>
          )
        )}
      </div>
    </nav>
  );
}

export default Navbar;