# 🪞 SkillMirror — AI-Powered Skill Evaluation Platform

SkillMirror is a full-stack AI-powered web application that analyzes a user's resume, extracts skills, and evaluates them through dynamically generated tests using LLMs. It provides personalized scorecards and feedback to help users understand their actual skill levels and areas for improvement.


---

## ✨ Key Features

- 📄 Resume upload & parsing (PDF supported)
- 🧠 AI-based skill extraction using Claude Sonnet via Segmind
- 🎯 Skill selection interface for focused evaluation
- 📝 Dynamic test generation — MCQ, Coding & Q&A formats
- ⚡ Real-time LLM-based answer evaluation
- 📊 Skill-wise scorecard with strengths, weaknesses & suggestions
- 🔐 JWT-based user authentication
- 🔁 Multi-skill testing support in a single session
- 💻 In-browser code editor powered by Monaco Editor & Judge0

---

## 🖥 Tech Stack

**Frontend:** React.js, Axios  
**Backend:** FastAPI, Uvicorn (Python)  
**Database:** MongoDB, Motor (async driver)  
**Authentication:** JWT (`python-jose`), `passlib[bcrypt]`  
**AI / LLM:** Claude Sonnet via Segmind API  
**PDF Parsing:** PyPDF  
**Validation:** Pydantic  
**Code Editor:** Monaco Editor, Judge0  

---

## 🔁 How It Works

```
📄 User uploads Resume (PDF)
        ↓
🔍 Text extracted via PyPDF
        ↓
🧠 LLM identifies skills from resume text (Claude Sonnet)
        ↓
🎯 User selects a skill to be evaluated
        ↓
📝 LLM dynamically generates test (MCQ / Coding / Q&A)
        ↓
✍️ User submits answers
        ↓
⚡ LLM evaluates responses in real-time
        ↓
📊 Detailed dashboard shown with score, strengths & weaknesses
        ↓
🔁 User can repeat for other skills
```

---

## 🧠 Architecture & Engineering Highlights

- Engineered a **multi-stage LLM prompt pipeline** for skill extraction, test generation, evaluation, and feedback
- Built a complete **FastAPI backend** with modular route separation and async MongoDB integration via Motor
- Implemented **resume parsing** using PyPDF with structured text extraction for LLM input
- Designed **Pydantic schemas** for strict request/response validation across all API endpoints
- Applied **JWT-based authentication** with secure password hashing using `passlib[bcrypt]`
- Integrated **Claude Sonnet via Segmind API** with carefully engineered prompts for each pipeline stage
- Led full **backend-frontend integration**, connecting FastAPI endpoints to React UI for seamless data flow
- Integrated **Monaco Editor & Judge0** for real in-browser code execution and evaluation

---

## 🤖 AI Pipeline — Prompt Engineering

SkillMirror uses 4 prompt engineering stages:

```
Stage 1 — Skill Extraction
"Given this resume text, identify all technical skills..."

Stage 2 — Test Generation
"Generate 5 questions to evaluate {skill} at {level} in {format}..."

Stage 3 — Answer Evaluation
"Evaluate this answer for correctness, depth and clarity..."

Stage 4 — Feedback Generation
"Based on these scores, suggest specific improvement areas..."
```

All powered by **Claude Sonnet via Segmind API**.

---

## 🎯 Why This Project Matters

This project showcases the ability to design and build **production-oriented AI systems** with a strong focus on prompt engineering, backend architecture, and real-world usability.

It demonstrates hands-on experience in:

- End-to-end AI pipeline design using LLMs
- Prompt engineering for structured, reliable outputs
- Python backend development with FastAPI & async MongoDB
- Secure authentication and multi-user session handling
- Full-stack integration between React frontend and FastAPI backend
- Resume parsing and intelligent data extraction
- Real-time code execution using Monaco Editor & Judge0

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Ancoder-07/SkillMirror.git
cd SkillMirror
```

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
API_KEY=your_segmind_api_key
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key
```

---

## 🚧 Upcoming Features

- [ ] Test history & progress tracking
- [ ] Advanced analytics dashboard
- [ ] Deployment on Vercel + Render

---

## 👥 Team

| Contributor |
|------------|
| [Toraskararya1201](https://github.com/Toraskararya1201) |
| [darshna21-bit](https://github.com/darshna21-bit) |
| [Ancoder-07](https://github.com/Ancoder-07) |
| [samruddhi-t12](https://github.com/samruddhi-t12) |
