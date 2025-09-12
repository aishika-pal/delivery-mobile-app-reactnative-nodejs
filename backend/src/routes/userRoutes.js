const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Create user
router.post('/', userController.createUser);

// Get user by ID
router.get('/:id', userController.getUser);

// Delete user by ID
router.delete('/:id', userController.deleteUser);

module.exports = router;