/**
 * Auth pattern — Show login screen until authenticated
 *
 * Recommended pattern for most mini-apps: gate the entire UI
 * behind authentication, with a clean loading + error state.
 */

import { ReactNode } from 'react';
import { useTossUser, useTossEnvironment } from 'react-toss-mini-app';

interface AuthGateProps {
  children: ReactNode;
  /** Optional custom loading component */
  loadingComponent?: ReactNode;
  /** Optional custom error component */
  errorComponent?: (error: string) => ReactNode;
  /** Optional custom "not in Toss app" component */
  notTossAppComponent?: ReactNode;
}

/**
 * AuthGate — Wraps your app and only renders children when authenticated.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AuthGate>
 *       <MainContent />
 *     </AuthGate>
 *   );
 * }
 * ```
 */
export function AuthGate({
  children,
  loadingComponent,
  errorComponent,
  notTossAppComponent,
}: AuthGateProps) {
  const env = useTossEnvironment();
  const { isAuthenticated, loading, error } = useTossUser();

  if (!env.isTossApp && !env.isDev) {
    return (
      <>
        {notTossAppComponent || (
          <div style={defaultMessageStyle}>
            <h2>토스 앱에서 열어주세요</h2>
            <p>이 앱은 토스 미니앱 안에서만 동작합니다.</p>
          </div>
        )}
      </>
    );
  }

  if (loading) {
    return (
      <>
        {loadingComponent || (
          <div style={defaultMessageStyle}>
            <p>로딩 중...</p>
          </div>
        )}
      </>
    );
  }

  if (error) {
    return (
      <>
        {errorComponent ? (
          errorComponent(error)
        ) : (
          <div style={defaultMessageStyle}>
            <h2>로그인 실패</h2>
            <p>{error}</p>
          </div>
        )}
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={defaultMessageStyle}>
        <h2>로그인 필요</h2>
      </div>
    );
  }

  return <>{children}</>;
}

const defaultMessageStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  textAlign: 'center',
};
