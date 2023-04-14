from pydantic import BaseModel

class Token(BaseModel):
    access_token: str | None = None
    
class TokenData(BaseModel):
    email_address: str | None = None
    
class AuthenticateUserModel(BaseModel):
    email_address: str | None = None
    password: str | None = None

class CreateUserModel(BaseModel):
    email_address: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    password: str | None = None
    
class ResponseCreateUserModel(BaseModel):
    email_address: str | None = None
    fullname: str | None = None
    
class UserModel(BaseModel):
    id: str | None = None
    email_address: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    profile_slug: str | None = None