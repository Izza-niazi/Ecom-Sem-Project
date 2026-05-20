import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SaveIcon from '@mui/icons-material/Save';
import { useSnackbar } from 'notistack';
import MetaData from '../Layouts/MetaData';
import { metaTitle } from '../../constants/brand';
import { EMPTY_SEO_FIELDS } from '../../utils/seo';
import BackdropLoader from '../Layouts/BackdropLoader';
import SeoAnalyticsPanel from './SeoAnalyticsPanel';
import Checkbox from '@mui/material/Checkbox';

const TARGET_STATIC = 'static';
const TARGET_PRODUCT = 'product';

const SeoManager = () => {
    const { enqueueSnackbar } = useSnackbar();

    const [targetType, setTargetType] = useState(TARGET_STATIC);
    const [pages, setPages] = useState([]);
    const [pageKey, setPageKey] = useState('home');
    const [products, setProducts] = useState([]);
    const [productId, setProductId] = useState('');
    const [seo, setSeo] = useState(() => ({ ...EMPTY_SEO_FIELDS }));
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastSource, setLastSource] = useState('');
    const [useAnalytics, setUseAnalytics] = useState(true);

    const selectedPage = useMemo(
        () => pages.find((p) => p.key === pageKey),
        [pages, pageKey]
    );

    const loadStaticPages = useCallback(async () => {
        const { data } = await axios.get('/api/v1/admin/seo');
        const list = data.pages || [];
        setPages(list);
        if (list.length) {
            setPageKey((prev) => (list.some((p) => p.key === prev) ? prev : list[0].key));
        }
    }, []);

    const loadProducts = useCallback(async () => {
        const { data } = await axios.get('/api/v1/admin/products');
        const list = data.products || [];
        setProducts(list);
        setProductId((prev) => {
            if (prev && list.some((p) => p._id === prev)) return prev;
            return list[0]?._id || '';
        });
    }, []);

    const loadSeoForSelection = useCallback(async () => {
        setLoading(true);
        setLastSource('');
        try {
            if (targetType === TARGET_PRODUCT) {
                if (!productId) {
                    setSeo({ ...EMPTY_SEO_FIELDS });
                    return;
                }
                const { data } = await axios.get(`/api/v1/admin/seo/product/${productId}`);
                setSeo({ ...EMPTY_SEO_FIELDS, ...data.seo });
            } else {
                const { data } = await axios.get(`/api/v1/admin/seo/page/${pageKey}`);
                setSeo({ ...EMPTY_SEO_FIELDS, ...data.seo });
            }
        } catch (e) {
            enqueueSnackbar(
                e.response?.data?.message || 'Could not load SEO',
                { variant: 'error' }
            );
            setSeo({ ...EMPTY_SEO_FIELDS });
        } finally {
            setLoading(false);
        }
    }, [targetType, pageKey, productId, enqueueSnackbar]);

    useEffect(() => {
        (async () => {
            try {
                await Promise.all([loadStaticPages(), loadProducts()]);
            } catch (e) {
                enqueueSnackbar(e.response?.data?.message || 'Failed to load admin data', {
                    variant: 'error',
                });
            }
        })();
    }, [loadStaticPages, loadProducts, enqueueSnackbar]);

    useEffect(() => {
        loadSeoForSelection();
    }, [loadSeoForSelection]);

    const handleField = (field) => (e) => {
        setSeo((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setLastSource('');
        try {
            const body =
                targetType === TARGET_PRODUCT
                    ? { productId, useAnalytics }
                    : { pageKey, useAnalytics };
            const { data } = await axios.post('/api/v1/admin/seo/generate', body);
            setSeo({ ...EMPTY_SEO_FIELDS, ...data.seo });
            setLastSource(data.source || 'ai');
            enqueueSnackbar(
                `SEO generated (${data.source === 'cerebras' ? 'Cerebras' : 'Groq'})`,
                { variant: 'success' }
            );
        } catch (e) {
            enqueueSnackbar(
                e.response?.data?.message || 'Generation failed',
                { variant: 'error' }
            );
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (targetType === TARGET_PRODUCT) {
                await axios.put(`/api/v1/admin/seo/product/${productId}`, { seo });
            } else {
                await axios.put(`/api/v1/admin/seo/page/${pageKey}`, { seo });
            }
            enqueueSnackbar('SEO saved', { variant: 'success' });
        } catch (e) {
            enqueueSnackbar(e.response?.data?.message || 'Save failed', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleOptimizeFromAnalytics = (row) => {
        if (row.productId) {
            setTargetType(TARGET_PRODUCT);
            setProductId(row.productId);
        } else if (row.pageKey) {
            setTargetType(TARGET_STATIC);
            setPageKey(row.pageKey);
        }
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    const previewTitle =
        seo.pageTitle ||
        (targetType === TARGET_PRODUCT
            ? products.find((p) => p._id === productId)?.name
            : selectedPage?.label) ||
        'Preview';

    return (
        <>
            <MetaData title={metaTitle('SEO Manager')} />
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-semibold text-slate-100 sm:text-2xl">
                        SEO Manager
                    </h1>
                    <p className="text-sm text-slate-400">
                        Analytics-driven SEO: track traffic, get AI insights, generate tags with
                        Cerebras or Groq, then save to live pages.
                    </p>
                </div>

                <SeoAnalyticsPanel onOptimizePage={handleOptimizeFromAnalytics} />

                <div className="rounded-xl border border-app-border bg-app-card p-4 shadow-lg shadow-black/20 sm:p-6">
                    <FormControl component="fieldset" className="mb-4">
                        <RadioGroup
                            row
                            value={targetType}
                            onChange={(e) => setTargetType(e.target.value)}
                        >
                            <FormControlLabel
                                value={TARGET_STATIC}
                                control={<Radio size="small" />}
                                label="Site page"
                            />
                            <FormControlLabel
                                value={TARGET_PRODUCT}
                                control={<Radio size="small" />}
                                label="Product page"
                            />
                        </RadioGroup>
                    </FormControl>

                    {targetType === TARGET_STATIC ? (
                        <FormControl fullWidth size="small" className="mb-4">
                            <InputLabel id="seo-page-label">Page</InputLabel>
                            <Select
                                labelId="seo-page-label"
                                label="Page"
                                value={pageKey}
                                onChange={(e) => setPageKey(e.target.value)}
                            >
                                {pages.map((p) => (
                                    <MenuItem key={p.key} value={p.key}>
                                        {p.label} ({p.path})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ) : (
                        <FormControl fullWidth size="small" className="mb-4">
                            <InputLabel id="seo-product-label">Product</InputLabel>
                            <Select
                                labelId="seo-product-label"
                                label="Product"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                            >
                                {products.map((p) => (
                                    <MenuItem key={p._id} value={p._id}>
                                        {p.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {selectedPage?.context && targetType === TARGET_STATIC && (
                        <p className="mb-4 text-xs leading-relaxed text-slate-400">
                            {selectedPage.context}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={useAnalytics}
                                    onChange={(e) => setUseAnalytics(e.target.checked)}
                                />
                            }
                            label={
                                <span className="text-xs text-slate-400">
                                    Use traffic analytics in AI prompt
                                </span>
                            }
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AutoFixHighIcon />}
                            disabled={generating || loading}
                            onClick={handleGenerate}
                        >
                            {generating ? 'Generating…' : 'Generate tags'}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<SaveIcon />}
                            disabled={saving || loading}
                            onClick={handleSave}
                        >
                            {saving ? 'Saving…' : 'Save SEO'}
                        </Button>
                        {lastSource && (
                            <span className="text-xs uppercase tracking-wide text-neutral-300">
                                Last generated via{' '}
                                {lastSource === 'cerebras' ? 'Cerebras' : 'Groq'}
                            </span>
                        )}
                    </div>

                    {(loading || generating) && <BackdropLoader />}

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <TextField
                            label="Page title (browser tab)"
                            size="small"
                            fullWidth
                            value={seo.pageTitle}
                            onChange={handleField('pageTitle')}
                            inputProps={{ maxLength: 70 }}
                            helperText={`${seo.pageTitle.length}/70`}
                        />
                        <TextField
                            label="Canonical path"
                            size="small"
                            fullWidth
                            value={seo.canonicalPath}
                            onChange={handleField('canonicalPath')}
                            placeholder="/products"
                        />
                        <TextField
                            label="Meta description"
                            size="small"
                            fullWidth
                            multiline
                            minRows={2}
                            className="sm:col-span-2"
                            value={seo.metaDescription}
                            onChange={handleField('metaDescription')}
                            inputProps={{ maxLength: 320 }}
                            helperText={`${seo.metaDescription.length}/320`}
                        />
                        <TextField
                            label="Keywords (comma-separated)"
                            size="small"
                            fullWidth
                            className="sm:col-span-2"
                            value={seo.keywords}
                            onChange={handleField('keywords')}
                        />
                        <TextField
                            label="Open Graph title"
                            size="small"
                            fullWidth
                            value={seo.ogTitle}
                            onChange={handleField('ogTitle')}
                        />
                        <TextField
                            label="Robots"
                            size="small"
                            fullWidth
                            value={seo.robots}
                            onChange={handleField('robots')}
                            placeholder="index, follow"
                        />
                        <TextField
                            label="Open Graph description"
                            size="small"
                            fullWidth
                            multiline
                            minRows={2}
                            className="sm:col-span-2"
                            value={seo.ogDescription}
                            onChange={handleField('ogDescription')}
                        />
                        <TextField
                            label="Open Graph image URL"
                            size="small"
                            fullWidth
                            className="sm:col-span-2"
                            value={seo.ogImage}
                            onChange={handleField('ogImage')}
                            placeholder="https://…"
                        />
                    </div>

                    <div className="mt-6 rounded-lg border border-dashed border-slate-600 bg-neutral-950/50 p-4">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                            Preview
                        </p>
                        <p className="text-sm font-medium text-neutral-200">{previewTitle}</p>
                        <p className="mt-1 text-xs text-slate-400">
                            {seo.metaDescription || 'No meta description yet.'}
                        </p>
                        {seo.canonicalPath && (
                            <p className="mt-2 text-[11px] text-slate-500">
                                Canonical: {seo.canonicalPath}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SeoManager;
