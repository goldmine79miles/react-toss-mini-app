import { useState, useCallback } from 'react';
import type { TossAdConfig, TossAdResult } from '../types';

/**
 * useTossAds — Toss Mini-App advertising hook
 *
 * Supports all three ad types:
 * - **Banner**: Inline display ad
 * - **Interstitial**: Full-screen ad shown between content
 * - **Rewarded**: User watches ad for in-app reward
 *
 * @example
 * ```tsx
 * const { showAd, loading } = useTossAds();
 *
 * const handleRewardedAd = async () => {
 *   const result = await showAd({
 *     adUnitId: 'ca-app-pub-XXX/YYY',
 *     type: 'rewarded',
 *     placement: 'after-game-end',
 *   });
 *   if (result.rewarded) {
 *     grantInGameReward(100);
 *   }
 * };
 * ```
 *
 * **Important**: Ad unit IDs must be hardcoded (not from env vars) per
 * Toss policy. Issued from Toss console after ad-monetization approval.
 */
export function useTossAds() {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<TossAdResult | null>(null);

  const showAd = useCallback(
    async (config: TossAdConfig): Promise<TossAdResult> => {
      setLoading(true);
      try {
        // @ts-ignore — SDK dynamic import
        const sdk = await import('@apps-in-toss/web-framework').catch(() => null);
        if (!sdk) {
          const result: TossAdResult = {
            shown: false,
            error: '토스 SDK를 로드할 수 없습니다.',
          };
          setLastResult(result);
          return result;
        }

        // @ts-ignore — TossAds module
        const TossAds = sdk.TossAds || sdk.default?.TossAds;
        if (!TossAds) {
          const result: TossAdResult = {
            shown: false,
            error: 'TossAds 모듈을 찾을 수 없습니다.',
          };
          setLastResult(result);
          return result;
        }

        let result: TossAdResult;
        switch (config.type) {
          case 'banner': {
            const ad = await TossAds.loadBanner({ adUnitId: config.adUnitId });
            await ad.show();
            result = { shown: true };
            break;
          }
          case 'interstitial': {
            const ad = await TossAds.loadInterstitial({
              adUnitId: config.adUnitId,
            });
            await ad.show();
            result = { shown: true };
            break;
          }
          case 'rewarded': {
            const ad = await TossAds.loadRewarded({ adUnitId: config.adUnitId });
            const showResult = await ad.show();
            result = {
              shown: true,
              rewarded: !!showResult?.rewarded,
            };
            break;
          }
          default:
            result = { shown: false, error: `알 수 없는 ad type: ${config.type}` };
        }

        setLastResult(result);
        return result;
      } catch (e: any) {
        const result: TossAdResult = {
          shown: false,
          error: e.message || '광고 표시 실패',
        };
        setLastResult(result);
        return result;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { showAd, loading, lastResult };
}
