import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PriceSidebar from './PriceSidebar';
import Stepper from './Stepper';
import { clearErrors, newOrder } from '../../actions/orderAction';
import { emptyCart } from '../../actions/cartAction';
import { useSnackbar } from 'notistack';
import MetaData from '../Layouts/MetaData';
import { APP_NAME } from '../../constants/brand';
import { formatRs } from '../../utils/currency';

const CARD_OPTIONS = {
    style: {
        base: {
            color: '#f8fafc',
            fontFamily: '"Plus Jakarta Sans", "Roboto", system-ui, sans-serif',
            fontSize: '16px',
            fontSmoothing: 'antialiased',
            '::placeholder': {
                color: '#94a3b8',
            },
        },
        complete: {
            color: '#f8fafc',
            iconColor: '#38bdf8',
        },
        empty: {
            color: '#64748b',
            '::placeholder': {
                color: '#64748b',
            },
        },
        invalid: {
            color: '#fca5a5',
            iconColor: '#f87171',
        },
    },
    hidePostalCode: true,
};

const STRIPE_APPEARANCE = {
    theme: 'night',
    variables: {
        colorPrimary: '#38bdf8',
        colorBackground: '#0f172a',
        colorText: '#f1f5f9',
        colorDanger: '#f87171',
        fontFamily: '"Plus Jakarta Sans", "Roboto", system-ui, sans-serif',
        borderRadius: '8px',
    },
};

const axiosConfig = {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
};

function StripeCheckoutForm({
    clientSecret,
    shippingInfo,
    user,
    totalPrice,
    cartItems,
    dispatch,
    navigate,
    enqueueSnackbar,
    selectedSavedPmId,
    savedMethods,
    onClearSavedSelection,
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const selectedPm = savedMethods.find((pm) => pm.id === selectedSavedPmId);

    const completeOrder = async (paymentIntent) => {
        if (paymentIntent.status !== 'succeeded') {
            enqueueSnackbar('Payment did not complete', { variant: 'error' });
            return;
        }
        const order = {
            shippingInfo,
            orderItems: cartItems,
            totalPrice,
            paymentInfo: {
                id: paymentIntent.id,
                status: paymentIntent.status,
            },
        };
        try {
            await dispatch(newOrder(order));
            dispatch(emptyCart());
            navigate('/orders/success');
        } catch (orderErr) {
            enqueueSnackbar(
                typeof orderErr === 'string'
                    ? orderErr
                    : orderErr?.message || 'Order failed',
                { variant: 'error' }
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe) return;

        if (selectedSavedPmId) {
            setLoading(true);
            try {
                const { error, paymentIntent } = await stripe.confirmCardPayment(
                    clientSecret,
                    { payment_method: selectedSavedPmId }
                );
                if (error) {
                    enqueueSnackbar(error.message, { variant: 'error' });
                    return;
                }
                await completeOrder(paymentIntent);
            } catch (err) {
                enqueueSnackbar(err?.message || 'Payment failed', { variant: 'error' });
            } finally {
                setLoading(false);
            }
            return;
        }

        const card = elements?.getElement(CardElement);
        if (!card) return;

        setLoading(true);
        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card,
                        billing_details: {
                            name: user.name,
                            email: user.email,
                            address: {
                                line1: shippingInfo.address,
                                city: shippingInfo.city,
                                country: shippingInfo.country,
                                state: shippingInfo.state,
                                postal_code: String(shippingInfo.pincode),
                            },
                        },
                    },
                }
            );

            if (error) {
                enqueueSnackbar(error.message, { variant: 'error' });
                return;
            }
            await completeOrder(paymentIntent);
        } catch (err) {
            enqueueSnackbar(err?.message || 'Payment failed', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const canPay =
        stripe &&
        (selectedSavedPmId ||
            (!selectedSavedPmId && elements?.getElement(CardElement)));

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-lg">
            {selectedSavedPmId && selectedPm ? (
                <div className="rounded-lg border border-sky-500/40 bg-slate-900/80 p-4">
                    <div className="flex items-start gap-3">
                        <CheckCircleIcon className="mt-0.5 shrink-0 text-sky-400" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-100">
                                Using saved card
                            </p>
                            <p className="mt-1 text-sm capitalize text-slate-300">
                                {selectedPm.brand} · •••• {selectedPm.last4} ·{' '}
                                {selectedPm.expMonth}/{String(selectedPm.expYear).slice(-2)}
                            </p>
                            <p className="mt-2 text-xs text-slate-500">
                                Stripe doesn’t allow typing saved numbers into the form — we charge
                                this card directly when you pay.
                            </p>
                            <button
                                type="button"
                                onClick={onClearSavedSelection}
                                className="mt-3 text-sm font-medium text-sky-400 hover:text-sky-300"
                            >
                                Use a different card instead
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border border-slate-500/70 bg-gradient-to-b from-slate-800/90 to-slate-900/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <label
                        htmlFor="card-element"
                        className="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-400"
                    >
                        Card details
                    </label>
                    <div
                        id="card-element"
                        className="min-h-[52px] rounded-md border border-slate-500/50 bg-slate-950/50 px-3 py-3 transition-colors focus-within:border-sky-500/60 focus-within:ring-1 focus-within:ring-sky-500/30"
                    >
                        <CardElement options={CARD_OPTIONS} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                        Test mode: use <span className="font-mono">4242 4242 4242 4242</span>, any
                        future expiry, any CVC.
                    </p>
                </div>
            )}
            <input
                type="submit"
                value={loading ? 'Processing…' : `Pay ${formatRs(totalPrice)}`}
                disabled={!canPay || loading}
                className={`${
                    !canPay || loading
                        ? 'bg-primary-grey cursor-not-allowed'
                        : 'bg-primary-orange cursor-pointer'
                } w-full max-w-xs py-3.5 font-medium text-white shadow-lg hover:shadow-xl rounded-sm uppercase tracking-wide outline-none transition-shadow`}
            />
        </form>
    );
}

