import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';

const BlogHomeBanner = () => {
    return (
        <div className="mx-auto max-w-7xl px-2 sm:px-4">
            <section
                className="fun-noise relative overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-black via-neutral-950 to-black shadow-xl shadow-black/40"
                aria-labelledby="blog-home-heading"
            >
                <div
                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5 blur-3xl"
                    aria-hidden
                />
                <div className="relative flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-7">
                    <div className="flex max-w-lg flex-col gap-2">
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-neutral-950/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-300">
                            <MenuBookRoundedIcon sx={{ fontSize: 16 }} className="!text-neutral-400" />
                            Blog
                        </span>
                        <h2
                            id="blog-home-heading"
                            className="text-xl font-semibold tracking-tight text-white sm:text-2xl"
                        >
                            Shopping guides & tips
                        </h2>
                        <p className="text-sm leading-relaxed text-neutral-400">
                            Read buying advice, deals, and how-tos from the izzmarket team.
                        </p>
                    </div>
                    <Link
                        to="/blog"
                        className="btn-secondary group shrink-0 self-start sm:self-center"
                    >
                        Read the blog
                        <ArrowForwardIcon
                            sx={{ fontSize: 18 }}
                            className="transition group-hover:translate-x-0.5"
                        />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default BlogHomeBanner;
