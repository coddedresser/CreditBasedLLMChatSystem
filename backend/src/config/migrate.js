const pool = require('./database');

async function migrate() {
  try {
    console.log('Starting migration...');

    // Create organization_credits table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS organization_credits (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        credits INTEGER DEFAULT 5000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(organization_id)
      );
    `);
    console.log('✅ Created organization_credits table');

    // Create trigger function
    await pool.query(`
      CREATE OR REPLACE FUNCTION create_organization_credits()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO organization_credits (organization_id, credits)
        VALUES (NEW.id, 5000);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Created trigger function');

    // Create trigger
    await pool.query(`
      DROP TRIGGER IF EXISTS after_organization_create ON organizations;
      CREATE TRIGGER after_organization_create
      AFTER INSERT ON organizations
      FOR EACH ROW
      EXECUTE FUNCTION create_organization_credits();
    `);
    console.log('✅ Created trigger');

    // Add credits for existing organizations
    await pool.query(`
      INSERT INTO organization_credits (organization_id, credits)
      SELECT id, 5000 FROM organizations
      ON CONFLICT (organization_id) DO NOTHING;
    `);
    console.log('✅ Added credits for existing organizations');

    // Add indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_chats_organization_id ON chats(organization_id);
      CREATE INDEX IF NOT EXISTS idx_organization_credits_org_id ON organization_credits(organization_id);
    `);
    console.log('✅ Created indexes');

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
