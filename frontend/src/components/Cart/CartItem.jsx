import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';
import { addItemsToCart, removeItemsFromCart } from '../../actions/cartAction';
import { getDeliveryDate, getDiscount } from '../../utils/functions';
import { saveForLater } from '../../actions/saveForLaterAction';
import { Link } from 'react-router-dom';
import { formatRs } from '../../utils/currency';

const CartItem = ({ product, name, seller, price, cuttedPrice, image, stock, quantity, inCart }) => {

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const increaseQuantity = (id, quantity, stock) => {
        const newQty = quantity + 1;
        if (quantity >= stock) {
            enqueueSnackbar("Maximum Order Quantity", { variant: "warning" });
            return;
        };
        dispatch(addItemsToCart(id, newQty));
    }

    const decreaseQuantity = (id, quantity) => {
        const newQty = quantity - 1;
        if (quantity <= 1) return;
        dispatch(addItemsToCart(id, newQty));
    }
    
    const removeCartItem = (id) => {
        dispatch(removeItemsFromCart(id));
        enqueueSnackbar("Product Removed From Cart", { variant: "success" });
    }

    const saveForLaterHandler = (id) => {
        dispatch(saveForLater(id));
        removeCartItem(id);
        enqueueSnackbar("Saved For Later", { variant: "success" });
    }

    return (
        <div className="flex flex-col gap-3 overflow-hidden border-b border-white/[0.06] py-5 pl-2 sm:pl-6" key={product}>

            <Link to={`/product/${product}`} className="flex flex-col sm:flex-row gap-5 items-stretch w-full group">
                {/* <!-- product image --> */}
                <div className="w-full sm:w-1/6 h-28 flex-shrink-0">
                    <img draggable="false" className="h-full w-full object-contain" src={image} alt={name} />
                </div>
                {/* <!-- product image --> */}

                {/* <!-- description --> */}
                <div className="flex flex-col sm:gap-5 w-full pr-6">
                    {/* <!-- product title --> */}
                    <div className="flex flex-col sm:flex-row justify-between items-start pr-5 gap-1 sm:gap-0">
                        <div className="flex flex-col gap-0.5 sm:w-3/5">
                            <p className="font-medium text-slate-100 transition group-hover:text-neutral-200">{name.length > 42 ? `${name.substring(0, 42)}...` : name}</p>
                            <span className="text-sm text-slate-500">Seller: {seller}</span>
                        </div>

                        <div className="flex flex-col sm:gap-2">
                            <p className="text-sm text-slate-400">Delivery by {getDeliveryDate()} · <span className="text-emerald-400">Free</span> <span className="line-through text-slate-600">{formatRs(quantity * 40)}</span></p>
                            <span className="text-xs text-slate-500">7-day replacement policy</span>
                        </div>

                    </div>
                    {/* <!-- product title --> */}

                    {/* <!-- price desc --> */}
                    <div className="flex flex-wrap items-baseline gap-2 text-xl font-semibold text-white">
                        <span>{formatRs(price * quantity)}</span>
                        <span className="text-sm font-normal text-slate-500 line-through">{formatRs(cuttedPrice * quantity)}</span>
                        <span className="text-sm font-medium text-emerald-400">{getDiscount(price, cuttedPrice)}% off</span>
                    </div>
                    {/* <!-- price desc --> */}

                </div>
                {/* <!-- description --> */}
            </Link>

            {/* <!-- save for later --> */}
            <div className="flex justify-between pr-4 sm:pr-0 sm:justify-start sm:gap-6">
                {/* <!-- quantity --> */}
                <div className="flex gap-1 items-center">
                    <span onClick={() => decreaseQuantity(product, quantity)} className="qty-btn"><p>-</p></span>
                    <input className="qtyInput w-11 rounded-lg border border-white/10 bg-slate-800/80 py-1 text-center text-sm font-medium text-slate-200 outline-none" value={quantity} disabled />
                    <span onClick={() => increaseQuantity(product, quantity, stock)} className="qty-btn">+</span>
                </div>
                {/* <!-- quantity --> */}
                {inCart && (
                    <>
                    <button onClick={() => saveForLaterHandler(product)} className="text-sm font-medium text-neutral-300 transition hover:text-neutral-200 sm:ml-4">Save for later</button>
                    <button onClick={() => removeCartItem(product)} className="text-sm font-medium text-slate-400 transition hover:text-red-400">Remove</button>
                    </>
                )}
            </div>
            {/* <!-- save for later --> */}

        </div>
    );
};

export default CartItem;
