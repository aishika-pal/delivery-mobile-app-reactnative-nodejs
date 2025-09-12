const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// Create store (admin only)
router.post('/', storeController.createStore);

// Get store by ID
router.get('/:id', storeController.getStore);

// Delete store by ID (admin only)
router.delete('/:id', storeController.deleteStore);

module.exports = router;