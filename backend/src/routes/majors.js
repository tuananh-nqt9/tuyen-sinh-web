const express = require('express');
const router = express.Router();
const majorController = require('../controllers/majorController');
const { auth, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', majorController.getAllMajors);
router.get('/groups', majorController.getMajorGroups);
router.get('/school/:schoolId', majorController.getMajorsBySchool);
router.get('/:id', majorController.getMajorById);

// Admin routes
router.post('/', auth, adminOnly, majorController.createMajor);
router.put('/:id', auth, adminOnly, majorController.updateMajor);
router.delete('/:id', auth, adminOnly, majorController.deleteMajor);

module.exports = router;
