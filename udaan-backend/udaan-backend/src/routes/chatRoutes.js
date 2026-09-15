const express = require('express');
const router = express.Router();
const { handleChatQuery } = require('../controllers/chatController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/', requireAuth, handleChatQuery);

module.exports = router;
