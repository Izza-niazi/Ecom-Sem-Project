import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import Logo from '../Logo';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildProductsSearchPath, parseNaturalLanguageSearch } from '../../../utils/nlSearch';

const DEBOUNCE_MS = 280;

const Searchbar = () => {
    const [keyword, setKeyword] = useState('');
    const [open, setOpen] = useState(false);
    const [loadingSuggest, setLoadingSuggest] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const wrapRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const onDoc = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    const fetchSuggest = useCallback(async (q) => {
        const t = q.trim();
        if (t.length < 2) {
            setProducts([]);
            setCategories([]);
            return;
        }
        setLoadingSuggest(true);
        try {
            const { data } = await axios.get('/api/v1/products/suggest', {
                params: { q: t },
            });
            setProducts(data.products || []);
            setCategories(data.categories || []);
        } catch {
            setProducts([]);
            setCategories([]);
        } finally {
            setLoadingSuggest(false);
        }
    }, []);

    useEffect(() => {
        const t = keyword.trim();
        if (t.length < 2) {
            setProducts([]);
            setCategories([]);
            return;
        }
        const id = setTimeout(() => fetchSuggest(t), DEBOUNCE_MS);
        return () => clearTimeout(id);
    }, [keyword, fetchSuggest]);

    const goParsed = (raw) => {
        const parsed = parseNaturalLanguageSearch(raw);
        navigate(buildProductsSearchPath(parsed));
        setOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        goParsed(keyword);
    };

    const selectProduct = (name) => {
        setKeyword(name);
        goParsed(name);
    };

    const selectCategory = (cat) => {
        const parsed = parseNaturalLanguageSearch(cat);
        parsed.keyword = '';
        parsed.category = cat;
        navigate(buildProductsSearchPath(parsed));
        setOpen(false);
    };

    const hasSuggestions =
        open && keyword.trim().length >= 2 && (products.length > 0 || categories.length > 0 || loadingSuggest);

    return (
        <div ref={wrapRef} className="relative flex w-full sm:w-9/12">
            <form
                onSubmit={handleSubmit}
                className="flex w-full items-center justify-between overflow-hidden rounded-md border border-app-border bg-app-card px-2 py-1.5 shadow-inner shadow-black/20 sm:px-4"
            >
                <Logo className="mr-2 shrink-0" />
                <input
                    id="header-search-input"
                    value={keyword}
                    onChange={(e) => {
                        setKeyword(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    className="flex-1 border-none bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                    type="text"
                    placeholder='Try "shoes under 5000" or product name…'
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={hasSuggestions}
                    aria-controls="search-suggestions-listbox"
                />
                <button type="submit" className="text-sky-400 transition hover:text-sky-300" aria-label="Search">
                    <SearchIcon />
                </button>
            </form>

            {hasSuggestions ? (
                <div
                    id="search-suggestions-listbox"
                    className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-auto rounded-lg border border-app-border bg-app-card py-1 shadow-2xl shadow-black/50"
                    role="listbox"
                    aria-labelledby="header-search-input"
                >
                    {loadingSuggest && products.length === 0 && categories.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-slate-500">Searching…</p>
                    ) : null}
                    {categories.map((c) => (
                        <button
                            key={`cat-${c}`}
                            type="button"
                            role="option"
                            aria-selected="false"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectCategory(c)}
                        >
                            <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
                                Category
                            </span>
                            {c}
                        </button>
                    ))}
                    {products.map((p) => (
                        <button
                            key={p._id}
                            type="button"
                            role="option"
                            aria-selected="false"
                            className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-white/5"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectProduct(p.name)}
                        >
                            <span className="text-sm text-slate-100">{p.name}</span>
                            <span className="text-xs text-slate-500">{p.category}</span>
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
};

export default Searchbar;
