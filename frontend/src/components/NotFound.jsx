import notFound from '../assets/images/404-not-found.svg';
import { Link } from 'react-router-dom';
import MetaData from './Layouts/MetaData';
import { metaTitle } from '../constants/brand';

const NotFound = () => {
    return (
        <div className="mt-16 flex flex-col gap-4 items-center justify-center">
            <MetaData title={metaTitle('Page not found')} robots="noindex, nofollow" />
            <img draggable="false" className="sm:w-1/3 h-full" src={notFound} alt="Page Not Found" />
            <Link to="/" className="rounded-md bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-slate-950 shadow-lg shadow-sky-500/25 transition hover:from-sky-400 hover:to-cyan-400">Back to home</Link>
        </div>
    );
};

export default NotFound;
