import { normalizeBaseUrl } from '@konkan/api-client';

export type ConfigResult = { ok: true; apiUrl: string } | { ok: false; reason: string };

/**
 * Validate the API origin. On a device, `127.0.0.1` is the phone itself: use your computer's
 * LAN IP (or `10.0.2.2` on the Android emulator) in `apps/mobile/.env.local`.
 */
export function readConfig(apiUrl: string | undefined): ConfigResult {
  if (!apiUrl?.trim()) return { ok: false, reason: 'EXPO_PUBLIC_API_URL is not set' };
  try {
    return { ok: true, apiUrl: normalizeBaseUrl(apiUrl.trim()) };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Must be read with the literal `process.env.EXPO_PUBLIC_API_URL` expression: Expo inlines
 * public variables at build time only for that exact form.
 */
export function readAppConfig(): ConfigResult {
  return readConfig(process.env.EXPO_PUBLIC_API_URL);
}
