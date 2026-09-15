const express = require('express');
const router = express.Router();
const { handleChatQuery } = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, handleChatQuery);

module.exports = router;
