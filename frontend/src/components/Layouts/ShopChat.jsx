import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import { buildProductsSearchPath, hasSearchFilters } from '../../utils/nlSearch';
import { executeCartAction } from '../../utils/chatCartActions';
import OrderChatTimeline from './OrderChatTimeline';

function sourceLabel(source) {
    if (source === 'cerebras') return 'Cerebras';
    if (source === 'groq') return 'Groq';
    return 'Rules';
}

const ShopChat = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector((state) => state.cart.cartItems);

    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const endRef = useRef(null);
    const pendingQueryRef = useRef('');
    const abandonedShownRef = useRef(false);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    useEffect(() => {
        if (!open || abandonedShownRef.current || cartItems.length === 0) {
            return undefined;
        }
        let cancelled = false;
        abandonedShownRef.current = true;

        (async () => {
            try {
                const { data } = await axios.post('/api/v1/chat', {
                    abandonedCheck: true,
                    cartItems,
                });
                if (cancelled || data.skip || !data.reply) return;
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: data.reply,
                        intent: data.intent,
                        cartAction: data.cartAction,
                        source: 'rules',
                    },
                ]);
            } catch {
                /* ignore */
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [open, cartItems]);

    const send = useCallback(async () => {
        const text = input.trim();
        if (!text || loading) return;

        pendingQueryRef.current = text;
        setMessages((prev) => [...prev, { role: 'user', content: text }]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await axios.post('/api/v1/chat', { q: text, cartItems });

            const replyText =
                data.reply ||
                (data.intent === 'order_track'
                    ? 'Could not find order information.'
                    : data.intent === 'faq'
                      ? 'Here is our policy information.'
                      : data.intent === 'cart'
                        ? 'Could not update your cart.'
                        : 'Could not build a search. Try describing a product, price, or category.');

            if (data.cartAction && data.cartAction.type) {
                await executeCartAction(data.cartAction, dispatch);
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: replyText,
                    intent: data.intent,
                    search: data.search,
                    orderTracking: data.orderTracking,
                    cartAction: data.cartAction,
                    cartSummary: data.cartSummary,
                    faqTopic: data.faqTopic,
                    source: data.source,
                },
            ]);
        } catch (e) {
            const msg =
                e.response?.data?.message ||
                e.message ||
                'Request failed. Is the server running?';
            setMessages((prev) => [...prev, { role: 'assistant', content: `Sorry — ${msg}` }]);
        } finally {
            setLoading(false);
        }
    }, [input, loading, cartItems, dispatch]);

    const goToProducts = (search) => {
        navigate(buildProductsSearchPath(search));
        setOpen(false);
    };

    const loadingLabel = () => {
        const q = pendingQueryRef.current.toLowerCase();
        if (/\border\b/.test(q)) return 'Checking orders…';
        if (/\b(cart|coupon|add|remove)\b/.test(q)) return 'Updating cart…';
        if (/\b(ship|return|refund|pay)\b/.test(q)) return 'Looking up policy…';
        return 'Thinking…';
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="fixed bottom-4 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-neutral-950 text-neutral-300 shadow-lg shadow-black/40 transition hover:border-neutral-500/70 hover:bg-slate-800"
                aria-expanded={open}
                aria-label={open ? 'Close shopping assistant' : 'Open shopping assistant'}
            >
                {open ? <CloseIcon /> : <ChatIcon />}
            </button>

            {open && (
                <div
                    className="fixed bottom-20 right-4 z-[60] flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-xl border border-slate-600/80 bg-[#0b1020] shadow-2xl shadow-black/60"
                    role="dialog"
                    aria-label="Shopping assistant"
                >
                    <div className="border-b border-slate-700/80 bg-neutral-950 px-3 py-2">
                        <p className="text-sm font-semibold text-slate-100">Shopping assistant</p>
                        <p className="text-[11px] text-slate-500">
                            Search, track orders, cart help & FAQs
                        </p>
                    </div>

                    <div className="max-h-72 min-h-[11rem] space-y-2 overflow-y-auto bg-[#0b1020] px-3 py-2">
                        {messages.length === 0 && (
                            <p className="text-xs leading-relaxed text-slate-400">
                                Try: &quot;shoes under 5000&quot;, &quot;Where is my order?&quot;,
                                &quot;shipping info&quot;, &quot;add wireless mouse to cart&quot;,
                                &quot;apply coupon WELCOME500&quot;.
                            </p>
                        )}
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[95%] rounded-lg px-2.5 py-1.5 text-xs leading-relaxed ${
                                        m.role === 'user'
                                            ? 'bg-neutral-800 text-white'
                                            : 'bg-slate-800 text-slate-100'
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap">{m.content}</p>
                                    {m.role === 'assistant' && m.source && (
                                        <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
                                            {sourceLabel(m.source)}
                                        </p>
                                    )}
                                    {m.role === 'assistant' &&
                                        m.orderTracking?.requiresLogin && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigate('/login');
                                                    setOpen(false);
                                                }}
                                                className="mt-2 w-full rounded border border-neutral-600/50 bg-neutral-950 py-1 text-[11px] font-medium text-neutral-200 hover:bg-slate-800"
                                            >
                                                Log in to track orders
                                            </button>
                                        )}
                                    {m.role === 'assistant' &&
                                        m.orderTracking?.orders?.map((order) => (
                                            <div key={order.orderId}>
                                                <OrderChatTimeline
                                                    timeline={order.timeline}
                                                    orderStatus={order.orderStatus}
                                                    shortId={order.shortId}
                                                />
                                                <p className="mt-1 text-[10px] text-slate-500">
                                                    {order.itemSummary} · Rs{' '}
                                                    {order.totalPrice?.toLocaleString('en-PK')}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        navigate(`/order_details/${order.orderId}`);
                                                        setOpen(false);
                                                    }}
                                                    className="mt-2 w-full rounded border border-neutral-600/50 bg-neutral-950 py-1 text-[11px] font-medium text-neutral-200 hover:bg-slate-800"
                                                >
                                                    View order details
                                                </button>
                                            </div>
                                        ))}
                                    {m.role === 'assistant' &&
                                        (m.cartAction?.type === 'go_cart' ||
                                            m.cartAction?.type === 'abandoned_reminder' ||
                                            m.cartAction?.type === 'summary') &&
                                        m.cartSummary?.uniqueItems > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigate('/cart');
                                                    setOpen(false);
                                                }}
                                                className="mt-2 w-full rounded border border-neutral-600/50 bg-neutral-950 py-1 text-[11px] font-medium text-neutral-200 hover:bg-slate-800"
                                            >
                                                View cart & checkout
                                            </button>
                                        )}
                                    {m.role === 'assistant' && hasSearchFilters(m.search) && (
                                        <button
                                            type="button"
                                            onClick={() => goToProducts(m.search)}
                                            className="mt-2 w-full rounded border border-neutral-600/50 bg-neutral-950 py-1 text-[11px] font-medium text-neutral-200 hover:bg-slate-800"
                                        >
                                            View products
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <p className="text-[11px] text-slate-500">{loadingLabel()}</p>
                        )}
                        <div ref={endRef} />
                    </div>

                    <div className="flex gap-1 border-t border-slate-700/80 bg-neutral-950 p-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    send();
                                }
                            }}
                            placeholder="Ask anything…"
                            autoComplete="off"
                            className="shop-chat-input min-w-0 flex-1 rounded-md border border-slate-600/80 px-2 py-1.5 text-xs caret-white shadow-inner focus:border-neutral-600/60 focus:outline-none focus:ring-1 focus:ring-neutral-500/40"
                            aria-label="Message"
                        />
                        <IconButton
                            size="small"
                            onClick={send}
                            disabled={loading || !input.trim()}
                            aria-label="Send"
                            className="text-neutral-300"
                        >
                            <SendIcon fontSize="small" />
                        </IconButton>
                    </div>
                </div>
            )}
        </>
    );
};

export default ShopChat;
