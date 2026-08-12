import { useEffect, useState } from 'react';

/** Current pathname (updates on pushState / popstate). */
export function usePathRoute(): string {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const sync = () => setPath(window.location.pathname);
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  return path;
}

/** Client-side navigation for SPA path routes. */
export function navigate(path: string) {
  if (window.location.pathname + window.location.search === path) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/** Match `/vault/12` or `/vault/12/alerts` etc. */
export function matchVaultRoute(path: string): {
  vaultId: number;
  section: 'dashboard' | 'alerts' | 'quickstart' | null;
} | null {
  const m = path.match(/^\/vault\/(\d+)(?:\/(alerts|quickstart))?\/?$/);
  if (!m) return null;
  const section =
    m[2] === 'alerts'
      ? 'alerts'
      : m[2] === 'quickstart'
        ? 'quickstart'
        : 'dashboard';
  return { vaultId: Number(m[1]), section };
}
