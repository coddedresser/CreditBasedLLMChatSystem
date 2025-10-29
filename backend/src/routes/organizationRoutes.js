const express = require('express');
const { body } = require('express-validator');
const organizationController = require('../controllers/organizationController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/',
  [
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Organization name is required'),
    validateRequest
  ],
  organizationController.createOrganization
);

router.get('/', organizationController.getUserOrganizations);
router.get('/:orgId', organizationController.getOrganizationById);

router.put(
  '/:orgId',
  [
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Organization name is required'),
    validateRequest
  ],
  organizationController.updateOrganization
);

router.post('/:orgId/activate', organizationController.setActiveOrganization);

router.post(
  '/:orgId/invite',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    validateRequest
  ],
  organizationController.inviteMember
);

router.get('/:orgId/members', organizationController.getOrganizationMembers);

// NEW ROUTES - ADD THESE
router.put('/:orgId/members/:memberId/role', 
  [
    body('role').isIn(['admin', 'moderator', 'member']).withMessage('Invalid role'),
    validateRequest
  ],
  organizationController.updateMemberRole
);
// Add these routes
router.get('/:orgId/credits', organizationController.getOrganizationCredits);
router.post('/:orgId/credits/add', 
  [
    body('amount').isInt({ min: 1 }).withMessage('Amount must be positive'),
    validateRequest
  ],
  organizationController.addOrganizationCredits
);
router.get('/:orgId/invitations', organizationController.getSentInvitations);
router.get('/invitations/my-invitations', organizationController.getMyInvitations);
router.post('/invitations/:invitationId/accept', organizationController.acceptInvitation);
router.post('/invitations/:invitationId/reject', organizationController.rejectInvitation);
router.delete('/:orgId/members/:memberId', organizationController.removeMember);
router.post('/invitations/:invitationId/resend', organizationController.resendInvitation);
module.exports = router;