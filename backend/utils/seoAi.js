const { normalizeSeo } = require('./normalizeSeo');
const { APP_NAME } = require('../constants/brand');
const { chatCompletionText, llmSourceLabel } = require('./llmClient');

function seoSystemPrompt() {
    return `You are an SEO specialist for "${APP_NAME}", a Pakistani e-commerce marketplace (prices in PKR).

Given page context, output ONE JSON object only (no markdown):
{
  "pageTitle": "browser tab title, max ~60 chars, include brand when natural",
  "metaDescription": "meta description, max ~155 chars, compelling and accurate",
  "keywords": "comma-separated keywords, max ~10 phrases",
  "ogTitle": "Open Graph title for social sharing",
  "ogDescription": "Open Graph description, max ~200 chars",
  "ogImage": "optional absolute https URL for share image, or empty string",
  "robots": "index, follow" or "noindex, nofollow" only if page should be hidden,
  "canonicalPath": "path starting with / e.g. /products — match the page URL"
}

Rules:
- Be specific to the page purpose; avoid generic filler.
- Do not invent product names or prices not in the context.
- canonicalPath must be a site path, not a full URL.
- ogImage leave "" unless context suggests a real image URL.`;
}

/**
 * @param {string} pageContext - human-readable context for the page
 * @returns {Promise<{ seo: object, source: string }|null>}
 */
async function generateSeoFromContext(pageContext, analyticsHint = '') {
    const analyticsBlock = analyticsHint
        ? `\n\nTraffic & SEO analytics:\n${String(analyticsHint).slice(0, 1500)}`
        : '';
    const text = await chatCompletionText(
        [
            { role: 'system', content: seoSystemPrompt() },
            {
                role: 'user',
                content: `Generate SEO tags for this page:\n\n${String(pageContext).slice(0, 6000)}${analyticsBlock}`,
            },
        ],
        { json: true, maxTokens: 600, temperature: 0.3 }
    );
    if (!text) {
        return null;
    }
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        return null;
    }
    const seo = normalizeSeo(parsed);
    if (!seo) {
        return null;
    }
    return { seo, source: llmSourceLabel() };
}

/**
 * AI SEO audit from analytics report.
 * @param {string} analyticsText
 * @returns {Promise<{ insights: object, source: string }|null>}
 */
async function generateSeoInsightsFromAnalytics(analyticsText) {
    const text = await chatCompletionText(
        [
            {
                role: 'system',
                content: `You are an SEO analyst for a Pakistani e-commerce site. Given traffic and SEO score data, output ONE JSON object only:
{
  "summary": "2-3 sentences on overall SEO health",
  "priorities": ["top 3-5 actionable priorities, short bullets"],
  "recommendations": ["5-8 specific recommendations referencing page names/paths when possible"]
}
Be practical. Focus on high-traffic pages with weak SEO scores first.`,
            },
            {
                role: 'user',
                content: `Analyze this storefront analytics and suggest SEO improvements:\n\n${String(analyticsText).slice(0, 8000)}`,
            },
        ],
        { json: true, maxTokens: 900, temperature: 0.35 }
    );
    if (!text) return null;
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        return null;
    }
    return {
        insights: {
            summary: String(parsed.summary || '').trim(),
            priorities: Array.isArray(parsed.priorities)
                ? parsed.priorities.map((p) => String(p).trim()).filter(Boolean).slice(0, 8)
                : [],
            recommendations: Array.isArray(parsed.recommendations)
                ? parsed.recommendations.map((r) => String(r).trim()).filter(Boolean).slice(0, 12)
                : [],
        },
        source: llmSourceLabel(),
    };
}

module.exports = {
    generateSeoFromContext,
    generateSeoInsightsFromAnalytics,
    seoSystemPrompt,
};
