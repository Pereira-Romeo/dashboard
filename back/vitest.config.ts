import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
	    silent: "passed-only",
        env: {
            JWT_SECRET: "test-jwt-secret-test-jwt-secret",
            PASSWORD_PEPPER: "test-pepper",
            BCRYPT_SALT_ROUNDS: "4",
            TOKEN_ENCRYPTION_KEY: "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
            OPENWEATHER_API_KEY: "test-key",
            GITHUB_CLIENT_ID: "test-client-id",
            GITHUB_CLIENT_SECRET: "test-client-secret",
            GITHUB_REDIRECT_URI: "http://localhost:8080/auth/github/callback",
            STEAM_API_KEY: "test-key",
            STEAM_REALM: "http://localhost:8080",
            STEAM_RETURN_TO: "http://localhost:8080/auth/steam/callback",
            CORS_ORIGIN: "http://localhost:5173",
            BACKEND_URL: "http://localhost:8080",
            DB_HOST: "127.0.0.1",
            DB_PORT: "1", //make everything that would need a db immidiatly fail.
            DB_USER: "test",
            DB_PASSWORD: "test",
            DB_NAME: "test",
        },
    },
});

