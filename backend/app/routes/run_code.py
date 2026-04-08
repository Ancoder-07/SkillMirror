import time
import requests
from fastapi import APIRouter, HTTPException

from app.models.schema import RunCodeRequest, RunCodeResponse

router = APIRouter()

JUDGE0_URL = "https://ce.judge0.com/submissions"

HEADERS = {
    "Content-Type": "application/json"
}

LANGUAGE_MAP = {
    "python": 71,
    "cpp": 54,
    "javascript": 63
}

LANGUAGE_ALIASES = {
    "python": "python",
    "py": "python",
    "c++": "cpp",
    "cpp": "cpp",
    "js": "javascript",
    "javascript": "javascript"
}


@router.post("/run-code", response_model=RunCodeResponse)
def run_code(request: RunCodeRequest):

    lang = request.language.lower()
    lang = LANGUAGE_ALIASES.get(lang)

    if not lang:
        raise HTTPException(status_code=400, detail="Unsupported language")

    payload = {
        "source_code": request.code,
        "language_id": LANGUAGE_MAP[lang]
    }

    try:
        # Step 1: Submit
        submit = requests.post(JUDGE0_URL, headers=HEADERS, json=payload)
        token = submit.json().get("token")

        if not token:
            raise HTTPException(status_code=500, detail="Token not received")

        # Step 2: Wait
        time.sleep(2)

        # Step 3: Fetch result
        result = requests.get(f"{JUDGE0_URL}/{token}", headers=HEADERS)
        result_data = result.json()

        output = result_data.get("stdout") or result_data.get("stderr") or "No output"

        return RunCodeResponse(output=output)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))