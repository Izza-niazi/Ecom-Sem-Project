import notFound from '../assets/images/404-not-found.svg';
import { Link } from 'react-router-dom';
import MetaData from './Layouts/MetaData';
import { metaTitle } from '../constants/brand';

const NotFound = () => {
    return (
        <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-6 px-4 pt-24 text-center animate-fade-in">
            <MetaData title={metaTitle('Page not found')} robots="noindex, nofollow" />
            <img draggable="false" className="w-64 opacity-90 sm:w-80" src={notFound} alt="Page Not Found" />
            <p className="text-slate-400">This page doesn&apos;t exist or was moved.</p>
            <Link to="/" className="btn-primary">
                Back to home
            </Link>
        </div>
    );
};

export default NotFound;
