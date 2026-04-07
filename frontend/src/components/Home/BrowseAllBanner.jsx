import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import { APP_NAME } from '../../constants/brand';

const BrowseAllBanner = () => {
    return (
        <div className="mx-auto mt-14 max-w-7xl px-2 sm:mt-6 sm:px-4 md:mt-8">
            <section
                className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-slate-950 shadow-xl shadow-sky-500/10"
                aria-labelledby="browse-all-heading"
            >
                <div
                    className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sky-500/25 blur-3xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                    aria-hidden
                />

                <div className="relative flex flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-10">
                    <div className="flex max-w-xl flex-col gap-3">
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">
                            <GridViewRoundedIcon sx={{ fontSize: 16 }} className="!text-sky-400" />
                            Full catalog
                        </span>
                        <h2
                            id="browse-all-heading"
                            className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl"
                        >
                            Browse every product on {APP_NAME}
                        </h2>
                        <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
                            Filters for price, category, and ratings — find what you need in one place.
                        </p>
                    </div>

                    <Link
                        to="/products"
                        className="group inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:from-sky-400 hover:to-cyan-400 hover:shadow-sky-500/35 sm:self-center"
                    >
                        Browse all products
                        <ArrowForwardIcon
                            sx={{ fontSize: 20 }}
                            className="transition group-hover:translate-x-0.5"
                        />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default BrowseAllBanner;
