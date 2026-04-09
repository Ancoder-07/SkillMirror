import axios from 'axios';
import React, { useState } from 'react';
import { Card, Input, Select, BtnPrimary, StepHeader } from '../components/ui';

const ROLES = [
  { value: '', label: 'Select your role...' },
  { value: 'sde', label: 'Software Engineer' },
  { value: 'frontend', label: 'Frontend Developer' },
  { value: 'backend', label: 'Backend Developer' },
  { value: 'fullstack', label: 'Full Stack Developer' },
  { value: 'ml', label: 'ML / AI Engineer' },
  { value: 'data', label: 'Data Scientist / Analyst' },
  { value: 'devops', label: 'DevOps / SRE' },
  { value: 'other', label: 'Other' },
];

const EXPERIENCE = [
  { value: '', label: 'Years of experience...' },
  { value: 'student', label: 'Student / Fresher' },
  { value: '1-2', label: '1–2 years' },
  { value: '3-5', label: '3–5 years' },
  { value: '6-10', label: '6–10 years' },
  { value: '10+', label: '10+ years' },
];

const GOALS = [
  { id: 'job', label: 'Prepare for interviews' },
  { id: 'verify', label: 'Verify my own skills' },
  { id: 'gap', label: 'Find skill gaps' },
  { id: 'share', label: 'Get a shareable scorecard' },
  { id: 'learn', label: 'Build a learning roadmap' },
];

function ProfileSetup({ onSave, user }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    role: '',
    experience: '',
    goals: [],
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleGoal = (id) => {
    setForm((prev) => ({
      ...prev,
      goals: prev.goals.includes(id)
        ? prev.goals.filter((g) => g !== id)
        : [...prev.goals, id],
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');

      await axios.post(
        'http://127.0.0.1:8000/api/profile/setup',
        {
          email: user.email,
          name: form.name,
          role: form.role,
          experience: form.experience,
          goals: form.goals,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage('✅ Profile saved successfully!');
      setError('');

      setTimeout(() => {
        onSave(form);
      }, 1500);

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detail || 'Error saving profile';
      setError(msg);
      setMessage('');
    }
  };

  const isValid = form.name && form.role && form.experience;

  return (
    <div className="min-h-screen" style={{ maxWidth: 640, margin: '0 auto', padding: '3rem 2rem' }}>
      <StepHeader
        step="PROFILE SETUP"
        title="Tell us about you."
        subtitle="This shapes the difficulty calibration and challenge selection. Honest answers = better results."
      />

      <div className="flex flex-col gap-5">
        <Card className="p-6 flex flex-col gap-5">
          <Input
            label="DISPLAY NAME"
            name="name"
            placeholder="How should we address you?"
            value={form.name}
            onChange={handleChange}
          />
          <Select
            label="ROLE / TITLE"
            name="role"
            value={form.role}
            onChange={handleChange}
            options={ROLES}
          />
          <Select
            label="EXPERIENCE"
            name="experience"
            value={form.experience}
            onChange={handleChange}
            options={EXPERIENCE}
          />
        </Card>

        {/* Goals */}
        <Card className="p-6">
          <div
            className="text-xs font-mono tracking-widest mb-4"
            style={{ color: 'var(--dim)', letterSpacing: '0.12em' }}
          >
            WHAT ARE YOU HERE FOR? (select all that apply)
          </div>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => {
              const active = form.goals.includes(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
                  style={
                    active
                      ? {
                          background: 'var(--purple-dim)',
                          border: '0.5px solid var(--purple)',
                          color: 'var(--text)',
                          fontFamily: 'var(--font)',
                        }
                      : {
                          background: 'transparent',
                          border: '0.5px solid var(--border)',
                          color: 'var(--muted)',
                          fontFamily: 'var(--font)',
                        }
                  }
                >
                  {active ? '✓ ' : ''}{g.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Privacy note */}
        <div
          className="text-xs font-mono px-4 py-3 rounded-lg"
          style={{
            color: 'var(--dim)',
            background: 'var(--surface)',
            border: '0.5px solid var(--border)',
            borderLeft: '2px solid var(--purple)',
          }}
        >
          Your profile is used only for calibration. We never share identifiable data with recruiters
          unless you explicitly generate a public scorecard link.
        </div>

        {/* ✅ Success message */}
        {message && (
          <p
            className="text-xs font-mono px-3 py-2 rounded-lg"
            style={{
              color: '#22c55e',
              background: 'rgba(34,197,94,0.08)',
              border: '0.5px solid #22c55e',
            }}
          >
            {message}
          </p>
        )}

        {/* ❌ Error message */}
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

        <div className="flex justify-end">
          <BtnPrimary onClick={handleSubmit} disabled={!isValid}>
            Continue to resume upload →
          </BtnPrimary>
        </div>
      </div>
    </div>
  );
}

export default ProfileSetup;