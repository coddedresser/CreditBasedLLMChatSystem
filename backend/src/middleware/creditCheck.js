const pool = require('../config/database');

const creditCheck = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT credits FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (result.rows[0].credits <= 0) {
      return res.status(403).json({ 
        error: 'Insufficient credits',
        credits: 0
      });
    }

    req.userCredits = result.rows[0].credits;
    next();
  } catch (error) {
    console.error('Credit check error:', error);
    return res.status(500).json({ error: 'Failed to check credits' });
  }
};

module.exports = creditCheck;