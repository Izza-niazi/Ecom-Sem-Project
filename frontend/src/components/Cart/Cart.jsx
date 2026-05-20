import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import MetaData from '../Layouts/MetaData';
import { metaTitle } from '../../constants/brand';
import CartItem from './CartItem';
import EmptyCart from './EmptyCart';
import PriceSidebar from './PriceSidebar';
import SaveForLaterItem from './SaveForLaterItem';

const Cart = () => {

    const navigate = useNavigate();
    const { cartItems } = useSelector((state) => state.cart);
    const { saveForLaterItems } = useSelector((state) => state.saveForLater);

    const placeOrderHandler = () => {
        navigate('/login?redirect=shipping');
    }

    return (
        <>
            <MetaData title={metaTitle('Shopping Cart')} />
            <main className="mx-auto mt-20 w-full max-w-7xl px-3 pb-12 sm:mt-24 sm:px-4">

                {/* <!-- row --> */}
                <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">

                    {/* <!-- cart column --> */}
                    <div className="flex-1">

                        {/* <!-- cart items container --> */}
                        <div className="checkout-card flex flex-col">
                            <span className="checkout-card-header">My cart ({cartItems.length})</span>

                            {cartItems && cartItems.length === 0 && (
                                <EmptyCart />
                            )}

                            {cartItems && cartItems.map((item) => (
                                <CartItem {...item} inCart={true} />
                            )
                            )}

                            {/* <!-- place order btn --> */}
                            <div className="flex justify-end px-4 pb-4 sm:px-6">
                                <button
                                    onClick={placeOrderHandler}
                                    disabled={cartItems.length < 1}
                                    className={
                                        cartItems.length < 1
                                            ? 'w-full cursor-not-allowed rounded-xl bg-slate-700 px-6 py-3 text-sm font-semibold text-slate-500 sm:w-auto'
                                            : 'btn-accent w-full !py-3 sm:w-auto sm:min-w-[200px]'
                                    }
                                >
                                    Place order
                                </button>
                            </div>
                            {/* <!-- place order btn --> */}

                        </div>
                        {/* <!-- cart items container --> */}

                        {/* <!-- saved for later items container --> */}
                        <div className="checkout-card mt-5 flex flex-col">
                            <span className="checkout-card-header">Saved for later ({saveForLaterItems.length})</span>
                            {saveForLaterItems && saveForLaterItems.map((item) => (
                                <SaveForLaterItem {...item} />
                            )
                            )}
                        </div>
                        {/* <!-- saved for later container --> */}

                    </div>
                    {/* <!-- cart column --> */}

                    <PriceSidebar cartItems={cartItems} />

                </div>

            </main>
        </>
    );
};

export default Cart;
