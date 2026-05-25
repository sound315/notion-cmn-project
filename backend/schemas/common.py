from typing import Any, Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
  success: bool = True
  data: T | None = None
  message: str = ""
  error: str | None = None

  @classmethod
  def ok(cls, data: T = None, message: str = "") -> "ApiResponse[T]":
    return cls(success=True, data=data, message=message)

  @classmethod
  def fail(cls, error: str, message: str = "") -> "ApiResponse[None]":
    return cls(success=False, error=error, message=message)
