# react-toss-mini-app

> React hooks and utilities for building **Toss Mini-Apps** (앱인토스) — auth, ads, points, share, navigation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-17.0+-61DAFB.svg)](https://react.dev/)

**Battle-tested across 5+ production mini-apps** with 100k+ users:
- ☕ **[공짜커피 (Free Coffee)](https://minion.toss.im/lWMEDzrv)** — Coffee mini-app, **#1 ranking on Toss** 🏆
- 🔮 사주박사 — Korean fortune telling
- 🍗 치킨준닭 — Chicken delivery rewards
- 🎰 또로또 — Lottery
- 📊 다이쏘 — Dashboard

---

## Why this library?

Building a Toss Mini-App requires navigating:
- `@apps-in-toss/web-framework` SDK with versioned APIs (1.0 vs 2.0)
- LocalStorage caching for instant auth
- Three ad types (Banner / Interstitial / Rewarded) with different APIs
- Toss Points promotion code system with server-side dedup
- Hardware back button handling for graceful app exit
- mTLS + CORS + AES-256-GCM for backend API integration

This library packages those patterns into clean React hooks with full TypeScript support.

---

## Installation

```bash
npm install react-toss-mini-app
# or
pnpm add react-toss-mini-app
# or
yarn add react-toss-mini-app
```

Peer dependencies (must be installed separately):
```bash
npm install react @apps-in-toss/web-framework
```

---

## Quick start

### Authentication

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

**Features**:
- LocalStorage cache (24h TTL) — instant subsequent loads
- `?dev=1` query param enables mock user for local dev
- Auto-refresh on token expiry

---

### Ads (광고)

```tsx
import { useTossAds } from 'react-toss-mini-app';

function GameOver() {
  const { showAd, loading } = useTossAds();

  const handleRewardedAd = async () => {
    const result = await showAd({
      adUnitId: 'ca-app-pub-XXX/YYY',  // From Toss console
      type: 'rewarded',
      placement: 'game-over-screen',
    });

    if (result.rewarded) {
      grantInGameReward(100);  // User earned reward
    }
  };

  return (
    <button onClick={handleRewardedAd} disabled={loading}>
      광고 보고 100코인 받기
    </button>
  );
}
```

**Three ad types**:
| Type | Use case |
|---|---|
| `banner` | Inline display ad |
| `interstitial` | Full-screen between content |
| `rewarded` | User watches for in-app reward |

⚠️ Ad unit IDs **must be hardcoded** (not from env vars) per Toss policy.

---

### Toss Points (포인트 지급)

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

  return <button onClick={handleCheckIn}>매일 출석 체크</button>;
}
```

**Constraints**:
- Promotion must be created on Toss console **before** first grant
- Budget must be **pre-funded** (developer pays)
- Max **5,000 points** per grant
- Server-side dedup is automatic — `result.duplicate === true` if already received

---

### Share dialog

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

⚠️ **Requires SDK 2.0+**. SDK 1.0's share API does NOT work — common rejection cause.

---

### Back button + result caching

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

  return <div>{/* result display */}</div>;
}
```

Solves two common rejection causes:
1. **App exits abruptly** when no history — calls Toss SDK `close()` gracefully
2. **Result data loss** on back navigation — auto-caches to `sessionStorage`

---

### Environment detection

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

## API reference

### Hooks
| Hook | Purpose |
|---|---|
| `useTossUser()` | Authenticate + cache user |
| `useTossAds()` | Show banner / interstitial / rewarded ads |
| `useTossPoints()` | Grant Toss Points via promotion |
| `useTossShare()` | Open native share dialog (SDK 2.0+) |
| `useTossBack(opts)` | Handle back button + cache result |
| `useTossEnvironment()` | Detect runtime (dev / Toss app / web) |

### Types
All TypeScript types are exported:
```ts
import type {
  TossUser, TossAuthResult,
  TossAdType, TossAdConfig, TossAdResult,
  TossPointsConfig, TossPointsResult,
  TossShareOptions, TossEnvironment,
} from 'react-toss-mini-app';
```

---

## Common pitfalls (from 4 production launches)

### 1. App name mismatch
`granite.config.ts` `appName` MUST exactly match the name registered on Toss console. Case-sensitive. Even a single character difference → rejection.

### 2. Icon must use Toss CDN
```ts
// ❌ Will be rejected
icon: 'https://your-domain.com/icon.png'

// ✅ Must be Toss CDN
icon: 'https://static.toss.im/appsintoss/your-app-icon.png'
```

### 3. CORS allowlist for backend
Add **both** domains to your API's CORS allowlist:
```
https://<app-name>.apps.tossmini.com
https://<app-name>.private-apps.tossmini.com
```

### 4. Backend mTLS + AES-256-GCM
Toss-to-backend API calls require:
- mTLS client certificate (issued from Toss console)
- AES-256-GCM body encryption with shared key
- URL must include `www.` (307 redirect strips POST body)

### 5. Ad unit ID placeholders
Don't ship with `'YOUR_AD_UNIT_ID'` strings. Toss reviewers will reject.

### 6. webViewProps
```ts
webViewProps: { type: 'partner' }  // Required
```

---

## Local development

```bash
# Start your app with dev mode
npm run dev

# Open in browser with ?dev=1 to mock Toss user
http://localhost:3000/?dev=1
```

`useTossUser()` returns a mock user `{ userId: 'dev-user-12345', nickname: '개발자' }` so you can develop without launching from inside the actual Toss app.

---

## Building and deployment

```bash
# Build for production
vite build

# Deploy to Toss
npx granite deploy
```

Don't forget to bump `version` in `package.json` before each deploy.

---

## Why I built this

I'm Donghyun An ([@goldmine79miles](https://github.com/goldmine79miles)) — a Korean indie hacker building multiple Toss Mini-Apps and SaaS products.

After shipping 4 mini-apps the hard way (multiple rejections, support ticket back-and-forth, undocumented SDK behavior), I extracted the patterns that actually work into this library. Saved me dozens of hours per new launch.

I built this primarily with **Claude Code (Sonnet 4.5 / 4.6)** as the development partner — debugging SDK quirks, generating type definitions, reviewing edge cases. Anthropic's models have become an indispensable part of my workflow for shipping Korean B2C products.

---

## Contributing

PRs welcome — especially:
- Additional Toss SDK feature wrappers
- Bug fixes for newer SDK versions
- Translations (Korean ↔ English)
- Production tips from your own mini-app launches

Open an issue first for major changes.

---

## License

[MIT](./LICENSE) © 2026 Donghyun An

---

## Related projects

- [`@apps-in-toss/web-framework`](https://www.npmjs.com/package/@apps-in-toss/web-framework) — Official Toss SDK
- [`@aspect-build/granite-cli`](https://www.npmjs.com/package/@aspect-build/granite-cli) — Toss Mini-App CLI
- [SYNDI](https://syndi.my) — All-in-one AI content automation platform (my main project)
