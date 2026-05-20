import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import MetaData from '../Layouts/MetaData';
import { metaTitle } from '../../constants/brand';
import { EMPTY_SEO_FIELDS } from '../../utils/seo';
import BackdropLoader from '../Layouts/BackdropLoader';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const config = { withCredentials: true };

const BlogEditor = () => {
    const { id } = useParams();
    const isNew = !id;
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [generatingSeo, setGeneratingSeo] = useState(false);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [tags, setTags] = useState('');
    const [author, setAuthor] = useState('izzmarket Team');
    const [published, setPublished] = useState(false);
    const [seo, setSeo] = useState(() => ({ ...EMPTY_SEO_FIELDS }));

    useEffect(() => {
        if (isNew) return;
        (async () => {
            try {
                const { data } = await axios.get(`/api/v1/admin/blog/${id}`, config);
                const b = data.blog;
                setTitle(b.title || '');
                setSlug(b.slug || '');
                setExcerpt(b.excerpt || '');
                setContent(b.content || '');
                setCoverImage(b.coverImage || '');
                setTags((b.tags || []).join(', '));
                setAuthor(b.author || 'izzmarket Team');
                setPublished(Boolean(b.published));
                const s = b.seo || {};
                setSeo({
                    ...EMPTY_SEO_FIELDS,
                    pageTitle: s.pageTitle || '',
                    metaDescription: s.metaDescription || '',
                    keywords: s.keywords || '',
                    ogTitle: s.ogTitle || '',
                    ogDescription: s.ogDescription || '',
                    ogImage: s.ogImage || '',
                    robots: s.robots || 'index, follow',
                    canonicalPath: s.canonicalPath || `/blog/${b.slug}`,
                });
            } catch (e) {
                enqueueSnackbar(e.response?.data?.message || 'Failed to load', {
                    variant: 'error',
                });
                navigate('/admin/blogs');
            } finally {
                setLoading(false);
            }
        })();
    }, [id, isNew, navigate, enqueueSnackbar]);

    const handleGenerateSeo = async () => {
        if (isNew) {
            enqueueSnackbar('Save the post first, or fill title and content before generating SEO', {
                variant: 'warning',
            });
            return;
        }
        setGeneratingSeo(true);
        try {
            const { data } = await axios.post(
                `/api/v1/admin/blog/${id}/seo/generate`,
                null,
                config
            );
            setSeo({ ...EMPTY_SEO_FIELDS, ...data.seo });
            enqueueSnackbar(
                `SEO generated (${data.source === 'cerebras' ? 'Cerebras' : 'Groq'})`,
                { variant: 'success' }
            );
        } catch (e) {
            enqueueSnackbar(e.response?.data?.message || 'SEO generation failed', {
                variant: 'error',
            });
        } finally {
            setGeneratingSeo(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const body = {
            title,
            slug: slug.trim() || undefined,
            excerpt,
            content,
            coverImage,
            tags,
            author,
            published,
            seo,
        };
        try {
            if (isNew) {
                await axios.post('/api/v1/admin/blog/new', body, config);
                enqueueSnackbar('Blog created', { variant: 'success' });
            } else {
                await axios.put(`/api/v1/admin/blog/${id}`, body, config);
                enqueueSnackbar('Blog updated', { variant: 'success' });
            }
            navigate('/admin/blogs');
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || 'Save failed', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <BackdropLoader />;
    }

    return (
        <>
            <MetaData title={metaTitle(isNew ? 'New blog post' : 'Edit blog post')} />
            <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-4">
                <h1 className="text-lg font-semibold text-slate-100">
                    {isNew ? 'New blog post' : 'Edit blog post'}
                </h1>

                <TextField label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} size="small" />
                <TextField
                    label="URL slug (optional)"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    helperText="Leave blank to auto-generate from title"
                    size="small"
                />
                <TextField
                    label="Excerpt"
                    multiline
                    minRows={2}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    size="small"
                />
                <TextField
                    label="Content (HTML allowed)"
                    multiline
                    minRows={10}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    size="small"
                />
                <TextField
                    label="Cover image URL"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    size="small"
                />
                <TextField label="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} size="small" />
                <TextField label="Author" value={author} onChange={(e) => setAuthor(e.target.value)} size="small" />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={published}
                            onChange={(e) => setPublished(e.target.checked)}
                        />
                    }
                    label="Published"
                />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-medium text-slate-300">SEO</h2>
                    <Button
                        type="button"
                        size="small"
                        variant="outlined"
                        startIcon={<AutoFixHighIcon />}
                        disabled={generatingSeo || isNew}
                        onClick={handleGenerateSeo}
                    >
                        {generatingSeo ? 'Generating…' : 'AI generate SEO'}
                    </Button>
                </div>
                <TextField
                    label="SEO title"
                    size="small"
                    value={seo.pageTitle}
                    onChange={(e) => setSeo({ ...seo, pageTitle: e.target.value })}
                />
                <TextField
                    label="Meta description"
                    size="small"
                    multiline
                    minRows={2}
                    value={seo.metaDescription}
                    onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                />
                <TextField
                    label="Keywords"
                    size="small"
                    value={seo.keywords}
                    onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                />
                <TextField
                    label="Canonical path"
                    size="small"
                    value={seo.canonicalPath}
                    onChange={(e) => setSeo({ ...seo, canonicalPath: e.target.value })}
                    placeholder="/blog/your-slug"
                />
                <TextField
                    label="OG image URL"
                    size="small"
                    value={seo.ogImage}
                    onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                />

                <Button type="submit" variant="contained" disabled={saving}>
                    {saving ? 'Saving…' : 'Save post'}
                </Button>
            </form>
        </>
    );
};

export default BlogEditor;
