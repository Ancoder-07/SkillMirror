import json
import re
from typing import Any, Dict, List

import requests

from app.core.config import settings

SEGMIND_API_KEY = settings.SEGMIND_API_KEY

# ✅ Correct endpoint
SEGMIND_ENDPOINT = "https://api.segmind.com/v1/claude-4-sonnet"

MAX_TOKENS = 800

if not SEGMIND_API_KEY:
    raise EnvironmentError("Missing Segmind API key.")

HEADERS = {
    "x-api-key": SEGMIND_API_KEY,
    "Content-Type": "application/json"
}

# 🔹 Extract JSON
def _extract_json_array(text: str) -> Any:
    match = re.search(r"(\[.*\])", text, re.S)
    if not match:
        raise ValueError("No JSON found")

    return json.loads(match.group(1))


# 🔹 Prompt
def _build_prompt(skill: str, level: str) -> str:
    return (
        "You are an expert technical interviewer.\n"
        "Generate exactly 5 coding questions.\n"
        "Difficulty distribution must be:\n"
        "- 2 easy\n"
        "- 2 medium\n"
        "- 1 hard\n"
        "Questions should be practical and interview-level.\n\n"
        f"Skill: {skill}\n"
        f"Level: {level}\n\n"
        "Return ONLY JSON:\n"
        "[\n"
        "  {\"id\":1,\"question\":\"...\",\"difficulty\":\"easy\"},\n"
        "  {\"id\":2,\"question\":\"...\",\"difficulty\":\"easy\"},\n"
        "  {\"id\":3,\"question\":\"...\",\"difficulty\":\"medium\"},\n"
        "  {\"id\":4,\"question\":\"...\",\"difficulty\":\"medium\"},\n"
        "  {\"id\":5,\"question\":\"...\",\"difficulty\":\"hard\"}\n"
        "]"
    )


# 🔹 Main function
def generate_questions(skill: str, level: str) -> Dict:

    prompt = _build_prompt(skill, level)

    payload = {
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ],
        "max_tokens": MAX_TOKENS
    }

    try:
        response = requests.post(
            SEGMIND_ENDPOINT,
            headers=HEADERS,
            json=payload
        )

        if response.status_code != 200:
            return {"error": response.text}

        data = response.json()

        # ✅ Correct extraction for Claude 4
        text = data["content"][0]["text"]

        questions = _extract_json_array(text)

        return {"questions": questions}

    except Exception as e:
        return {"error": str(e)}
