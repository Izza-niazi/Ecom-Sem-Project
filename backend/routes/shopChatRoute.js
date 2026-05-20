const express = require('express');
const { shopChat } = require('../controllers/shopChatController');
const { optionalAuth } = require('../middlewares/auth');

const router = express.Router();

router.route('/chat').post(optionalAuth, shopChat);

module.exports = router;
