const pool = require('../config/database');

class Invitation {
  static async create(organizationId, email, invitedBy) {
    const result = await pool.query(
      `INSERT INTO invitations (organization_id, email, invited_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [organizationId, email, invitedBy]
    );
    return result.rows[0];
  }

  static async findByOrganizationId(organizationId) {
    const result = await pool.query(
      `SELECT i.*, u.username as invited_by_username
       FROM invitations i
       JOIN users u ON i.invited_by = u.id
       WHERE i.organization_id = $1
       ORDER BY i.created_at DESC`,
      [organizationId]
    );
    return result.rows;
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE invitations SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }
}

module.exports = Invitation;