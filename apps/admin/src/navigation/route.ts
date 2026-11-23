import { useEffect, useState } from 'react';

/**
 * Minimal hash routing (#/, #/listings, #/approvals). Links stay real anchors, Back/Forward
 * work, and no router dependency is needed until the dashboard grows (Sprint 6).
 */
export type Route = 'dashboard' | 'listings' | 'approvals';

export const ROUTE_HREF: Readonly<Record<Route, string>> = {
  dashboard: '#/',
  listings: '#/listings',
  approvals: '#/approvals',
};

export function parseRoute(hash: string): Route {
  switch (hash.replace(/^#\/?/, '').split(/[/?]/)[0]) {
    case 'listings':
      return 'listings';
    case 'approvals':
      return 'approvals';
    default:
      return 'dashboard';
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseRoute(window.location.hash));
    };
    window.addEventListener('hashchange', onChange);
    return () => {
      window.removeEventListener('hashchange', onChange);
    };
  }, []);
  return route;
}
