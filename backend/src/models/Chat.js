const pool = require('../config/database');

class Chat {
  static async create(userId, organizationId, title = 'New Chat') {
    const result = await pool.query(
      `INSERT INTO chats (user_id, organization_id, title)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, organizationId, title]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM chats WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      `SELECT c.*, COUNT(m.id) as message_count
       FROM chats c
       LEFT JOIN messages m ON c.id = m.chat_id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.updated_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async update(id, title) {
    const result = await pool.query(
      'UPDATE chats SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [title, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM chats WHERE id = $1', [id]);
  }
}

module.exports = Chat;