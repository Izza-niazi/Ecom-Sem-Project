import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Searchbar from './Searchbar';
import PrimaryDropDownMenu from './PrimaryDropDownMenu';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Header = () => {

  const { isAuthenticated, user } = useSelector((state) => state.user);

  const { cartItems } = useSelector(state => state.cart);

  const [togglePrimaryDropDown, setTogglePrimaryDropDown] = useState(false);

  return (

    <header className="fixed top-0 z-10 w-full border-b border-app-border/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 py-2.5 shadow-lg shadow-black/20 backdrop-blur-md">

      {/* <!-- navbar container --> */}
      <div className="w-full sm:w-9/12 px-1 sm:px-4 m-auto flex justify-between items-center relative">

        {/* <!-- logo & search container --> */}
        <div className="flex items-center flex-1 gap-2 sm:gap-4">
          <Searchbar />
        </div>
        {/* <!-- logo & search container --> */}

        {/* <!-- right navs --> */}
        <div className="flex items-center justify-between ml-1 sm:ml-0 gap-0.5 sm:gap-7 relative">

          {isAuthenticated === false ?
            <Link to="/login" className="rounded-md border border-sky-400/40 bg-app-card px-3 py-0.5 font-medium text-sky-300 shadow-sm transition hover:border-sky-400/70 hover:bg-slate-800 sm:px-9">Login</Link>
            :
            (
              <span className="userDropDown flex cursor-pointer items-center gap-1 font-medium text-slate-100" onClick={() => setTogglePrimaryDropDown(!togglePrimaryDropDown)}>{user.name && user.name.split(" ", 1)}
                <span>{togglePrimaryDropDown ? <ExpandLessIcon sx={{ fontSize: "16px" }} /> : <ExpandMoreIcon sx={{ fontSize: "16px" }} />}</span>
              </span>
            )
          }

          {togglePrimaryDropDown && <PrimaryDropDownMenu setTogglePrimaryDropDown={setTogglePrimaryDropDown} user={user} />}

          <Link to="/cart" className="relative flex items-center gap-2 font-medium text-slate-100">
            <span><ShoppingCartIcon /></span>
            {cartItems.length > 0 &&
              <div className="absolute -top-2 left-3 flex h-5 w-5 items-center justify-center rounded-full border border-slate-900 bg-gradient-to-br from-orange-500 to-rose-600 p-2 text-xs text-white">
                {cartItems.length}
              </div>
            }
            Cart
          </Link>
        </div>
        {/* <!-- right navs --> */}

      </div>
      {/* <!-- navbar container --> */}
    </header>
  )
};

export default Header;
