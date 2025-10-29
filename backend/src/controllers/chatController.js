const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Organization = require('../models/Organization');
const OrganizationCredits = require('../models/OrganizationCredits');
const { sendChatMessage } = require('../services/llmService');
const pool = require('../config/database');

exports.createChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    // Get active organization
    const activeOrg = await Organization.getActiveOrganization(userId);
    if (!activeOrg) {
      return res.status(400).json({ error: 'No active organization' });
    }

    const chat = await Chat.create(userId, activeOrg.id, title || 'New Chat');

    res.status(201).json({
      message: 'Chat created successfully',
      chat
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get active organization
    const activeOrg = await Organization.getActiveOrganization(userId);
    if (!activeOrg) {
      return res.json({ chats: [] });
    }

    // Get chats for the active organization only
    const result = await pool.query(
      `SELECT c.*, COUNT(m.id) as message_count
       FROM chats c
       LEFT JOIN messages m ON c.id = m.chat_id
       WHERE c.user_id = $1 AND c.organization_id = $2
       GROUP BY c.id
       ORDER BY c.updated_at DESC`,
      [userId, activeOrg.id]
    );

    res.json({ chats: result.rows });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'Failed to retrieve chats' });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Verify user has access to this chat's organization
    const membership = await pool.query(
      'SELECT * FROM organization_members WHERE organization_id = $1 AND user_id = $2',
      [chat.organization_id, userId]
    );

    if (membership.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await Message.findByChatId(chatId);

    res.json({ chat, messages });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Verify chat ownership and get organization
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Verify user has access to this chat's organization
    const membership = await pool.query(
      'SELECT * FROM organization_members WHERE organization_id = $1 AND user_id = $2',
      [chat.organization_id, userId]
    );

    if (membership.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check organization credits
    const orgCredits = await OrganizationCredits.getCredits(chat.organization_id);
    if (!orgCredits || orgCredits.credits <= 0) {
      return res.status(403).json({ 
        error: 'Insufficient organization credits',
        credits: 0 
      });
    }

    // Save user message
    await Message.create(chatId, 'user', content);

    // Get chat history
    const messages = await Message.findByChatId(chatId);

    // Send to LLM
    const response = await sendChatMessage(messages);

    // Calculate tokens (approximate)
    const tokensUsed = Math.ceil((content.length + response.content.length) / 4);

    // Save assistant message
    const assistantMessage = await Message.create(
      chatId,
      'assistant',
      response.content,
      tokensUsed
    );

    // Deduct credits from organization
    const updatedCredits = await OrganizationCredits.deductCredits(
      chat.organization_id, 
      tokensUsed
    );

    res.json({
      message: assistantMessage,
      credits: updatedCredits ? updatedCredits.credits : 0,
      tokensUsed
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

exports.updateChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Verify user has access to this chat's organization
    const membership = await pool.query(
      'SELECT * FROM organization_members WHERE organization_id = $1 AND user_id = $2',
      [chat.organization_id, userId]
    );

    if (membership.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedChat = await Chat.update(chatId, title);

    res.json({
      message: 'Chat updated successfully',
      chat: updatedChat
    });
  } catch (error) {
    console.error('Update chat error:', error);
    res.status(500).json({ error: 'Failed to update chat' });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Verify user has access to this chat's organization
    const membership = await pool.query(
      'SELECT * FROM organization_members WHERE organization_id = $1 AND user_id = $2',
      [chat.organization_id, userId]
    );

    if (membership.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Chat.delete(chatId);

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};

// NEW: Get organization credits
exports.getOrganizationCredits = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const activeOrg = await Organization.getActiveOrganization(userId);
    if (!activeOrg) {
      return res.status(400).json({ error: 'No active organization' });
    }

    const credits = await OrganizationCredits.getCredits(activeOrg.id);
    
    res.json({ 
      credits: credits ? credits.credits : 0,
      organizationId: activeOrg.id,
      organizationName: activeOrg.name
    });
  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({ error: 'Failed to retrieve credits' });
  }
};