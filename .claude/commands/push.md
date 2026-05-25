현재 브랜치를 원격 저장소에 push해줘.

아래 순서대로 진행해:

1. `git status` 로 현재 상태 확인
   - 커밋되지 않은 변경사항이 있으면 사용자에게 알리고 push 진행 여부를 물어봐

2. `git log origin/<현재브랜치>..HEAD` 로 push할 커밋 목록 확인
   - push할 커밋이 없으면 "push할 커밋이 없습니다" 라고 알려줘

3. 현재 브랜치명을 확인하고 아래 규칙에 따라 push 실행:
   - main 또는 master 브랜치: 사용자에게 확인 후 push (위험 경고 표시)
   - 그 외 브랜치: `git push origin <브랜치명>` 실행
   - 원격 브랜치가 없으면 `git push --set-upstream origin <브랜치명>` 실행

4. push 결과를 요약해서 알려줘:
   - push한 브랜치명
   - push된 커밋 수
   - 원격 저장소 URL
