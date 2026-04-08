const express = require('express');
const { parseNaturalLanguage } = require('../controllers/searchNlController');

const router = express.Router();

router.route('/search/nl').post(parseNaturalLanguage);

module.exports = router;
