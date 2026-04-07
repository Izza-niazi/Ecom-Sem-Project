const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const CATEGORIES = require('../constants/categories');
const {
    parseNaturalLanguageSearch,
    mergeSearch,
    normalizeSearch,
    buildFallbackReply,
} = require('../utils/nlSearchParse');

const MAX_USER_CHARS = 2000;
const MAX_MESSAGES = 12;

function systemPrompt() {
    return `You are a shopping assistant for an e-commerce site (prices in Pakistani Rupees — Rs). 
The user may say things like "shoes under 5000" or "phones with 4+ stars from Samsung".

Always respond with a single JSON object (no markdown) with this exact shape:
{
  "reply": "short friendly message to the shopper (1-3 sentences)",
  "keyword": "remaining product name text after extracting filters, or empty string",
  "category": "one of: ${CATEGORIES.join(', ')} — or empty string if unknown",
  "brand": "brand name substring to filter, or empty string",
  "minPrice": null or number,
  "maxPrice": null or number,
  "minRating": null or number 0-5 (minimum star rating)
}

Rules:
- Map $ amounts to the same numeric value as Rs (e.g. $50 → 50 as a price hint).
- If the user only chats (hi, thanks) with no product intent, set all search fields empty/null and reply helpfully.
- category must exactly match one of the allowed list or be "".
- Extract minRating from phrases like "4 stars", "rated 4+", "at least 4.5 stars".`;
}

async function callOpenAI(messages) {
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const trimmed = messages.slice(-MAX_MESSAGES).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || '').slice(0, MAX_USER_CHARS),
    }));

    const completion = await client.chat.completions.create({
        model,
        messages: [{ role: 'system', content: systemPrompt() }, ...trimmed],
        response_format: { type: 'json_object' },
        temperature: 0.25,
        max_tokens: 500,
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) throw new Error('empty_ai_response');
    const parsed = JSON.parse(text);
    return {
        reply: String(parsed.reply || '').slice(0, 1200),
        search: normalizeSearch({
            keyword: parsed.keyword,
            category: parsed.category,
            brand: parsed.brand,
            minPrice: parsed.minPrice,
            maxPrice: parsed.maxPrice,
            minRating: parsed.minRating,
        }),
    };
}

/**
 * POST body: { messages: [{ role: 'user'|'assistant', content: string }] }
 */
exports.chatAgent = asyncErrorHandler(async (req, res) => {
    const { messages = [] } = req.body;
    if (!Array.isArray(messages)) {
        return res.status(400).json({ success: false, message: 'messages array required' });
    }

    const users = messages.filter((m) => m && m.role === 'user');
    const lastUser = users.length ? String(users[users.length - 1].content || '').trim() : '';

    const ruleSearch = parseNaturalLanguageSearch(lastUser);
    let search = normalizeSearch(ruleSearch);
    let reply = buildFallbackReply(search);
    let usedAi = false;

    if (process.env.OPENAI_API_KEY && lastUser) {
        try {
            const ai = await callOpenAI(messages);
            usedAi = true;
            search = mergeSearch(ruleSearch, ai.search);
            if (ai.reply) reply = ai.reply;
        } catch (e) {
            console.warn('OpenAI chat agent:', e.message || e);
        }
    }

    res.status(200).json({
        success: true,
        reply,
        search,
        usedAi,
        aiEnabled: Boolean(process.env.OPENAI_API_KEY),
    });
});
