const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const CATEGORIES = require('../constants/categories');
const {
    parseNaturalLanguageSearch,
    normalizeSearch,
    buildReplyFromSearch,
} = require('../utils/ruleSearchParse');

function systemPrompt() {
    return `You are a search parser for a Pakistani e-commerce site. Prices are in PKR; treat $ or "dollars" in user text as the same numeric budget in PKR (e.g. "under $50" → maxPrice 50).

Respond with ONE JSON object only, no markdown:
{
  "keyword": "remaining product name text after extracting filters, or empty string",
  "category": "must be exactly one of: ${CATEGORIES.join(', ')} — or empty string if unknown",
  "brand": "brand name substring to filter, or empty string",
  "minPrice": null or number,
  "maxPrice": null or number,
  "minRating": null or number from 0 to 5 (minimum star rating)
}

Rules:
- If the user is only greeting or chatting with no product intent, return empty keyword and nulls.
- category must match the list exactly or be "".
- Extract minRating from "4 stars", "rated 4+", "at least 4.5 stars".
- Kitchen/electric items (kettle, toaster, microwave, fridge, mixer, iron) → category "Appliances" not "Home".
- Furniture and decor (table, chair, sofa, bed, lamp) → "Home".
- Vague shopping phrases ("something to wear", "something nice", "outfit ideas", "clothes") are not product names: set keyword to "" and infer category only (e.g. Fashion for wear/outfit/clothes). Never put the full vague sentence in keyword.`;
}

async function parseWithGroq(userText) {
    const Groq = require('groq-sdk');
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return null;
    }
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
        model,
        messages: [
            { role: 'system', content: systemPrompt() },
            { role: 'user', content: String(userText).slice(0, 2000) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 400,
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
        return null;
    }
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        return null;
    }
    return normalizeSearch({
        keyword: parsed.keyword,
        category: parsed.category,
        brand: parsed.brand,
        minPrice: parsed.minPrice,
        maxPrice: parsed.maxPrice,
        minRating: parsed.minRating,
    });
}

/**
 * POST { q: string } → { success, source: 'groq'|'rules', search }
 */
exports.parseNaturalLanguage = asyncErrorHandler(async (req, res) => {
    const q = String(req.body.q || '').trim();
    if (!q) {
        return res.status(400).json({ success: false, message: 'q is required' });
    }

    let source = 'rules';
    let search = normalizeSearch(parseNaturalLanguageSearch(q));

    if (process.env.GROQ_API_KEY) {
        try {
            const groqSearch = await parseWithGroq(q);
            if (groqSearch) {
                search = groqSearch;
                source = 'groq';
            }
        } catch (e) {
            console.warn('Groq NL search:', e.message || e);
        }
    }

    res.status(200).json({
        success: true,
        source,
        search,
        reply: buildReplyFromSearch(search),
    });
});
