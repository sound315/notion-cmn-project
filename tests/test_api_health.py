"""
Health API 엔드포인트 통합 테스트 - TestClient 활용
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from backend.main import app
from backend.core.config import Settings


@pytest.fixture
def client():
  """FastAPI TestClient 픽스처"""
  with TestClient(app) as c:
    yield c


class TestHealthEndpoint:
  """GET /health 엔드포인트 테스트"""

  def test_health_check_returns_200(self, client):
    """헬스체크 엔드포인트가 200을 반환하는지 검증"""
    response = client.get("/health")
    assert response.status_code == 200

  def test_health_check_response_structure(self, client):
    """헬스체크 응답이 ApiResponse 형식인지 검증"""
    response = client.get("/health")
    data = response.json()
    assert "success" in data
    assert data["success"] is True
    assert "data" in data

  def test_health_check_data_status_ok(self, client):
    """헬스체크 data.status가 'ok'인지 검증"""
    response = client.get("/health")
    data = response.json()
    assert data["data"]["status"] == "ok"


class TestRootEndpoint:
  """GET / 루트 엔드포인트 테스트"""

  def test_root_returns_200(self, client):
    """루트 엔드포인트가 200을 반환하는지 검증"""
    response = client.get("/")
    assert response.status_code == 200

  def test_root_returns_app_info(self, client):
    """루트 응답에 앱 정보가 포함되는지 검증"""
    response = client.get("/")
    data = response.json()
    assert "app" in data
    assert "version" in data
    assert "docs" in data
