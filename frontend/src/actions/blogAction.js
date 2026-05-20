import axios from 'axios';

const config = { headers: { 'Content-Type': 'application/json' }, withCredentials: true };

export const getAdminBlogs = () => async () => {
    const { data } = await axios.get('/api/v1/admin/blogs', config);
    return data.blogs;
};

export const deleteBlog = (id) => async () => {
    await axios.delete(`/api/v1/admin/blog/${id}`, config);
};
