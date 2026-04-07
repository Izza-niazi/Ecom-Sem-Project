import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from 'react-router-dom';
import { useProductCategories } from '../../hooks/useProductCategories';

const MinCategory = () => {
    const { categories, loading } = useProductCategories();

    if (loading || categories.length === 0) {
        return null;
    }

    return (
        <section className="mt-14 hidden w-full overflow-hidden border-b border-app-border bg-app-card/90 px-2 backdrop-blur-sm sm:block sm:px-12">
            <div className="flex items-center justify-between p-0.5">
                {categories.map((el) => (
                    <Link
                        to={`/products?category=${encodeURIComponent(el)}`}
                        key={el}
                        className="group flex items-center gap-0.5 p-2 text-sm font-medium text-slate-300 hover:text-sky-400"
                    >
                        {el}{' '}
                        <span className="text-slate-500 group-hover:text-sky-400">
                            <ExpandMoreIcon sx={{ fontSize: '16px' }} />
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default MinCategory;
