# 개발 서버 실행 스크립트 (Windows PowerShell)
# 사용법: .\scripts\dev.ps1

Write-Host "LLM Chatbot 개발 서버 시작..." -ForegroundColor Green

# .env 파일 확인
if (-not (Test-Path ".env")) {
  Write-Host ".env 파일이 없습니다. .env.example 을 복사합니다." -ForegroundColor Yellow
  Copy-Item ".env.example" ".env"
  Write-Host ".env 파일을 열어 API 키를 설정해주세요." -ForegroundColor Red
  exit 1
}

# FastAPI 서버 백그라운드 실행
Write-Host "FastAPI 서버 시작 (http://localhost:8000)..." -ForegroundColor Cyan
$apiJob = Start-Job -ScriptBlock {
  Set-Location $using:PWD
  uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
}

Start-Sleep -Seconds 2

# Streamlit 서버 실행
Write-Host "Streamlit 서버 시작 (http://localhost:8501)..." -ForegroundColor Cyan
streamlit run streamlit_app/app.py --server.port 8501 --server.address 0.0.0.0

# 종료 시 FastAPI 서버도 정리
Stop-Job $apiJob
Remove-Job $apiJob
