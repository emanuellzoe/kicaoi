import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TITLES = {
  '/': 'Kicaoi — Plant. Grow. Harvest.',
  '/farm': 'Kicaoi — Farm',
  '/leaderboard': 'Kicaoi — Leaderboard',
};

export function usePageTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = TITLES[pathname] ?? 'Kicaoi';
  }, [pathname]);
}