const Payment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [stripePromise, setStripePromise] = useState(null);
    const [clientSecret, setClientSecret] = useState('');
    const [initError, setInitError] = useState(null);
    const [intentLoading, setIntentLoading] = useState(true);
    const [saveCard, setSaveCard] = useState(false);
    const [savedMethods, setSavedMethods] = useState([]);
    const [selectedSavedPmId, setSelectedSavedPmId] = useState(null);

    const { shippingInfo, cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);
    const { error } = useSelector((state) => state.newOrder);

    const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { data } = await axios.get('/api/v1/payment/methods', axiosConfig);
                if (!cancelled && data.paymentMethods) {
                    setSavedMethods(data.paymentMethods);
                }
            } catch {
                /* ignore */
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        setInitError(null);
        setClientSecret('');
        setStripePromise(null);
        setIntentLoading(true);
        setSelectedSavedPmId(null);

        (async () => {
            try {
                const { data: keyData } = await axios.get(
                    '/api/v1/stripeapikey',
                    axiosConfig
                );
                const pk = keyData.stripeApiKey;
                if (!pk) {
                    throw new Error('Missing Stripe publishable key from server');
                }
                if (!cancelled) setStripePromise(loadStripe(pk));

                const { data: intentData } = await axios.post(
                    '/api/v1/payment/process',
                    { amount: Math.round(totalPrice), saveCard },
                    axiosConfig
                );
                if (!cancelled && intentData.client_secret) {
                    setClientSecret(intentData.client_secret);
                }
            } catch (e) {
                if (!cancelled) {
                    setInitError(
                        e.response?.data?.message || e.message || 'Payment init failed'
                    );
                }
            } finally {
                if (!cancelled) setIntentLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [totalPrice, saveCard]);

    useEffect(() => {
        if (error) {
            dispatch(clearErrors());
            enqueueSnackbar(error, { variant: 'error' });
        }
    }, [dispatch, error, enqueueSnackbar]);

    const ready = stripePromise && clientSecret && !intentLoading;

    return (
        <>
            <MetaData title={'Secure Payment | ' + APP_NAME} />

            <main className="w-full mt-20">
                <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-11/12 mt-0 sm:mt-4 m-auto sm:mb-7">
                    <div className="flex-1">
                        <Stepper activeStep={3}>
                            <div className="w-full bg-app-card">
                                <div className="flex flex-col justify-start gap-3 w-full mx-8 my-4 overflow-hidden">
                                    <p className="text-sm text-slate-400">
                                        Pay with Stripe (test card{' '}
                                        <span className="font-mono text-slate-300">4242…</span> in
                                        Test mode)
                                    </p>

                                    {savedMethods.length > 0 && (
                                        <div className="w-full max-w-lg">
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Saved cards
                                            </p>
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                {savedMethods.map((pm) => {
                                                    const isSelected =
                                                        selectedSavedPmId === pm.id;
                                                    return (
                                                        <button
                                                            key={pm.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedSavedPmId(pm.id)
                                                            }
                                                            className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
                                                                isSelected
                                                                    ? 'border-sky-500 bg-sky-950/40 ring-2 ring-sky-500/50'
                                                                    : 'border-slate-600/70 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-800/60'
                                                            }`}
                                                        >
                                                            <CreditCardIcon
                                                                className="shrink-0 text-sky-400/90"
                                                                fontSize="small"
                                                            />
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium capitalize text-slate-100">
                                                                    {pm.brand} · •••• {pm.last4}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    Exp {pm.expMonth}/
                                                                    {String(pm.expYear).slice(-2)}
                                                                </p>
                                                            </div>
                                                            {isSelected && (
                                                                <CheckCircleIcon className="ml-auto shrink-0 text-sky-400" fontSize="small" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <p className="mt-2 text-xs text-slate-500">
                                                Tap a card to use it for this payment — no need to
                                                re-enter the number.
                                            </p>
                                        </div>
                                    )}

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={saveCard}
                                                onChange={(e) => setSaveCard(e.target.checked)}
                                                sx={{
                                                    color: 'rgb(148 163 184)',
                                                    '&.Mui-checked': { color: '#38bdf8' },
                                                }}
                                            />
                                        }
                                        label={
                                            <span className="text-sm text-slate-300">
                                                Save this card for future purchases
                                                <span className="ml-1 text-xs text-slate-500">
                                                    (stored securely by Stripe, not on our servers)
                                                </span>
                                            </span>
                                        }
                                    />

                                    {initError && (
                                        <p className="text-sm text-red-400">{initError}</p>
                                    )}

                                    {(intentLoading || !ready) && !initError && (
                                        <p className="text-sm text-slate-400">
                                            {intentLoading
                                                ? 'Preparing secure payment…'
                                                : 'Loading secure payment form…'}
                                        </p>
                                    )}

                                    {ready && (
                                        <Elements
                                            key={clientSecret}
                                            stripe={stripePromise}
                                            options={{
                                                clientSecret,
                                                appearance: STRIPE_APPEARANCE,
                                            }}
                                        >
                                            <StripeCheckoutForm
                                                clientSecret={clientSecret}
                                                shippingInfo={shippingInfo}
                                                user={user}
                                                totalPrice={totalPrice}
                                                cartItems={cartItems}
                                                dispatch={dispatch}
                                                navigate={navigate}
                                                enqueueSnackbar={enqueueSnackbar}
                                                selectedSavedPmId={selectedSavedPmId}
                                                savedMethods={savedMethods}
                                                onClearSavedSelection={() =>
                                                    setSelectedSavedPmId(null)
                                                }
                                            />
                                        </Elements>
                                    )}
                                </div>
                            </div>
                        </Stepper>
                    </div>

                    <PriceSidebar cartItems={cartItems} />
                </div>
            </main>
        </>
    );
};

export default Payment;
