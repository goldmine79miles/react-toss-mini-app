import { useEffect, useCallback } from 'react';

interface UseTossBackOptions {
  /** Called when user attempts to go back. Return true to prevent default. */
  onBack?: () => boolean | void;
  /** Cache key for result data persistence via sessionStorage */
  resultCacheKey?: string;
  /** Result data to cache on back */
  resultCacheValue?: unknown;
}

/**
 * useTossBack — Hardware back button + navigation handler for Toss Mini-Apps
 *
 * Solves two common rejection causes:
 * 1. **App exits on back press** when there's no history (Toss requires graceful exit)
 * 2. **Result data loss** when user navigates back from result screen
 *
 * Strategy:
 * - `window.history.length > 2` → safe to call `history.back()`
 * - `<= 2` → call Toss SDK `close()` to gracefully exit
 * - Cache result data in sessionStorage before navigation
 *
 * @example
 * ```tsx
 * // On result page — cache result and handle back
 * useTossBack({
 *   resultCacheKey: 'last-saju-result',
 *   resultCacheValue: sajuResult,
 *   onBack: () => {
 *     analytics.track('result_back_pressed');
 *   },
 * });
 *
 * // On home page — restore cached result on mount
 * useEffect(() => {
 *   const cached = sessionStorage.getItem('last-saju-result');
 *   if (cached) setLastResult(JSON.parse(cached));
 * }, []);
 * ```
 */
export function useTossBack(options: UseTossBackOptions = {}) {
  const { onBack, resultCacheKey, resultCacheValue } = options;

  // Cache result on every render where value changes
  useEffect(() => {
    if (resultCacheKey && resultCacheValue !== undefined) {
      try {
        sessionStorage.setItem(
          resultCacheKey,
          JSON.stringify(resultCacheValue)
        );
      } catch {
        // Quota exceeded — ignore
      }
    }
  }, [resultCacheKey, resultCacheValue]);

  const goBack = useCallback(async () => {
    const prevented = onBack?.();
    if (prevented === true) return;

    if (window.history.length > 2) {
      window.history.back();
      return;
    }

    // No history — try Toss SDK close, fallback to nothing
    try {
      // @ts-ignore
      const sdk = await import('@apps-in-toss/web-framework').catch(() => null);
      // @ts-ignore
      const closeFn = sdk?.close || sdk?.default?.close;
      if (closeFn) {
        await closeFn();
      }
    } catch {
      // Not in Toss app — do nothing
    }
  }, [onBack]);

  // Optionally intercept browser back button
  useEffect(() => {
    if (!onBack) return;
    const handler = (e: PopStateEvent) => {
      const prevented = onBack();
      if (prevented === true) {
        // Push state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [onBack]);

  return { goBack };
}
