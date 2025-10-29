const pool = require('../config/database');
const Organization = require('../models/Organization');
const Invitation = require('../models/Invitation');
const Notification = require('../models/Notification');
const User = require('../models/User');
const OrganizationCredits = require('../models/OrganizationCredits');

// ADD THIS FUNCTION
exports.getOrganizationCredits = async (req, res) => {
  try {
    const { orgId } = req.params;
    const userId = req.user.id;

    // Verify user is member
    const membership = await pool.query(
      'SELECT * FROM organization_members WHERE organization_id = $1 AND user_id = $2',
      [orgId, userId]
    );

    if (membership.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const credits = await OrganizationCredits.getCredits(orgId);
    
    res.json({ credits: credits ? credits.credits : 0 });
  } catch (error) {
    console.error('Get organization credits error:', error);
    res.status(500).json({ error: 'Failed to retrieve credits' });
  }
};

// ADD THIS FUNCTION
exports.addOrganizationCredits = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { amount } = req.body;
    const userId = req.user.id;

    // Verify user is admin
    const membership = await pool.query(
      'SELECT role FROM organization_members WHERE organization_id = $1 AND user_id = $2',
      [orgId, userId]
    );

    if (membership.rows.length === 0 || membership.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can add credits' });
    }

    const result = await OrganizationCredits.addCredits(orgId, amount);
    
    res.json({ 
      message: 'Credits added successfully',
      credits: result ? result.credits : 0 
    });
  } catch (error) {
    console.error('Add credits error:', error);
    res.status(500).json({ error: 'Failed to add credits' });
  }
};

// MODIFY the setActiveOrganization function to return credits
exports.setActiveOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;
    const userId = req.user.id;

    await Organization.setActiveOrganization(userId, orgId);
    const org = await Organization.findById(orgId);
    
    // Get organization credits
    const credits = await OrganizationCredits.getCredits(orgId);

    res.json({
      message: 'Active organization set successfully',
      organization: org,
      credits: credits ? credits.credits : 0
    });
  } catch (error) {
    console.error('Set active organization error:', error);
    res.status(500).json({ error: 'Failed to set active organization' });
  }
};

exports.createOrganization = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const org = await Organization.create(name, userId);
    await Organization.addMember(org.id, userId, 'admin', false);

    res.status(201).json({
      message: 'Organization created successfully',
      organization: org
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
};

exports.getUserOrganizations = async (req, res) => {
  try {
    const userId = req.user.id;
    const organizations = await Organization.findByUserId(userId);

    res.json({ organizations });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ error: 'Failed to retrieve organizations' });
  }
};

exports.getOrganizationById = async (req, res) => {
  try {
    const { orgId } = req.params;
    const userId = req.user.id;

    const org = await Organization.findById(orgId);
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const members = await Organization.getMembers(orgId);
    const invitations = await Invitation.findByOrganizationId(orgId);

    res.json({
      organization: org,
      members,
      invitations
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: 'Failed to retrieve organization' });
  }
};

exports.updateOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { name } = req.body;

    const org = await Organization.update(orgId, name);

    res.json({
      message: 'Organization updated successfully',
      organization: org
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
};


exports.inviteMember = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { email } = req.body;
    const userId = req.user.id;

    // Check if user with email exists
    const invitedUser = await User.findByEmail(email);

    const invitation = await Invitation.create(orgId, email, userId);

    // If user exists, send notification
    if (invitedUser) {
      await Notification.create(
        invitedUser.id,
        'Organization Invitation',
        `You have been invited to join an organization`,
        'invitation'
      );
    }

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation
    });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
};

exports.getOrganizationMembers = async (req, res) => {
  try {
    const { orgId } = req.params;
    const members = await Organization.getMembers(orgId);

    res.json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to retrieve members' });
  }
};
// ADD THIS NEW FUNCTION
exports.acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id;

    // Get invitation details
    const invitation = await pool.query(
      'SELECT * FROM invitations WHERE id = $1',
      [invitationId]
    );

    if (invitation.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const inv = invitation.rows[0];

    // Verify the invitation is for this user's email
    const user = await User.findById(userId);
    if (user.email !== inv.email) {
      return res.status(403).json({ error: 'This invitation is not for you' });
    }

    // Check if already a member
    const existingMember = await pool.query(
      'SELECT * FROM organization_members WHERE organization_id = $1 AND user_id = $2',
      [inv.organization_id, userId]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: 'Already a member of this organization' });
    }

    // Add user to organization
    await Organization.addMember(inv.organization_id, userId, 'member', false);

    // Update invitation status
    await pool.query(
      'UPDATE invitations SET status = $1 WHERE id = $2',
      ['accepted', invitationId]
    );

    // Get organization details
    const org = await Organization.findById(inv.organization_id);

    res.json({
      message: 'Invitation accepted successfully',
      organization: org
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
};

// ADD THIS NEW FUNCTION
exports.getMyInvitations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const result = await pool.query(
      `SELECT i.*, o.name as organization_name, u.username as invited_by_username
       FROM invitations i
       JOIN organizations o ON i.organization_id = o.id
       JOIN users u ON i.invited_by = u.id
       WHERE i.email = $1 AND i.status = 'pending'
       ORDER BY i.created_at DESC`,
      [user.email]
    );

    res.json({ invitations: result.rows });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Failed to retrieve invitations' });
  }
};

