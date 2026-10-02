const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  submitApplication,
  getApplicationsForApplicant,
  decideApplication,
  getDepartmentQueue
} = require('../controllers/applicationController');

router.post('/submit', authenticate, submitApplication);
router.get('/queue', authenticate, authorize('officer', 'admin'), getDepartmentQueue);
router.get('/:applicantId', authenticate, getApplicationsForApplicant);
router.patch('/:applicationId/decide', authenticate, authorize('officer', 'admin'), decideApplication);

module.exports = router;
