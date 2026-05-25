#!/bin/bash
# 개발 서버 실행 스크립트 (Linux/Mac)
# 사용법: bash scripts/dev.sh

set -e

echo "LLM Chatbot 개발 서버 시작..."

# .env 파일 확인
if [ ! -f ".env" ]; then
  echo ".env 파일이 없습니다. .env.example을 복사합니다."
  cp .env.example .env
  echo ".env 파일을 열어 API 키를 설정해주세요."
  exit 1
fi

# FastAPI 백그라운드 실행
echo "FastAPI 서버 시작 (http://localhost:8000)..."
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
API_PID=$!

sleep 2

# Streamlit 실행
echo "Streamlit 서버 시작 (http://localhost:8501)..."
streamlit run streamlit_app/app.py \
  --server.port 8501 \
  --server.address 0.0.0.0

# 종료 시 FastAPI 프로세스 정리
kill $API_PID
