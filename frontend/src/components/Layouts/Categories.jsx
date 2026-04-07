import { Link } from 'react-router-dom';
import { useProductCategories } from '../../hooks/useProductCategories';
import mobiles from '../../assets/images/Categories/phone.png';
import fashion from '../../assets/images/Categories/fashion.png';
import electronics from '../../assets/images/Categories/electronics.png';
import home from '../../assets/images/Categories/home.png';
import travel from '../../assets/images/Categories/travel.png';
import appliances from '../../assets/images/Categories/appliances.png';
import furniture from '../../assets/images/Categories/furniture.png';
import beauty from '../../assets/images/Categories/beauty.png';
import grocery from '../../assets/images/Categories/grocery.png';

const defaultIcon = electronics;

/** Map category names (from DB) to tile icons — substring match, then default. */
function iconForCategory(name) {
    if (!name) return defaultIcon;
    const lower = String(name).toLowerCase();
    if (lower.includes('mobile') || lower.includes('phone')) return mobiles;
    if (lower.includes('fashion') || lower.includes('cloth') || lower.includes('wear')) return fashion;
    if (lower.includes('electronic') || lower.includes('laptop') || lower.includes('computer')) return electronics;
    if (lower.includes('home') && !lower.includes('appliance')) return home;
    if (lower.includes('travel') || lower.includes('luggage')) return travel;
    if (lower.includes('appliance')) return appliances;
    if (lower.includes('furniture') || lower.includes('sofa')) return furniture;
    if (lower.includes('grocery') || lower.includes('food')) return grocery;
    if (lower.includes('beauty') || lower.includes('toy')) return beauty;
    return defaultIcon;
}

const Categories = () => {
    const { categories: categoriesWithProducts, loading } = useProductCategories();

    if (loading || categoriesWithProducts.length === 0) {
        return null;
    }

    return (
        <section className="mt-10 mb-4 hidden min-w-full overflow-hidden border-b border-app-border/80 bg-gradient-to-b from-app-card to-slate-950/30 px-6 py-5 shadow-lg shadow-black/25 sm:block sm:px-12">
            <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-center gap-x-4 gap-y-6 sm:justify-between">
                {categoriesWithProducts.map((name) => (
                    <Link
                        to={`/products?category=${encodeURIComponent(name)}`}
                        className="group flex w-[4.75rem] flex-col items-center gap-2 sm:w-[5.5rem]"
                        key={name}
                    >
                        <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-2 border-slate-600/40 bg-slate-900/80 p-2.5 shadow-lg shadow-black/40 ring-2 ring-white/[0.04] transition group-hover:border-sky-500/40 group-hover:ring-sky-500/20 sm:h-[5.25rem] sm:w-[5.25rem] sm:p-3">
                            <img
                                draggable={false}
                                className="h-full w-full object-contain drop-shadow-sm transition group-hover:scale-105"
                                src={iconForCategory(name)}
                                alt=""
                            />
                        </div>
                        <span className="line-clamp-2 text-center text-xs font-medium leading-tight text-slate-200 group-hover:text-sky-400 sm:text-sm">
                            {name}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default Categories;
