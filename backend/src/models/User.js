const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { username, email, password, googleId } = userData;
    let passwordHash = null;

    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, google_id, credits)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, credits, created_at`,
      [username, email, passwordHash, googleId, 1000]
    );

    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, username, email, credits, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByGoogleId(googleId) {
    const result = await pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );
    return result.rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateCredits(userId, amount) {
    const result = await pool.query(
      'UPDATE users SET credits = credits + $1 WHERE id = $2 RETURNING credits',
      [amount, userId]
    );
    return result.rows[0];
  }

  static async deductCredits(userId, amount) {
    const result = await pool.query(
      'UPDATE users SET credits = credits - $1 WHERE id = $2 AND credits >= $1 RETURNING credits',
      [amount, userId]
    );
    return result.rows[0];
  }
}

module.exports = User;