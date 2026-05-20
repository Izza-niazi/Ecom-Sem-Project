import { useSelector } from 'react-redux';
import { formatRs } from '../../utils/currency';
import { computeCouponDiscount } from '../../utils/coupon';

const PriceSidebar = ({ cartItems }) => {
    const coupon = useSelector((state) => state.cart.coupon);

    const listTotal = cartItems.reduce((sum, item) => sum + (item.cuttedPrice * item.quantity), 0);
    const discountTotal = cartItems.reduce(
        (sum, item) => sum + (item.cuttedPrice * item.quantity - item.price * item.quantity),
        0
    );
    const payTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const couponOff = computeCouponDiscount(coupon, payTotal);
    const grandTotal = Math.max(0, payTotal - couponOff);

    return (
        <div className="sticky top-20 flex flex-col sm:w-[340px] sm:shrink-0">
            <div className="checkout-card">
                <h2 className="checkout-card-header text-base uppercase tracking-wide text-slate-400">
                    Price details
                </h2>

                <div className="flex flex-col gap-4 p-6 pb-4 text-sm text-slate-300">
                    <p className="flex justify-between">
                        <span>Price ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                        <span className="font-medium text-white">{formatRs(listTotal)}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Discount</span>
                        <span className="font-medium text-emerald-400">− {formatRs(discountTotal)}</span>
                    </p>
                    {couponOff > 0 && (
                        <p className="flex justify-between">
                            <span>Coupon ({coupon?.code})</span>
                            <span className="font-medium text-emerald-400">− {formatRs(couponOff)}</span>
                        </p>
                    )}
                    <p className="flex justify-between">
                        <span>Delivery</span>
                        <span className="font-medium text-emerald-400">FREE</span>
                    </p>

                    <div className="border-t border-dashed border-white/10" />
                    <p className="flex justify-between text-lg font-semibold text-white">
                        <span>Total</span>
                        <span>{formatRs(grandTotal)}</span>
                    </p>
                    <div className="border-t border-dashed border-white/10" />

                    <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300 ring-1 ring-emerald-500/20">
                        You save {formatRs(discountTotal + couponOff)} on this order
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PriceSidebar;
