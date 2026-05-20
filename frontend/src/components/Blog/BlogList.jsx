import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MetaData from '../Layouts/MetaData';
import Loader from '../Layouts/Loader';
import { metaTitle, BLOG_META_TITLE, BLOG_META_DESCRIPTION, APP_NAME } from '../../constants/brand';
import { absoluteUrl, mergePageMeta } from '../../utils/seo';
import { usePageSeo } from '../../hooks/usePageSeo';

const BlogList = () => {
    const { seo: savedSeo } = usePageSeo('blog');
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { data } = await axios.get('/api/v1/blogs?limit=24');
                if (!cancelled) {
                    setBlogs(data.blogs || []);
                }
            } catch (e) {
                if (!cancelled) {
                    setError(e.response?.data?.message || 'Could not load blog posts');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const meta = mergePageMeta(savedSeo, {
        title: BLOG_META_TITLE,
        description: BLOG_META_DESCRIPTION,
        keywords: `blog, shopping tips, ${APP_NAME}, pakistan ecommerce`,
        canonicalPath: '/blog',
        ogTitle: BLOG_META_TITLE,
        ogDescription: BLOG_META_DESCRIPTION,
    });

    return (
        <>
            <MetaData
                title={meta.title}
                description={meta.description}
                keywords={meta.keywords}
                canonical={meta.canonical}
                ogTitle={meta.ogTitle}
                ogDescription={meta.ogDescription}
                ogImage={meta.ogImage}
                robots={meta.robots}
            />
            <main className="mx-auto mt-20 max-w-5xl px-4 pb-16 pt-6 sm:px-6">
                <header className="mb-10 border-b border-app-border pb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300/90">
                        {APP_NAME} Blog
                    </p>
                    <h1 className="mt-2 font-serif text-3xl font-semibold text-slate-100 sm:text-4xl">
                        Guides &amp; shopping tips
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
                        Articles on smart shopping, delivery, and product picks — written to help you
                        shop with confidence.
                    </p>
                </header>

                {loading && <Loader />}
                {error && <p className="text-sm text-red-400">{error}</p>}

                {!loading && !error && blogs.length === 0 && (
                    <p className="text-slate-400">No posts yet. Check back soon.</p>
                )}

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {blogs.map((post) => (
                        <article
                            key={post._id}
                            className="blog-card"
                        >
                            <Link to={`/blog/${post.slug}`} className="block aspect-[16/10] overflow-hidden bg-neutral-950">
                                {post.coverImage ? (
                                    <img
                                        src={post.coverImage}
                                        alt=""
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-slate-600">
                                        No image
                                    </div>
                                )}
                            </Link>
                            <div className="flex flex-1 flex-col p-4">
                                {post.tags?.[0] && (
                                    <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-300/80">
                                        {post.tags[0]}
                                    </span>
                                )}
                                <h2 className="mt-1 font-serif text-lg font-medium leading-snug text-slate-100 group-hover:text-neutral-200">
                                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                                </h2>
                                <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-slate-400">
                                    {post.excerpt}
                                </p>
                                <Link
                                    to={`/blog/${post.slug}`}
                                    className="mt-3 text-xs font-medium text-neutral-300 hover:text-neutral-200"
                                >
                                    Read more →
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </main>
        </>
    );
};

export default BlogList;
