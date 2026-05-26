import { useCallback } from 'react';
import type { TossShareOptions } from '../types';

/**
 * useTossShare — Toss Mini-App share dialog
 *
 * Opens the native Toss share dialog. **Requires SDK 2.0+**.
 * SDK 1.0's share API does NOT work — common rejection cause.
 *
 * @example
 * ```tsx
 * const share = useTossShare();
 *
 * await share({
 *   title: '오늘의 운세 확인하세요',
 *   text: '내 사주 결과를 친구에게 공유해보세요',
 *   url: 'https://sajubaksa.apps.tossmini.com/result/abc123',
 * });
 * ```
 */
export function useTossShare() {
  return useCallback(async (options: TossShareOptions): Promise<boolean> => {
    try {
      // @ts-ignore — SDK dynamic import
      const sdk = await import('@apps-in-toss/web-framework').catch(() => null);
      if (!sdk) {
        // Fallback to Web Share API
        if (navigator.share) {
          await navigator.share(options);
          return true;
        }
        return false;
      }

      // @ts-ignore — share API (SDK 2.0)
      const shareFn = sdk.share || sdk.default?.share;
      if (!shareFn) {
        if (navigator.share) {
          await navigator.share(options);
          return true;
        }
        return false;
      }

      await shareFn(options);
      return true;
    } catch (e) {
      // User canceled or share failed
      return false;
    }
  }, []);
}
