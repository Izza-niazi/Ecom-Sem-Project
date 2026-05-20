import { getDiscount } from '../../../utils/functions';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../../actions/wishlistAction';
import { useSnackbar } from 'notistack';
import { formatRs } from '../../../utils/currency';
import ProductThumb from '../../common/ProductThumb';

const Product = (props) => {
    const { _id, name, images, ratings, numOfReviews, price, cuttedPrice } = props;

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const { wishlistItems } = useSelector((state) => state.wishlist);

    const itemInWishlist = wishlistItems.some((i) => i.product === _id);

    const addToWishlistHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (itemInWishlist) {
            dispatch(removeFromWishlist(_id));
            enqueueSnackbar('Remove From Wishlist', { variant: 'success' });
        } else {
            dispatch(addToWishlist(_id));
            enqueueSnackbar('Added To Wishlist', { variant: 'success' });
        }
    };

    const title = name.length > 48 ? `${name.substring(0, 48)}…` : name;
    const safeRatings = typeof ratings === 'number' && !Number.isNaN(ratings) ? ratings : 0;
    const safeReviews = typeof numOfReviews === 'number' ? numOfReviews : 0;

    return (
        <article className="group/card relative h-full px-1.5 pb-1 pt-2 sm:px-2">
            <div className="product-card">
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

                <Link to={`/product/${_id}`} className="flex min-h-0 flex-1 flex-col">
                    <ProductThumb
                        url={images?.[0]?.url}
                        alt={name}
                        className="aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-slate-800/80 to-black ring-1 ring-inset ring-white/[0.06]"
                        imgClassName="h-full w-full object-contain p-3 transition duration-300 group-hover/card:scale-105"
                    />

                    <h2 className="home-product-title mt-3 min-h-[2.5rem] text-left text-sm font-medium leading-snug text-slate-200 transition group-hover/card:text-neutral-200">
                        {title}
                    </h2>

                    <div className="mt-auto flex flex-col gap-2 pt-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="badge-rating">
                                {safeRatings.toFixed(1)}
                                <StarIcon sx={{ fontSize: 13 }} className="!text-emerald-400" />
                            </span>
                            <span className="text-xs text-slate-500">
                                ({safeReviews.toLocaleString()})
                            </span>
                        </div>

                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            <span className="text-lg font-bold tracking-tight text-white">
                                {formatRs(price)}
                            </span>
                            <span className="text-xs text-slate-500 line-through">
                                {formatRs(cuttedPrice)}
                            </span>
                            <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                                {getDiscount(price, cuttedPrice)}% off
                            </span>
                        </div>
                    </div>
                </Link>
            </div>
        </article>
    );
};

export default Product;
