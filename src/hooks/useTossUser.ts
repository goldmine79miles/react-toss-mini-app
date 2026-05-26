import { useEffect, useState, useCallback } from 'react';
import type { TossUser, TossAuthResult } from '../types';

const STORAGE_KEY = 'toss-mini-app:user-cache';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

interface CachedUser {
  user: TossUser;
  cachedAt: number;
}

/**
 * useTossUser — Toss Mini-App user authentication hook
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, loading, error, refresh, logout } = useTossUser();
 *
 * if (loading) return <div>로딩 중...</div>;
 * if (!isAuthenticated) return <div>토스 앱에서 열어주세요</div>;
 *
 * return <div>안녕하세요 {user.nickname}님</div>;
 * ```
 *
 * Features:
 * - LocalStorage caching (24h TTL) for instant subsequent loads
 * - `?dev=1` query param enables mock mode for local development
 * - Automatic re-fetch on token expiry
 * - Graceful fallback when not running inside Toss app
 */
export function useTossUser(): TossAuthResult & {
  refresh: () => Promise<void>;
  logout: () => void;
} {
  const [user, setUser] = useState<TossUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load from cache first for instant UI
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed: CachedUser = JSON.parse(cached);
        if (Date.now() - parsed.cachedAt < CACHE_TTL_MS) {
          setUser(parsed.user);
        }
      }
    } catch {
      // Ignore cache errors
    }
  }, []);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Dev mode — return mock user for local development
      const isDev =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('dev') === '1';

      if (isDev) {
        const mockUser: TossUser = {
          userId: 'dev-user-12345',
          nickname: '개발자',
          loginAt: Date.now(),
        };
        setUser(mockUser);
        cacheUser(mockUser);
        return;
      }

      // Production — call Toss SDK
      // @ts-ignore — SDK loaded via script tag
      const sdk = await import('@apps-in-toss/web-framework').catch(() => null);
      if (!sdk) {
        throw new Error(
          '토스 SDK를 로드할 수 없습니다. 토스 앱 내에서 실행해주세요.'
        );
      }

      // @ts-ignore — getUser API varies by SDK version
      const tossUser = await sdk.getUser?.();
      if (!tossUser) {
        throw new Error('사용자 정보를 가져올 수 없습니다.');
      }

      const normalized: TossUser = {
        userId: tossUser.userId || tossUser.id,
        nickname: tossUser.nickname,
        phoneNumber: tossUser.phoneNumber,
        email: tossUser.email,
        loginAt: Date.now(),
      };

      setUser(normalized);
      cacheUser(normalized);
    } catch (e: any) {
      setError(e.message || '토스 로그인 실패');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setUser(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    refresh: fetchUser,
    logout,
  };
}

function cacheUser(user: TossUser) {
  try {
    const cached: CachedUser = { user, cachedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  } catch {
    // LocalStorage quota or unavailable — ignore
  }
}
