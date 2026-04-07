import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { sliceProductsForHome, topRatedProductsForHome } from '../../../utils/functions';
import { homeSliderSettings } from '../homeSliderSettings';
import Product from './Product';

/**
 * @param {'youMayAlsoLike'|'suggestedForYou'|undefined} recommendationSource — server rules (trending / browse history)
 * @param {Array|undefined} externalProducts — e.g. “customers also bought” on PDP
 */
const ProductSlider = ({
    title,
    tagline,
    sectionIndex = 0,
    variant = 'slice',
    recommendationSource,
    externalProducts,
}) => {
    const { loading, products, recommendations = { youMayAlsoLike: [], suggestedForYou: [] }, recommendationsLoading } =
        useSelector((state) => state.products);

    const rowProducts = useMemo(() => {
        if (externalProducts?.length) {
            return externalProducts.slice(0, 12);
        }
        if (recommendationSource && recommendations[recommendationSource]?.length) {
            return recommendations[recommendationSource].slice(0, 12);
        }
        if (variant === 'topRated') {
            return topRatedProductsForHome(products, 12);
        }
        return sliceProductsForHome(products, sectionIndex, 12);
    }, [externalProducts, recommendationSource, recommendations, variant, products, sectionIndex]);

    const waitingForRec =
        Boolean(recommendationSource) && recommendationsLoading && !recommendations[recommendationSource]?.length;
    const waitingForCatalog = !externalProducts && !recommendationSource && loading;
    const showLoader = waitingForRec || waitingForCatalog;

    return (
        <section className="w-full overflow-hidden rounded-2xl border border-app-border/70 bg-gradient-to-br from-app-card via-app-card to-slate-950/40 shadow-xl shadow-black/40 ring-1 ring-white/[0.03]">
            <div className="flex flex-col gap-3 border-b border-app-border/80 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-5">
                <div className="min-w-0 flex-1">
                    <h1 className="text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">{title}</h1>
                    {tagline ? <p className="mt-1 text-sm text-slate-500">{tagline}</p> : null}
                </div>
                <Link
                    to="/products"
                    className="shrink-0 self-start rounded-lg border border-sky-500/35 bg-sky-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-sky-300 transition hover:border-sky-400/50 hover:bg-sky-500/15 hover:text-sky-200 sm:self-auto"
                >
                    View all
                </Link>
            </div>
            {showLoader ? (
                <div className="flex min-h-[280px] items-center justify-center px-6 py-12">
                    <div className="h-9 w-9 animate-pulse rounded-full border-2 border-sky-500/30 border-t-sky-400" aria-hidden />
                </div>
            ) : rowProducts.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-slate-500">No products in the store yet.</p>
            ) : (
                <div className="home-product-slider px-1 pb-4 pt-1 sm:px-2 sm:pb-6">
                    <Slider {...homeSliderSettings} className="home-product-slick">
                        {rowProducts.map((product) => (
                            <div key={product._id} className="!flex h-full">
                                <Product {...product} />
                            </div>
                        ))}
                    </Slider>
                </div>
            )}
        </section>
    );
};

export default ProductSlider;
