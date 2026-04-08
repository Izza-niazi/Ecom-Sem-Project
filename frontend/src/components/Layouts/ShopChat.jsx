import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import { buildProductsSearchPath, hasSearchFilters } from '../../utils/nlSearch';

const ShopChat = () => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const endRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    const send = useCallback(async () => {
        const text = input.trim();
        if (!text || loading) return;

        setMessages((prev) => [...prev, { role: 'user', content: text }]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await axios.post('/api/v1/search/nl', { q: text });

            const replyText =
                data.reply ||
                'Could not build a search. Try describing a product, price, or category.';

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: replyText,
                    search: data.search,
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
    }, [input, loading]);

    const goToProducts = (search) => {
        navigate(buildProductsSearchPath(search));
        setOpen(false);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="fixed bottom-4 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full border border-sky-500/40 bg-slate-900 text-sky-400 shadow-lg shadow-black/40 transition hover:border-sky-400/70 hover:bg-slate-800"
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
                    <div className="border-b border-slate-700/80 bg-slate-900 px-3 py-2">
                        <p className="text-sm font-semibold text-slate-100">Shopping assistant</p>
                        <p className="text-[11px] text-slate-500">
                            Groq Llama when configured — else rule-based (PKR)
                        </p>
                    </div>

                    <div className="max-h-72 min-h-[11rem] space-y-2 overflow-y-auto bg-[#0b1020] px-3 py-2">
                        {messages.length === 0 && (
                            <p className="text-xs leading-relaxed text-slate-400">
                                Try: &quot;shoes under 5000&quot;, &quot;phones with 4 stars&quot;, or &quot;laptops in
                                Electronics&quot;.
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
                                            ? 'bg-sky-700 text-white'
                                            : 'bg-slate-800 text-slate-100'
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap">{m.content}</p>
                                    {m.role === 'assistant' && m.source && (
                                        <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
                                            {m.source === 'groq' ? 'Llama (Groq)' : 'Rules'}
                                        </p>
                                    )}
                                    {m.role === 'assistant' && hasSearchFilters(m.search) && (
                                        <button
                                            type="button"
                                            onClick={() => goToProducts(m.search)}
                                            className="mt-2 w-full rounded border border-sky-500/50 bg-slate-900 py-1 text-[11px] font-medium text-sky-300 hover:bg-slate-800"
                                        >
                                            View products
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <p className="text-[11px] text-slate-500">Parsing…</p>
                        )}
                        <div ref={endRef} />
                    </div>

                    <div className="flex gap-1 border-t border-slate-700/80 bg-slate-900 p-2">
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
                            placeholder="Ask about products…"
                            autoComplete="off"
                            className="shop-chat-input min-w-0 flex-1 rounded-md border border-slate-600/80 px-2 py-1.5 text-xs caret-sky-400 shadow-inner focus:border-sky-500/60 focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                            aria-label="Message"
                        />
                        <IconButton
                            size="small"
                            onClick={send}
                            disabled={loading || !input.trim()}
                            aria-label="Send"
                            className="text-sky-400"
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
