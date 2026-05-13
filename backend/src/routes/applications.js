const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const documentController = require('../controllers/documentController');
const { auth, adminOnly, candidateOnly } = require('../middleware/auth');
const { uploadMiddleware } = require('../controllers/documentController');

// Candidate routes
router.get('/my', auth, candidateOnly, applicationController.getMyApplications);
router.post('/', auth, candidateOnly, applicationController.createApplication);
router.put('/:id', auth, candidateOnly, applicationController.updateApplication);
router.post('/:id/submit', auth, candidateOnly, applicationController.submitApplication);
router.delete('/:id', auth, candidateOnly, applicationController.deleteApplication);

// Document upload
router.post('/documents', auth, candidateOnly, uploadMiddleware.single('file'), documentController.uploadDocument);
router.delete('/documents', auth, candidateOnly, documentController.deleteDocument);

// Admin routes
router.get('/', auth, adminOnly, applicationController.getAllApplications);
router.get('/statistics', auth, adminOnly, applicationController.getStatistics);
router.put('/:id/status', auth, adminOnly, applicationController.updateApplicationStatus);
router.put('/documents/verify', auth, adminOnly, documentController.verifyDocument);

// Shared routes
router.get('/:id', auth, applicationController.getApplicationById);

module.exports = router;
