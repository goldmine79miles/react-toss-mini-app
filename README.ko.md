# react-toss-mini-app

> 토스 미니앱(앱인토스) 개발용 React Hooks 라이브러리. 인증, 광고, 포인트, 공유, 네비게이션을 한 번에.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-17.0+-61DAFB.svg)](https://react.dev/)

[English](./README.md) | **한국어**

**5개 프로덕션 미니앱**에서 검증된 라이브러리 (합산 사용자 10만명+):
- ☕ **[공짜커피](https://minion.toss.im/lWMEDzrv)** — 커피 미니앱, **토스 미니앱 1위** 🏆
- 🔮 사주박사 — 한국 전통 사주 풀이
- 🍗 치킨준닭 — 치킨 배달 리워드
- 🎰 또로또 — 복권
- 📊 다이쏘 — 대시보드

---

## 왜 만들었나

토스 미니앱 개발하다 보면 만나는 문제들:
- `@apps-in-toss/web-framework` SDK가 1.0 / 2.0 버전마다 API가 달라짐
- LocalStorage 캐싱 직접 박아야 함 (안 그러면 매번 로그인 느림)
- 광고 3종 (배너/전면/보상형) API가 다 다름
- 토스포인트 지급 API + 중복 처리 + 5,000P 제한
- 뒤로가기 안 박으면 앱 강제 종료로 반려
- 백엔드 mTLS + CORS + AES-256-GCM 박는 거

이거 4번 박아보면서 정리한 패턴들을 React hook으로 박은 라이브러리.

---

## 설치

```bash
npm install react-toss-mini-app
# 또는
pnpm add react-toss-mini-app
# 또는
yarn add react-toss-mini-app
```

Peer dependencies (별도 설치):
```bash
npm install react @apps-in-toss/web-framework
```

---

## 빠른 시작

### 1. 토스 사용자 인증

```tsx
import { useTossUser } from 'react-toss-mini-app';

function App() {
  const { user, isAuthenticated, loading, error } = useTossUser();

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error}</div>;
  if (!isAuthenticated) return <div>토스 앱에서 열어주세요</div>;

  return <div>안녕하세요 {user.nickname}님!</div>;
}
```

**특징**:
- LocalStorage 24시간 캐싱 — 두 번째부터는 즉시 로드
- `?dev=1` 쿼리 박으면 로컬 개발용 mock 유저 박힘
- 토큰 만료 시 자동 재요청

---

### 2. 광고

```tsx
import { useTossAds } from 'react-toss-mini-app';

function GameOver() {
  const { showAd, loading } = useTossAds();

  const handleRewardedAd = async () => {
    const result = await showAd({
      adUnitId: 'ca-app-pub-XXX/YYY',  // 토스 콘솔에서 발급
      type: 'rewarded',
      placement: 'game-over-screen',
    });

    if (result.rewarded) {
      grantInGameReward(100);  // 보상 지급
    }
  };

  return (
    <button onClick={handleRewardedAd} disabled={loading}>
      광고 보고 100코인 받기
    </button>
  );
}
```

**3종 광고**:
| 종류 | 용도 |
|---|---|
| `banner` | 인라인 배너 |
| `interstitial` | 전면 광고 (콘텐츠 사이) |
| `rewarded` | 보상형 (광고 보면 보상 지급) |

⚠️ 광고 ID는 **반드시 하드코딩** (환경변수 X) — 토스 정책.

---

### 3. 토스포인트 지급

```tsx
import { useTossPoints } from 'react-toss-mini-app';

function DailyCheckIn() {
  const { grant, loading } = useTossPoints();

  const handleCheckIn = async () => {
    const result = await grant({
      promotionCode: 'DAILY_CHECKIN_500',
    });

    if (result.success) {
      toast(`${result.amount}P 적립!`);
    } else if (result.duplicate) {
      toast('이미 받으셨어요');
    } else {
      toast(`실패: ${result.error}`);
    }
  };

  return <button onClick={handleCheckIn}>출석 체크</button>;
}
```

**주의사항**:
- 프로모션은 토스 콘솔에서 **미리 생성** 필수
- 예산 **선충전** 필수 (개발자 부담)
- 1회 **최대 5,000P**
- 중복 방지는 토스 서버 자동 처리 — `result.duplicate === true` 박혀있으면 이미 받은 거

---

### 4. 공유

```tsx
import { useTossShare } from 'react-toss-mini-app';

function ResultPage({ resultId }) {
  const share = useTossShare();

  return (
    <button onClick={() => share({
      title: '오늘의 운세',
      text: '내 사주 결과를 친구에게 공유해보세요',
      url: `https://sajubaksa.apps.tossmini.com/result/${resultId}`,
    })}>
      공유하기
    </button>
  );
}
```

⚠️ **SDK 2.0+ 필수**. SDK 1.0의 share API는 작동 안 함 — 대표적인 반려 사유.

---

### 5. 뒤로가기 + 결과 캐싱

```tsx
import { useTossBack } from 'react-toss-mini-app';

