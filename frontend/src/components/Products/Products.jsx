import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Pagination from '@mui/material/Pagination';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Slider from '@mui/material/Slider';
import { useSnackbar } from 'notistack';
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { clearErrors, getProducts } from '../../actions/productAction';
import Loader from '../Layouts/Loader';
import MinCategory from '../Layouts/MinCategory';
import Product from './Product';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import StarIcon from '@mui/icons-material/Star';
import { categories } from '../../utils/constants';
import MetaData from '../Layouts/MetaData';
import {
    metaTitle,
    APP_NAME,
    PRODUCTS_META_DESCRIPTION,
} from '../../constants/brand';
import { absoluteUrl } from '../../utils/seo';
import { formatRs } from '../../utils/currency';

function readCategoryFromSearch(search) {
    const q = new URLSearchParams(search).get('category');
    return q || '';
}

function readPriceFromSearch(search) {
    const p = new URLSearchParams(search);
    const maxP = p.get('maxPrice');
    const minP = p.get('minPrice');
    let low = 0;
    let high = 200000;
    if (minP !== null && minP !== '' && !Number.isNaN(Number(minP))) {
        low = Math.max(0, Number(minP));
    }
    if (maxP !== null && maxP !== '' && !Number.isNaN(Number(maxP))) {
        high = Math.min(200000, Number(maxP));
    }
    if (high < low) {
        return [0, 200000];
    }
    return [low, high];
}

function readBrandFromSearch(search) {
    const b = new URLSearchParams(search).get('brand');
    return b || '';
}

function readRatingsFromSearch(search) {
    const r = new URLSearchParams(search).get('ratings');
    if (r === null || r === '') return 0;
    const n = Number(r);
    return Number.isNaN(n) ? 0 : n;
}

