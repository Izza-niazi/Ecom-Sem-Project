const Product = require('../models/productModel');
const { listActiveCoupons, validateCoupon } = require('../constants/coupons');

function cartTotalFromItems(cartItems) {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
    );
}

function summarizeCart(cartItems) {
    const items = Array.isArray(cartItems) ? cartItems : [];
    const lines = items.map((item) => ({
        productId: item.product,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price,
        lineTotal: Number(item.price || 0) * Number(item.quantity || 1),
    }));
    const total = cartTotalFromItems(items);
    return {
        itemCount: items.reduce((n, i) => n + (i.quantity || 1), 0),
        uniqueItems: items.length,
        totalPrice: total,
        items: lines,
    };
}

async function findProductByQuery(query) {
    const q = String(query || '').trim();
    if (!q) return null;

    const exact = await Product.findOne({
        name: { $regex: new RegExp(`^${escapeRegex(q)}$`, 'i') },
    }).select('name price stock images brand');
    if (exact) return exact;

    const partial = await Product.find({
        name: { $regex: escapeRegex(q), $options: 'i' },
    })
        .select('name price stock images brand')
        .limit(5);
    if (partial.length === 1) return partial[0];
    if (partial.length > 1) {
        return { ambiguous: true, matches: partial };
    }
    return null;
}

function escapeRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findCartLine(cartItems, query) {
    const q = String(query || '').toLowerCase();
    const items = Array.isArray(cartItems) ? cartItems : [];
    const hit = items.find((item) => String(item.name || '').toLowerCase().includes(q));
    return hit || null;
}

async function resolveCartAssist(action, cartItems) {
    const summary = summarizeCart(cartItems);

    if (!action || !action.type) {
        return {
            reply:
                'For promo codes, say "apply WELCOME500" or "what coupons are available?" For cart changes, try "add [product] to cart" or "what\'s in my cart".',
            cartAction: { type: 'help' },
            cartSummary: summary,
        };
    }

    switch (action.type) {
        case 'summary': {
            if (!summary.uniqueItems) {
                return {
                    reply: 'Your cart is empty. Search for products and say "add [product name] to cart".',
                    cartAction: { type: 'summary' },
                    cartSummary: summary,
                };
            }
            const lines = summary.items
                .map((i) => `• ${i.name} × ${i.quantity} — Rs ${i.lineTotal.toLocaleString('en-PK')}`)
                .join('\n');
            return {
                reply: `Your cart (${summary.itemCount} item${summary.itemCount === 1 ? '' : 's'}):\n${lines}\n\nTotal: Rs ${summary.totalPrice.toLocaleString('en-PK')}`,
                cartAction: { type: 'summary' },
                cartSummary: summary,
            };
        }

        case 'go_cart': {
            return {
                reply: summary.uniqueItems
                    ? `Opening your cart — ${summary.uniqueItems} product(s), Rs ${summary.totalPrice.toLocaleString('en-PK')} total.`
                    : 'Your cart is empty right now.',
                cartAction: { type: 'go_cart' },
                cartSummary: summary,
            };
        }

        case 'list_coupons': {
            const coupons = listActiveCoupons();
            const list = coupons.map((c) => `• **${c.code}** — ${c.description}`).join('\n');
            return {
                reply: coupons.length
                    ? `Available promo codes:\n${list.replace(/\*\*/g, '')}\n\nSay: "apply coupon WELCOME500" at checkout.`
                    : 'No promo codes are active right now. Product discounts still apply on each item.',
                cartAction: { type: 'list_coupons', coupons },
                cartSummary: summary,
            };
        }

        case 'apply_coupon': {
            if (!action.code) {
                const coupons = listActiveCoupons();
                const list = coupons.map((c) => `• ${c.code} — ${c.description}`).join('\n');
                return {
                    reply: `Which code? Available:\n${list}\n\nExample: apply WELCOME500`,
                    cartAction: { type: 'list_coupons', coupons },
                    cartSummary: summary,
                };
            }
            const result = validateCoupon(action.code, summary.totalPrice);
            if (!result.valid) {
                return {
                    reply: result.message,
                    cartAction: {
                        type: 'apply_coupon',
                        success: false,
                        code: action.code,
                    },
                    cartSummary: summary,
                };
            }
            return {
                reply: result.message,
                cartAction: {
                    type: 'apply_coupon',
                    success: true,
                    code: result.coupon.code,
                    discount: result.discount,
                    coupon: result.coupon,
                },
                cartSummary: summary,
            };
        }

        case 'add': {
            const found = await findProductByQuery(action.query);
            if (!found) {
                return {
                    reply: `I couldn't find a product matching "${action.query}". Try the exact product name or search the catalog.`,
                    cartAction: { type: 'add', success: false, query: action.query },
                    cartSummary: summary,
                };
            }
            if (found.ambiguous) {
                const names = found.matches.map((p) => p.name).join(', ');
                return {
                    reply: `Which one did you mean? ${names}\n\nSay: "add [full product name] to cart".`,
                    cartAction: {
                        type: 'add',
                        success: false,
                        ambiguous: found.matches.map((p) => ({
                            productId: String(p._id),
                            name: p.name,
                        })),
                    },
                    cartSummary: summary,
                };
            }
            if (found.stock < 1) {
                return {
                    reply: `"${found.name}" is out of stock.`,
                    cartAction: { type: 'add', success: false, productId: String(found._id) },
                    cartSummary: summary,
                };
            }
            return {
                reply: `Added "${found.name}" to your cart (Rs ${found.price.toLocaleString('en-PK')}).`,
                cartAction: {
                    type: 'add',
                    success: true,
                    productId: String(found._id),
                    productName: found.name,
                    quantity: 1,
                },
                cartSummary: summary,
            };
        }

        case 'remove': {
            const line = findCartLine(cartItems, action.query);
            if (!line) {
                const found = await findProductByQuery(action.query);
                if (found && !found.ambiguous) {
                    return {
                        reply: `"${found.name}" isn't in your cart.`,
                        cartAction: { type: 'remove', success: false },
                        cartSummary: summary,
                    };
                }
                return {
                    reply: `No cart item matching "${action.query}". Say "what's in my cart" to see items.`,
                    cartAction: { type: 'remove', success: false, query: action.query },
                    cartSummary: summary,
                };
            }
            return {
                reply: `Removed "${line.name}" from your cart.`,
                cartAction: {
                    type: 'remove',
                    success: true,
                    productId: line.product,
                    productName: line.name,
                },
                cartSummary: summary,
            };
        }

        default:
            return {
                reply: "I didn't understand that cart request.",
                cartAction: { type: 'unknown' },
                cartSummary: summary,
            };
    }
}

function buildAbandonedCartReply(cartItems) {
    const summary = summarizeCart(cartItems);
    if (!summary.uniqueItems) return null;
    const preview = summary.items
        .slice(0, 3)
        .map((i) => i.name)
        .join(', ');
    const more =
        summary.uniqueItems > 3 ? ` (+${summary.uniqueItems - 3} more)` : '';
    return {
        intent: 'cart_reminder',
        reply: `You still have ${summary.itemCount} item${summary.itemCount === 1 ? '' : 's'} in your cart (${preview}${more}) — total Rs ${summary.totalPrice.toLocaleString('en-PK')}. Ready to checkout?`,
        cartSummary: summary,
        cartAction: { type: 'abandoned_reminder' },
    };
}

module.exports = {
    resolveCartAssist,
    summarizeCart,
    buildAbandonedCartReply,
    cartTotalFromItems,
};
