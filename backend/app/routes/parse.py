from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel
import pypdf
import io

from app.models.schema import DeveloperProfile
from app.services.parse import extract_full_profile
from app.core.database import profiles_collection

router = APIRouter()

# =========================
# ✅ TEXT INPUT MODEL
# =========================
class TextRequest(BaseModel):
    text: str


# =========================
# ✅ TEXT PARSE (USED BY FRONTEND NOW)
# =========================
@router.post("/parse-text", response_model=DeveloperProfile)
async def parse_text(req: TextRequest):
    try:
        if not req.text.strip():
            raise HTTPException(status_code=400, detail="Empty text provided")

        full_profile = await extract_full_profile(req.text)
        return full_profile

    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error parsing text: {str(exc)}")


# =========================
# ✅ PDF PARSE (KEEP FOR FUTURE)
# =========================
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
        await profiles_collection.insert_one(full_profile.copy())
        return full_profile

    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(exc)}")