const express = require('express');
const router = express.Router();
const authController = require('../controller/AuthController');
const { verifyAccessToken } = require('../MiddlewareS/JWT');

// Registration and authentication routes
router.post('/signup', authController.register);
router.post('/signin', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', verifyAccessToken, authController.getUserProfile);

module.exports = router;