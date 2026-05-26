import { useMemo } from 'react';
import type { TossEnvironment } from '../types';

/**
 * useTossEnvironment — Detect Toss Mini-App runtime environment
 *
 * Helps gate features that only work inside Toss WebView,
 * or enable mock behavior during local development.
 *
 * @example
 * ```tsx
 * const env = useTossEnvironment();
 *
 * if (!env.isTossApp && !env.isDev) {
 *   return <div>이 앱은 토스에서 열어주세요</div>;
 * }
 *
 * if (env.isDev) {
 *   return <DevModeBanner />;
 * }
 * ```
 */
export function useTossEnvironment(): TossEnvironment {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return { isTossApp: false, isDev: false, webViewType: 'unknown' };
    }

    const ua = navigator.userAgent || '';
    const params = new URLSearchParams(window.location.search);

    // Detect Toss WebView via UA signature
    const isTossApp = /toss/i.test(ua) || /apps-in-toss/i.test(ua);

    // ?dev=1 enables mock mode
    const isDev = params.get('dev') === '1';

    // Partner WebView vs Toss native WebView
    let webViewType: TossEnvironment['webViewType'] = 'unknown';
    if (/partner/i.test(ua)) webViewType = 'partner';
    else if (isTossApp) webViewType = 'toss';

    return { isTossApp, isDev, webViewType };
  }, []);
}
