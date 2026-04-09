import axios from "axios";
import React, { useState } from 'react';
import { Card, Input, BtnPrimary } from '../components/ui';

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
     try {
    let response;

    if (isSignup) {
  // 1️⃣ signup
  await axios.post("http://127.0.0.1:8000/api/auth/signup", {
    name: form.name,
    email: form.email,
    password: form.password,
  });

  // 2️⃣ immediately login to get token 🔥
  const response = await axios.post("http://127.0.0.1:8000/api/auth/login", {
    email: form.email,
    password: form.password,
  });

  // 3️⃣ save token
  localStorage.setItem("token", response.data.access_token);
  localStorage.setItem("user", JSON.stringify({
  email: form.email,
  name: form.name
  }));

  // 👉 directly move to profile setup
  onLogin({
    email: form.email,
    name: form.name,
    isNewUser: true   // ⭐ important
  });

  return;
}else {
      // LOGIN
      response = await axios.post("http://127.0.0.1:8000/api/auth/login", {
        email: form.email,
        password: form.password,
      });
    }

    // Save token
    localStorage.setItem("token", response.data.access_token);

    localStorage.setItem("user", JSON.stringify({
      email: form.email,
      name: form.email.split("@")[0]
  }));  

    // Pass user forward
    onLogin({
  email: form.email,
  name: form.email.split("@")[0],
  isNewUser: false   // ⭐ important
});

  } catch (error) {
  console.error(error);

  const msg = error.response?.data?.detail || "Something went wrong";
  setError(msg);
}
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(124,109,248,0.055) 0%, transparent 70%)',
        }}
      />

      <div className="w-full relative" style={{ maxWidth: 400 }}>
        {/* Logo mark */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center rounded-xl text-lg mb-4"
            style={{
              width: 44,
              height: 44,
              background: 'linear-gradient(135deg,#7c6df8,#4a9eff)',
            }}
          >
            ◈
          </div>
          <h1
            className="text-2xl font-black"
            style={{ letterSpacing: '-1px' }}
          >
            {isSignup ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {isSignup
              ? 'Start your skill audit today'
              : 'Sign in to continue your audit'}
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignup && (
              <Input
                label="FULL NAME"
                name="name"
                placeholder="Jane Doe"
                value={form.name || ''}
                onChange={handleChange}
              />
            )}
            <Input
              label="EMAIL"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              label="PASSWORD"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />

            {error && (
              <p
                className="text-xs font-mono px-3 py-2 rounded-lg"
                style={{
                  color: 'var(--red)',
                  background: 'var(--red-dim)',
                  border: '0.5px solid var(--red)',
                }}
              >
                {error}
              </p>
            )}

            <BtnPrimary type="submit" className="w-full mt-1">
              {isSignup ? 'Create account →' : 'Sign in →'}
            </BtnPrimary>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs font-mono" style={{ color: 'var(--dim)' }}>OR</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* OAuth placeholder */}
          <button
            className="w-full py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              border: '0.5px solid var(--border2)',
              color: 'var(--muted)',
              background: 'transparent',
              fontFamily: 'var(--font)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--text)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border2)';
              e.currentTarget.style.color = 'var(--muted)';
            }}
            onClick={handleSubmit}
            type="button"
          >
            <span>G</span> Continue with Google
          </button>
        </Card>

        {/* Toggle */}
        <p className="text-center text-xs mt-5" style={{ color: 'var(--muted)' }}>
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => setIsSignup((v) => !v)}
            className="font-bold underline bg-transparent border-none cursor-pointer"
            style={{ color: 'var(--purple)', fontFamily: 'var(--font)' }}
          >
            {isSignup ? 'Sign in' : 'Sign up free'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
