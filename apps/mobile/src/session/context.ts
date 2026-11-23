import { createContext, useContext } from 'react';

export interface PreviewUser {
  name: string;
  /** Normalised +91XXXXXXXXXX. */
  phone: string;
  district: string;
  taluka: string;
}

/**
 * Preview session: kept in memory on the device only. Real authentication (OTP via the
 * backend, tokens in secure storage) replaces this in Sprint 2.
 */
export interface SessionValue {
  user: PreviewUser | null;
  signIn: (user: PreviewUser) => void;
  updateUser: (changes: Partial<PreviewUser>) => void;
  signOut: () => void;
  saved: readonly string[];
  isSaved: (slug: string) => boolean;
  toggleSaved: (slug: string) => void;
  recent: readonly string[];
  addRecent: (slug: string) => void;
}

export const SessionContext = createContext<SessionValue | null>(null);

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside <SessionProvider>');
  return value;
}

export const PREVIEW_OTP = '123456';
export const MAX_RECENT = 10;
