const express = require('express');
const { chatAgent } = require('../controllers/aiAgentController');

const router = express.Router();

router.route('/ai/chat').post(chatAgent);

module.exports = router;