function ResultPage({ sajuResult }) {
  useTossBack({
    resultCacheKey: 'last-saju-result',
    resultCacheValue: sajuResult,
    onBack: () => {
      analytics.track('result_back_pressed');
    },
  });

  return <div>{/* 결과 표시 */}</div>;
}
```

**2가지 반려 사유 해결**:
1. **히스토리 없을 때 앱 강제 종료** → 토스 SDK `close()` 자동 호출로 graceful 종료
2. **뒤로가기로 결과 데이터 손실** → `sessionStorage`에 자동 캐싱

---

### 6. 환경 감지

```tsx
import { useTossEnvironment } from 'react-toss-mini-app';

function App() {
  const env = useTossEnvironment();

  if (!env.isTossApp && !env.isDev) {
    return <div>이 앱은 토스에서 열어주세요</div>;
  }

  if (env.isDev) {
    return <DevModeBanner />;
  }

  return <MainApp />;
}
```

---

## API 레퍼런스

### Hooks
| Hook | 용도 |
|---|---|
| `useTossUser()` | 사용자 인증 + 캐싱 |
| `useTossAds()` | 배너/전면/보상형 광고 |
| `useTossPoints()` | 토스포인트 지급 |
| `useTossShare()` | 네이티브 공유 (SDK 2.0+) |
| `useTossBack(opts)` | 뒤로가기 + 결과 캐싱 |
| `useTossEnvironment()` | 환경 감지 (dev/Toss앱/웹) |

### Types
모든 TypeScript 타입 export 박혀있음:
```ts
import type {
  TossUser, TossAuthResult,
  TossAdType, TossAdConfig, TossAdResult,
  TossPointsConfig, TossPointsResult,
  TossShareOptions, TossEnvironment,
} from 'react-toss-mini-app';
```

---

## 흔한 반려 사유 (4번 출시하면서 배운 거)

### 1. 앱 이름 불일치
`granite.config.ts`의 `appName`이 토스 콘솔 등록명과 **정확히 일치**해야 함. 대소문자 구분. 한 글자 차이도 반려.

### 2. 아이콘은 토스 CDN 필수
```ts
// ❌ 반려됨
icon: 'https://your-domain.com/icon.png'

// ✅ 토스 CDN만 가능
icon: 'https://static.toss.im/appsintoss/your-app-icon.png'
```

### 3. CORS 허용 목록
백엔드 API CORS 설정에 **두 도메인 모두** 박아야 함:
```
https://<앱이름>.apps.tossmini.com
https://<앱이름>.private-apps.tossmini.com
```

### 4. 백엔드 mTLS + AES-256-GCM
토스 → 백엔드 API 호출 시 필요:
- mTLS 클라이언트 인증서 (토스 콘솔 발급)
- AES-256-GCM body 암호화 (공유 키)
- URL에 `www.` 포함 필수 (307 리다이렉트 시 POST body 유실)

### 5. 광고 ID 플레이스홀더
`'YOUR_AD_UNIT_ID'` 같은 placeholder 박혀있으면 반려됨. 실제 ID 박아야 함.

### 6. webViewProps
```ts
webViewProps: { type: 'partner' }  // 필수
```

---

## 로컬 개발

```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 ?dev=1 박아서 mock 유저 사용
http://localhost:3000/?dev=1
```

`useTossUser()`가 mock 유저 `{ userId: 'dev-user-12345', nickname: '개발자' }` 박혀있어서 토스 앱 없이도 개발 박힘.

---

## 빌드 & 배포

```bash
# 프로덕션 빌드
vite build

# 토스에 배포
npx granite deploy
```

`package.json`의 `version` 매번 올려야 함.

---

## 왜 만들었나 (개인)

저는 안동현([@goldmine79miles](https://github.com/goldmine79miles))이고, 한국에서 여러 토스 미니앱과 SaaS를 개발하고 있습니다.

4번 출시하면서 (반려 여러 번, 고객지원 핑퐁, 문서 안 박힌 SDK 동작 추적) 진짜 작동하는 패턴들을 라이브러리로 박았습니다. 신규 출시할 때마다 수십 시간씩 절약됐습니다.

주로 **Claude Code (Sonnet 4.5 / 4.6)**로 박은 라이브러리입니다 — SDK 버그 추적, 타입 정의 생성, 엣지 케이스 리뷰까지. Anthropic 모델이 한국 B2C 제품 박는 데 진짜 필수가 됐습니다.

---

## 기여

PR 환영합니다 — 특히:
- 추가 토스 SDK feature wrapper
- 새 SDK 버전 대응 버그 픽스
- 번역 (한국어 ↔ 영어)
- 본인 미니앱 출시 박은 거 공유

큰 변경은 이슈 먼저 박아주세요.

---

## 라이센스

[MIT](./LICENSE) © 2026 안동현

---

## 관련 프로젝트

- [`@apps-in-toss/web-framework`](https://www.npmjs.com/package/@apps-in-toss/web-framework) — 토스 공식 SDK
- [`@aspect-build/granite-cli`](https://www.npmjs.com/package/@aspect-build/granite-cli) — 토스 미니앱 CLI
- [SYNDI](https://syndi.my) — 올인원 AI 콘텐츠 자동화 플랫폼 (제 메인 프로젝트)
