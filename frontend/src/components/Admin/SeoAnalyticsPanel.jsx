import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import InsightsIcon from '@mui/icons-material/Insights';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSnackbar } from 'notistack';

const config = { withCredentials: true };

const SeoAnalyticsPanel = ({ onOptimizePage }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [insights, setInsights] = useState(null);
    const [insightSource, setInsightSource] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/v1/admin/seo/analytics?days=30', config);
            setReport(data);
        } catch (e) {
            enqueueSnackbar(e.response?.data?.message || 'Failed to load analytics', {
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        load();
    }, [load]);

    const runInsights = async () => {
        setInsightsLoading(true);
        try {
            const { data } = await axios.post('/api/v1/admin/seo/insights', { days: 30 }, config);
            setInsights(data.insights);
            setInsightSource(data.source || '');
            enqueueSnackbar('AI insights ready', { variant: 'success' });
        } catch (e) {
            enqueueSnackbar(e.response?.data?.message || 'Insights failed', { variant: 'error' });
        } finally {
            setInsightsLoading(false);
        }
    };

    const totals = report?.totals || {};
    const topPages = report?.topPages || [];
    const opportunities = report?.opportunities || [];

    return (
        <section className="rounded-xl border border-white/10 bg-gradient-to-br from-neutral-950 to-black p-4 shadow-lg sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold text-slate-100">SEO analytics</h2>
                    <p className="mt-1 text-xs text-slate-400">
                        Public pages only (home, catalog, blog, products) — last{' '}
                        {report?.periodDays || 30} days. Cart, account, wishlist, and checkout are
                        excluded.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        disabled={loading}
                        onClick={load}
                    >
                        Refresh
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        startIcon={<InsightsIcon />}
                        disabled={insightsLoading || loading}
                        onClick={runInsights}
                    >
                        {insightsLoading ? 'Analyzing…' : 'AI insights'}
                    </Button>
                </div>
            </div>

            {loading ? (
                <p className="mt-4 text-sm text-slate-500">Loading analytics…</p>
            ) : (
                <>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <Stat label="Page views" value={totals.pageViews ?? 0} />
                        <Stat label="Sessions" value={totals.uniqueSessions ?? 0} />
                        <Stat label="Product views" value={totals.productActivityViews ?? 0} />
                    </div>

                    {opportunities.length > 0 && (
                        <div className="mt-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-400/90">
                                High traffic · weak SEO
                            </h3>
                            <ul className="mt-2 space-y-2">
                                {opportunities.map((row) => (
                                    <li
                                        key={row.path}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/20 bg-amber-950/20 px-3 py-2 text-sm"
                                    >
                                        <span className="text-slate-200">
                                            {row.label}{' '}
                                            <span className="text-slate-500">({row.views} views)</span>
                                            <span className="ml-2 text-xs text-amber-300">
                                                SEO {row.seoScore}/100
                                            </span>
                                        </span>
                                        {onOptimizePage && (
                                            <button
                                                type="button"
                                                onClick={() => onOptimizePage(row)}
                                                className="text-xs font-medium text-neutral-300 hover:text-neutral-200"
                                            >
                                                Optimize →
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {topPages.length > 0 && (
                        <div className="mt-5 overflow-x-auto">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Top pages
                            </h3>
                            <table className="mt-2 w-full min-w-[480px] text-left text-xs text-slate-400">
                                <thead>
                                    <tr className="border-b border-slate-700 text-slate-500">
                                        <th className="py-2 pr-2 font-medium">Page</th>
                                        <th className="py-2 pr-2 font-medium">Views</th>
                                        <th className="py-2 font-medium">SEO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topPages.slice(0, 10).map((row) => (
                                        <tr key={row.path} className="border-b border-slate-800/80">
                                            <td className="max-w-[200px] truncate py-2 pr-2 text-slate-300">
                                                {row.label}
                                            </td>
                                            <td className="py-2 pr-2">{row.views}</td>
                                            <td className="py-2">
                                                <span
                                                    className={
                                                        row.weakSeo
                                                            ? 'text-amber-400'
                                                            : 'text-emerald-400'
                                                    }
                                                >
                                                    {row.seoScore}/100
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {topPages.length === 0 && (
                        <p className="mt-4 text-sm text-slate-500">
                            No traffic yet. Browse the store (home, products, blog) to collect data.
                        </p>
                    )}

                    {insights && (
                        <div className="mt-5 rounded-lg border border-white/15 bg-neutral-900/80 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
                                AI recommendations
                                {insightSource && (
                                    <span className="ml-2 font-normal text-slate-500">
                                        via {insightSource === 'cerebras' ? 'Cerebras' : 'Groq'}
                                    </span>
                                )}
                            </p>
                            {insights.summary && (
                                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                                    {insights.summary}
                                </p>
                            )}
                            {insights.priorities?.length > 0 && (
                                <>
                                    <p className="mt-3 text-xs font-medium text-slate-400">Priorities</p>
                                    <ul className="mt-1 list-inside list-disc text-sm text-slate-300">
                                        {insights.priorities.map((p) => (
                                            <li key={p}>{p}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            {insights.recommendations?.length > 0 && (
                                <>
                                    <p className="mt-3 text-xs font-medium text-slate-400">
                                        Recommendations
                                    </p>
                                    <ul className="mt-1 list-inside list-disc text-sm text-slate-400">
                                        {insights.recommendations.map((r) => (
                                            <li key={r}>{r}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

function Stat({ label, value }) {
    return (
        <div className="rounded-lg border border-slate-700/80 bg-neutral-950/60 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
            <p className="text-lg font-semibold text-slate-100">{value}</p>
        </div>
    );
}

export default SeoAnalyticsPanel;
