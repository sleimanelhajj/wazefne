import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import pool from "./src/config/db";
import routes from "./src/routes";
import errorHandler from "./src/middleware/errorHandler";
import swaggerSpec from "./src/config/swagger";
import runMigrations from "./src/config/migrate";

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Swagger ────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Root redirect to Swagger ───────────────────────────
app.get("/", (_req, res) => res.redirect("/api-docs"));

// ── Routes ─────────────────────────────────────────────
app.use("/api", routes);

// ── Error handling (must be last) ──────────────────────
app.use(errorHandler);

// ── Start server & verify DB connection ────────────────
const start = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL");
    client.release();

    // Run pending migrations
    await runMigrations();

    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to connect to PostgreSQL:", message);
    process.exit(1);
  }
};

start();
