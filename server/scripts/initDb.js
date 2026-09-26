const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load server .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'viral';

async function initDatabase() {
  console.log('🔄 Initializing ViralRecharge MySQL Database...');
  console.log(`📡 Connecting to MySQL server at ${dbHost}:${dbPort} as user "${dbUser}"...`);

  let connection;
  try {
    // 1. Connect without selecting database first
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      multipleStatements: true,
    });

    console.log('✅ Connected to MySQL server.');

    // 2. Create database if it does not exist
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`✅ Database "${dbName}" verified/created.`);

    // 3. Switch to target database
    await connection.changeUser({ database: dbName });

    // 4. Run Schema Migration
    const schemaPath = path.resolve(__dirname, '../../database/migrations/001_initial_schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('📜 Executing schema migration (001_initial_schema.sql)...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('✅ Schema migration executed successfully.');
    } else {
      console.warn(`⚠️ Schema migration file not found at ${schemaPath}`);
    }

    // 5. Run Seed Data
    const seedPath = path.resolve(__dirname, '../../database/seeds/001_seed_data.sql');
    if (fs.existsSync(seedPath)) {
      console.log('🌱 Executing initial seed data (001_seed_data.sql)...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await connection.query(seedSql);
      console.log('✅ Seed data inserted successfully.');
    } else {
      console.warn(`⚠️ Seed file not found at ${seedPath}`);
    }

    // 6. Verify Tables
    const [tables] = await connection.query('SHOW TABLES;');
    console.log(`\n🎉 Database setup complete! Total active tables in "${dbName}": ${tables.length}`);
    tables.forEach((row, i) => {
      const tableName = Object.values(row)[0];
      console.log(`   ${i + 1}. ${tableName}`);
    });

    console.log('\n🚀 Ready to run the server with: npm run dev:server\n');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
