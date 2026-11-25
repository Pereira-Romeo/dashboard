import "dotenv/config";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { db, waitForDb } from "./db";
import { seedDatabase } from "./db/seed";
import { createApp } from "./app";
import { verifyMailerConfig } from "./mail/mailer";

const PORT = process.env.PORT || 8080;

async function main() {
    //database setup
    await waitForDb();
    console.log("\x1b[36m[APP]\x1b[0m Database reachable.");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("\x1b[35m[DataBase]\x1b[0m Migrations applied.");
    await seedDatabase();

    await verifyMailerConfig();

    const app = await createApp();
    app.listen(PORT, () => console.log(`\x1b[36m[APP]\x1b[0m Server running on port ${PORT}`));
}

main().catch((err) => {
    console.error("\x1b[36m[APP]\x1b[0m Startup failed:", err);
    process.exit(1);
});

