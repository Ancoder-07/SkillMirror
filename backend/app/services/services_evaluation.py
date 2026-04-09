import json
import re
from typing import Any, Dict, List

import requests
from app.core.config import settings

SEGMIND_API_KEY = settings.SEGMIND_API_KEY
SEGMIND_ENDPOINT = "https://api.segmind.com/v1/claude-4-sonnet"
MAX_TOKENS = 1200

if not SEGMIND_API_KEY:
    raise EnvironmentError("Missing Segmind API key.")

HEADERS = {
    "x-api-key": SEGMIND_API_KEY,
    "Content-Type": "application/json",
}


# ─────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────

def _extract_json_object(text: str) -> Any:
    match = re.search(r"(\{.*\})", text, re.S)
    if not match:
        raise ValueError("No JSON object found in model response.")
    return json.loads(match.group(1))


def _call_segmind(prompt: str) -> Dict:
    payload = {
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}],
            }
        ],
        "max_tokens": MAX_TOKENS,
    }
    response = requests.post(SEGMIND_ENDPOINT, headers=HEADERS, json=payload)
    if response.status_code != 200:
        return {"error": response.text}
    data = response.json()
    text = data["content"][0]["text"]
    return _extract_json_object(text)


# ─────────────────────────────────────────
# Per-question evaluators
# ─────────────────────────────────────────

def _evaluate_mcq(question: Dict, user_answer: str) -> Dict:
    """
    Pure rule-based. No AI call needed.
    correct_answer stored in question at generation time.
    """
    correct = str(question.get("answer", "")).strip()
    given   = str(user_answer).strip()
    is_correct = correct.lower() == given.lower()

    return {
        "question_id":    question.get("id"),
        "type":           "mcq",
        "difficulty":     question.get("difficulty", "medium"),
        "question_text":  question.get("question"),
        "user_answer":    given,
        "correct_answer": correct,
        "is_correct":     is_correct,
        "score":          25 if is_correct else 0,
        "max_score":      25,
        "feedback":       "Correct!" if is_correct else f"Wrong. Correct answer: {correct}",
        "explanation":    None,   # filled by AI summary prompt below if needed
        "improvement_tip": None,
    }


def _evaluate_numerical(question: Dict, user_answer: str) -> Dict:
    """
    Rule-based with small float tolerance.
    """
    correct_raw = str(question.get("answer", "")).strip()
    given_raw   = str(user_answer).strip()

    try:
        correct_val = float(correct_raw)
        given_val   = float(given_raw)
        is_correct  = abs(correct_val - given_val) < 1e-6
    except ValueError:
        # non-numeric fallback — exact string match
        is_correct = correct_raw.lower() == given_raw.lower()

    return {
        "question_id":    question.get("id"),
        "type":           "numerical",
        "difficulty":     question.get("difficulty", "medium"),
        "question_text":  question.get("question"),
        "user_answer":    given_raw,
        "correct_answer": correct_raw,
        "is_correct":     is_correct,
        "score":          25 if is_correct else 0,
        "max_score":      25,
        "feedback":       "Correct!" if is_correct else f"Wrong. Correct answer: {correct_raw}",
        "explanation":    None,
        "improvement_tip": None,
    }


