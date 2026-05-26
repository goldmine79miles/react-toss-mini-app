/**
 * react-toss-mini-app
 *
 * React hooks and utilities for building Toss Mini-Apps (앱인토스).
 *
 * Battle-tested across 5+ production mini-apps:
 * - 공짜커피 (Free Coffee) — #1 ranked Toss Mini-App 🏆
 *   https://minion.toss.im/lWMEDzrv
 * - 사주박사 — Korean fortune telling
 * - 치킨준닭 — Chicken delivery rewards
 * - 또로또 — Lottery
 * - 다이쏘 — Dashboard
 *
 * @see https://docs.apps.tossmini.com — Official Toss docs
 * @see https://github.com/goldmine79miles/react-toss-mini-app — Repo
 */

export { useTossUser } from './hooks/useTossUser';
export { useTossAds } from './hooks/useTossAds';
export { useTossPoints } from './hooks/useTossPoints';
export { useTossShare } from './hooks/useTossShare';
export { useTossBack } from './hooks/useTossBack';
export { useTossEnvironment } from './hooks/useTossEnvironment';

export type {
  TossUser,
  TossAuthResult,
  TossAdType,
  TossAdConfig,
  TossAdResult,
  TossPointsConfig,
  TossPointsResult,
  TossShareOptions,
  TossEnvironment,
} from './types';
