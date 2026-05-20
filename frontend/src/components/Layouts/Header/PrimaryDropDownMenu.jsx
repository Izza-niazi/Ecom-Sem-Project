import React, { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { logoutUser } from '../../../actions/userAction';

const PrimaryDropDownMenu = ({ setTogglePrimaryDropDown, user, anchorRef }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [position, setPosition] = useState({ top: 0, right: 0 });

    const { wishlistItems } = useSelector((state) => state.wishlist);

    useLayoutEffect(() => {
        const updatePosition = () => {
            if (!anchorRef?.current) return;
            const rect = anchorRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 8,
                right: Math.max(8, window.innerWidth - rect.right),
            });
        };
        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [anchorRef]);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
        enqueueSnackbar('Logout Successfully', { variant: 'success' });
        setTogglePrimaryDropDown(false);
    };

    const close = () => setTogglePrimaryDropDown(false);

    const navs = [
        {
            title: 'Orders',
            icon: <ShoppingBagIcon sx={{ fontSize: '18px' }} />,
            redirect: '/orders',
        },
        {
            title: 'Wishlist',
            icon: <FavoriteIcon sx={{ fontSize: '18px' }} />,
            redirect: '/wishlist',
        },
    ];

    const itemClass =
        'flex items-center gap-3 border-b border-neutral-800 py-3 pl-4 pr-3 text-sm text-white transition hover:bg-neutral-800';

    const menu = (
        <div
            role="menu"
            className="user-dropdown-menu fixed z-[200] w-56 overflow-hidden rounded-xl border border-neutral-700 text-sm"
            style={{
                top: position.top,
                right: position.right,
                backgroundColor: '#0a0a0a',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.08)',
            }}
        >
            {user.role === 'admin' && (
                <Link className={`${itemClass} rounded-t-xl`} to="/admin/dashboard" onClick={close} role="menuitem">
                    <span className="text-neutral-400">
                        <DashboardIcon sx={{ fontSize: '18px' }} />
                    </span>
                    Admin Dashboard
                </Link>
            )}

            <Link
                className={`${itemClass} ${user.role !== 'admin' ? 'rounded-t-xl' : ''}`}
                to="/account"
                onClick={close}
                role="menuitem"
            >
                <span className="text-neutral-400">
                    <AccountCircleIcon sx={{ fontSize: '18px' }} />
                </span>
                My Profile
            </Link>

            {navs.map((item) => {
                const { title, icon, redirect } = item;

                return (
                    <React.Fragment key={title}>
                        {title === 'Wishlist' ? (
                            <Link className={itemClass} to={redirect} onClick={close} role="menuitem">
                                <span className="text-neutral-400">{icon}</span>
                                {title}
                                <span className="ml-auto rounded-md bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">
                                    {wishlistItems.length}
                                </span>
                            </Link>
                        ) : (
                            <Link className={itemClass} to={redirect} onClick={close} role="menuitem">
                                <span className="text-neutral-400">{icon}</span>
                                {title}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}

            <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-3 rounded-b-xl py-3 pl-4 pr-3 text-left text-sm text-white transition hover:bg-neutral-800"
                onClick={handleLogout}
                role="menuitem"
            >
                <span className="text-neutral-400">
                    <PowerSettingsNewIcon sx={{ fontSize: '18px' }} />
                </span>
                Logout
            </button>
        </div>
    );

    return createPortal(menu, document.body);
};

export default PrimaryDropDownMenu;
