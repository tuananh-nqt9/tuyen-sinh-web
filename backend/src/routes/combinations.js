const express = require('express');
const router = express.Router();
const combinationController = require('../controllers/combinationController');
const { auth, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', combinationController.getAllCombinations);
router.get('/major/:majorId', combinationController.getCombinationsByMajor);
router.get('/:id', combinationController.getCombinationById);

// Admin routes
router.post('/', auth, adminOnly, combinationController.createCombination);
router.put('/:id', auth, adminOnly, combinationController.updateCombination);
router.delete('/:id', auth, adminOnly, combinationController.deleteCombination);

module.exports = router;
