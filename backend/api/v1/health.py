from fastapi import APIRouter
from backend.schemas.common import ApiResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=ApiResponse[dict])
async def health_check():
  return ApiResponse.ok(data={"status": "ok"})
