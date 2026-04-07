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
            enqueueSnackbar("Remove From Wishlist", { variant: "success" });
        } else {
            dispatch(addToWishlist(_id));
            enqueueSnackbar("Added To Wishlist", { variant: "success" });
        }
    }

    return (
        <div className="relative flex flex-col items-stretch gap-3 rounded-xl border border-app-border/60 bg-gradient-to-b from-slate-900/40 to-app-page/90 p-4 transition hover:border-sky-500/20 hover:shadow-lg hover:shadow-black/40">
            <Link to={`/product/${_id}`} className="group flex flex-col">
                <ProductThumb
                    url={images?.[0]?.url}
                    alt={name}
                    className="aspect-[4/5] w-full rounded-lg bg-slate-950/50 ring-1 ring-inset ring-white/5"
                    imgClassName="h-full w-full object-contain p-2 transition group-hover:scale-[1.02]"
                />
                <h2 className="home-product-title mt-3 text-left text-sm font-medium text-slate-200 group-hover:text-sky-300">
                    {name.length > 85 ? `${name.substring(0, 85)}…` : name}
                </h2>
            </Link>

            <div className="flex flex-col gap-2">
                <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
                    <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/20">
                        {ratings.toFixed(1)} <StarIcon sx={{ fontSize: 14 }} className="!text-emerald-400" />
                    </span>
                    <span className="text-xs">({numOfReviews})</span>
                </span>

                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-lg font-semibold text-white">{formatRs(price)}</span>
                    <span className="text-xs font-medium text-slate-500 line-through">{formatRs(cuttedPrice)}</span>
                    <span className="text-xs font-semibold text-emerald-400/90">{getDiscount(price, cuttedPrice)}% off</span>
                </div>
            </div>

            <button
                type="button"
                onClick={addToWishlistHandler}
                className={`absolute right-3 top-3 rounded-full p-1.5 transition ${
                    itemInWishlist ? 'text-rose-400' : 'text-slate-400 hover:bg-white/5 hover:text-rose-400'
                }`}
                aria-label={itemInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                <FavoriteIcon sx={{ fontSize: 18 }} />
            </button>
        </div>
    );
};

export default Product;
