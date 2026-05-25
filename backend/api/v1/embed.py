from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import HTMLResponse, FileResponse

router = APIRouter(tags=["embed"])

WIDGET_DIR = Path(__file__).parent.parent.parent.parent / "widget"


@router.get("/embed", response_class=HTMLResponse)
async def embed_chat():
  """iframe 임베딩용 채팅 UI"""
  html_path = WIDGET_DIR / "embed.html"
  return HTMLResponse(content=html_path.read_text(encoding="utf-8"))


@router.get("/widget/chatbot.js")
async def serve_widget_js():
  """임베딩 위젯 JS 파일 서빙"""
  return FileResponse(WIDGET_DIR / "chatbot.js", media_type="application/javascript")
