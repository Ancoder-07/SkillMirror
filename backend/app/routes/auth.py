from fastapi import APIRouter
from app.models.auth_schema import Signup, Login
from app.services.auth_service import hash_password, verify_password, create_token
from app.core.database import users_collection

router = APIRouter(prefix="/auth")

@router.post("/signup")
async def signup(user: Signup):
    existing = await users_collection.find_one({"email": user.email})

    if existing:
        return {"error": "User already exists"}

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
        return {"error": "User not found"}

    if not verify_password(user.password, db_user["password"]):
        return {"error": "Wrong password"}

    token = create_token({"email": user.email})

    return {"access_token": token}