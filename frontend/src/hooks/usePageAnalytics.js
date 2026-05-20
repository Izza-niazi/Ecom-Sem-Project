import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/pageAnalytics';

/**
 * Records storefront page views for admin SEO analytics.
 */
export function usePageAnalytics() {
    const { pathname } = useLocation();
    const lastPath = useRef('');

    useEffect(() => {
        if (pathname === lastPath.current) return;
        lastPath.current = pathname;
        trackPageView(pathname);
    }, [pathname]);
}
