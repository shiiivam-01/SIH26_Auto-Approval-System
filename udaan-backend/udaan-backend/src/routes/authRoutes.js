const express = require('express');
const router = express.Router();
const { register, login, googleOAuthLogin } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleOAuthLogin);

module.exports = router;

