from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.services.services_evaluation import evaluate_code, evaluate_verbal, evaluate_session
from app.core.database import evaluations_collection

router = APIRouter()


# ─────────────────────────────────────────
# Request schemas
# ─────────────────────────────────────────

class EvaluateCodeRequest(BaseModel):
    skill: str
    level: str
    question: str
    user_code: str
    time_taken_seconds: Optional[int] = 0
    rewrite_count: Optional[int] = 0
    tab_switches: Optional[int] = 0


class EvaluateVerbalRequest(BaseModel):
    skill: str
    level: str
    question: str
    user_answer: str


class QuestionAnswer(BaseModel):
    question: Dict[str, Any]      # full question object {id, type, question, options, answer, difficulty}
    answer: str                   # user's answer
    type: str                     # "mcq" | "coding" | "numerical"
    time_taken_seconds: Optional[int] = 0
    rewrite_count: Optional[int] = 0
    tab_switches: Optional[int] = 0


class EvaluateSessionRequest(BaseModel):
    skill: str
    level: str
    questions_and_answers: List[QuestionAnswer]
    test_id: Optional[str] = None     # optional — to save result linked to test


# ─────────────────────────────────────────
# POST /evaluate/session  ← NEW main endpoint
# ─────────────────────────────────────────

@router.post("/evaluate/session")
async def evaluate_session_endpoint(request: EvaluateSessionRequest):
    """
    Accepts all 4 questions + answers at once.
    Evaluates each by type:
      - MCQ      → rule-based (instant, no AI)
      - Numerical → rule-based (instant, no AI)
      - Coding   → AI evaluation via Segmind
    Returns combined score, skill level, skill gap, per-question breakdown.
    """
    try:
        # Convert pydantic models to plain dicts
        qa_list = [item.dict() for item in request.questions_and_answers]

        result = evaluate_session(
            skill=request.skill,
            level=request.level,
            questions_and_answers=qa_list,
        )

        if "error" in result:
            raise HTTPException(status_code=502, detail=result["error"])

        # Save to MongoDB if test_id provided
        if request.test_id:
            try:
                await evaluations_collection.update_one(
                    {"test_id": request.test_id},
                    {"$set": {"evaluation": result}},
                    upsert=True,
                )
                result["test_id"] = request.test_id
            except Exception:
                pass  # don't fail the response if DB save fails

        return result

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ─────────────────────────────────────────
# Legacy endpoints (unchanged — kept so
# nothing else in the app breaks)
# ─────────────────────────────────────────

@router.post("/evaluate/code")
async def evaluate_code_endpoint(request: EvaluateCodeRequest):
    try:
        result = evaluate_code(
            skill=request.skill,
            level=request.level,
            question=request.question,
            user_code=request.user_code,
            time_taken_seconds=request.time_taken_seconds,
            rewrite_count=request.rewrite_count,
            tab_switches=request.tab_switches,
        )
        if "error" in result:
            raise HTTPException(status_code=502, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/evaluate/verbal")
async def evaluate_verbal_endpoint(request: EvaluateVerbalRequest):
    try:
        result = evaluate_verbal(
            skill=request.skill,
            level=request.level,
            question=request.question,
            user_answer=request.user_answer,
        )
        if "error" in result:
            raise HTTPException(status_code=502, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/result/{test_id}")
async def get_result(test_id: str):
    data = await evaluations_collection.find_one({"test_id": test_id})
    if not data:
        raise HTTPException(status_code=404, detail="Result not found")
    data["_id"] = str(data["_id"])
    return data