import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearErrors, loginUser } from '../../actions/userAction';
import { useSnackbar } from 'notistack';
import BackdropLoader from '../Layouts/BackdropLoader';
import MetaData from '../Layouts/MetaData';
import { APP_NAME, metaTitle } from '../../constants/brand';

const Login = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const location = useLocation();

    const { loading, isAuthenticated, error } = useSelector((state) => state.user);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        dispatch(loginUser(email, password));
    }

    const redirect = location.search ? location.search.split("=")[1] : "account";

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        if (isAuthenticated) {
            navigate(`/${redirect}`)
        }
    }, [dispatch, error, isAuthenticated, redirect, navigate, enqueueSnackbar]);

    return (
        <>
            <MetaData title={metaTitle('Login')} />

            {loading && <BackdropLoader />}
            <main className="w-full mt-12 sm:pt-20 sm:mt-0">

                {/* <!-- row --> */}
                <div className="flex sm:w-4/6 sm:mt-4 m-auto mb-7 bg-app-card shadow-lg">
                    {/* <!-- sidebar column  --> */}
                    <div className="loginSidebar hidden w-2/5 flex-col gap-4 p-10 pr-12 sm:flex">
                        <h1 className="text-3xl font-semibold text-white">Login</h1>
                        <p className="text-lg text-slate-400">Access your orders, wishlist and recommendations on {APP_NAME}.</p>
                    </div>
                    {/* <!-- sidebar column  --> */}

                    {/* <!-- login column --> */}
                    <div className="flex-1 overflow-hidden">

                        {/* <!-- edit info container --> */}
                        <div className="text-center py-10 px-4 sm:px-14">

                            {/* <!-- input container --> */}
                            <form onSubmit={handleLogin}>
                                <div className="flex flex-col w-full gap-4">

                                    <TextField
                                        fullWidth
                                        id="email"
                                        label="Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        id="password"
                                        label="Password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    {/* <span className="text-xxs text-red-500 font-medium text-left mt-0.5">Please enter valid Email ID/Mobile number</span> */}

                                    {/* <!-- button container --> */}
                                    <div className="flex flex-col gap-2.5 mt-2 mb-32">
                                        <p className="text-left text-xs text-primary-grey">By continuing, you agree to {APP_NAME}&apos;s <a href="/terms" className="text-sky-400 hover:underline">Terms of Use</a> and <a href="/privacy" className="text-sky-400 hover:underline">Privacy Policy</a>.</p>
                                        <button type="submit" className="w-full rounded-md bg-gradient-to-r from-orange-500 to-rose-500 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:from-orange-400 hover:to-rose-400">Login</button>
                                    </div>
                                    {/* <!-- button container --> */}

                                </div>
                            </form>
                            {/* <!-- input container --> */}

                            <Link to="/register" className="text-sm font-medium text-sky-400 hover:text-sky-300">New to {APP_NAME}? Create an account</Link>
                        </div>
                        {/* <!-- edit info container --> */}

                    </div>
                    {/* <!-- login column --> */}
                </div>
                {/* <!-- row --> */}

            </main>
        </>
    );
};

export default Login;
