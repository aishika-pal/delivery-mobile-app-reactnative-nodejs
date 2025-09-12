const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Place order
router.post('/', orderController.placeOrder);

// Get order by ID
router.get('/:id', orderController.getOrder);

// Delete order by ID (customer or admin)
router.delete('/:id', orderController.deleteOrder);

module.exports = router;