import jwt from "jsonwebtoken";

const SECRET: string = (() => {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET is not set");
  return value;
})();

export interface JwtPayload {
    userId: number;
    email: string;
}

//sign a token to start a session
export function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, SECRET, {expiresIn: "1h"});
}

//verify a token for a currently in-use session
export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, SECRET) as JwtPayload;
}

