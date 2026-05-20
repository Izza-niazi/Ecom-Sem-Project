const mongoose = require('mongoose');

const ORDER_TRACK_RE =
    /\b(where\s+is\s+(?:my\s+)?order|track(?:ing)?\s+(?:my\s+)?order|order\s+status|delivery\s+status|when\s+will\s+(?:my\s+)?order|has\s+my\s+order|status\s+of\s+(?:my\s+)?order|my\s+orders?|shipment\s+status)\b/i;

const ORDER_ID_RE = /\b(?:order\s*#?\s*)?([a-f0-9]{24})\b/i;

function isOrderTrackingQuery(text) {
    return ORDER_TRACK_RE.test(String(text || ''));
}

function extractOrderId(text) {
    const m = ORDER_ID_RE.exec(String(text || ''));
    if (m && mongoose.Types.ObjectId.isValid(m[1])) {
        return m[1];
    }
    return null;
}

function formatWhen(date) {
    if (!date) return null;
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function activeStepForStatus(orderStatus) {
    if (orderStatus === 'Delivered') return 2;
    if (orderStatus === 'Shipped') return 1;
    return 0;
}

function buildTimeline(order) {
    const activeStep = activeStepForStatus(order.orderStatus);
    const steps = [
        { status: 'Ordered', date: order.createdAt },
        { status: 'Shipped', date: order.shippedAt },
        { status: 'Delivered', date: order.deliveredAt },
    ];
    return steps.map((step, index) => ({
        status: step.status,
        date: formatWhen(step.date),
        completed: activeStep >= index,
        active: activeStep === index,
    }));
}

function summarizeItems(orderItems) {
    const items = orderItems || [];
    if (!items.length) return 'No items';
    const names = items.slice(0, 2).map((i) => i.name);
    const extra = items.length > 2 ? ` +${items.length - 2} more` : '';
    return `${names.join(', ')}${extra}`;
}

function serializeOrder(order) {
    const id = String(order._id);
    return {
        orderId: id,
        shortId: id.slice(-8).toUpperCase(),
        orderStatus: order.orderStatus,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        shippedAt: order.shippedAt || null,
        deliveredAt: order.deliveredAt || null,
        itemSummary: summarizeItems(order.orderItems),
        itemCount: (order.orderItems || []).length,
        timeline: buildTimeline(order),
        activeStep: activeStepForStatus(order.orderStatus),
    };
}

function buildOrderReply(orders) {
    if (!orders.length) {
        return "You don't have any orders yet. Browse products and check out when you're ready.";
    }
    if (orders.length === 1) {
        const o = orders[0];
        const when =
            o.orderStatus === 'Delivered' && o.deliveredAt
                ? ` Delivered on ${formatWhen(o.deliveredAt)}.`
                : o.orderStatus === 'Shipped' && o.shippedAt
                  ? ` Shipped on ${formatWhen(o.shippedAt)}.`
                  : ` Placed on ${formatWhen(o.createdAt)}.`;
        return `Order #${o.shortId} is **${o.orderStatus}** (${o.itemSummary}).${when}`;
    }
    return `You have ${orders.length} recent orders. Here are the latest — tap one for full details.`;
}

module.exports = {
    isOrderTrackingQuery,
    extractOrderId,
    serializeOrder,
    buildOrderReply,
    formatWhen,
};
