from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.core.config import get_settings
from backend.api.v1 import chat, health, embed

settings = get_settings()

app = FastAPI(
  title=settings.app_name,
  version=settings.app_version,
  docs_url="/docs",
  redoc_url="/redoc",
)

# CORS - iframe 임베딩을 위해 전체 허용 가능하도록 설정
app.add_middleware(
  CORSMiddleware,
  allow_origins=settings.cors_origins_list,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


@app.middleware("http")
async def add_iframe_headers(request: Request, call_next):
  """iframe 임베딩 허용을 위한 헤더 추가"""
  response = await call_next(request)
  origins = settings.allow_iframe_origins
  if origins == "*":
    response.headers["X-Frame-Options"] = "ALLOWALL"
  else:
    response.headers["Content-Security-Policy"] = f"frame-ancestors {origins}"
  return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
  return JSONResponse(
    status_code=500,
    content={"success": False, "error": str(exc), "message": "서버 오류가 발생했습니다."},
  )


app.include_router(health.router)
app.include_router(chat.router, prefix="/api/v1")
app.include_router(embed.router)


@app.get("/")
async def root():
  return {"app": settings.app_name, "version": settings.app_version, "docs": "/docs"}
