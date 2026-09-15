const express = require('express');
const router = express.Router();
const { handleChatQuery } = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, handleChatQuery);

module.exports = router;
