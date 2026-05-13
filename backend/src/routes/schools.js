const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const { auth, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', schoolController.getAllSchools);
router.get('/active-rounds', schoolController.getActiveAdmissionRounds);
router.get('/:id', schoolController.getSchoolById);

// Admin routes
router.post('/', auth, adminOnly, schoolController.createSchool);
router.put('/:id', auth, adminOnly, schoolController.updateSchool);
router.delete('/:id', auth, adminOnly, schoolController.deleteSchool);

module.exports = router;
