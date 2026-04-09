from fastapi import APIRouter
from app.core.database import profiles_collection
from fastapi import Depends
from app.core.deps import verify_token

router = APIRouter(prefix="/profile")

@router.post("/setup")
async def setup_profile(data: dict):
    existing = await profiles_collection.find_one({"email": data["email"]})

    if existing:
        await profiles_collection.update_one(
            {"email": data["email"]},
            {"$set": data}
        )
    else:
        await profiles_collection.insert_one(data)

    return {"message": "Profile saved"}