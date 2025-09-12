const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Create product (admin only)
router.post('/', productController.createProduct);

// Get product by ID
router.get('/:id', productController.getProduct);

// Delete product by ID (admin only)
router.delete('/:id', productController.deleteProduct);

module.exports = router;