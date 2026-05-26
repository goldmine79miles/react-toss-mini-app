/**
 * Toss Mini-App SDK type definitions
 *
 * These types correspond to `@apps-in-toss/web-framework` SDK 2.0+
 * Refer to https://docs.apps.tossmini.com for official documentation.
 */

export interface TossUser {
  /** Toss internal user ID (anonymized) */
  userId: string;
  /** User's nickname on Toss */
  nickname?: string;
  /** Phone number (only available with explicit consent) */
  phoneNumber?: string;
  /** Email (only available with explicit consent) */
  email?: string;
  /** Last login timestamp */
  loginAt?: number;
}

export interface TossAuthResult {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Authenticated user (null if not logged in) */
  user: TossUser | null;
  /** Loading state */
  loading: boolean;
  /** Error message if auth failed */
  error: string | null;
}

export type TossAdType = 'banner' | 'interstitial' | 'rewarded';

export interface TossAdConfig {
  /** Ad unit ID issued from Toss console (hardcode required) */
  adUnitId: string;
  /** Ad type — banner | interstitial | rewarded */
  type: TossAdType;
  /** Optional placement label for analytics */
  placement?: string;
}

export interface TossAdResult {
  /** Whether ad was shown successfully */
  shown: boolean;
  /** For rewarded ads — whether user earned reward */
  rewarded?: boolean;
  /** Error if ad failed to load/show */
  error?: string;
}

export interface TossPointsConfig {
  /** Promotion code issued from Toss console */
  promotionCode: string;
  /** Optional metadata for tracking */
  metadata?: Record<string, string>;
}

export interface TossPointsResult {
  /** Whether points were granted */
  success: boolean;
  /** Amount granted (up to 5,000 per request) */
  amount?: number;
  /** Error if grant failed */
  error?: string;
  /** Whether this was a duplicate attempt (Toss server-side deduplication) */
  duplicate?: boolean;
}

export interface TossShareOptions {
  /** Share dialog title */
  title: string;
  /** Share dialog body text */
  text: string;
  /** Target URL */
  url: string;
}

export interface TossEnvironment {
  /** Whether running inside the actual Toss app */
  isTossApp: boolean;
  /** Whether running in local dev mode (?dev=1) */
  isDev: boolean;
  /** WebView type — partner | toss */
  webViewType: 'partner' | 'toss' | 'unknown';
}
