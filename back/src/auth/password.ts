import bcrypt from "bcrypt";

//arbitrary value added to user's password in case of db leak
const PEPPER = process.env.PASSWORD_PEPPER ?? "";
//number of hashing rounds
const SALT = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

//hash a new password, use when adding new user to db
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password + PEPPER, SALT);
}

//compare password to hash in db, use for user login
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    return bcrypt.compare(password + PEPPER, storedHash);
}

