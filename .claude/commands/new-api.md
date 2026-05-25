새 API 엔드포인트를 레이어드 아키텍처로 생성해줘. 리소스 이름은 $ARGUMENTS야.

아래 순서대로 진행해:

1. `backend/schemas/{리소스명}.py` 생성
   - Request / Response DTO (Pydantic BaseModel)
   - service_uid, job_uid 필드 포함

2. `backend/repositories/{리소스명}_repository.py` 생성
   - Redis 또는 인메모리 기반 CRUD 메서드
   - `SessionRepository` 패턴 참고

3. `backend/services/{리소스명}_service.py` 생성
   - Repository를 생성자 주입으로 받음
   - 비즈니스 로직 구현

4. `backend/api/v1/{리소스명}.py` 생성
   - FastAPI APIRouter 사용
   - `prefix="/{리소스명}"`, `tags=["{리소스명}"]`
   - `ApiResponse` 공통 응답 형식 사용
   - 의존성 주입으로 Service 받기

5. `backend/main.py` 에 새 라우터 import 및 `include_router` 등록

6. 생성된 파일 목록과 각 엔드포인트 경로를 요약해서 알려줘
