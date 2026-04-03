const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const dotenv = require("dotenv");

const envPath = path.join(__dirname, "..", ".env");
dotenv.config({ path: envPath });

const requiredVars = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required .env variables: ${missing.join(", ")}`);
  process.exit(1);
}

const outputPath =
  process.argv[2] || process.env.DB_SYNC_FILE || path.join(__dirname, "..", "db", "latest.sql");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const args = [
  "--host",
  process.env.DB_HOST,
  "--port",
  process.env.DB_PORT,
  "--username",
  process.env.DB_USER,
  "--dbname",
  process.env.DB_NAME,
  "--clean",
  "--if-exists",
  "--no-owner",
  "--no-privileges",
  "--file",
  outputPath,
];

console.log(`Creating dump at ${outputPath}`);

const child = spawn("pg_dump", args, {
  stdio: "inherit",
  env: {
    ...process.env,
    PGPASSWORD: process.env.DB_PASSWORD,
  },
});

child.on("error", (err) => {
  if (err.code === "ENOENT") {
    console.error("pg_dump was not found. Install PostgreSQL client tools and try again.");
    process.exit(1);
  }
  console.error(err.message);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
