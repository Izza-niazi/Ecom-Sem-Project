import { useDispatch, useSelector } from 'react-redux';
import FolderIcon from '@mui/icons-material/Folder';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonIcon from '@mui/icons-material/Person';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { logoutUser } from '../../actions/userAction';

const linkAccount = (active, children, to) => (
    <Link
        to={to}
        className={`${
            active
                ? 'bg-blue-50 font-medium text-primary-blue dark:bg-slate-800/80 dark:text-sky-400'
                : 'hover:bg-blue-50 hover:text-primary-blue dark:hover:bg-slate-800/50'
        } p-3 pl-14`}
    >
        {children}
    </Link>
);

const Sidebar = ({ activeTab }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname, hash } = useLocation();
    const { enqueueSnackbar } = useSnackbar();

    const { user } = useSelector((state) => state.user);

    const accountSub =
        pathname === '/account' && hash === '#payment-methods'
            ? 'payment'
            : pathname === '/account'
            ? 'profile'
            : null;

    const handleLogout = () => {
        dispatch(logoutUser());
        enqueueSnackbar('Logout Successfully', { variant: 'success' });
        navigate('/login');
    };

    return (
        <div className="hidden w-1/4 flex-col gap-4 px-1 sm:flex">
            <div className="flex items-center gap-4 rounded-sm bg-app-card p-3 shadow">
                <div className="h-12 w-12 rounded-full">
                    <img
                        draggable={false}
                        className="h-full w-full rounded-full object-cover"
                        src={user.avatar.url}
                        alt="Avatar"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-xs">Hello,</p>
                    <h2 className="font-medium">{user.name}</h2>
                </div>
            </div>

            <div className="flex flex-col rounded-sm bg-app-card shadow">
                <div className="flex items-center gap-5 border-b px-4 py-4">
                    <span className="text-primary-blue">
                        <FolderIcon />
                    </span>
                    <Link
                        className="flex w-full justify-between font-medium text-gray-500 hover:text-primary-blue"
                        to="/orders"
                    >
                        MY ORDERS
                        <span>
                            <ChevronRightIcon />
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-5 px-4 py-4">
                    <span className="text-primary-blue">
                        <PersonIcon />
                    </span>
                    <p className="flex w-full justify-between font-medium text-gray-500">ACCOUNT SETTINGS</p>
                </div>
                <div className="flex flex-col border-b pb-3 text-sm">
                    {linkAccount(
                        activeTab === 'profile' && accountSub === 'profile',
                        'Profile Information',
                        '/account'
                    )}
                    {linkAccount(
                        activeTab === 'profile' && accountSub === 'payment',
                        'Payment methods',
                        '/account#payment-methods'
                    )}
                </div>

                <div className="flex items-center gap-5 px-4 py-4">
                    <span className="text-primary-blue">
                        <FolderSharedIcon />
                    </span>
                    <p className="flex w-full justify-between font-medium text-gray-500">MY STUFF</p>
                </div>
                <div className="flex flex-col border-b pb-3 text-sm">
                    <Link
                        to="/wishlist"
                        className={`${
                            activeTab === 'wishlist'
                                ? 'bg-blue-50 font-medium text-primary-blue'
                                : 'hover:bg-blue-50 hover:text-primary-blue'
                        } p-3 pl-14`}
                    >
                        My Wishlist
                    </Link>
                </div>

                <div className="flex items-center gap-5 border-b px-4 py-4">
                    <span className="text-primary-blue">
                        <PowerSettingsNewIcon />
                    </span>
                    <div
                        className="flex w-full cursor-pointer justify-between font-medium text-gray-500 hover:text-primary-blue"
                        onClick={handleLogout}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogout()}
                        role="button"
                        tabIndex={0}
                    >
                        Logout
                        <span>
                            <ChevronRightIcon />
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-start gap-2 rounded-sm bg-app-card p-4 shadow">
                <span className="text-xs font-medium">Frequently Visited:</span>
                <div className="flex gap-2.5 text-xs text-gray-500">
                    <Link to="/password/update">Change Password</Link>
                    <Link to="/orders">Track Order</Link>
                    <Link to="/products">Browse Store</Link>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
