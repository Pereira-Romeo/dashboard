import { hashPassword } from "../auth/password";
import { db } from "./index";
import { users } from "./schema";

const seedUsers = await Promise.all([
	{ name: "Deb", email: "deb@blahaj.silly", password: "sillyYou", emailVerified: 1 },
	{ name: "Dan", email: "dodo@blahaj.silly", password: "googoogaga", emailVerified: 1 },
    ].map(async (u) => ({...u, password: await hashPassword(u.password)}))
);

export async function seedDatabase() {
    console.log(`\x1b[35m[DataBase]\x1b[0m Seeding database...`);
    const existing = await db.select({name: users.id}).from(users);
    if (existing.length > 0) {
	console.log("\x1b[35m[DataBase]\x1b[0m Users table already has data, skipping seed");
	return;
    }

    await db.insert(users).values(seedUsers);
    console.log(`\x1b[35m[DataBase]\x1b[0m Seeded ${seedUsers.length} users`);
}