// ADD THIS NEW FUNCTION
exports.rejectInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    
    const result = await pool.query(
      'UPDATE invitations SET status = $1 WHERE id = $2 AND email = $3 RETURNING *',
      ['rejected', invitationId, user.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json({ message: 'Invitation rejected' });
  } catch (error) {
    console.error('Reject invitation error:', error);
    res.status(500).json({ error: 'Failed to reject invitation' });
  }
};

// ADD THIS NEW FUNCTION
exports.removeMember = async (req, res) => {
  try {
    const { orgId, memberId } = req.params;
    const userId = req.user.id;

    // Check if requester is admin
    const requesterMembership = await pool.query(
      'SELECT role FROM organization_members WHERE organization_id = $1 AND user_id = $2',
      [orgId, userId]
    );

    if (requesterMembership.rows.length === 0 || requesterMembership.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

    // Don't allow removing yourself if you're the only admin
    const adminCount = await pool.query(
      'SELECT COUNT(*) FROM organization_members WHERE organization_id = $1 AND role = $2',
      [orgId, 'admin']
    );

    if (parseInt(adminCount.rows[0].count) === 1 && parseInt(memberId) === userId) {
      return res.status(400).json({ error: 'Cannot remove the last admin' });
    }

    // Remove member
    await pool.query(
      'DELETE FROM organization_members WHERE organization_id = $1 AND user_id = $2',
      [orgId, memberId]
    );

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};
exports.updateMemberRole = async (req, res) => {
  try {
    const { orgId, memberId } = req.params;
    const { role } = req.body;
    const userId = req.user.id;

    // Validate role
    if (!['admin', 'moderator', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if requester is admin
    const requesterMembership = await pool.query(
      'SELECT role FROM organization_members WHERE organization_id = $1 AND user_id = $2',
      [orgId, userId]
    );

    if (requesterMembership.rows.length === 0 || requesterMembership.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update member roles' });
    }

    // Don't allow changing your own role
    if (parseInt(memberId) === userId) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    // Update role
    await pool.query(
      'UPDATE organization_members SET role = $1 WHERE organization_id = $2 AND user_id = $3',
      [role, orgId, memberId]
    );

    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
};
exports.resendInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id;

    const invitation = await pool.query(
      `SELECT i.*, om.role 
       FROM invitations i
       JOIN organization_members om ON i.organization_id = om.organization_id
       WHERE i.id = $1 AND om.user_id = $2`,
      [invitationId, userId]
    );

    if (invitation.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const inv = invitation.rows[0];

    if (inv.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can resend invitations' });
    }

    // Update invitation timestamp
    await pool.query(
      'UPDATE invitations SET created_at = CURRENT_TIMESTAMP WHERE id = $1',
      [invitationId]
    );

    // Check if user exists and send notification
    const invitedUser = await User.findByEmail(inv.email);
    if (invitedUser) {
      await Notification.create(
        invitedUser.id,
        'Organization Invitation (Reminder)',
        `You have a pending invitation to join an organization`,
        'invitation'
      );
    }

    res.json({ message: 'Invitation resent successfully' });
  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({ error: 'Failed to resend invitation' });
  }
};
exports.getSentInvitations = async (req, res) => {
  try {
    const { orgId } = req.params;
    const userId = req.user.id;

    // Check if user is member of the organization
    const membership = await pool.query(
      'SELECT role FROM organization_members WHERE organization_id = $1 AND user_id = $2',
      [orgId, userId]
    );

    if (membership.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT i.*, u.username as invited_by_username
       FROM invitations i
       JOIN users u ON i.invited_by = u.id
       WHERE i.organization_id = $1
       ORDER BY i.created_at DESC`,
      [orgId]
    );

    res.json({ invitations: result.rows });
  } catch (error) {
    console.error('Get sent invitations error:', error);
    res.status(500).json({ error: 'Failed to retrieve invitations' });
  }
};