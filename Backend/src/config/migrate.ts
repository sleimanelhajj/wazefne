import pool from "../config/db";
import fs from "fs";
import path from "path";

const MIGRATIONS_DIR = path.join(__dirname, "../migrations/sql");

const runMigrations = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    // Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Read all .sql files sorted alphabetically
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      // Check if already executed
      const { rows } = await client.query(
        "SELECT id FROM _migrations WHERE name = $1",
        [file]
      );

      if (rows.length > 0) {
        console.log(`⏭️  Skipping (already applied): ${file}`);
        continue;
      }

      // Execute migration
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO _migrations (name) VALUES ($1)", [
          file,
        ]);
        await client.query("COMMIT");
        console.log(`✅ Applied migration: ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }

    console.log("✅ All migrations up to date");
  } finally {
    client.release();
  }
};

export default runMigrations;
