import axios from 'axios';
import { useEffect, useState } from 'react';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const axiosConfig = { withCredentials: true };

export default function SavedPaymentMethods() {
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { data } = await axios.get(
                    '/api/v1/payment/methods',
                    axiosConfig
                );
                if (!cancelled) setMethods(data.paymentMethods || []);
            } catch (e) {
                if (!cancelled) {
                    setError(
                        e.response?.data?.message ||
                            e.message ||
                            'Could not load payment methods'
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <p className="text-sm text-slate-500">Loading saved cards…</p>
        );
    }
    if (error) {
        return <p className="text-sm text-red-400">{error}</p>;
    }
    if (!methods.length) {
        return (
            <p className="text-sm text-slate-500">
                No saved cards yet. At checkout, turn on{' '}
                <span className="text-slate-400">
                    “Save this card for future purchases”
                </span>{' '}
                — cards are stored securely by Stripe, not on our servers.
            </p>
        );
    }

    return (
        <ul className="flex flex-col gap-3">
            {methods.map((pm) => (
                <li
                    key={pm.id}
                    className="flex items-center gap-4 rounded-lg border border-slate-600/50 bg-slate-900/40 px-4 py-3"
                >
                    <CreditCardIcon className="shrink-0 text-sky-400" fontSize="medium" />
                    <div>
                        <p className="text-sm font-medium capitalize text-slate-200">
                            {pm.brand} •••• {pm.last4}
                        </p>
                        <p className="text-xs text-slate-500">
                            Expires {pm.expMonth}/{String(pm.expYear).slice(-2)}
                        </p>
                    </div>
                </li>
            ))}
        </ul>
    );
}
