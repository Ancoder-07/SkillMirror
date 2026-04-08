from fastapi import APIRouter, HTTPException

from app.models.schema import GenerateQuestionsRequest
from app.services.ai_service import generate_questions

router = APIRouter()


@router.post("/generate-questions")
async def generate_questions_endpoint(request: GenerateQuestionsRequest):
    try:
        return generate_questions(request.skill, request.level)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")
