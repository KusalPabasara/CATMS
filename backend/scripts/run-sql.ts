import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { sequelize } from '../config/database';

dotenv.config();

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: npx ts-node backend/scripts/run-sql.ts <path-to-sql>');
    process.exit(1);
  }

  const sqlPath = path.resolve(fileArg);
  if (!fs.existsSync(sqlPath)) {
    console.error(`SQL file not found: ${sqlPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf-8');
  if (!sql.trim()) {
    console.error('SQL file is empty');
    process.exit(1);
  }

  try {
    console.log(`Executing SQL from: ${sqlPath}`);
    // MySQL can execute multiple statements if separated by semicolons.
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      console.log('> ', stmt.replace(/\s+/g, ' ').slice(0, 120) + '...');
      await sequelize.query(stmt);
    }

    console.log('✅ SQL executed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to execute SQL:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();


