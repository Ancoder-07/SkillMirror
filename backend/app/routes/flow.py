from fastapi import APIRouter
from uuid import uuid4
from typing import Dict, Any
from pydantic import BaseModel

from app.services.ai_service import generate_questions
from app.core.database import evaluations_collection
from app.services.evaluation import evaluate_code

router = APIRouter()

# 🔥 In-memory sessions
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

    result = generate_questions(skill, level)

    if "error" in result:
        return result

    # ✅ FIX: keep all generated questions (no filtering)
    questions = result.get("questions", [])[:4]

    if not questions:
        return {"error": "No questions generated"}

    test_id = str(uuid4())

    test_sessions[test_id] = {
        "questions": questions,
        "current_index": 0,
        "answers": [],
        "skill": skill,
        "level": level
    }

    # Save initial state
    try:
        evaluations_collection.insert_one({
            "test_id": test_id,
            "skill": skill,
            "level": level,
            "questions": questions,
            "answers": [],
            "current_index": 0,
            "completed": False
        })
    except Exception as e:
        print("MongoDB Insert Error:", e)

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

    # Update DB
    try:
        evaluations_collection.update_one(
            {"test_id": test_id},
            {"$set": {"current_index": session["current_index"]}}
        )
    except Exception as e:
        print("MongoDB Update Error:", e)

    # =========================
    # 🔥 TEST COMPLETED → EVALUATION
    # =========================
    if session["current_index"] >= len(session["questions"]):

        try:
            evaluations = []

            for i, q in enumerate(session["questions"]):
                user_answer = ""
                if i < len(session["answers"]):
                    user_answer = session["answers"][i]["answer"]

                # ✅ TYPE-BASED EVALUATION
                if q.get("type") == "mcq":
                    result = {
                        "type": "mcq",
                        "score": 1 if str(user_answer).strip() == str(q.get("answer")).strip() else 0
                    }

                elif q.get("type") == "numerical":
                    result = {
                        "type": "numerical",
                        "score": 1 if str(user_answer).strip() == str(q.get("answer")).strip() else 0
                    }

                else:  # coding
                    result = evaluate_code(
                        skill=session["skill"],
                        level=session["level"],
                        question=q["question"],
                        user_code=user_answer
                    )

                evaluations.append(result)

            # ✅ average score
            avg_score = sum(e.get("score", 0) for e in evaluations) // len(evaluations)

            # Save results
            evaluations_collection.update_one(
                {"test_id": test_id},
                {
                    "$set": {
                        "evaluations": evaluations,
                        "final_score": avg_score,
                        "completed": True
                    }
                }
            )

        except Exception as e:
            print("Evaluation Error:", e)

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

    answer_data = {
        "question_id": index + 1,
        "answer": answer
    }

    session["answers"].append(answer_data)

    try:
        evaluations_collection.update_one(
            {"test_id": test_id},
            {"$push": {"answers": answer_data}}
        )
    except Exception as e:
        print("MongoDB Answer Save Error:", e)

    return {
        "message": "Answer submitted",
        "current_question": index + 1
    }


# =========================
# ✅ TEST STATUS (DEBUG)
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