const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createProfile, getMyProfile, updateProfile } = require('../controllers/applicantController');

router.post('/profile', authenticate, createProfile);
router.get('/profile/me', authenticate, getMyProfile);
router.put('/profile', authenticate, updateProfile);
router.patch('/profile', authenticate, updateProfile);

module.exports = router;

