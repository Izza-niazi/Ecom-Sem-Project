import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Pagination from '@mui/material/Pagination';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useSnackbar } from 'notistack';
import MetaData from '../Layouts/MetaData';
import { metaTitle } from '../../constants/brand';

const ActivityTable = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionFilter, setActionFilter] = useState('');

    const limit = 25;

    const fetchActivities = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(limit) });
            if (actionFilter === 'view' || actionFilter === 'click') {
                params.set('action', actionFilter);
            }
            const { data } = await axios.get(`/api/v1/admin/activities?${params.toString()}`, {
                withCredentials: true,
            });
            const list = data.activities || [];
            setRows(
                list.map((a) => ({
                    id: a._id,
                    userName: a.user?.name || 'Guest',
                    userEmail: a.user?.email || '—',
                    productName: a.product?.name || '(deleted)',
                    category: a.product?.category || '—',
                    action: a.action,
                    source: a.source || '—',
                    when: a.createdAt ? new Date(a.createdAt).toLocaleString() : '—',
                }))
            );
            setTotalPages(data.totalPages || 1);
        } catch (e) {
            enqueueSnackbar(e.response?.data?.message || 'Failed to load activity', { variant: 'error' });
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [page, actionFilter, enqueueSnackbar]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    useEffect(() => {
        setPage(1);
    }, [actionFilter]);

    const columns = [
        { field: 'when', headerName: 'Time', minWidth: 170, flex: 0.4 },
        { field: 'action', headerName: 'Action', minWidth: 90, flex: 0.15 },
        { field: 'userName', headerName: 'User', minWidth: 130, flex: 0.25 },
        { field: 'userEmail', headerName: 'Email', minWidth: 180, flex: 0.3 },
        { field: 'productName', headerName: 'Product', minWidth: 200, flex: 0.4 },
        { field: 'category', headerName: 'Category', minWidth: 120, flex: 0.2 },
        { field: 'source', headerName: 'Source', minWidth: 140, flex: 0.2 },
    ];

    return (
        <>
            <MetaData title={metaTitle('User activity')} />

            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <h1 className="text-lg font-medium uppercase text-slate-100">User activity</h1>
                <FormControl size="small" className="min-w-[180px]">
                    <InputLabel id="activity-action-filter" className="text-slate-400">
                        Filter action
                    </InputLabel>
                    <Select
                        labelId="activity-action-filter"
                        label="Filter action"
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="text-slate-100"
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="view">View</MenuItem>
                        <MenuItem value="click">Click</MenuItem>
                    </Select>
                </FormControl>
            </div>

            <p className="mb-3 text-sm text-slate-500">
                Product page views and clicks. Guests appear as &quot;Guest&quot; with no email.
            </p>

            <div className="w-full rounded-xl bg-app-card shadow-lg" style={{ height: 520 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    pageSize={limit}
                    rowsPerPageOptions={[limit]}
                    hideFooter
                    disableSelectionOnClick
                    sx={{
                        boxShadow: 0,
                        border: 0,
                        color: 'rgb(226 232 240)',
                        '& .MuiDataGrid-columnHeaders': { borderBottomColor: 'rgba(148,163,184,0.2)' },
                        '& .MuiDataGrid-cell': { borderColor: 'rgba(148,163,184,0.12)' },
                    }}
                />
            </div>

            {totalPages > 1 ? (
                <div className="mt-4 flex justify-center">
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, p) => setPage(p)}
                        color="primary"
                        shape="rounded"
                    />
                </div>
            ) : null}
        </>
    );
};

export default ActivityTable;
