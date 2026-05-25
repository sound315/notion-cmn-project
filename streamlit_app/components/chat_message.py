import streamlit as st


def render_message(role: str, content: str):
  """역할에 따른 채팅 메시지 렌더링"""
  avatar = "🧑‍💻" if role == "user" else "🤖"
  with st.chat_message(role, avatar=avatar):
    st.markdown(content)


def render_chat_history(messages: list[dict]):
  """전체 채팅 이력 렌더링"""
  for msg in messages:
    render_message(msg["role"], msg["content"])
