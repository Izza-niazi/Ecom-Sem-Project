import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import Searchbar from './Searchbar';
import PrimaryDropDownMenu from './PrimaryDropDownMenu';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Header = () => {
    const { isAuthenticated, user } = useSelector((state) => state.user);
    const { cartItems } = useSelector((state) => state.cart);
    const [togglePrimaryDropDown, setTogglePrimaryDropDown] = useState(false);
    const userMenuRef = useRef(null);
    const userMenuButtonRef = useRef(null);

    useEffect(() => {
        if (!togglePrimaryDropDown) return undefined;
        const onPointerDown = (e) => {
            const inTrigger = userMenuRef.current?.contains(e.target);
            const inMenu = e.target.closest?.('.user-dropdown-menu');
            if (!inTrigger && !inMenu) {
                setTogglePrimaryDropDown(false);
            }
        };
        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [togglePrimaryDropDown]);

    return (
        <header className="glass-header fixed top-0 z-[100] h-14 w-full">
            <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
                    <Searchbar />
                </div>

                <nav className="flex shrink-0 items-center gap-1 overflow-visible sm:gap-2">
                    <Link to="/blog" className="nav-pill hidden sm:inline-flex">
                        Blog
                    </Link>
                    <Link to="/products" className="nav-pill hidden md:inline-flex">
                        Shop
                    </Link>

                    {isAuthenticated === false ? (
                        <Link to="/login" className="btn-secondary !px-4 !py-1.5 text-xs sm:text-sm">
                            Login
                        </Link>
                    ) : (
                        <div ref={userMenuRef} className="relative">
                            <button
                                ref={userMenuButtonRef}
                                type="button"
                                aria-expanded={togglePrimaryDropDown}
                                aria-haspopup="menu"
                                className={`nav-pill flex items-center gap-1 font-medium text-slate-100 focus:outline-none ${
                                    togglePrimaryDropDown
                                        ? 'border border-white/25 bg-white/10 text-white'
                                        : ''
                                }`}
                                onClick={() => setTogglePrimaryDropDown((open) => !open)}
                            >
                                {user.name && user.name.split(' ', 1)}
                                {togglePrimaryDropDown ? (
                                    <ExpandLessIcon sx={{ fontSize: 16 }} />
                                ) : (
                                    <ExpandMoreIcon sx={{ fontSize: 16 }} />
                                )}
                            </button>

                            {togglePrimaryDropDown && (
                                <PrimaryDropDownMenu
                                    setTogglePrimaryDropDown={setTogglePrimaryDropDown}
                                    user={user}
                                    anchorRef={userMenuButtonRef}
                                />
                            )}
                        </div>
                    )}

                    <Link
                        to="/cart"
                        className="relative flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/10 hover:text-neutral-200"
                    >
                        <ShoppingCartOutlinedIcon sx={{ fontSize: 20 }} />
                        <span className="hidden sm:inline">Cart</span>
                        {cartItems.length > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-orange-500/40">
                                {cartItems.length}
                            </span>
                        )}
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
