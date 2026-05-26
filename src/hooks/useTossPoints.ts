import { useState, useCallback } from 'react';
import type { TossPointsConfig, TossPointsResult } from '../types';

/**
 * useTossPoints — Toss Points (토스포인트) grant hook
 *
 * Grants Toss Points to the current user via promotion code.
 * Promotion code is issued from Toss console after creating a promotion
 * with pre-funded budget (developer pays).
 *
 * @example
 * ```tsx
 * const { grant, loading } = useTossPoints();
 *
 * const handleCheckIn = async () => {
 *   const result = await grant({
 *     promotionCode: 'DAILY_CHECKIN_500',
 *   });
 *   if (result.success) {
 *     toast(`${result.amount}P 적립!`);
 *   } else if (result.duplicate) {
 *     toast('이미 받으셨어요');
 *   }
 * };
 * ```
 *
 * **Important constraints**:
 * - Promotion must be created on Toss console BEFORE first grant
 * - Budget must be pre-funded (developer covers cost)
 * - Max 5,000 points per grant
 * - Server-side dedup is automatic (per user, per promotion)
 * - Returns `duplicate: true` if user already received from this promotion
 */
export function useTossPoints() {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<TossPointsResult | null>(null);

  const grant = useCallback(
    async (config: TossPointsConfig): Promise<TossPointsResult> => {
      setLoading(true);
      try {
        // @ts-ignore — SDK dynamic import
        const sdk = await import('@apps-in-toss/web-framework').catch(() => null);
        if (!sdk) {
          const result: TossPointsResult = {
            success: false,
            error: '토스 SDK를 로드할 수 없습니다.',
          };
          setLastResult(result);
          return result;
        }

        // @ts-ignore — grantPromotionReward API
        const grantFn =
          sdk.grantPromotionReward || sdk.default?.grantPromotionReward;
        if (!grantFn) {
          const result: TossPointsResult = {
            success: false,
            error: 'grantPromotionReward API를 찾을 수 없습니다.',
          };
          setLastResult(result);
          return result;
        }

        const response = await grantFn({
          promotionCode: config.promotionCode,
          metadata: config.metadata,
        });

        // Toss SDK response shape (best-effort parsing):
        // { success: true, amount: 500 }
        // { success: false, code: 'DUPLICATE', message: '...' }
        const result: TossPointsResult = {
          success: !!response?.success,
          amount: response?.amount,
          duplicate:
            response?.code === 'DUPLICATE' ||
            response?.code === 'ALREADY_REWARDED',
          error: response?.success ? undefined : response?.message,
        };

        setLastResult(result);
        return result;
      } catch (e: any) {
        // Some SDK versions throw on duplicate — handle gracefully
        const isDup =
          /duplicate|already|이미/i.test(e?.message || '') ||
          e?.code === 'DUPLICATE';
        const result: TossPointsResult = {
          success: false,
          duplicate: isDup,
          error: e.message || '포인트 지급 실패',
        };
        setLastResult(result);
        return result;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { grant, loading, lastResult };
}
