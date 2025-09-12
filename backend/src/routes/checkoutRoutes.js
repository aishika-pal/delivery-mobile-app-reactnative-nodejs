const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/session', authMiddleware, checkoutController.saveCheckoutSession);

module.exports = router;