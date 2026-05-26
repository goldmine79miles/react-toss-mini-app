/**
 * Basic usage example — Full Toss Mini-App in one file
 *
 * Demonstrates all 6 hooks integrated:
 * - useTossEnvironment for runtime detection
 * - useTossUser for auth
 * - useTossAds for rewarded ad before content
 * - useTossPoints for daily check-in reward
 * - useTossShare for sharing results
 * - useTossBack for graceful navigation
 */

import { useState } from 'react';
import {
  useTossUser,
  useTossAds,
  useTossPoints,
  useTossShare,
  useTossBack,
  useTossEnvironment,
} from 'react-toss-mini-app';

export default function ExampleMiniApp() {
  const env = useTossEnvironment();
  const { user, isAuthenticated, loading, error } = useTossUser();
  const { showAd, loading: adLoading } = useTossAds();
  const { grant, loading: pointsLoading } = useTossPoints();
  const share = useTossShare();
  const [unlocked, setUnlocked] = useState(false);
  const [pointsResult, setPointsResult] = useState<string>('');

  // 결과 캐싱 + 뒤로가기 핸들링
  useTossBack({
    resultCacheKey: 'last-result',
    resultCacheValue: { unlocked, pointsResult },
  });

  // 환경 체크
  if (!env.isTossApp && !env.isDev) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <h2>토스 앱에서 열어주세요</h2>
        <p>이 앱은 토스 미니앱 안에서만 동작합니다.</p>
      </div>
    );
  }

  // 인증 로딩
  if (loading) return <div>로딩 중...</div>;

  // 인증 실패
  if (error || !isAuthenticated) {
    return (
      <div style={{ padding: 24 }}>
        <h2>로그인 필요</h2>
        <p>{error || '토스 로그인이 필요합니다.'}</p>
      </div>
    );
  }

  // 보상형 광고 보고 컨텐츠 잠금 해제
  const handleUnlock = async () => {
    const result = await showAd({
      adUnitId: 'YOUR_REWARDED_AD_UNIT_ID',
      type: 'rewarded',
      placement: 'unlock-content',
    });
    if (result.rewarded) {
      setUnlocked(true);
    } else if (result.error) {
      alert(`광고 표시 실패: ${result.error}`);
    }
  };

  // 일일 출석 체크 → 100P 지급
  const handleCheckIn = async () => {
    const result = await grant({
      promotionCode: 'DAILY_CHECKIN_100',
    });
    if (result.success) {
      setPointsResult(`${result.amount}P 적립 완료!`);
    } else if (result.duplicate) {
      setPointsResult('오늘은 이미 받으셨어요');
    } else {
      setPointsResult(`실패: ${result.error}`);
    }
  };

  // 친구에게 공유
  const handleShare = async () => {
    const ok = await share({
      title: '예제 미니앱',
      text: `${user?.nickname}님이 추천하는 미니앱`,
      url: 'https://example.apps.tossmini.com',
    });
    if (!ok) console.log('공유 취소됨');
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <header>
        <h1>예제 미니앱</h1>
        <p>
          안녕하세요 <strong>{user?.nickname}</strong>님!
          {env.isDev && <span style={{ color: 'orange' }}> (DEV MODE)</span>}
        </p>
      </header>

      <section style={{ marginTop: 32 }}>
        <h2>일일 출석 체크</h2>
        <button onClick={handleCheckIn} disabled={pointsLoading}>
          {pointsLoading ? '처리 중...' : '오늘 출석 (+100P)'}
        </button>
        {pointsResult && <p>{pointsResult}</p>}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>프리미엄 콘텐츠</h2>
        {unlocked ? (
          <div>
            <p>✨ 잠금 해제됨!</p>
            <p>특별한 콘텐츠가 여기에...</p>
          </div>
        ) : (
          <button onClick={handleUnlock} disabled={adLoading}>
            {adLoading ? '광고 로딩...' : '광고 보고 잠금 해제'}
          </button>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <button onClick={handleShare}>친구에게 공유</button>
      </section>
    </div>
  );
}
