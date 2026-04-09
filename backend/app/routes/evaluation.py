from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.evaluation import evaluate_code, evaluate_verbal
from app.core.database import evaluations_collection

router = APIRouter()



# Request schemas 


class EvaluateCodeRequest(BaseModel):
    skill: str                         
    level: str                         
    question: str                    
    user_code: str                      # what the user submitted
    time_taken_seconds: Optional[int] = 0
    rewrite_count: Optional[int] = 0
    tab_switches: Optional[int] = 0


class EvaluateVerbalRequest(BaseModel):
    skill: str                         
    level: str                   
    question: str                       
    user_answer: str                    


# POST /evaluate/code

@router.post("/evaluate/code")
async def evaluate_code_endpoint(request: EvaluateCodeRequest):
    """
    Evaluates a user's code submission against the original question.
    Returns score, verdict, feedback, strengths, weaknesses, next steps,
    confidence flag (from behavioural signals), and impostor flag.
    """
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
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


# POST /evaluate/verbal


@router.post("/evaluate/verbal")
async def evaluate_verbal_endpoint(request: EvaluateVerbalRequest):
    """
    Evaluates a user's written/verbal answer to a follow-up question.
    Returns score, verdict, accuracy, depth, clarity,
    missed concepts, strengths, weaknesses, and next steps.
    """
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
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")
    
@router.get("/result/{test_id}")
async def get_result(test_id: str):
    """
    Fetch full test result including answers, evaluations, and final score
    """

    data = await evaluations_collection.find_one({"test_id": test_id})

    if not data:
        raise HTTPException(status_code=404, detail="Result not found")

    # Convert MongoDB _id to string
    data["_id"] = str(data["_id"])

    return data