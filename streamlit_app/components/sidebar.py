import streamlit as st
import httpx
from datetime import datetime


def render_sidebar(api_base_url: str) -> dict:
  """사이드바 렌더링 - 설정, 세션 관리 반환"""
  with st.sidebar:
    st.title("💬 LLM Chatbot")
    st.divider()

    # 프로바이더 정보
    try:
      resp = httpx.get(f"{api_base_url}/api/v1/chat/provider", timeout=3)
      if resp.status_code == 200:
        provider = resp.json()["data"]["provider"]
        st.caption(f"🔌 프로바이더: `{provider}`")
    except Exception:
      st.caption("🔌 프로바이더: 연결 중...")

    st.divider()

    # 새 대화 버튼
    if st.button("➕ 새 대화", use_container_width=True, type="primary"):
      st.session_state.session_id = None
      st.session_state.messages = []
      st.session_state.chat_title = "새 대화"
      st.rerun()

    st.divider()

    # 시스템 프롬프트 설정
    with st.expander("⚙️ 시스템 프롬프트", expanded=False):
      system_prompt = st.text_area(
        "AI 역할 지시",
        value=st.session_state.get("system_prompt", "당신은 도움이 되는 AI 어시스턴트입니다. 한국어로 답변해 주세요."),
        height=120,
        label_visibility="collapsed",
      )
      if st.button("적용", use_container_width=True):
        st.session_state.system_prompt = system_prompt
        st.success("적용되었습니다.")

    # 파라미터 설정
    with st.expander("🎛️ 파라미터 설정", expanded=False):
      temperature = st.slider("Temperature", 0.0, 2.0, st.session_state.get("temperature", 0.7), 0.1)
      max_tokens = st.select_slider(
        "Max Tokens",
        options=[256, 512, 1024, 2048, 4096, 8192],
        value=st.session_state.get("max_tokens", 4096),
      )
      st.session_state.temperature = temperature
      st.session_state.max_tokens = max_tokens

    st.divider()

    # 대화 초기화 버튼
    if st.session_state.get("messages"):
      if st.button("🗑️ 대화 초기화", use_container_width=True):
        st.session_state.messages = []
        st.session_state.session_id = None
        st.rerun()

    # 사이드바 하단 정보
    st.markdown("---")
    st.caption("LLM Chatbot Starter Kit v1.0")

  return {
    "system_prompt": st.session_state.get("system_prompt", "당신은 도움이 되는 AI 어시스턴트입니다. 한국어로 답변해 주세요."),
    "temperature": st.session_state.get("temperature", 0.7),
    "max_tokens": st.session_state.get("max_tokens", 4096),
  }
