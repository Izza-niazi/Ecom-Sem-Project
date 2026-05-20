import { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * Load saved SEO for a static page key (home, products, …).
 * @param {string} pageKey
 * @returns {{ seo: object|null, loading: boolean }}
 */
export function usePageSeo(pageKey) {
    const [seo, setSeo] = useState(null);
    const [loading, setLoading] = useState(Boolean(pageKey));

    useEffect(() => {
        if (!pageKey) {
            setSeo(null);
            setLoading(false);
            return undefined;
        }
        let cancelled = false;
        setLoading(true);
        axios
            .get(`/api/v1/seo/page/${pageKey}`)
            .then((res) => {
                if (!cancelled) {
                    setSeo(res.data?.seo || null);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setSeo(null);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [pageKey]);

    return { seo, loading };
}
