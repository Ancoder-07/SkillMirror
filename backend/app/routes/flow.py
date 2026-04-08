from fastapi import APIRouter, HTTPException
from uuid import uuid4
from app.models.schema import StartTestRequest, NextQuestionRequest
from app.services.ai_service import generate_questions

router = APIRouter()

test_sessions = {}

@router.post("/start-test")
def start_test(data: StartTestRequest):
    try:
        result = generate_questions(data.skill, data.level)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    questions = result["questions"]
    test_id = str(uuid4())

    # store session
    test_sessions[test_id] = {
        "questions": questions
    }

    return {
        "test_id": test_id,
        "index": 0,
        "question": questions[0]
    }


@router.post("/next-question")
def next_question(data: NextQuestionRequest):
    session = test_sessions.get(data.test_id)
    if not session:
        raise HTTPException(status_code=404, detail="Invalid test_id")

    questions = session["questions"]
    next_index = data.current_index + 1

    if next_index >= len(questions):
        return {"message": "Test completed"}

    return {
        "index": next_index,
        "question": questions[next_index]
    }