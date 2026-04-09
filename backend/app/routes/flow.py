from fastapi import APIRouter
from uuid import uuid4
from typing import Dict, Any
from pydantic import BaseModel

from app.services.ai_service import generate_questions

router = APIRouter()

# 🔥 Store all active test sessions (in-memory)
test_sessions: Dict[str, Dict[str, Any]] = {}

# =========================
# ✅ REQUEST MODELS
# =========================

class StartTestRequest(BaseModel):
    skill: str
    level: str


class NextQuestionRequest(BaseModel):
    test_id: str


class SubmitAnswerRequest(BaseModel):
    test_id: str
    answer: str


# =========================
# ✅ START TEST
# =========================
@router.post("/start-test")
def start_test(data: StartTestRequest):
    skill = data.skill
    level = data.level

    # Generate questions using AI
    result = generate_questions(skill, level)

    if "error" in result:
        return result

    questions = result["questions"]

    # Create unique test ID
    test_id = str(uuid4())

    # Store session
    test_sessions[test_id] = {
        "questions": questions,
        "current_index": 0,
        "answers": []
    }

    return {
        "test_id": test_id,
        "question": questions[0],
        "message": "Test started"
    }


# =========================
# ✅ NEXT QUESTION
# =========================
@router.post("/next-question")
def next_question(data: NextQuestionRequest):
    test_id = data.test_id

    session = test_sessions.get(test_id)

    if not session:
        return {"error": "Invalid test_id"}

    session["current_index"] += 1

    # Check if test completed
    if session["current_index"] >= len(session["questions"]):
        return {
            "message": "Test completed",
            "total_questions": len(session["questions"])
        }

    return {
        "question": session["questions"][session["current_index"]]
    }


# =========================
# ✅ SUBMIT ANSWER
# =========================
@router.post("/submit-answer")
def submit_answer(data: SubmitAnswerRequest):
    test_id = data.test_id
    answer = data.answer

    session = test_sessions.get(test_id)

    if not session:
        return {"error": "Invalid test_id"}

    index = session["current_index"]

    session["answers"].append({
        "question_id": index + 1,
        "answer": answer
    })

    return {
        "message": "Answer submitted",
        "current_question": index + 1
    }


# =========================
# ✅ GET TEST STATUS (DEBUG)
# =========================
@router.get("/test-status")
def get_test_status(test_id: str):
    session = test_sessions.get(test_id)

    if not session:
        return {"error": "Invalid test_id"}

    return {
        "current_index": session["current_index"],
        "total_questions": len(session["questions"]),
        "answers_submitted": len(session["answers"])
    }