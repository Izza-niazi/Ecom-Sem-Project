import React from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { logoutUser } from '../../../actions/userAction';

const PrimaryDropDownMenu = ({ setTogglePrimaryDropDown, user }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const { wishlistItems } = useSelector((state) => state.wishlist);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
        enqueueSnackbar('Logout Successfully', { variant: 'success' });
        setTogglePrimaryDropDown(false);
    };

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

    return (
        <div className="absolute -left-24 top-9 ml-2 flex w-60 flex-col rounded-md border border-app-border bg-app-card text-sm text-slate-200 shadow-2xl shadow-black/40">
            {user.role === 'admin' && (
                <Link
                    className="flex items-center gap-3 rounded-t-md border-b border-app-border py-3.5 pl-3 hover:bg-white/5"
                    to="/admin/dashboard"
                >
                    <span className="text-primary-blue">
                        <DashboardIcon sx={{ fontSize: '18px' }} />
                    </span>
                    Admin Dashboard
                </Link>
            )}

            <Link
                className={`flex items-center gap-3 border-b border-app-border py-3.5 pl-3 hover:bg-white/5 ${
                    user.role !== 'admin' ? 'rounded-t-md' : ''
                }`}
                to="/account"
            >
                <span className="text-primary-blue">
                    <AccountCircleIcon sx={{ fontSize: '18px' }} />
                </span>
                My Profile
            </Link>

            {navs.map((item) => {
                const { title, icon, redirect } = item;

                return (
                    <React.Fragment key={title}>
                        {title === 'Wishlist' ? (
                            <Link
                                className="flex items-center gap-3 border-b border-app-border py-3.5 pl-3 hover:bg-white/5"
                                to={redirect}
                            >
                                <span className="text-primary-blue">{icon}</span>
                                {title}
                                <span className="ml-auto mr-3 rounded bg-slate-800 px-2 py-0.5 text-slate-300">
                                    {wishlistItems.length}
                                </span>
                            </Link>
                        ) : (
                            <Link
                                className="flex items-center gap-3 border-b border-app-border py-3.5 pl-3 hover:bg-white/5"
                                to={redirect}
                            >
                                <span className="text-primary-blue">{icon}</span>
                                {title}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}

            <div
                className="flex cursor-pointer items-center gap-3 rounded-b-md py-3.5 pl-3 hover:bg-white/5"
                onClick={handleLogout}
                onKeyDown={(e) => e.key === 'Enter' && handleLogout()}
                role="button"
                tabIndex={0}
            >
                <span className="text-primary-blue">
                    <PowerSettingsNewIcon sx={{ fontSize: '18px' }} />
                </span>
                Logout
            </div>

            <div className="absolute right-1/2 -top-2.5">
                <div className="arrow_down"></div>
            </div>
        </div>
    );
};

export default PrimaryDropDownMenu;
