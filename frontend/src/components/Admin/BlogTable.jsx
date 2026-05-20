import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import MetaData from '../Layouts/MetaData';
import { metaTitle } from '../../constants/brand';
import BackdropLoader from '../Layouts/BackdropLoader';
import Actions from './Actions';

const BlogTable = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/v1/admin/blogs', {
                withCredentials: true,
            });
            setBlogs(data.blogs || []);
        } catch (e) {
            enqueueSnackbar(e.response?.data?.message || 'Failed to load blogs', {
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const seedDummy = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post('/api/v1/admin/blogs/seed', null, {
                withCredentials: true,
            });
            enqueueSnackbar(data.message || 'Dummy posts added', { variant: 'success' });
            await load();
        } catch (e) {
            enqueueSnackbar(e.response?.data?.message || 'Seed failed', { variant: 'error' });
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const deleteHandler = async (id) => {
        try {
            await axios.delete(`/api/v1/admin/blog/${id}`, { withCredentials: true });
            enqueueSnackbar('Blog deleted', { variant: 'success' });
            await load();
        } catch (e) {
            enqueueSnackbar(e.response?.data?.message || 'Delete failed', { variant: 'error' });
            throw e;
        }
    };

    const rows = blogs.map((b) => ({
        id: b._id,
        title: b.title,
        slug: b.slug,
        published: b.published ? 'Published' : 'Draft',
        updated: b.updatedAt
            ? new Date(b.updatedAt).toLocaleDateString('en-PK')
            : '',
    }));

    const columns = [
        { field: 'title', headerName: 'Title', flex: 1, minWidth: 200 },
        { field: 'slug', headerName: 'Slug', flex: 0.8, minWidth: 160 },
        { field: 'published', headerName: 'Status', width: 110 },
        { field: 'updated', headerName: 'Updated', width: 110 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Actions
                    editRoute="blog"
                    deleteHandler={deleteHandler}
                    id={params.id}
                    name={params.row.title}
                />
            ),
        },
    ];

    return (
        <>
            <MetaData title={metaTitle('Manage Blogs')} />
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h1 className="text-lg font-semibold text-slate-100">Blog posts</h1>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={seedDummy}
                            className="rounded border border-neutral-600/50 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-slate-800"
                        >
                            Add dummy posts
                        </button>
                        <Link
                            to="/admin/blog/new"
                            className="rounded bg-primary-orange px-4 py-2 text-sm font-medium text-white shadow hover:shadow-md"
                        >
                            New post
                        </Link>
                    </div>
                </div>
                {loading ? (
                    <BackdropLoader />
                ) : (
                    <div className="h-[min(70vh,520px)] w-full">
                        <DataGrid rows={rows} columns={columns} pageSize={10} disableRowSelectionOnClick />
                    </div>
                )}
            </div>
        </>
    );
};

export default BlogTable;
