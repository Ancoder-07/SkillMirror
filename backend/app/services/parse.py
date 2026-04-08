import json
import httpx
from app.core.config import settings

async def extract_full_profile(raw_text: str) -> dict:
    if not settings.SEGMIND_API_KEY:
        raise ValueError("SEGMIND_API_KEY is missing in environment variables")

    url = "https://api.segmind.com/v1/claude-4-sonnet"
    
    headers = {
        "x-api-key": settings.SEGMIND_API_KEY,
        "Content-Type": "application/json"
    }
    
    # We moved ALL strict instructions into the user prompt so the proxy cannot ignore it.
    strict_prompt = f"""You are a strict data extraction bot. Your ONLY output must be a raw JSON object. Do NOT output any conversational text, greetings, markdown formatting, or resume analysis. 

Extract the candidate's profile into this EXACT JSON schema:
{{
  "primary_role": "String",
  "years_of_experience": "String",
  "all_skills": ["String"],
  "key_projects": ["String"],
  "boldest_claims": ["String"]
}}

Resume Text:
{raw_text[:3000]}

OUTPUT ONLY RAW JSON STARTING WITH {{ AND ENDING WITH }}."""

    payload = {
        "max_tokens": 1000,
        "messages": [
            {"role": "user", "content": strict_prompt}
        ]
    }

    async with httpx.AsyncClient(timeout=40.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()

    content = ""
    if "content" in data and isinstance(data["content"], list):
        content = data["content"][0].get("text", "")
    elif "choices" in data and isinstance(data["choices"], list):
        choice = data["choices"][0]
        if isinstance(choice, dict):
            message = choice.get("message")
            if isinstance(message, dict):
                content = message.get("content", "")
    else:
        content = str(data)

    start_idx = content.find("{")
    end_idx = content.rfind("}")
    if start_idx == -1 or end_idx == -1:
        raise ValueError("No JSON object found in response")

    json_str = content[start_idx:end_idx + 1]
    return json.loads(json_str)
