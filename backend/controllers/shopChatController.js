const mongoose = require('mongoose');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const Order = require('../models/orderModel');
const {
    parseNaturalLanguageSearch,
    normalizeSearch,
    buildReplyFromSearch,
} = require('../utils/ruleSearchParse');
const { classifyIntent } = require('../utils/chatIntent');
const { serializeOrder, buildOrderReply, extractOrderId } = require('../utils/orderTracking');
const { getFaqReply } = require('../constants/storeFaq');
const { parseCartAssist, isCartAssistQuery } = require('../utils/cartAssistParse');
const { resolveCartAssist, buildAbandonedCartReply } = require('../utils/cartAssist');

async function parseWithGroq(userText) {
    const Groq = require('groq-sdk');
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    const groq = new Groq({ apiKey });
    const CATEGORIES = require('../constants/categories');

    const completion = await groq.chat.completions.create({
        model,
        messages: [
            {
                role: 'system',
                content: `You are a search parser for a Pakistani e-commerce site. Prices are in PKR.
Respond with ONE JSON object only:
{"keyword":"","category":"one of: ${CATEGORIES.join(', ')} or empty","brand":"","minPrice":null,"maxPrice":null,"minRating":null}`,
            },
            { role: 'user', content: String(userText).slice(0, 2000) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 400,
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) return null;
    try {
        const parsed = JSON.parse(text);
        return normalizeSearch({
            keyword: parsed.keyword,
            category: parsed.category,
            brand: parsed.brand,
            minPrice: parsed.minPrice,
            maxPrice: parsed.maxPrice,
            minRating: parsed.minRating,
        });
    } catch {
        return null;
    }
}

async function resolveProductSearch(q) {
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

    return {
        intent: 'product_search',
        source,
        search,
        reply: buildReplyFromSearch(search),
    };
}

async function resolveOrderTracking(req, q, orderIdHint) {
    if (!req.user) {
        return {
            intent: 'order_track',
            source: 'rules',
            reply:
                'To track your order, please log in first. Then ask again — e.g. "Where is my order?"',
            orderTracking: {
                requiresLogin: true,
                orders: [],
            },
        };
    }

    const orderId = orderIdHint || extractOrderId(q);
    let orders = [];

    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
        const order = await Order.findOne({ _id: orderId, user: req.user._id });
        if (!order) {
            return {
                intent: 'order_track',
                source: 'rules',
                reply:
                    "I couldn't find that order on your account. Check the order ID from My Orders, or ask \"Where is my order?\" for your latest shipment.",
                orderTracking: { requiresLogin: false, orders: [] },
            };
        }
        orders = [order];
    } else {
        orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(3);
    }

    const serialized = orders.map(serializeOrder);
    let reply = buildOrderReply(serialized);
    reply = reply.replace(/\*\*/g, '');

    return {
        intent: 'order_track',
        source: 'rules',
        reply,
        orderTracking: {
            requiresLogin: false,
            orders: serialized,
            primaryOrderId: serialized[0]?.orderId || null,
        },
    };
}

function resolveFaq(faqTopic) {
    const topic = faqTopic || 'shipping';
    const reply = getFaqReply(topic) || getFaqReply('shipping');
    return {
        intent: 'faq',
        source: 'rules',
        faqTopic: topic,
        reply,
    };
}

/**
 * POST /api/v1/chat
 * Body: { q, cartItems?, abandonedCheck? }
 */
exports.shopChat = asyncErrorHandler(async (req, res) => {
    const q = String(req.body.q || '').trim();
    const cartItems = Array.isArray(req.body.cartItems) ? req.body.cartItems : [];

    if (req.body.abandonedCheck) {
        const reminder = buildAbandonedCartReply(cartItems);
        if (reminder) {
            return res.status(200).json({ success: true, ...reminder, source: 'rules' });
        }
        return res.status(200).json({
            success: true,
            intent: 'cart_reminder',
            reply: null,
            skip: true,
        });
    }

    if (!q) {
        return res.status(400).json({ success: false, message: 'q is required' });
    }

    const { intent, orderId, faqTopic, source: intentSource } = await classifyIntent(q);

    if (intent === 'order_track') {
        const payload = await resolveOrderTracking(req, q, orderId);
        return res.status(200).json({
            success: true,
            ...payload,
            intentSource,
        });
    }

    if (intent === 'faq') {
        const payload = resolveFaq(faqTopic);
        return res.status(200).json({
            success: true,
            ...payload,
            intentSource,
        });
    }

    if (intent === 'cart' || isCartAssistQuery(q)) {
        const action = parseCartAssist(q) || { type: 'help' };
        const payload = await resolveCartAssist(action, cartItems);
        return res.status(200).json({
            success: true,
            intent: 'cart',
            source: 'rules',
            ...payload,
            intentSource,
        });
    }

    const payload = await resolveProductSearch(q);
    return res.status(200).json({
        success: true,
        ...payload,
        intentSource,
    });
});
