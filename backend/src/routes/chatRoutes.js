const express = require('express');
const { body } = require('express-validator');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const creditCheck = require('../middleware/creditCheck');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(authMiddleware);
// Add this route
router.get('/credits', chatController.getOrganizationCredits);
router.post(
  '/',
  [
    body('title').optional().trim().isLength({ min: 1, max: 255 }),
    validateRequest
  ],
  chatController.createChat
);

router.get('/', chatController.getUserChats);
router.get('/:chatId', chatController.getChatById);

router.post(
  '/:chatId/messages',
  [
    body('content').trim().notEmpty().withMessage('Message content is required'),
    validateRequest
  ],
  creditCheck,
  chatController.sendMessage
);

router.put(
  '/:chatId',
  [
    body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required'),
    validateRequest
  ],
  chatController.updateChat
);

router.delete('/:chatId', chatController.deleteChat);

module.exports = router;