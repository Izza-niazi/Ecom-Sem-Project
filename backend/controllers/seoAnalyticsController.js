const PageView = require('../models/pageViewModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const {
    inferPageMeta,
    buildSeoAnalytics,
    formatAnalyticsForAi,
} = require('../utils/seoAnalyticsService');
const { generateSeoInsightsFromAnalytics } = require('../utils/seoAi');

/** POST /api/v1/analytics/pageview */
exports.trackPageView = asyncErrorHandler(async (req, res) => {
    const path = String(req.body.path || '').trim().slice(0, 500);
    if (!path || !path.startsWith('/')) {
        return res.status(400).json({ success: false, message: 'Invalid path' });
    }

    const meta = inferPageMeta(path);
    const sessionId = String(req.body.sessionId || '').trim().slice(0, 64);
    const referrer = String(req.body.referrer || '').trim().slice(0, 500);

    await PageView.create({
        path: meta.path,
        pageType: req.body.pageType || meta.pageType,
        entityId: meta.entityId || null,
        entityKey: meta.entityKey || null,
        sessionId: sessionId || undefined,
        user: req.user ? req.user._id : null,
        referrer: referrer || undefined,
    });

    res.status(201).json({ success: true });
});

/** GET /api/v1/admin/seo/analytics?days=30 */
exports.getSeoAnalytics = asyncErrorHandler(async (req, res) => {
    const days = parseInt(req.query.days, 10) || 30;
    const report = await buildSeoAnalytics(days);
    res.status(200).json({ success: true, ...report });
});

/** POST /api/v1/admin/seo/insights — AI recommendations from analytics */
exports.generateSeoInsights = asyncErrorHandler(async (req, res) => {
    if (!process.env.CEREBRAS_API_KEY && !process.env.GROQ_API_KEY) {
        throw new ErrorHandler(
            'Set CEREBRAS_API_KEY or GROQ_API_KEY in backend/.env for AI insights',
            503
        );
    }

    const days = parseInt(req.body.days, 10) || 30;
    const report = await buildSeoAnalytics(days);
    const analyticsText = formatAnalyticsForAi(report);

    const result = await generateSeoInsightsFromAnalytics(analyticsText);
    if (!result?.insights) {
        throw new ErrorHandler('AI could not generate insights', 502);
    }

    res.status(200).json({
        success: true,
        source: result.source,
        insights: result.insights,
        analytics: {
            periodDays: report.periodDays,
            totals: report.totals,
            opportunityCount: report.opportunities.length,
        },
    });
});
