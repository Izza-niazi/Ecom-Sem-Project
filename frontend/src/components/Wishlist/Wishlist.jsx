import { useSelector } from 'react-redux';
import MetaData from '../Layouts/MetaData';
import { metaTitle } from '../../constants/brand';
import MinCategory from '../Layouts/MinCategory';
import Sidebar from '../User/Sidebar';
import Product from './Product';

const Wishlist = () => {

    const { wishlistItems } = useSelector((state) => state.wishlist);

    return (
        <>
            <MetaData title={metaTitle('Wishlist')} />

            <MinCategory />
            <main className="mx-auto mt-12 w-full max-w-7xl px-3 pb-12 sm:mt-4 sm:px-4">

                <div className="mb-7 flex gap-4">

                    <Sidebar activeTab={'wishlist'} />

                    <div className="checkout-card flex-1">
                        <div className="flex flex-col">
                            <span className="checkout-card-header">My wishlist ({wishlistItems.length})</span>

                            {wishlistItems.length === 0 && (
                                <div className="m-6 flex flex-col items-center gap-3 py-8 text-center">
                                    <img draggable="false" className="w-48 object-contain opacity-80" src="https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/mywishlist-empty_39f7a5.png" alt="Empty Wishlist" />
                                    <span className="mt-4 text-lg font-semibold text-white">Your wishlist is empty</span>
                                    <p className="text-slate-400">Save items you love and come back anytime.</p>
                                </div>
                            )}

                            {wishlistItems.map((item, index) => (
                                <Product {...item} key={index}/>
                            )
                            ).reverse()}

                        </div>
                        {/* <!-- wishlist container --> */}

                    </div>

                </div>
            </main>
        </>
    );
};

export default Wishlist;
