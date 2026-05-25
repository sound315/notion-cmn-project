import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from backend.core.dependencies import get_llm_service, get_session_repository
from backend.repositories.session_repository import SessionRepository
from backend.schemas.chat import ChatMessage, ChatRequest, ChatResponse, SessionCreateRequest
from backend.schemas.common import ApiResponse
from backend.services.llm.base import BaseLLMService

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/sessions", response_model=ApiResponse[dict])
async def create_session(
  body: SessionCreateRequest,
  repo: SessionRepository = Depends(get_session_repository),
):
  session_id = str(uuid.uuid4())
  from datetime import datetime
  created_at = datetime.utcnow().isoformat()
  client = await repo._get_client()
  await client.set(f"session:{session_id}:meta", json.dumps({
    "title": body.title,
    "system_prompt": body.system_prompt or "",
    "created_at": created_at,
  }), ex=repo._ttl)
  return ApiResponse.ok(data={"session_id": session_id, "title": body.title})


@router.get("/sessions/{session_id}/messages", response_model=ApiResponse[list])
async def get_session_messages(
  session_id: str,
  repo: SessionRepository = Depends(get_session_repository),
):
  messages = await repo.get_messages(session_id)
  return ApiResponse.ok(data=[m.model_dump() for m in messages])


@router.delete("/sessions/{session_id}", response_model=ApiResponse[None])
async def delete_session(
  session_id: str,
  repo: SessionRepository = Depends(get_session_repository),
):
  await repo.delete_session(session_id)
  return ApiResponse.ok(message="세션이 삭제되었습니다.")


@router.post("/completions", response_model=ApiResponse[dict])
async def chat_completion(
  request: ChatRequest,
  llm: BaseLLMService = Depends(get_llm_service),
  repo: SessionRepository = Depends(get_session_repository),
):
  if request.session_id:
    history = await repo.get_messages(request.session_id)
    request.messages = history + request.messages

  try:
    response = await llm.chat(request)
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

  if request.session_id:
    assistant_msg = ChatMessage(role="assistant", content=response.content)
    await repo.append_messages(request.session_id, [request.messages[-1], assistant_msg])

  return ApiResponse.ok(data={
    "content": response.content,
    "model": response.model,
    "provider": response.provider,
    "usage": response.usage,
  })


@router.post("/stream")
async def stream_chat(
  request: ChatRequest,
  llm: BaseLLMService = Depends(get_llm_service),
  repo: SessionRepository = Depends(get_session_repository),
):
  if request.session_id:
    history = await repo.get_messages(request.session_id)
    request.messages = history + request.messages

  user_message = request.messages[-1]
  collected_tokens: list[str] = []

  async def event_generator():
    try:
      async for token in llm.stream_chat(request):
        collected_tokens.append(token)
        yield f"data: {json.dumps({'token': token})}\n\n"

      full_response = "".join(collected_tokens)
      if request.session_id:
        assistant_msg = ChatMessage(role="assistant", content=full_response)
        await repo.append_messages(request.session_id, [user_message, assistant_msg])

      yield f"data: {json.dumps({'done': True, 'full_content': full_response})}\n\n"
    except Exception as e:
      yield f"data: {json.dumps({'error': str(e)})}\n\n"

  return StreamingResponse(
    event_generator(),
    media_type="text/event-stream",
    headers={
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  )


@router.get("/models", response_model=ApiResponse[list])
async def list_models(llm: BaseLLMService = Depends(get_llm_service)):
  models = await llm.get_available_models()
  return ApiResponse.ok(data=models)


@router.get("/provider", response_model=ApiResponse[dict])
async def get_provider(llm: BaseLLMService = Depends(get_llm_service)):
  return ApiResponse.ok(data={"provider": llm.provider_name})
