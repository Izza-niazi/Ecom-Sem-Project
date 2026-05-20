import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import MetaData from '../Layouts/MetaData';
import Loader from '../Layouts/Loader';
import { metaTitle, APP_NAME } from '../../constants/brand';
import {
    absoluteUrl,
    buildBlogJsonLd,
    plainTextFromHtml,
    excerpt,
} from '../../utils/seo';

const BlogPost = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { data } = await axios.get(`/api/v1/blog/${slug}`);
                if (!cancelled) setPost(data.blog);
            } catch (e) {
                if (!cancelled) {
                    setError(e.response?.data?.message || 'Post not found');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [slug]);

    if (loading) {
        return (
            <>
                <MetaData title={metaTitle('Blog')} />
                <Loader />
            </>
        );
    }

    if (error || !post) {
        return (
            <main className="mx-auto mt-24 max-w-2xl px-4 text-center">
                <MetaData title={metaTitle('Post not found')} robots="noindex, nofollow" />
                <p className="text-slate-400">{error || 'Post not found'}</p>
                <Link to="/blog" className="mt-4 inline-block text-neutral-300 hover:underline">
                    ← Back to blog
                </Link>
            </main>
        );
    }

    const seo = post.seo || {};
    const title = seo.pageTitle || post.title;
    const description =
        seo.metaDescription ||
        post.excerpt ||
        excerpt(plainTextFromHtml(post.content), 160);
    const canonical = absoluteUrl(seo.canonicalPath || `/blog/${post.slug}`);
    const ogImage = seo.ogImage || post.coverImage || '';
    const jsonLd = buildBlogJsonLd(post, { description, canonical });

    const dateStr = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('en-PK', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : '';

    return (
        <>
            <MetaData
                title={metaTitle(title)}
                description={description}
                keywords={seo.keywords}
                canonical={canonical}
                ogTitle={seo.ogTitle || title}
                ogDescription={seo.ogDescription || description}
                ogImage={ogImage ? absoluteUrl(ogImage) : ''}
                ogUrl={canonical}
                ogType="article"
                robots={seo.robots}
                jsonLd={jsonLd}
            />
            <article className="mx-auto mt-20 max-w-3xl px-4 pb-16 pt-6 sm:px-6">
                <Link
                    to="/blog"
                    className="text-xs font-medium text-neutral-300 hover:text-neutral-200"
                >
                    ← {APP_NAME} Blog
                </Link>
                <header className="mt-4 border-b border-app-border pb-6">
                    {post.tags?.length > 0 && (
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-300/80">
                            {post.tags.join(' · ')}
                        </p>
                    )}
                    <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-slate-100 sm:text-4xl">
                        {post.title}
                    </h1>
                    <p className="mt-3 text-sm text-slate-500">
                        {post.author}
                        {dateStr ? ` · ${dateStr}` : ''}
                    </p>
                </header>
                {post.coverImage && (
                    <img
                        src={post.coverImage}
                        alt=""
                        className="mt-8 w-full rounded-2xl border border-white/[0.08] object-cover shadow-2xl shadow-black/40 ring-1 ring-white/[0.06]"
                    />
                )}
                <div
                    className="blog-content prose prose-invert prose-sm mt-8 max-w-none prose-headings:font-serif prose-a:text-neutral-300"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </article>
        </>
    );
};

export default BlogPost;
