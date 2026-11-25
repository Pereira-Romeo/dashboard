import { drizzle } from "drizzle-orm/mysql2";
import mysql, { type PoolOptions } from "mysql2/promise";
import * as schema from "./schema";

const poolConfig: PoolOptions = {
    host: String(process.env.DB_HOST) ?? "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: String(process.env.DB_USER),
    password: String(process.env.DB_PASSWORD),
    database: String(process.env.DB_NAME) ?? "dashboardDB",
    waitForConnections: true,
    connectionLimit: 10,
};

const pool = mysql.createPool(poolConfig);

export const db = drizzle(pool, { schema, mode: "default" });

// make sure the db is actually started and reachable even after docker's check
export async function waitForDb(maxRetries = 10, delayMs = 3000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await pool.query("SELECT 1");
            return;
        } catch {
            console.log(`\x1b[36m[APP]\x1b[0m DB not ready (attempt ${i + 1}/${maxRetries}), retrying in ${delayMs}ms... (Make sure your .env has a "DB_HOST=" matching your db service name)`);
            await new Promise((r) => setTimeout(r, delayMs));
        }
    }
    throw new Error("\x1b[36m[APP]\x1b[0m Could not connect to database after retries");
}

