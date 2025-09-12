const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, addressController.saveAddress);
router.get('/', authMiddleware, addressController.getAddress);

module.exports = router;