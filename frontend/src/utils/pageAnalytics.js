import axios from 'axios';

const SESSION_KEY = 'izz_pv_sid';

function getSessionId() {
    try {
        let sid = localStorage.getItem(SESSION_KEY);
        if (!sid) {
            sid =
                typeof crypto !== 'undefined' && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
            localStorage.setItem(SESSION_KEY, sid);
        }
        return sid;
    } catch {
        return '';
    }
}

/** Skip admin and noisy routes. */
export function shouldTrackPath(pathname) {
    if (!pathname || typeof pathname !== 'string') return false;
    if (pathname.startsWith('/admin')) return false;
    return true;
}

/**
 * Fire-and-forget page view for SEO analytics.
 * @param {string} pathname
 */
export function trackPageView(pathname) {
    if (!shouldTrackPath(pathname)) return;

    axios
        .post(
            '/api/v1/analytics/pageview',
            {
                path: pathname,
                sessionId: getSessionId(),
                referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
            },
            { withCredentials: true }
        )
        .catch(() => {
            /* non-blocking */
        });
}
