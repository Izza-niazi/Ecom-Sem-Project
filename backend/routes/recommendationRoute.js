const express = require('express');
const {
    getHomeRecommendations,
    getAlsoBought,
    trackActivity,
    getAdminActivities,
} = require('../controllers/recommendationController');
const { optionalAuth, isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.route('/admin/activities').get(isAuthenticatedUser, authorizeRoles('admin'), getAdminActivities);
router.route('/recommendations/home').get(optionalAuth, getHomeRecommendations);
router.route('/recommendations/also-bought/:productId').get(getAlsoBought);
router.route('/activity').post(optionalAuth, trackActivity);

module.exports = router;
