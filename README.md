# Skill Mirror — Frontend

AI-powered technical skill auditor. Upload your resume, get challenged, get exposed.

## Stack

- **React 18** (JavaScript, no TypeScript)
- **Tailwind CSS 3**
- **Custom CSS variables** for the dark theme

## Quick start

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Project structure

```
skill-mirror/
├── public/
│   └── index.html               # Google Fonts (Syne + JetBrains Mono)
├── src/
│   ├── index.js                 # React entry point
│   ├── index.css                # Global styles + CSS variables
│   ├── App.jsx                  # Root: page state router
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.jsx       # Sticky nav with step pills
│   │   └── ui/
│   │       └── index.jsx        # Reusable: BtnPrimary, BtnGhost, Card,
│   │                            #   StepHeader, Tag, Input, Select,
│   │                            #   SkillBar, Flag, Code
│   └── pages/
│       ├── Landing.jsx          # Hero + feature grid
│       ├── Login.jsx            # Email/password + Google OAuth stub
│       ├── ProfileSetup.jsx     # Name, role, experience, goals
│       ├── ResumeUpload.jsx     # PDF/URL/paste + extracted claims table
│       ├── SkillSelection.jsx   # Radar chart + skill bars + selector
│       ├── Challenge.jsx        # Problem card + Monaco placeholder + timer
│       └── Scorecard.jsx        # Full evaluation dashboard + download
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Page flow

```
Landing → Login → Profile Setup → Resume Upload → Skill Selection → Challenge → Scorecard
```

All navigation is managed via React state in `App.jsx` — no external router needed.

## Monaco Editor

`Challenge.jsx` contains a `<MonacoPlaceholder>` component (a styled textarea).
To integrate real Monaco:

```bash
npm install @monaco-editor/react
```

Then in `Challenge.jsx`, replace `<MonacoPlaceholder>` with:

```jsx
import Editor from '@monaco-editor/react';

<Editor
  height="300px"
  defaultLanguage="python"
  value={code}
  onChange={(val) => handleCodeChange(val || '')}
  theme="vs-dark"
  options={{ fontSize: 13, minimap: { enabled: false } }}
/>
```

## Backend integration points

| Page | Hook | Replace with |
|------|------|-------------|
| Login | `onLogin(userData)` | POST `/api/auth/login` |
| ResumeUpload | `handleFile(f)` | POST `/api/resume/parse` |
| Challenge | `handleRun()` | POST `/api/challenge/run` |
| Scorecard | Static data | GET `/api/results/:sessionId` |

## Design system

All colors are CSS variables in `src/index.css`:

| Var | Value | Use |
|-----|-------|-----|
| `--purple` | `#7c6df8` | Primary accent |
| `--green`  | `#22c97e` | Success / actual |
| `--amber`  | `#f5a623` | Warning / timer |
| `--red`    | `#ff5a5a` | Danger / gap |
| `--card`   | `#16161a` | Card background |
| `--surface`| `#111114` | Page background |
