from fastapi import APIRouter, HTTPException, File, UploadFile
import pypdf
import io

from app.models.schema import DeveloperProfile
from app.services.parse import extract_full_profile

router = APIRouter()


@router.post("/parse-resume", response_model=DeveloperProfile)
async def parse_resume(file: UploadFile = File(...)):

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    try:
        pdf_content = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(pdf_content))

        raw_text = ""
        for page in pdf_reader.pages:
            raw_text += page.extract_text() + "\n"

        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        full_profile = await extract_full_profile(raw_text)
        return full_profile
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(exc)}")