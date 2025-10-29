const pool = require('../config/database');

class OrganizationCredits {
  static async getCredits(organizationId) {
    const result = await pool.query(
      'SELECT credits FROM organization_credits WHERE organization_id = $1',
      [organizationId]
    );
    return result.rows[0];
  }

  static async deductCredits(organizationId, amount) {
    const result = await pool.query(
      `UPDATE organization_credits 
       SET credits = credits - $1, updated_at = CURRENT_TIMESTAMP 
       WHERE organization_id = $2 AND credits >= $1 
       RETURNING credits`,
      [amount, organizationId]
    );
    return result.rows[0];
  }

  static async addCredits(organizationId, amount) {
    const result = await pool.query(
      `UPDATE organization_credits 
       SET credits = credits + $1, updated_at = CURRENT_TIMESTAMP 
       WHERE organization_id = $2 
       RETURNING credits`,
      [amount, organizationId]
    );
    return result.rows[0];
  }

  static async setCredits(organizationId, amount) {
    const result = await pool.query(
      `UPDATE organization_credits 
       SET credits = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE organization_id = $2 
       RETURNING credits`,
      [amount, organizationId]
    );
    return result.rows[0];
  }

  static async create(organizationId, credits = 5000) {
    const result = await pool.query(
      `INSERT INTO organization_credits (organization_id, credits)
       VALUES ($1, $2)
       ON CONFLICT (organization_id) DO NOTHING
       RETURNING *`,
      [organizationId, credits]
    );
    return result.rows[0];
  }
}

module.exports = OrganizationCredits;