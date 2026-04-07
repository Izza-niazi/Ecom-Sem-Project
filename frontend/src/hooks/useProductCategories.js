import axios from 'axios';
import { useEffect, useState } from 'react';

/** Categories that exist on at least one product in the DB (GET /products/categories). */
export function useProductCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { data } = await axios.get('/api/v1/products/categories');
                if (!cancelled && data?.categories?.length) {
                    setCategories(data.categories);
                }
            } catch {
                if (!cancelled) setCategories([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return { categories, loading };
}
