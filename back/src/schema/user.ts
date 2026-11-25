import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../db/schema";

const baseUserSchema = createInsertSchema(users);

//checks name,
export const updateProfileSchema = baseUserSchema
    .pick({ name: true })
    .extend({
	name: z.string().min(3, {error: "Name must be at least 3 characters long."})
    })
    .openapi("UpdateProfileInput")
    .partial();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;


//checks email of user entry, used in email changing (idk if we're keeping that route but the code is there)
export const updateEmailSchema = baseUserSchema
    .pick({email: true})
    .extend({
	email: z.email({error: "Invalid email address."})
    })
    .openapi("UpdateEmailInput");

export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;


//checks password of user entry, used in password changing
export const updatePasswordSchema = baseUserSchema
    .pick({password: true})
    .extend({
	password: z.string().min(8, {error: "Password must be at least 8 characters."})
    })
    .openapi("UpdatePasswordInput");

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;


//checks mail and password of user entry, used in user login and first stage sign up
export const loginSchema = baseUserSchema
    .pick({ email: true, password: true })
    .extend({
	email: z.email("Invalid email address."),
	password: z.string().min(8, {error: "Password must be at least 8 characters."}),
    })
    .openapi("LoginInput");

export type LoginInput = z.infer<typeof loginSchema>;


//------------------------------------------------------------------
//----------------- schemas used for docs only ---------------------
//------------------------------------------------------------------

export const profileResponseSchema = baseUserSchema
  .pick({ name: true, email: true, avatar: true })
  .extend({
    name: z.string().openapi({ example: "userr1" }),
    email: z.email().openapi({ example: "user@example.com" }),
    avatar: z.string().nullable().openapi({ example: "/uploads/avatars/1.png" }),
  })
  .openapi("ProfileOutput");

