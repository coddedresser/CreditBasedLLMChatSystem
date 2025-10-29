const pool = require('../config/database');

class Message {
  static async create(chatId, role, content, tokensUsed = 0) {
    const result = await pool.query(
      `INSERT INTO messages (chat_id, role, content, tokens_used)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [chatId, role, content, tokensUsed]
    );

    // Update chat's updated_at
    await pool.query(
      'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [chatId]
    );

    return result.rows[0];
  }

  static async findByChatId(chatId) {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE chat_id = $1 
       ORDER BY created_at ASC`,
      [chatId]
    );
    return result.rows;
  }
}

module.exports = Message;