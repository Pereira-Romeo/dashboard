import jwt from "jsonwebtoken";
import { createApp } from "../app";

let appPromise: ReturnType<typeof createApp> | null = null;

export function getTestApp() {
  appPromise ??= createApp();
  return appPromise;
}

export const TEST_USER = { userId: 1, email: "test@example.com" };

export function tokenSignedWithWrongSecret(): string {
  return jwt.sign(TEST_USER, "not-the-real-secret", { expiresIn: "1h" });
}

export function expiredToken(): string {
  return jwt.sign({ ...TEST_USER, exp: Math.floor(Date.now() / 1000) - 60 }, process.env.JWT_SECRET!);
}

// Returns the status of whatever the function throws (HttpError), or undefined if it doesn't throw
export function thrownStatus(fn: () => unknown): number | undefined {
  try {
    fn();
  } catch (err) {
    return (err as { status?: number }).status;
  }
  return undefined;
}

