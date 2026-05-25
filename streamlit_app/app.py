import os
import streamlit as st
from dotenv import load_dotenv

load_dotenv()

from streamlit_app.components.sidebar import render_sidebar
from streamlit_app.components.chat_message import render_chat_history
from streamlit_app.api_client import ChatAPIClient

# ── 페이지 설정 ──────────────────────────────────────────────
st.set_page_config(
  page_title="LLM Chatbot",
  page_icon="💬",
  layout="wide",
  initial_sidebar_state="expanded",
)

# ── 전역 CSS (GPT/Claude 스타일) ─────────────────────────────
st.markdown("""
<style>
  /* 채팅 영역 스크롤 최적화 */
  .main .block-container { padding-top: 1rem; padding-bottom: 5rem; max-width: 860px; }
  /* 입력창 고정 하단 */
  .stChatFloatingInputContainer { bottom: 1rem; }
  /* 어시스턴트 메시지 배경 */
  [data-testid="stChatMessage"]:has([data-testid="stChatMessageAvatar"] img[alt="🤖"]) {
    background-color: #f7f7f8;
    border-radius: 12px;
    padding: 0.5rem;
  }
  /* 사이드바 배경 */
  [data-testid="stSidebar"] { background-color: #202123; }
  [data-testid="stSidebar"] * { color: #ececf1 !important; }
  [data-testid="stSidebar"] .stButton button {
    background-color: #343541;
    border: 1px solid #565869;
    color: #ececf1 !important;
    border-radius: 6px;
  }
  [data-testid="stSidebar"] .stButton button:hover { background-color: #40414f; }
  /* 상단 헤더 숨김 */
  #MainMenu, header, footer { visibility: hidden; }
</style>
""", unsafe_allow_html=True)

# ── 초기 상태 설정 ────────────────────────────────────────────
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
client = ChatAPIClient(API_BASE_URL)

if "messages" not in st.session_state:
  st.session_state.messages = []
if "session_id" not in st.session_state:
  st.session_state.session_id = None
if "system_prompt" not in st.session_state:
  st.session_state.system_prompt = "당신은 도움이 되는 AI 어시스턴트입니다. 한국어로 답변해 주세요."
if "temperature" not in st.session_state:
  st.session_state.temperature = 0.7
if "max_tokens" not in st.session_state:
  st.session_state.max_tokens = 4096

# ── 사이드바 렌더링 ───────────────────────────────────────────
settings = render_sidebar(API_BASE_URL)

# ── 메인 채팅 영역 ────────────────────────────────────────────
# API 연결 상태 표시
if not client.health_check():
  st.warning("⚠️ API 서버에 연결할 수 없습니다. FastAPI 서버가 실행 중인지 확인하세요.", icon="⚠️")

# 대화가 없을 때 환영 화면
if not st.session_state.messages:
  st.markdown("""
  <div style="text-align:center; margin-top: 4rem; color: #888;">
    <h1 style="font-size:2.5rem;">💬 LLM Chatbot</h1>
    <p style="font-size:1.1rem;">무엇이든 물어보세요. Azure OpenAI가 답변해 드립니다.</p>
  </div>
  """, unsafe_allow_html=True)

  # 예시 프롬프트 버튼
  cols = st.columns(2)
  examples = [
    ("📝 코드 작성", "Python으로 REST API 클라이언트를 작성해줘"),
    ("🔍 설명 요청", "트랜스포머 아키텍처에 대해 쉽게 설명해줘"),
    ("🌐 번역", "다음 문장을 영어로 번역해줘: 안녕하세요"),
    ("💡 아이디어", "SaaS 스타트업 아이디어 5가지를 제안해줘"),
  ]
  for i, (label, prompt) in enumerate(examples):
    with cols[i % 2]:
      if st.button(label, use_container_width=True, key=f"example_{i}"):
        st.session_state.messages.append({"role": "user", "content": prompt})
        st.rerun()
else:
  render_chat_history(st.session_state.messages)

# ── 채팅 입력 처리 ────────────────────────────────────────────
if prompt := st.chat_input("메시지를 입력하세요..."):
  # 세션 최초 생성
  if st.session_state.session_id is None:
    st.session_state.session_id = client.create_session(
      title=prompt[:30],
      system_prompt=settings["system_prompt"],
    )

  # 유저 메시지 추가 및 렌더링
  st.session_state.messages.append({"role": "user", "content": prompt})
  with st.chat_message("user", avatar="🧑‍💻"):
    st.markdown(prompt)

  # 어시스턴트 스트리밍 응답
  with st.chat_message("assistant", avatar="🤖"):
    placeholder = st.empty()
    full_response = ""
    try:
      for token in client.stream_chat(
        messages=[{"role": "user", "content": prompt}],
        session_id=st.session_state.session_id,
        system_prompt=settings["system_prompt"],
        temperature=settings["temperature"],
        max_tokens=settings["max_tokens"],
      ):
        full_response += token
        placeholder.markdown(full_response + "▌")
      placeholder.markdown(full_response)
    except Exception as e:
      placeholder.error(f"오류가 발생했습니다: {e}")
      full_response = f"[오류] {e}"

  st.session_state.messages.append({"role": "assistant", "content": full_response})
