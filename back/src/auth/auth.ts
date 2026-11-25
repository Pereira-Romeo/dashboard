import type { RequestHandler } from "express";
import { verifyToken, type JwtPayload } from "./jwt";
import { HttpError } from "../error";
import type { Request } from "express";
import { users } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "../db";

export const requireAuth: RequestHandler = async (req, _res, next) => {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
	throw new HttpError(401, "Not authenticated.");
    }

    const token = header.slice("Bearer ".length);

    let payload: JwtPayload;
    try {
	payload = verifyToken(token);
    } catch {
	throw new HttpError(401, "Invalid or expired token.");
    }

    const [user] = await db.select({ id: users.id }).from(users).where(and(eq(users.id, payload.userId), eq(users.email, payload.email)));
    if (!user) {
	throw new HttpError(401, "Account no longer exists.");
    }
    req.user = payload;
    next();
}

//get the authenticated user
export function getAuthUser(req: Request): JwtPayload {
  if (!req.user) throw new HttpError(401, "Not authenticated.");
  return req.user;
}

