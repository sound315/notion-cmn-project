import httpx
from typing import Generator


class ChatAPIClient:

  def __init__(self, base_url: str):
    self._base_url = base_url.rstrip("/")

  def create_session(self, title: str = "새 대화", system_prompt: str = "") -> str | None:
    try:
      resp = httpx.post(
        f"{self._base_url}/api/v1/chat/sessions",
        json={"title": title, "system_prompt": system_prompt},
        timeout=10,
      )
      if resp.status_code == 200:
        return resp.json()["data"]["session_id"]
    except Exception:
      pass
    return None

  def stream_chat(
    self,
    messages: list[dict],
    session_id: str | None,
    system_prompt: str,
    temperature: float,
    max_tokens: int,
  ) -> Generator[str, None, None]:
    payload = {
      "messages": messages,
      "session_id": session_id or "",
      "system_prompt": system_prompt,
      "temperature": temperature,
      "max_tokens": max_tokens,
      "stream": True,
    }
    import json
    with httpx.Client(timeout=120) as client:
      with client.stream("POST", f"{self._base_url}/api/v1/chat/stream", json=payload) as response:
        response.raise_for_status()
        for line in response.iter_lines():
          if line.startswith("data: "):
            data = json.loads(line[6:])
            if data.get("error"):
              raise RuntimeError(data["error"])
            if data.get("done"):
              break
            token = data.get("token", "")
            if token:
              yield token

  def health_check(self) -> bool:
    try:
      resp = httpx.get(f"{self._base_url}/health", timeout=3)
      return resp.status_code == 200
    except Exception:
      return False