def _build_coding_eval_prompt(
    skill: str,
    level: str,
    question_text: str,
    user_code: str,
    time_taken_seconds: int,
    rewrite_count: int,
    tab_switches: int,
) -> str:
    return (
        "You are a strict but fair technical interviewer evaluating a candidate's code.\n"
        "Evaluate correctness, efficiency, edge-case handling, and code quality.\n"
        "Also consider behavioural signals.\n\n"
        f"Skill: {skill}\n"
        f"Claimed Level: {level}\n"
        f"Question: {question_text}\n\n"
        f"User's Code:\n```\n{user_code}\n```\n\n"
        f"Behavioural Signals:\n"
        f"- Time taken: {time_taken_seconds}s\n"
        f"- Rewrites: {rewrite_count}\n"
        f"- Tab switches: {tab_switches}\n\n"
        "Return ONLY a JSON object:\n"
        "{\n"
        '  "score": <integer 0-25>,\n'
        '  "verdict": "<Excellent|Good|Average|Poor>",\n'
        '  "correctness": "<brief>",\n'
        '  "efficiency": "<brief>",\n'
        '  "feedback": "<one sentence summary for the user>",\n'
        '  "correct_answer": "<ideal solution in 2-3 lines>",\n'
        '  "explanation": "<what they got right and wrong>",\n'
        '  "improvement_tip": "<one specific thing to study>",\n'
        '  "strengths": ["<s1>", "<s2>"],\n'
        '  "weaknesses": ["<w1>", "<w2>"],\n'
        '  "confidence_flag": "<High|Medium|Low>"\n'
        "}"
    )


def _build_mcq_explanation_prompt(
    skill: str,
    question_text: str,
    options: list,
    correct_answer: str,
    user_answer: str,
) -> str:
    """
    Called ONLY when user got the MCQ wrong — to get an explanation.
    Avoids wasting tokens on correct answers.
    """
    return (
        "You are a technical mentor. A candidate answered an MCQ incorrectly.\n"
        f"Skill: {skill}\n"
        f"Question: {question_text}\n"
        f"Options: {options}\n"
        f"Correct answer: {correct_answer}\n"
        f"User answered: {user_answer}\n\n"
        "Return ONLY a JSON object:\n"
        "{\n"
        '  "explanation": "<why the correct answer is right, 2-3 sentences>",\n'
        '  "improvement_tip": "<one specific concept to review>"\n'
        "}"
    )


def _evaluate_coding(
    skill: str,
    level: str,
    question: Dict,
    user_answer: str,
    time_taken_seconds: int = 0,
    rewrite_count: int = 0,
    tab_switches: int = 0,
) -> Dict:
    prompt = _build_coding_eval_prompt(
        skill, level,
        question.get("question", ""),
        user_answer,
        time_taken_seconds, rewrite_count, tab_switches,
    )
    ai = _call_segmind(prompt)

    # Clamp AI score to 0-25
    raw_score = ai.get("score", 0)
    try:
        score = max(0, min(25, int(raw_score)))
    except (TypeError, ValueError):
        score = 0

    return {
        "question_id":     question.get("id"),
        "type":            "coding",
        "difficulty":      question.get("difficulty", "medium"),
        "question_text":   question.get("question"),
        "user_answer":     user_answer,
        "correct_answer":  ai.get("correct_answer", ""),
        "is_correct":      score >= 18,      # 18/25 = ~70% threshold
        "score":           score,
        "max_score":       25,
        "verdict":         ai.get("verdict", ""),
        "feedback":        ai.get("feedback", ""),
        "explanation":     ai.get("explanation", ""),
        "improvement_tip": ai.get("improvement_tip", ""),
        "strengths":       ai.get("strengths", []),
        "weaknesses":      ai.get("weaknesses", []),
        "confidence_flag": ai.get("confidence_flag", "Medium"),
    }


# ─────────────────────────────────────────
# Main session evaluator (called from route)
# ─────────────────────────────────────────

