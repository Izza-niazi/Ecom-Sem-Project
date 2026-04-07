import { useEffect } from 'react';
import Categories from '../Layouts/Categories';
import BrowseAllBanner from './BrowseAllBanner';
import ProductSlider from './ProductSlider/ProductSlider';
import { useDispatch, useSelector } from 'react-redux';
import { clearErrors, getSliderProducts, getHomeRecommendations } from '../../actions/productAction';
import { useSnackbar } from 'notistack';
import MetaData from '../Layouts/MetaData';
import {
    HOME_META_TITLE,
    HOME_META_DESCRIPTION,
    HOME_META_KEYWORDS,
} from '../../constants/brand';
import { absoluteUrl } from '../../utils/seo';

const Home = () => {

  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { error } = useSelector((state) => state.products);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: "error" });
      dispatch(clearErrors());
    }
    dispatch(getSliderProducts());
    dispatch(getHomeRecommendations());
  }, [dispatch, error, enqueueSnackbar]);

  return (
    <>
      <MetaData
        title={HOME_META_TITLE}
        description={HOME_META_DESCRIPTION}
        keywords={HOME_META_KEYWORDS}
        canonical={absoluteUrl('/')}
        ogTitle={HOME_META_TITLE}
        ogDescription={HOME_META_DESCRIPTION}
      />
      <Categories />
      <BrowseAllBanner />
      <main className="mt-4 flex flex-col gap-3 px-2 sm:mt-6">
        <ProductSlider
          recommendationSource="youMayAlsoLike"
          sectionIndex={0}
          title="You may also like"
          tagline="Trending from what shoppers buy"
        />
        <ProductSlider
          recommendationSource="suggestedForYou"
          sectionIndex={1}
          title="Suggested for you"
          tagline="Based on categories you view — sign in for better picks"
        />
        <ProductSlider variant="topRated" title="Top picks" tagline="Highest rated in the store" />
      </main>
    </>
  );
};

export default Home;
