import json
import re
from typing import Any, Dict

import requests

from app.core.config import settings

SEGMIND_API_KEY = settings.SEGMIND_API_KEY
SEGMIND_ENDPOINT = "https://api.segmind.com/v1/claude-4-sonnet"
MAX_TOKENS = 1200

if not SEGMIND_API_KEY:
    raise EnvironmentError("Missing Segmind API key.")

HEADERS = {
    "x-api-key": SEGMIND_API_KEY,
    "Content-Type": "application/json"
}


# Extract JSON object from raw LLM text

def _extract_json_object(text: str) -> Any:
    match = re.search(r"(\{.*\})", text, re.S)
    if not match:
        raise ValueError("No JSON object found in model response.")
    return json.loads(match.group(1))



# Prompt builder — coding question evaluation

def _build_code_eval_prompt(
    skill: str,
    level: str,
    question: str,
    user_code: str,
    time_taken_seconds: int,
    rewrite_count: int,
    tab_switches: int,
) -> str:
    return (
        "You are a strict but fair technical interviewer evaluating a candidate's code submission.\n"
        "Evaluate based on correctness, efficiency, edge case handling, and code quality.\n"
        "Also factor in behavioural signals: time taken, number of rewrites, and tab switches (possible googling).\n\n"
        f"Skill: {skill}\n"
        f"Claimed Level: {level}\n"
        f"Question: {question}\n\n"
        f"User's Code:\n```\n{user_code}\n```\n\n"
        f"Behavioural Signals:\n"
        f"- Time taken: {time_taken_seconds} seconds\n"
        f"- Rewrites / major edits: {rewrite_count}\n"
        f"- Tab switches (possible googling): {tab_switches}\n\n"
        "Return ONLY a JSON object with this exact structure:\n"
        "{\n"
        '  "score": <integer 0-100>,\n'
        '  "verdict": "<Excellent | Good | Average | Poor>",\n'
        '  "correctness": "<brief assessment of correctness>",\n'
        '  "efficiency": "<time/space complexity feedback>",\n'
        '  "edge_cases": "<did they handle edge cases? what did they miss?>",\n'
        '  "code_quality": "<naming, readability, structure>",\n'
        '  "confidence_flag": "<High | Medium | Low — based on behavioural signals>",\n'
        '  "strengths": ["<strength 1>", "<strength 2>"],\n'
        '  "weaknesses": ["<weakness 1>", "<weakness 2>"],\n'
        '  "next_steps": ["<actionable improvement 1>", "<actionable improvement 2>", "<actionable improvement 3>"],\n'
        '  "impostor_flag": <true if claimed level does not match performance, else false>\n'
        "}"
    )


# Prompt builder

def _build_verbal_eval_prompt(
    skill: str,
    level: str,
    question: str,
    user_answer: str,
) -> str:
    return (
        "You are a strict technical interviewer evaluating a candidate's verbal/written answer.\n"
        "Assess conceptual depth, accuracy, and clarity of explanation.\n\n"
        f"Skill: {skill}\n"
        f"Claimed Level: {level}\n"
        f"Question: {question}\n\n"
        f"User's Answer:\n{user_answer}\n\n"
        "Return ONLY a JSON object with this exact structure:\n"
        "{\n"
        '  "score": <integer 0-100>,\n'
        '  "verdict": "<Excellent | Good | Average | Poor>",\n'
        '  "accuracy": "<was the answer factually correct?>",\n'
        '  "depth": "<was the explanation deep or surface-level?>",\n'
        '  "clarity": "<was the answer well-structured and clear?>",\n'
        '  "missed_concepts": ["<concept they should have mentioned 1>", "<concept 2>"],\n'
        '  "strengths": ["<strength 1>", "<strength 2>"],\n'
        '  "weaknesses": ["<weakness 1>", "<weakness 2>"],\n'
        '  "next_steps": ["<study recommendation 1>", "<study recommendation 2>"],\n'
        '  "impostor_flag": <true if claimed level does not match performance, else false>\n'
        "}"
    )


# Shared API caller

def _call_segmind(prompt: str) -> Dict:
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

    response = requests.post(
        SEGMIND_ENDPOINT,
        headers=HEADERS,
        json=payload
    )

    if response.status_code != 200:
        return {"error": response.text}

    data = response.json()
    text = data["content"][0]["text"]
    return _extract_json_object(text)


# Public: evaluate code submission

def evaluate_code(
    skill: str,
    level: str,
    question: str,
    user_code: str,
    time_taken_seconds: int = 0,
    rewrite_count: int = 0,
    tab_switches: int = 0,
) -> Dict:
    try:
        prompt = _build_code_eval_prompt(
            skill, level, question,
            user_code, time_taken_seconds,
            rewrite_count, tab_switches
        )
        result = _call_segmind(prompt)
        result["evaluation_type"] = "code"
        return result
    except Exception as e:
        return {"error": str(e)}


# Public: evaluate text answer

def evaluate_verbal(
    skill: str,
    level: str,
    question: str,
    user_answer: str,
) -> Dict:
    try:
        prompt = _build_verbal_eval_prompt(skill, level, question, user_answer)
        result = _call_segmind(prompt)
        result["evaluation_type"] = "verbal"
        return result
    except Exception as e:
        return {"error": str(e)}
