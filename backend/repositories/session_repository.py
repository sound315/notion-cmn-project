import json
from datetime import datetime
from typing import Optional
import redis.asyncio as aioredis

from backend.schemas.chat import ChatMessage


class SessionRepository:

  def __init__(self, redis_url: str, ttl_seconds: int):
    self._redis_url = redis_url
    self._ttl = ttl_seconds
    self._client: Optional[aioredis.Redis] = None

  async def _get_client(self) -> aioredis.Redis:
    if self._client is None:
      self._client = await aioredis.from_url(self._redis_url, decode_responses=True)
    return self._client

  async def get_messages(self, session_id: str) -> list[ChatMessage]:
    client = await self._get_client()
    raw = await client.get(f"session:{session_id}:messages")
    if not raw:
      return []
    return [ChatMessage(**m) for m in json.loads(raw)]

  async def save_messages(self, session_id: str, messages: list[ChatMessage]) -> None:
    client = await self._get_client()
    key = f"session:{session_id}:messages"
    await client.set(key, json.dumps([m.model_dump() for m in messages]), ex=self._ttl)
    await client.set(f"session:{session_id}:updated_at", datetime.utcnow().isoformat(), ex=self._ttl)

  async def append_messages(self, session_id: str, new_messages: list[ChatMessage]) -> list[ChatMessage]:
    existing = await self.get_messages(session_id)
    combined = existing + new_messages
    await self.save_messages(session_id, combined)
    return combined

  async def delete_session(self, session_id: str) -> None:
    client = await self._get_client()
    await client.delete(f"session:{session_id}:messages", f"session:{session_id}:updated_at")

  async def get_session_meta(self, session_id: str) -> dict:
    messages = await self.get_messages(session_id)
    client = await self._get_client()
    updated_at = await client.get(f"session:{session_id}:updated_at") or ""
    return {
      "session_id": session_id,
      "message_count": len(messages),
      "updated_at": updated_at,
    }
