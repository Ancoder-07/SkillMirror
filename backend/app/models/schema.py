from pydantic import BaseModel, Field
from typing import List

# NEW: A comprehensive profile extracted from the resume
class DeveloperProfile(BaseModel):
    primary_role: str              # e.g., "Full Stack Developer"
    years_of_experience: str       # e.g., "2 years" or "Student/Entry Level"
    all_skills: List[str]          # ALL skills found in the text
    key_projects: List[str]        # Short descriptions of what they built
    boldest_claims: List[str]      # The cocky stuff we want to test them on

# What the frontend sends to generate the challenge
class ChallengeRequest(BaseModel):
    profile: DeveloperProfile      # Now we pass the WHOLE profile to the AI
    focus_skill: str               # The specific skill the user clicked to be tested on

class CodeSubmission(BaseModel):
    code: str
    hesitation_score: int
    problem_statement: str

class GenerateQuestionsRequest(BaseModel):
    skill: str = Field(..., min_length=1, description="Primary technical skill or domain")
    level: str = Field(..., min_length=1, description="Candidate experience level")


class StartTestRequest(BaseModel):
    skill: str = Field(..., min_length=1, description="Selected skill")
    level: str = Field(..., min_length=1, description="Selected level")


class NextQuestionRequest(BaseModel):
    test_id: str = Field(..., description="Unique test session ID")
    current_index: int = Field(..., ge=0, description="Current question index")


class RunCodeRequest(BaseModel):
    language: str = Field(..., min_length=1, description="Programming language")
    code: str = Field(..., description="Code to execute")


class RunCodeResponse(BaseModel):
    output: str = Field(..., description="Execution output")