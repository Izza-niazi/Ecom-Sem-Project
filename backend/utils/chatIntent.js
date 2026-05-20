const { chatCompletionText } = require('./llmClient');
const { isOrderTrackingQuery, extractOrderId } = require('./orderTracking');
const { detectFaqTopic } = require('./faqParse');
const { isCartAssistQuery, parseCartAssist } = require('./cartAssistParse');

function classifyIntentRules(text) {
    const q = String(text || '').trim();
    if (!q) {
        return { intent: 'other', orderId: null, faqTopic: null };
    }
    if (isOrderTrackingQuery(q)) {
        return { intent: 'order_track', orderId: extractOrderId(q), faqTopic: null };
    }
    const faqTopic = detectFaqTopic(q);
    if (faqTopic) {
        return { intent: 'faq', orderId: null, faqTopic };
    }
    if (isCartAssistQuery(q) || parseCartAssist(q)) {
        return { intent: 'cart', orderId: null, faqTopic: null };
    }
    return { intent: 'product_search', orderId: null, faqTopic: null };
}

async function classifyIntentWithLlm(text) {
    const system = `Classify the user message for an e-commerce shopping assistant.
Respond with ONE JSON object only:
{
  "intent": "order_track" | "faq" | "cart" | "product_search",
  "orderId": "24-char hex id if specific order mentioned, else null",
  "faqTopic": "shipping" | "returns" | "payment" | null
}

order_track: where is my order, track order, delivery status.
faq: shipping policy, returns, refunds, how to pay, payment methods.
cart: add/remove cart items, view cart, apply coupon, promo codes.
product_search: find/buy products, prices, categories.`;

    const raw = await chatCompletionText(
        [
            { role: 'system', content: system },
            { role: 'user', content: String(text).slice(0, 1500) },
        ],
        { json: true, maxTokens: 150 }
    );
    if (!raw) return null;
    try {
        const p = JSON.parse(raw);
        const intent = ['order_track', 'faq', 'cart', 'product_search'].includes(p.intent)
            ? p.intent
            : 'product_search';
        let orderId = p.orderId && String(p.orderId).trim();
        if (orderId && !/^[a-f0-9]{24}$/i.test(orderId)) {
            orderId = null;
        }
        const faqTopic = ['shipping', 'returns', 'payment'].includes(p.faqTopic)
            ? p.faqTopic
            : detectFaqTopic(text);
        return {
            intent,
            orderId: orderId || extractOrderId(text),
            faqTopic: intent === 'faq' ? faqTopic : null,
        };
    } catch {
        return null;
    }
}

async function classifyIntent(text) {
    const rules = classifyIntentRules(text);
    if (rules.intent !== 'product_search') {
        return { ...rules, source: 'rules' };
    }
    try {
        const llm = await classifyIntentWithLlm(text);
        if (llm) {
            return { ...llm, source: 'llm' };
        }
    } catch (e) {
        console.warn('Chat intent LLM:', e.message || e);
    }
    return { ...rules, source: 'rules' };
}

module.exports = { classifyIntent, classifyIntentRules };
