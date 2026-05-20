import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { APP_NAME } from '../../../constants/brand';
import Logo from '../Logo';

const footerNav = [
    { name: 'Blog', to: '/blog' },
    { name: 'Browse products', to: '/products' },
    { name: 'Terms of Use', to: '/terms' },
    { name: 'Privacy', to: '/privacy' },
];

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
        <footer className="relative mt-24 w-full border-t border-white/[0.06] bg-black/80 backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
                <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-sm">
                        <Logo />
                        <p className="mt-4 text-sm leading-relaxed text-slate-400">
                            Pakistan&apos;s favourite marketplace — electronics, fashion, home essentials,
                            and more. Secure checkout in PKR.
                        </p>
                    </div>

                    <nav className="flex flex-wrap gap-x-8 gap-y-3">
                        {footerNav.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className="text-sm font-medium text-slate-400 transition hover:text-neutral-200"
                            >
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
                                className="rounded-xl p-2.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-neutral-300"
                                aria-label={name}
                            >
                                <Icon sx={{ fontSize: 22 }} />
                            </a>
                        ))}
                    </div>
                </div>

                <p className="mt-10 border-t border-white/[0.06] pt-8 text-center text-xs text-slate-500 sm:text-left">
                    &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
