import { useEffect } from "react";
import React, { useState } from 'react';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import ResumeUpload from './pages/ResumeUpload';
import SkillSelection from './pages/SkillSelection';
import Challenge from './pages/Challenge';
import Scorecard from './pages/Scorecard';

// Pages: 'landing' | 'login' | 'profile' | 'resume' | 'skills' | 'challenge' | 'scorecard'
export const PAGES = {
  LANDING: 'landing',
  LOGIN: 'login',
  PROFILE: 'profile',
  RESUME: 'resume',
  SKILLS: 'skills',
  CHALLENGE: 'challenge',
  SCORECARD: 'scorecard',
};

// Nav steps config (for the top pill nav, shown after login)
export const NAV_STEPS = [
  { key: PAGES.RESUME,    label: '1. Parse' },
  { key: PAGES.SKILLS,   label: '2. Skill map' },
  { key: PAGES.CHALLENGE, label: '3. Challenge' },
  { key: PAGES.SCORECARD, label: '4. Results' },
];



function App() {
  const [page, setPage] = useState(PAGES.LANDING);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);

  useEffect(() => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (token && userData) {
    setUser(JSON.parse(userData));

    // 👉 stay logged in after refresh
    setPage(PAGES.RESUME);
  } else {
    setPage(PAGES.LANDING);
  }
}, []);

  const navigate = (target) => {
    setPage(target);
    window.scrollTo(0, 0);
  };

const handleLogin = (userData) => {
  setUser(userData);

  if (userData.isNewUser) {
    navigate(PAGES.PROFILE);   // ✅ go to profile after signup
  } else {
    navigate(PAGES.RESUME);    // ✅ go to next step after login
  }
};

  const handleProfileSave = (profileData) => {
    setProfile(profileData);
    navigate(PAGES.RESUME);
  };

  const handleResumeParsed = (data) => {
    setResumeData(data);
    navigate(PAGES.SKILLS);
  };

  const handleSkillSelected = (skill) => {
    setSelectedSkill(skill);
    navigate(PAGES.CHALLENGE);
  };

  const handleChallengeSubmit = () => {
    navigate(PAGES.SCORECARD);
  };

  const showAuthNav = [PAGES.RESUME, PAGES.SKILLS, PAGES.CHALLENGE, PAGES.SCORECARD].includes(page);

  const renderPage = () => {
    switch (page) {
      case PAGES.LANDING:
        return <Landing onStart={() => navigate(PAGES.LOGIN)} onDemo={() => navigate(PAGES.CHALLENGE)} />;
      case PAGES.LOGIN:
        return <Login onLogin={handleLogin} />;
      case PAGES.PROFILE:
        return <ProfileSetup onSave={handleProfileSave} user={user} />;
      case PAGES.RESUME:
        return <ResumeUpload onNext={handleResumeParsed} />;
      case PAGES.SKILLS:
        return <SkillSelection resumeData={resumeData} onSelect={handleSkillSelected} />;
      case PAGES.CHALLENGE:
        return <Challenge skill={selectedSkill} onSubmit={handleChallengeSubmit} />;
      case PAGES.SCORECARD:
        return <Scorecard skill={selectedSkill} onRestart={() => navigate(PAGES.LANDING)} />;
      default:
        return <Landing onStart={() => navigate(PAGES.LOGIN)} />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar
        page={page}
        showAuthNav={showAuthNav}
        navigate={navigate}
        user={user}
        PAGES={PAGES}
        NAV_STEPS={NAV_STEPS}
      />
      <main className="animate-fade-in" key={page}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
