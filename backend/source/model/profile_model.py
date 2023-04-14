from pydantic import BaseModel

class RequestUpdateField(BaseModel):
    update_field: str | None = None
    
class RequestUpdatePasswordField(BaseModel):
    currently_password: str | None = None
    update_field: str | None = None
    
