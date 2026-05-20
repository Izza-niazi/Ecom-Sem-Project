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
        <section className="section-shell animate-slide-up w-full">
            <div className="section-head">
                <div className="min-w-0 flex-1">
                    <h2 className="section-title">{title}</h2>
                    {tagline ? <p className="section-tagline">{tagline}</p> : null}
                </div>
                <Link to="/products" className="btn-secondary shrink-0 self-start !text-xs sm:self-auto">
                    View all
                </Link>
            </div>
            {showLoader ? (
                <div className="flex min-h-[280px] items-center justify-center px-6 py-12">
                    <div className="h-9 w-9 animate-pulse rounded-full border-2 border-white/20 border-t-white" aria-hidden />
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
