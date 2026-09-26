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

    // 4. Run Schema Migrations
    const migrationsDir = path.resolve(__dirname, '../../database/migrations');
    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
      for (const file of migrationFiles) {
        console.log(`📜 Executing schema migration (${file})...`);
        const schemaSql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await connection.query(schemaSql);
        console.log(`✅ Schema migration ${file} executed successfully.`);
      }
    }

    // 5. Run Seed Data
    const seedsDir = path.resolve(__dirname, '../../database/seeds');
    if (fs.existsSync(seedsDir)) {
      const seedFiles = fs.readdirSync(seedsDir).filter(f => f.endsWith('.sql')).sort();
      for (const file of seedFiles) {
        console.log(`🌱 Executing seed data (${file})...`);
        const seedSql = fs.readFileSync(path.join(seedsDir, file), 'utf8');
        await connection.query(seedSql);
        console.log(`✅ Seed data ${file} inserted successfully.`);
      }
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
