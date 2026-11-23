import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { MAX_RECENT, SessionContext } from './context';
import type { PreviewUser, SessionValue } from './context';

export function SessionProvider({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  initialUser?: PreviewUser | null;
}) {
  const [user, setUser] = useState<PreviewUser | null>(initialUser);
  const [saved, setSaved] = useState<readonly string[]>([]);
  const [recent, setRecent] = useState<readonly string[]>([]);

  const toggleSaved = useCallback((slug: string) => {
    setSaved((list) => (list.includes(slug) ? list.filter((s) => s !== slug) : [slug, ...list]));
  }, []);

  const addRecent = useCallback((slug: string) => {
    setRecent((list) => [slug, ...list.filter((s) => s !== slug)].slice(0, MAX_RECENT));
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      user,
      signIn: setUser,
      updateUser: (changes) => {
        setUser((current) => (current ? { ...current, ...changes } : current));
      },
      signOut: () => {
        setUser(null);
        setSaved([]);
      },
      saved,
      isSaved: (slug) => saved.includes(slug),
      toggleSaved,
      recent,
      addRecent,
    }),
    [user, saved, recent, toggleSaved, addRecent],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}
