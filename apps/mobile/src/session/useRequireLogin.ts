import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useSession } from './context';

/**
 * Guests can browse everything. Actions that need an account (save, review, report, register
 * a business) call `requireLogin(action, returnTo)`: logged-in users run the action, guests
 * go to login and come back to `returnTo` afterwards.
 */
export function useRequireLogin() {
  const { user } = useSession();
  const router = useRouter();
  return useCallback(
    (action: () => void, returnTo: string) => {
      if (user) {
        action();
      } else {
        router.push({ pathname: '/auth/login', params: { next: returnTo } });
      }
    },
    [user, router],
  );
}
