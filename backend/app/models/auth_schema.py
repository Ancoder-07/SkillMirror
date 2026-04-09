from pydantic import BaseModel, EmailStr

class Signup(BaseModel):
    name: str
    email: EmailStr
    password: str

class Login(BaseModel):
    email: EmailStr
    password: str