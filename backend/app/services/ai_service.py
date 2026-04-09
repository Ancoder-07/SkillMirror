import json
import re
from typing import Any, Dict

import requests
from app.core.config import settings

SEGMIND_API_KEY = settings.SEGMIND_API_KEY
SEGMIND_ENDPOINT = "https://api.segmind.com/v1/claude-4-sonnet"
MAX_TOKENS = 800

if not SEGMIND_API_KEY:
    raise EnvironmentError("Missing Segmind API key.")

HEADERS = {
    "x-api-key": SEGMIND_API_KEY,
    "Content-Type": "application/json"
}

# =========================
# 🔹 Extract JSON
# =========================
def _extract_json_array(text: str) -> Any:
    match = re.search(r"(\[.*\])", text, re.S)
    if not match:
        raise ValueError("No JSON found")
    return json.loads(match.group(1))


# =========================
# 🔹 Prompt
# =========================
def _build_prompt(skill: str, level: str) -> str:
    return (
        "You are an intelligent AI evaluator.\n\n"

        "STRICT RULES:\n"
        "Generate EXACTLY 4 questions.\n\n"

        "If TECH skill:\n"
        "- EXACTLY 2 coding questions\n"
        "- EXACTLY 2 MCQ questions\n\n"

        "If NON-TECH skill:\n"
        "- EXACTLY 2 MCQ questions\n"
        "- EXACTLY 2 numerical questions\n\n"

        "DO NOT VIOLATE THIS DISTRIBUTION.\n\n"

        f"Skill: {skill}\n"
        f"Level: {level}\n\n"

        "Return ONLY JSON array in this format:\n"
        "[\n"
        "  {\"id\":1,\"type\":\"coding\",\"question\":\"...\",\"difficulty\":\"easy\"},\n"
        "  {\"id\":2,\"type\":\"coding\",\"question\":\"...\",\"difficulty\":\"easy\"},\n"
        "  {\"id\":3,\"type\":\"mcq\",\"question\":\"...\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"answer\":\"A\",\"difficulty\":\"medium\"},\n"
        "  {\"id\":4,\"type\":\"mcq\",\"question\":\"...\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"answer\":\"B\",\"difficulty\":\"medium\"}\n"
        "]"
    )


# =========================
# 🔹 Main function
# =========================
def generate_questions(skill: str, level: str) -> Dict:

    prompt = _build_prompt(skill, level)

    payload = {
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}]
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
        raw_text = data["content"][0]["text"]

        print("RAW AI RESPONSE:\n", raw_text)

        questions = _extract_json_array(raw_text)

        cleaned_questions = []

        # ✅ CLEAN ALL (NO slicing)
        for q in questions:
            cleaned_q = {
                "id": q.get("id"),
                "type": q.get("type"),
                "question": q.get("question"),
                "difficulty": q.get("difficulty", "medium")
            }

            if q.get("type") == "mcq":
                cleaned_q["options"] = q.get("options", [])
                cleaned_q["answer"] = q.get("answer")

            elif q.get("type") == "numerical":
                cleaned_q["answer"] = q.get("answer")

            cleaned_questions.append(cleaned_q)

        # =========================
        # 🔥 ENFORCE DISTRIBUTION
        # =========================
        coding_q = [q for q in cleaned_questions if q["type"] == "coding"]
        mcq_q = [q for q in cleaned_questions if q["type"] == "mcq"]
        num_q = [q for q in cleaned_questions if q["type"] == "numerical"]

        # TECH → 2 coding + 2 mcq
        if len(coding_q) >= 2 and len(mcq_q) >= 2:
            final_questions = coding_q[:2] + mcq_q[:2]

        # NON-TECH → 2 mcq + 2 numerical
        elif len(mcq_q) >= 2 and len(num_q) >= 2:
            final_questions = mcq_q[:2] + num_q[:2]

        else:
            # fallback safe
            final_questions = cleaned_questions[:4]

        print("FINAL QUESTIONS:\n", final_questions)

        return {"questions": final_questions}

    except Exception as e:
        print("ERROR:", str(e))
        return {"error": str(e)}