import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Link } from 'react-router-dom';
import { getDiscount } from '../../utils/functions';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../actions/wishlistAction';
import { useSnackbar } from 'notistack';
import { formatRs } from '../../utils/currency';
import ProductThumb from '../common/ProductThumb';

const Product = ({ _id, name, images, ratings, numOfReviews, price, cuttedPrice }) => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const { wishlistItems } = useSelector((state) => state.wishlist);
    const itemInWishlist = wishlistItems.some((i) => i.product === _id);

    const addToWishlistHandler = () => {
        if (itemInWishlist) {
            dispatch(removeFromWishlist(_id));
            enqueueSnackbar('Remove From Wishlist', { variant: 'success' });
        } else {
            dispatch(addToWishlist(_id));
            enqueueSnackbar('Added To Wishlist', { variant: 'success' });
        }
    };

    return (
        <div className="product-card group relative">
            <button
                type="button"
                onClick={addToWishlistHandler}
                className={`absolute right-3 top-3 z-[1] rounded-full p-2 backdrop-blur-sm transition ${
                    itemInWishlist
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-black/30 text-slate-300 hover:bg-rose-500/20 hover:text-rose-400'
                }`}
                aria-label={itemInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                <FavoriteIcon sx={{ fontSize: 18 }} />
            </button>

            <Link to={`/product/${_id}`} className="group/link flex flex-col">
                <ProductThumb
                    url={images?.[0]?.url}
                    alt={name}
                    className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-gradient-to-b from-slate-800/80 to-black ring-1 ring-inset ring-white/[0.06]"
                    imgClassName="h-full w-full object-contain p-3 transition duration-300 group-hover/link:scale-105"
                />
                <h2 className="home-product-title mt-3 text-left text-sm font-medium text-slate-200 group-hover/link:text-neutral-200">
                    {name.length > 85 ? `${name.substring(0, 85)}…` : name}
                </h2>
            </Link>

            <div className="mt-3 flex flex-col gap-2">
                <span className="flex flex-wrap items-center gap-2">
                    <span className="badge-rating">
                        {ratings.toFixed(1)} <StarIcon sx={{ fontSize: 14 }} className="!text-emerald-400" />
                    </span>
                    <span className="text-xs text-slate-500">({numOfReviews})</span>
                </span>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-lg font-bold text-white">{formatRs(price)}</span>
                    <span className="text-xs text-slate-500 line-through">{formatRs(cuttedPrice)}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                        {getDiscount(price, cuttedPrice)}% off
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Product;
