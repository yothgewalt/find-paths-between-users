from pydantic import BaseModel

from typing import Any

class DefaultResponseModel(BaseModel):
    status_code: int | None = None
    error: Any | None = None
    message: str | None = None
    data: Any | None = None
