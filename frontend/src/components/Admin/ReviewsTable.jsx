import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { clearErrors, deleteReview, getAllReviews } from '../../actions/productAction';
import Rating from '@mui/material/Rating';
import Actions from './Actions';
import { DELETE_REVIEW_RESET } from '../../constants/productConstants';
import MetaData from '../Layouts/MetaData';
import { APP_NAME } from '../../constants/brand';
import BackdropLoader from '../Layouts/BackdropLoader';

const ReviewsTable = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const [productIdFilter, setProductIdFilter] = useState('');

    const { reviews, error } = useSelector((state) => state.reviews);
    const { loading, isDeleted, error: deleteError } = useSelector((state) => state.review);

    useEffect(() => {
        const id = productIdFilter.trim();
        if (id.length === 24) {
            dispatch(getAllReviews(id));
        } else if (id.length === 0) {
            dispatch(getAllReviews());
        }
    }, [dispatch, productIdFilter]);

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: 'error' });
            dispatch(clearErrors());
        }
        if (deleteError) {
            enqueueSnackbar(deleteError, { variant: 'error' });
            dispatch(clearErrors());
        }
        if (isDeleted) {
            enqueueSnackbar('Review Deleted Successfully', { variant: 'success' });
            dispatch({ type: DELETE_REVIEW_RESET });
            const fid = productIdFilter.trim();
            dispatch(getAllReviews(fid.length === 24 ? fid : ''));
        }
    }, [dispatch, error, deleteError, isDeleted, enqueueSnackbar, productIdFilter]);

    const deleteReviewHandler = (reviewId, productId) => {
        dispatch(deleteReview(reviewId, productId));
    };

    const columns = [
        {
            field: 'id',
            headerName: 'Review ID',
            minWidth: 200,
            flex: 0.45,
        },
        {
            field: 'productName',
            headerName: 'Product',
            minWidth: 180,
            flex: 0.35,
        },
        {
            field: 'productId',
            headerName: 'Product ID',
            minWidth: 200,
            flex: 0.35,
        },
        {
            field: 'user',
            headerName: 'User',
            minWidth: 130,
            flex: 0.25,
        },
        {
            field: 'rating',
            headerName: 'Rating',
            type: 'number',
            minWidth: 140,
            flex: 0.25,
            align: 'left',
            headerAlign: 'left',
            renderCell: (params) => (
                <Rating readOnly value={params.row.rating} size="small" precision={0.5} />
            ),
        },
        {
            field: 'comment',
            headerName: 'Comment',
            minWidth: 220,
            flex: 0.5,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            minWidth: 120,
            flex: 0.2,
            sortable: false,
            renderCell: (params) => (
                <Actions
                    editRoute="review"
                    deleteHandler={() => deleteReviewHandler(params.row.id, params.row.productId)}
                    id={params.row.id}
                />
            ),
        },
    ];

    const rows = [];
    reviews?.forEach((rev) => {
        rows.push({
            id: rev._id,
            rating: rev.rating,
            comment: rev.comment,
            user: rev.name,
            productId: rev.productId,
            productName: rev.productName || '—',
        });
    });

    return (
        <>
            <MetaData title={`Admin Reviews | ${APP_NAME}`} />

            {loading && <BackdropLoader />}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-lg font-medium uppercase text-slate-100">reviews</h1>
                <div className="flex w-full max-w-md flex-col gap-1 sm:items-end">
                    <input
                        type="text"
                        placeholder="Filter by Product ID (optional, 24 chars)"
                        value={productIdFilter}
                        onChange={(e) => setProductIdFilter(e.target.value.trim())}
                        className="w-full rounded border border-app-border bg-slate-900 p-2 text-sm text-slate-100 shadow placeholder:text-slate-500"
                    />
                    <span className="text-xs text-slate-500">Leave empty to show all reviews</span>
                </div>
            </div>
            <div className="mt-4 w-full rounded-xl bg-app-card shadow-lg" style={{ height: 450 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25]}
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
        </>
    );
};

export default ReviewsTable;
