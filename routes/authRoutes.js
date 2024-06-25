const express = require('express');
const router = express.Router();
const { registerUser, authUser, newUser, loginForm, logout } = require('../controllers/authController');

router.get('/register', newUser)
router.post('/register', registerUser);
router.get('/login',loginForm);
router.post('/login', authUser);
router.post('/logout',logout);
module.exports = router;