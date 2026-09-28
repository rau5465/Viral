const { sequelize } = require('../models');

async function migrate() {
  try {
    console.log('Connecting and checking schema updates...');

    // 1. Create platform_settings table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        setting_key VARCHAR(100) NOT NULL PRIMARY KEY,
        setting_value LONGTEXT NOT NULL,
        updated_by VARCHAR(100) DEFAULT 'Admin',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ platform_settings table verified/created.');

    // 2. Clean up orphaned rows if any in YouTube tables
    try {
      await sequelize.query(`
        DELETE FROM user_youtube_subscriptions WHERE account_id NOT IN (SELECT id FROM user_youtube_accounts);
      `);
      await sequelize.query(`
        DELETE FROM user_youtube_accounts WHERE user_id NOT IN (SELECT id FROM users);
      `);
    } catch (_ignoreErr) {}

    // 3. Create user_spins table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_spins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        reward_credits INT NOT NULL,
        segment_label VARCHAR(50) NOT NULL,
        slice_index INT NOT NULL DEFAULT 0,
        ad_session_id VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_spins_user (user_id),
        CONSTRAINT fk_user_spins_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ user_spins table verified/created.');

    // 4. Update transactions category enum
    try {
      await sequelize.query(`
        ALTER TABLE transactions
          MODIFY COLUMN category ENUM(
            'signup_bonus',
            'referral',
            'task',
            'recharge',
            'adjustment',
            'bonus_multiplier',
            'multiply_game',
            'spin_wheel'
          ) NOT NULL;
      `);
      console.log('✅ transactions category ENUM updated with spin_wheel.');
    } catch (enumErr) {
      console.log('ℹ️ transactions category check:', enumErr.message);
    }

    // 5. Seed spin_settings in platform_settings
    await sequelize.query(`
      INSERT IGNORE INTO platform_settings (setting_key, setting_value, updated_by) VALUES
      ('spin_settings', '{"max_daily_spins":10,"ad_duration_seconds":15,"enabled":true}', 'System Administrator');
    `);
    console.log('✅ spin_settings seeded in platform_settings.');

    // 6. Sync models safely
    await sequelize.sync();
    console.log('✅ Sequelize sync completed successfully.');

    // 3. Print tables list
    const [tables] = await sequelize.query('SHOW TABLES;');
    console.log(`\n🎉 Total Tables (${tables.length}):`);
    tables.forEach((t, i) => console.log(`   ${i + 1}. ${Object.values(t)[0]}`));

    // 4. Print users columns
    const [userCols] = await sequelize.query('DESCRIBE users;');
    console.log('\nUsers columns:');
    console.log(userCols.map((c) => c.Field).join(', '));

    // 5. Check transaction categories
    const [trxCategoryCol] = await sequelize.query("SHOW COLUMNS FROM transactions LIKE 'category';");
    console.log('\nTransaction category type:', trxCategoryCol[0]?.Type);

  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