def evaluate_session(
    skill: str,
    level: str,
    questions_and_answers: List[Dict],
) -> Dict:
    """
    Evaluates all 4 answers.

    Each item in questions_and_answers:
    {
        "question":           { full question object from generate_questions },
        "answer":             "user's answer string",
        "type":               "mcq" | "coding" | "numerical",
        "time_taken_seconds": int,
        "rewrite_count":      int,
        "tab_switches":       int,
    }

    Returns full result object saved to DB and sent to frontend.
    """
    evaluated = []

    for item in questions_and_answers:
        q_obj   = item.get("question", {})
        q_type  = item.get("type", q_obj.get("type", "coding"))
        answer  = item.get("answer", "")

        if q_type == "mcq":
            result = _evaluate_mcq(q_obj, answer)

            # If wrong, get AI explanation (cheap — only on wrong answers)
            if not result["is_correct"]:
                try:
                    expl = _call_segmind(
                        _build_mcq_explanation_prompt(
                            skill,
                            q_obj.get("question", ""),
                            q_obj.get("options", []),
                            q_obj.get("answer", ""),
                            answer,
                        )
                    )
                    result["explanation"]    = expl.get("explanation", "")
                    result["improvement_tip"] = expl.get("improvement_tip", "")
                except Exception:
                    pass  # don't crash if explanation fails

        elif q_type == "numerical":
            result = _evaluate_numerical(q_obj, answer)

        else:
            # coding (default)
            result = _evaluate_coding(
                skill=skill,
                level=level,
                question=q_obj,
                user_answer=answer,
                time_taken_seconds=item.get("time_taken_seconds", 0),
                rewrite_count=item.get("rewrite_count", 0),
                tab_switches=item.get("tab_switches", 0),
            )

        evaluated.append(result)

    # ─────────────────────────────────────
    # Combined scoring
    # ─────────────────────────────────────
    total_score  = sum(e["score"] for e in evaluated)           # out of 100
    max_possible = sum(e["max_score"] for e in evaluated)       # always 100
    percentage   = round((total_score / max_possible) * 100) if max_possible else 0

    if percentage >= 75:
        skill_level = "Advanced"
    elif percentage >= 45:
        skill_level = "Intermediate"
    else:
        skill_level = "Beginner"

    # Skill gap: compare claimed level vs evaluated
    level_map = {"beginner": 1, "easy": 1, "medium": 2, "intermediate": 2, "hard": 3, "advanced": 3}
    claimed_n  = level_map.get(level.lower(), 2)
    eval_n     = level_map.get(skill_level.lower(), 2)
    diff       = claimed_n - eval_n
    if diff >= 1:
        gap = "Overestimated"
    elif diff <= -1:
        gap = "Underestimated"
    else:
        gap = "Accurate"

    # Aggregate strengths/weaknesses from coding questions
    all_strengths  = []
    all_weaknesses = []
    for e in evaluated:
        all_strengths.extend(e.get("strengths", []))
        all_weaknesses.extend(e.get("weaknesses", []))

    # Impostor flag: any coding question scored < 40% AND claimed level is advanced/hard
    impostor = (
        claimed_n == 3
        and any(
            e["type"] == "coding" and e["score"] < 10
            for e in evaluated
        )
    )

    return {
        "skill":           skill,
        "claimed_level":   level,
        "total_score":     total_score,
        "max_score":       max_possible,
        "percentage":      percentage,
        "skill_level":     skill_level,
        "skill_gap":       gap,
        "impostor_flag":   impostor,
        "strengths":       list(dict.fromkeys(all_strengths))[:4],   # deduplicated
        "weaknesses":      list(dict.fromkeys(all_weaknesses))[:4],
        "questions":       evaluated,    # full per-question breakdown
    }


# ─────────────────────────────────────────
# Legacy single-question exports
# (kept so existing routes don't break)
# ─────────────────────────────────────────

def evaluate_code(
    skill: str,
    level: str,
    question: str,
    user_code: str,
    time_taken_seconds: int = 0,
    rewrite_count: int = 0,
    tab_switches: int = 0,
) -> Dict:
    q_obj = {"id": 1, "type": "coding", "question": question, "difficulty": level}
    return _evaluate_coding(skill, level, q_obj, user_code, time_taken_seconds, rewrite_count, tab_switches)


def evaluate_verbal(
    skill: str,
    level: str,
    question: str,
    user_answer: str,
) -> Dict:
    q_obj = {"id": 1, "type": "mcq", "question": question, "answer": ""}
    result = _evaluate_mcq(q_obj, user_answer)
    return result