const Products = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const params = useParams();
    const location = useLocation();

    const [price, setPrice] = useState(() => readPriceFromSearch(location.search));
    const [category, setCategory] = useState(() => readCategoryFromSearch(location.search));
    const [ratings, setRatings] = useState(0);

    // pagination
    const [currentPage, setCurrentPage] = useState(1);

    // filter toggles
    const [categoryToggle, setCategoryToggle] = useState(true);
    const [ratingsToggle, setRatingsToggle] = useState(true);

    const { products, loading, error, resultPerPage, filteredProductsCount, searchRelaxed, searchRelaxedMode } =
        useSelector((state) => state.products);
    const keyword = params.keyword;

    const brand = useMemo(() => readBrandFromSearch(location.search), [location.search]);

    const listTitle = keyword
        ? metaTitle(`Search: ${keyword}`)
        : category
          ? metaTitle(category)
          : metaTitle('All Products');
    const listDescription = keyword
        ? `Results for "${keyword}" on ${APP_NAME}. ${PRODUCTS_META_DESCRIPTION}`
        : category
          ? `Shop ${category} — ${PRODUCTS_META_DESCRIPTION}`
          : PRODUCTS_META_DESCRIPTION;
    const listKeywords = [keyword, category, APP_NAME].filter(Boolean).join(', ');
    const canonical = absoluteUrl(`${location.pathname}${location.search}`);

    const priceHandler = (e, newPrice) => {
        setPrice(newPrice);
    }

    const clearFilters = () => {
        setPrice([0, 200000]);
        setCategory('');
        setRatings(0);
        setCurrentPage(1);
        navigate({ pathname: keyword ? `/products/${keyword}` : '/products', search: '' });
    };

    /** Query string drives category + price caps (e.g. natural language search). */
    useEffect(() => {
        setCategory(readCategoryFromSearch(location.search));
        setPrice(readPriceFromSearch(location.search));
        setRatings(readRatingsFromSearch(location.search));
        setCurrentPage(1);
    }, [location.search]);

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        dispatch(getProducts(keyword, category, price, ratings, currentPage, brand));
    }, [dispatch, keyword, category, price, ratings, currentPage, brand, error, enqueueSnackbar]);

    const categoryRadioChange = (value) => {
        setCategory(value);
        setCurrentPage(1);
        const base = keyword ? `/products/${keyword}` : '/products';
        const p = new URLSearchParams();
        if (value) {
            p.set('category', value);
        }
        if (price[1] < 200000) {
            p.set('maxPrice', String(price[1]));
        }
        if (price[0] > 0) {
            p.set('minPrice', String(price[0]));
        }
        if (brand) {
            p.set('brand', brand);
        }
        if (ratings > 0) {
            p.set('ratings', String(ratings));
        }
        navigate({ pathname: base, search: p.toString() ? `?${p.toString()}` : '' });
    };

    return (
        <>
            <MetaData
                title={listTitle}
                description={listDescription}
                keywords={listKeywords}
                canonical={canonical}
                ogTitle={listTitle}
                ogDescription={listDescription}
            />

            <MinCategory />
            <main className="w-full mt-14 sm:mt-0">

                {/* <!-- row --> */}
                <div className="flex gap-3 mt-2 sm:mt-2 sm:mx-3 m-auto mb-7">

                    {/* <!-- sidebar column  --> */}
                    <div className="hidden sm:flex flex-col w-1/5 px-1">

                        {/* <!-- nav tiles --> */}
                        <div className="flex flex-col bg-app-card rounded-sm shadow">

                            {/* <!-- filters header --> */}
                            <div className="flex items-center justify-between gap-5 border-b border-app-border px-4 py-2">
                                <p className="text-lg font-medium text-slate-100">Filters</p>
                                <span className="uppercase text-primary-blue text-xs cursor-pointer font-medium" onClick={() => clearFilters()}>clear all</span>
                            </div>

                            <div className="flex flex-col gap-2 py-3 text-sm overflow-hidden">

                                {/* price slider filter */}
                                <div className="flex flex-col gap-2 border-b border-app-border px-4">
                                    <span className="font-medium text-xs">PRICE</span>

                                    <Slider
                                        value={price}
                                        onChange={priceHandler}
                                        valueLabelDisplay="auto"
                                        getAriaLabel={() => 'Price range slider'}
                                        min={0}
                                        max={200000}
                                    />

                                    <div className="flex gap-3 items-center justify-between mb-2 min-w-full">
                                        <span className="flex-1 rounded-sm border border-app-border bg-slate-900/80 px-4 py-1 text-slate-200">{formatRs(price[0])}</span>
                                        <span className="font-medium text-slate-500">to</span>
                                        <span className="flex-1 rounded-sm border border-app-border bg-slate-900/80 px-4 py-1 text-slate-200">{formatRs(price[1])}</span>
                                    </div>
                                </div>
                                {/* price slider filter */}

                                {/* category filter */}
                                <div className="flex flex-col border-b border-app-border px-4">

                                    <div className="flex cursor-pointer items-center justify-between py-2 pb-4" onClick={() => setCategoryToggle(!categoryToggle)}>
                                        <p className="text-xs font-medium uppercase text-slate-300">Category</p>
                                        {categoryToggle ?
                                            <ExpandLessIcon sx={{ fontSize: "20px" }} /> :
                                            <ExpandMoreIcon sx={{ fontSize: "20px" }} />
                                        }
                                    </div>

                                    {categoryToggle && (
                                        <div className="flex flex-col pb-1">
                                            <FormControl>
                                                <RadioGroup
                                                    aria-labelledby="category-radio-buttons-group"
                                                    onChange={(e) => categoryRadioChange(e.target.value)}
                                                    name="category-radio-buttons"
                                                    value={category}
                                                >
                                                    {categories.map((el, i) => (
                                                        <FormControlLabel value={el} control={<Radio size="small" />} label={<span className="text-sm" key={i}>{el}</span>} />
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                        </div>
                                    )}

                                </div>
                                {/* category filter */}

                                {/* ratings filter */}
                                <div className="flex flex-col border-b border-app-border px-4">

                                    <div className="flex cursor-pointer items-center justify-between py-2 pb-4" onClick={() => setRatingsToggle(!ratingsToggle)}>
                                        <p className="text-xs font-medium uppercase text-slate-300">ratings</p>
                                        {ratingsToggle ?
                                            <ExpandLessIcon sx={{ fontSize: "20px" }} /> :
                                            <ExpandMoreIcon sx={{ fontSize: "20px" }} />
                                        }
                                    </div>

                                    {ratingsToggle && (
                                        <div className="flex flex-col pb-1">
                                            <FormControl>
                                                <RadioGroup
                                                    aria-labelledby="ratings-radio-buttons-group"
                                                    onChange={(e) => setRatings(e.target.value)}
                                                    value={ratings}
                                                    name="ratings-radio-buttons"
                                                >
                                                    {[4, 3, 2, 1].map((el, i) => (
                                                        <FormControlLabel value={el} key={i} control={<Radio size="small" />} label={<span className="flex items-center text-sm">{el}<StarIcon sx={{ fontSize: "12px", mr: 0.5 }} /> & above</span>} />
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                        </div>
                                    )}

                                </div>
                                {/* ratings filter */}

                            </div>

                        </div>
                        {/* <!-- nav tiles --> */}

                    </div>
                    {/* <!-- sidebar column  --> */}

                    {/* <!-- search column --> */}
                    <div className="flex-1">
                        {!loading && products?.length > 0 && searchRelaxed && (
                            <div className="mb-3 rounded-md border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-xs text-amber-100/90">
                                {searchRelaxedMode === 'category_browse' ? (
                                    <>
                                        Your search words did not match any product title or description. Showing
                                        products in <strong className="font-semibold">{category || 'this category'}</strong>{' '}
                                        with your other filters instead.
                                    </>
                                ) : (
                                    <>
                                        No exact match with the suggested category/brand filters. Showing results for
                                        your keywords and other filters instead.
                                    </>
                                )}
                            </div>
                        )}

                        {!loading && products?.length === 0 && (
                            <div className="flex flex-col items-center justify-center gap-3 bg-app-card shadow-sm rounded-sm p-6 sm:p-16">
                                <img draggable="false" className="w-1/2 h-44 object-contain" src="https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/error-no-search-results_2353c5.png" alt="Search Not Found" />
                                <h1 className="text-2xl font-medium text-slate-100">Sorry, no results found!</h1>
                                <p className="text-xl text-center text-primary-grey">Please check the spelling or try searching for something else</p>
                            </div>
                        )}

                        {loading ? <Loader /> : (
                            <div className="flex flex-col gap-2 pb-4 justify-center items-center w-full overflow-hidden bg-app-card">

                                <div className="grid w-full grid-cols-1 place-content-start overflow-hidden border-b border-app-border pb-4 sm:grid-cols-4">
                                    {products?.map((product) => (
                                            <Product {...product} key={product._id} />
                                        ))
                                    }
                                </div>
                                {filteredProductsCount > resultPerPage && (
                                    <Pagination
                                        count={Number(((filteredProductsCount + 6) / resultPerPage).toFixed())}
                                        page={currentPage}
                                        onChange={(e, val) => setCurrentPage(val)}
                                        color="primary"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                    {/* <!-- search column --> */}
                </div >
                {/* <!-- row --> */}

            </main >
        </>
    );
};

export default Products;
