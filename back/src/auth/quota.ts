import { db } from "../db/index";
import { sql } from "drizzle-orm";
import { HttpError } from "../error";

function todayUtc(): string {
    return new Date().toISOString().slice(0, 10);
}

//executing all of the following sql calls as raw sql instead of using drizzle to make it atomic and avoid calls being reserved by multiple widgets at once.
export async function reserveApiCalls(provider: string, calls: number, dailyLimit: number): Promise<void> {
    const date = todayUtc();

    //create row if first call today, do nothing if row already exists
    await db.execute(sql`
        INSERT INTO api_usage (provider, date, count)
        VALUES (${provider}, ${date}, 0)
        ON DUPLICATE KEY UPDATE count = count
    `);

    //reserve the calls if it wouldn't go past the limit, do nothing if it goes past
    const [result] = await db.execute(sql`
        UPDATE api_usage
        SET count = count + ${calls}
        WHERE provider = ${provider} AND date = ${date} AND count + ${calls} <= ${dailyLimit}
    `);

    const affected = (result as { affectedRows?: number }).affectedRows ?? 0;

    if (affected === 0) {
        throw new HttpError(429, `The ${provider} API key has reached its daily call limit. Try again tomorrow.`);
    }
}

