const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Signup
router.post('/signup', authController.signup);

// Login
router.post('/login', authController.login);

// Forgot password (email only)
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;