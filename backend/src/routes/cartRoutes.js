const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Get current user's cart
router.get('/', cartController.getCart);

// Add product to cart
router.post('/add', cartController.addProduct);

// Change quantity of a product in cart
router.put('/quantity', cartController.changeProductQuantity);

// Remove product from cart
router.delete('/remove', cartController.removeProduct);

// Clear entire cart
router.delete('/clear', cartController.clearCart);

module.exports = router;