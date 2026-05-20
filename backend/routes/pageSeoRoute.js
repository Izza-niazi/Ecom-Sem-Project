const express = require('express');
const {
    listPublicPages,
    getPublicPageSeo,
    getAdminSeoOverview,
    getAdminPageSeo,
    getAdminProductSeo,
    savePageSeo,
    saveProductSeo,
    generateSeo,
} = require('../controllers/pageSeoController');
const {
    trackPageView,
    getSeoAnalytics,
    generateSeoInsights,
} = require('../controllers/seoAnalyticsController');
const { optionalAuth, isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.get('/seo/pages', listPublicPages);
router.get('/seo/page/:pageKey', getPublicPageSeo);
router.post('/analytics/pageview', optionalAuth, trackPageView);

router.get('/admin/seo', isAuthenticatedUser, authorizeRoles('admin'), getAdminSeoOverview);
router.get('/admin/seo/page/:pageKey', isAuthenticatedUser, authorizeRoles('admin'), getAdminPageSeo);
router.get(
    '/admin/seo/product/:productId',
    isAuthenticatedUser,
    authorizeRoles('admin'),
    getAdminProductSeo
);
router.put('/admin/seo/page/:pageKey', isAuthenticatedUser, authorizeRoles('admin'), savePageSeo);
router.put(
    '/admin/seo/product/:productId',
    isAuthenticatedUser,
    authorizeRoles('admin'),
    saveProductSeo
);
router.post('/admin/seo/generate', isAuthenticatedUser, authorizeRoles('admin'), generateSeo);
router.get('/admin/seo/analytics', isAuthenticatedUser, authorizeRoles('admin'), getSeoAnalytics);
router.post('/admin/seo/insights', isAuthenticatedUser, authorizeRoles('admin'), generateSeoInsights);

module.exports = router;
