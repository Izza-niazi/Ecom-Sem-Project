const express = require('express');
const {
    getPublishedBlogs,
    getBlogBySlug,
    getAdminBlogs,
    getAdminBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    seedDummyBlogs,
    generateBlogSeo,
} = require('../controllers/blogController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.get('/blogs', getPublishedBlogs);
router.get('/blog/:slug', getBlogBySlug);

router.get('/admin/blogs', isAuthenticatedUser, authorizeRoles('admin'), getAdminBlogs);
router.post('/admin/blogs/seed', isAuthenticatedUser, authorizeRoles('admin'), seedDummyBlogs);
router.get('/admin/blog/:id', isAuthenticatedUser, authorizeRoles('admin'), getAdminBlog);
router.post('/admin/blog/new', isAuthenticatedUser, authorizeRoles('admin'), createBlog);
router.put('/admin/blog/:id', isAuthenticatedUser, authorizeRoles('admin'), updateBlog);
router.post('/admin/blog/:id/seo/generate', isAuthenticatedUser, authorizeRoles('admin'), generateBlogSeo);
router.delete('/admin/blog/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteBlog);

module.exports = router;
