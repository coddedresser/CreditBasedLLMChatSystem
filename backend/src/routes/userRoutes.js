const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.get('/credits', userController.getCredits);

module.exports = router;