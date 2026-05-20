import { Link, useLocation } from 'react-router-dom';
import { useProductCategories } from '../../hooks/useProductCategories';
import { iconForCategory } from '../../utils/categoryIcons';

const MinCategory = () => {
    const { categories, loading } = useProductCategories();
    const location = useLocation();
    const activeCategory = new URLSearchParams(location.search).get('category') || '';

    if (loading || categories.length === 0) {
        return null;
    }

    return (
        <section
            className="category-bar sticky top-14 z-40 mt-14 w-full border-b border-white/[0.06] bg-black/90 backdrop-blur-md"
            aria-label="Shop by category"
        >
            <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-3 py-2.5 scrollbar-none sm:gap-2.5 sm:px-4">
                <Link
                    to="/products"
                    className={`category-pill shrink-0 ${
                        location.pathname.startsWith('/products') && !activeCategory
                            ? 'category-pill-active'
                            : ''
                    }`}
                >
                    All
                </Link>
                {categories.map((name) => {
                    const isActive =
                        activeCategory.toLowerCase() === name.toLowerCase();
                    return (
                        <Link
                            to={`/products?category=${encodeURIComponent(name)}`}
                            key={name}
                            className={`category-pill shrink-0 ${isActive ? 'category-pill-active' : ''}`}
                        >
                            <img
                                src={iconForCategory(name)}
                                alt=""
                                className="h-4 w-4 object-contain opacity-90"
                                draggable={false}
                            />
                            <span>{name}</span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default MinCategory;
