from fastapi import APIRouter, HTTPException
from app.models.auth_schema import Signup, Login
from app.services.auth_service import hash_password, verify_password, create_token
from app.core.database import users_collection

router = APIRouter(prefix="/auth")

@router.post("/signup")
async def signup(user: Signup):
    existing = await users_collection.find_one({"email": user.email})

    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    await users_collection.insert_one({
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password)
    })

    return {"message": "Signup successful"}


@router.post("/login")
async def login(user: Login):
    db_user = await users_collection.find_one({"email": user.email})

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect password")

    token = create_token({"email": user.email})

    return {"access_token": token}