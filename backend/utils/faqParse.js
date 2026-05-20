const FAQ_PATTERNS = [
    {
        topic: 'shipping',
        re: /\b(shipping|delivery time|how long.*deliver|when will (?:it|my order) arrive|ship to|deliver to|courier)\b/i,
    },
    {
        topic: 'returns',
        re: /\b(return policy|returns?|refund|exchange|money back|send back)\b/i,
    },
    {
        topic: 'payment',
        re: /\b(payment method|how (?:do i|to) pay|pay with|stripe|credit card|debit card|card payment|checkout pay)\b/i,
    },
];

function detectFaqTopic(text) {
    const q = String(text || '').trim();
    if (!q) return null;
    for (const { topic, re } of FAQ_PATTERNS) {
        if (re.test(q)) return topic;
    }
    if (/^(shipping|returns?|payment)\s*(info|policy|methods?)?\??$/i.test(q)) {
        const word = q.toLowerCase();
        if (word.startsWith('ship')) return 'shipping';
        if (word.startsWith('return')) return 'returns';
        if (word.startsWith('pay')) return 'payment';
    }
    return null;
}

module.exports = { detectFaqTopic };
