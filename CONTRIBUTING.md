# Contributing to react-toss-mini-app

감사합니다! 기여 환영합니다.

## 기여하는 방법

### 1. 이슈 박기
- 버그 발견 → [Issue 박기](https://github.com/goldmine79miles/react-toss-mini-app/issues/new)
- 새 기능 제안 → 마찬가지로 이슈 박아주세요
- 큰 변경은 PR 박기 전에 이슈로 먼저 논의

### 2. 로컬 개발
```bash
git clone https://github.com/goldmine79miles/react-toss-mini-app.git
cd react-toss-mini-app
npm install
npm run build
```

### 3. PR 박는 순서
1. Fork 박기
2. Feature 브랜치 박기 (`git checkout -b feat/my-feature`)
3. 변경 박기
4. `npm run build` 박아서 타입 에러 없는지 확인
5. Commit 박기 (conventional commits 추천: `feat:`, `fix:`, `docs:`)
6. Push 박기
7. PR 박기

### 4. 환영하는 기여
- ✅ 새 SDK 버전 대응 버그 픽스
- ✅ 추가 토스 SDK feature wrapper
- ✅ 번역 (한국어 ↔ 영어)
- ✅ 본인 미니앱 출시 박은 경험 README에 추가
- ✅ 예제 추가 (`examples/` 폴더)
- ✅ 테스트 추가
- ✅ 문서 개선

### 5. 코드 스타일
- TypeScript strict mode
- 함수형 컴포넌트 + hooks
- 외부 의존성 최소화 (peer dep만 사용)
- JSDoc 주석으로 사용 예제 박기

## 행동 강령
모든 기여자는 서로 존중합니다. 차별/괴롭힘 0 톨러런스.

## 라이센스
기여하시는 모든 코드는 [MIT 라이센스](./LICENSE)로 박힙니다.
