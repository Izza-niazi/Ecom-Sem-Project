import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { APP_NAME } from '../../../constants/brand';

const footerNav = [
    { name: 'Browse products', to: '/products' },
    { name: 'Terms of Use', to: '/terms' },
    { name: 'Privacy', to: '/privacy' },
];

/** Placeholder social links — replace with real profiles when ready. */
const socialLinks = [
    { name: 'Facebook', href: 'https://facebook.com', Icon: FacebookIcon },
    { name: 'Twitter', href: 'https://twitter.com', Icon: TwitterIcon },
    { name: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
    { name: 'YouTube', href: 'https://youtube.com', Icon: YouTubeIcon },
];

const Footer = () => {
    const location = useLocation();
    const [adminRoute, setAdminRoute] = useState(false);

    useEffect(() => {
        setAdminRoute(location.pathname.split('/', 2).includes('admin'));
    }, [location]);

    if (adminRoute) {
        return null;
    }

    return (
        <footer className="mt-20 w-full border-t border-app-border bg-primary-darkBlue text-xs text-slate-300">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        {footerNav.map((item) => (
                            <Link key={item.to} to={item.to} className="transition hover:text-sky-400">
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-1">
                        {socialLinks.map(({ name, href, Icon }) => (
                            <a
                                key={name}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-md p-2 text-slate-400 transition hover:bg-white/5 hover:text-sky-400"
                                aria-label={name}
                            >
                                <Icon sx={{ fontSize: 22 }} />
                            </a>
                        ))}
                    </div>
                </div>
                <p className="text-center text-slate-500 sm:text-left">
                    &copy; {new Date().getFullYear()} {APP_NAME}
                </p>
            </div>
        </footer>
    );
};

export default Footer;
