const pool = require('../config/database');

class Organization {
  static async create(name, createdBy) {
    const result = await pool.query(
      `INSERT INTO organizations (name, created_by)
       VALUES ($1, $2)
       RETURNING *`,
      [name, createdBy]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM organizations WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      `SELECT o.*, om.role, om.is_active
       FROM organizations o
       JOIN organization_members om ON o.id = om.organization_id
       WHERE om.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async update(id, name) {
    const result = await pool.query(
      'UPDATE organizations SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [name, id]
    );
    return result.rows[0];
  }

  static async addMember(organizationId, userId, role = 'member', isActive = false) {
    const result = await pool.query(
      `INSERT INTO organization_members (organization_id, user_id, role, is_active)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (organization_id, user_id) DO NOTHING
       RETURNING *`,
      [organizationId, userId, role, isActive]
    );
    return result.rows[0];
  }

  static async getMembers(organizationId) {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, om.role, om.joined_at
       FROM users u
       JOIN organization_members om ON u.id = om.user_id
       WHERE om.organization_id = $1
       ORDER BY om.joined_at DESC`,
      [organizationId]
    );
    return result.rows;
  }

  static async setActiveOrganization(userId, organizationId) {
    await pool.query(
      'UPDATE organization_members SET is_active = false WHERE user_id = $1',
      [userId]
    );

    const result = await pool.query(
      `UPDATE organization_members 
       SET is_active = true 
       WHERE user_id = $1 AND organization_id = $2
       RETURNING *`,
      [userId, organizationId]
    );
    return result.rows[0];
  }

  static async getActiveOrganization(userId) {
    const result = await pool.query(
      `SELECT o.* 
       FROM organizations o
       JOIN organization_members om ON o.id = om.organization_id
       WHERE om.user_id = $1 AND om.is_active = true`,
      [userId]
    );
    return result.rows[0];
  }
}

module.exports = Organization;