/**
 * OpenAI-compatible chat (Cerebras preferred, Groq fallback).
 * @param {Array<{role:string, content:string}>} messages
 * @param {{ json?: boolean, maxTokens?: number, temperature?: number }} [opts]
 * @returns {Promise<string|null>}
 */
async function chatCompletionText(messages, opts = {}) {
    const cerebrasKey = process.env.CEREBRAS_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const apiKey = cerebrasKey || groqKey;
    if (!apiKey) {
        return null;
    }

    const useCerebras = Boolean(cerebrasKey);
    const url = useCerebras
        ? 'https://api.cerebras.ai/v1/chat/completions'
        : 'https://api.groq.com/openai/v1/chat/completions';
    const model = useCerebras
        ? process.env.CEREBRAS_MODEL || 'llama-3.1-8b'
        : process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

    const body = {
        model,
        messages,
        temperature: opts.temperature ?? 0.2,
        max_tokens: opts.maxTokens ?? 500,
    };
    if (opts.json) {
        body.response_format = { type: 'json_object' };
    }

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(
            `${useCerebras ? 'Cerebras' : 'Groq'} API ${res.status}: ${errText.slice(0, 200)}`
        );
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
}

function llmSourceLabel() {
    if (process.env.CEREBRAS_API_KEY) return 'cerebras';
    if (process.env.GROQ_API_KEY) return 'groq';
    return 'rules';
}

module.exports = { chatCompletionText, llmSourceLabel };
