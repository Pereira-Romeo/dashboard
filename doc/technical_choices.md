# Technical choices

[backlink](../README.md#dashboard)

Table of contents:
1. **[frontend](#frontend)**
2. **[backend](#backend)**


# Frontend

**React + TypeScript**
Chosen because I already had some prior experience with React and
TypeScript, and for the React ecosystem and its extensive documentation. The
dashboard requires a lot of interactivity (drag and drop, resizing, widget
refresh).

**Vite**
It is the current standard tool for React projects: fast startup and
live reloading during development.

**dnd-kit and re-resizable**
Dedicated libraries for the widget canvas: `@dnd-kit` for drag and drop and
`re-resizable` for resizing. This avoids reinventing the wheel and they are
easy to integrate into the project.

**Native CSS with design tokens**
No CSS framework: colors, spacing and text sizes are CSS variables
centralized in `tokens.css`. This is enough to handle the light and dark
themes and keep contrasts compliant with the RGAA.

## Technology comparison

| Need | Chosen option | Alternatives | Why this choice |
| --- | --- | --- | --- |
| Interface | React + TypeScript | Vue, Svelte, Angular, HTMX | Prior experience, very rich ecosystem and documentation. HTMX is too limited for such an interactive interface; Angular is heavier to get started with for a project of this size. |
| Build tool | Vite | Next.js | Fast startup and reloading, minimal configuration. Next.js brings server-side rendering that the project does not need. |
| Drag and drop | dnd-kit | react-dnd, react-beautiful-dnd | Lightweight, designed for React, lets you constrain movement. react-beautiful-dnd is no longer maintained. |
| Resizing | re-resizable | react-rnd, react-grid-layout, CSS `resize` | A simple component that only handles resizing and combines with dnd-kit. react-grid-layout imposes a grid; CSS `resize` offers neither a controlled minimum size nor events. |
| Styles | Native CSS + design tokens | Tailwind | No dependency, light and dark themes handled by CSS variables, full control over contrasts for the RGAA. Tailwind adds a layer to learn and configure for a modest need. |

# Backend

The documentation is served through 2 routes and 1 redirect:
- `/docs` redirects to `/docs/scalar`
- `/docs/scalar` uses scalar UI
- `/docs/swagger` uses swagger UI \

| Need | Chosen option | Alternatives | Why this choice |
| --- | --- | --- | --- |
| Language and module system | TypeScript, pure ESM (`"type": "module"`, `moduleResolution: Bundler`) | Plain JavaScript, TypeScript on CommonJS | Type safety end to end, with no CommonJS/ESM mix, which caused conflicts on a previous project. |
| HTTP framework | Express 5 | NestJS, Fastify, Koa | Minimal and familiar. Express 5 forwards rejected promises from async handlers to the error middleware, so routes need no try/catch or `next(err)`. |
| Running the app | Docker Compose (backend, frontend, MySQL, healthcheck) | Manual installs, a single Dockerfile, Kubernetes | `docker compose up` brings up everything ready to use. `depends_on: service_healthy` plus a retry loop in the app covers MySQL's first-boot window. |
| Database | MySQL 8.4 as a Compose service | PostgreSQL, MariaDB, SQLite | Project requirement, mature and well supported by `mysql2` and Drizzle. |
| ORM | Drizzle ORM + `drizzle-kit` | TypeORM, Prisma, Kysely, raw SQL | Types are inferred straight from the schema, with no decorators or `experimentalDecorators`. Queries read like SQL, and the same schema feeds validation through `drizzle-zod`. Drizzle Studio gives a web UI to browse and edit data while the app is running. |
| API documentation | `zod-to-openapi` with `registerPath` inside each route file, rendered by Scalar (default) and Swagger UI | Hand-written YAML, JSDoc annotations, one central doc file | Docs sit next to the code they describe and reuse the Zod schemas, so they can't drift. Both UIs read the same `/openapi.json`, so offering both costs nothing. |
| Registering routes and widgets | Filesystem-driven loaders: `routes/**` (path = URL) and `service/<name>/*.widget.ts` | A central route list in `app.ts`, decorators, a manual registry | Adding a route or widget means adding one file and nothing else. `/about.json` and the data endpoint update on their own. all routes inside app.ts would have been very ugly and awful to work with. |
| Authentication | JWT (`jsonwebtoken`) in `Authorization: Bearer` | Server sessions with cookies, refresh tokens, opaque tokens | Stateless and already familiar from a previous project. The token carries `userId` and `email`, so the frontend never says who the user is. |
| Password storage | bcrypt + a server-side pepper from env, configurable cost, hashed only on the server | argon2, scrypt, client-side hashing | bcrypt salts every hash itself, and the pepper lives outside the DB, so a leaked dump alone isn't enough. Client-side hashing was rejected because the hash would just become the password (pass-the-hash), and TLS already protects transit. |
| Third-party tokens at rest (GitHub) | AES-256-GCM via Node `crypto`, key in env | Plaintext, hashing, KMS or secrets manager | The real token is needed back to call GitHub, so hashing is impossible. GCM also detects tampering, and a DB leak alone exposes only ciphertext. |
| GitHub connection | OAuth App, authorization-code flow, one-time `state` kept in memory | GitHub App, personal access tokens, Passport.js | The callback arrives with no JWT, so `state` carries the dashboard user across the redirect. It is single-use and expires, and the callback route stays public on purpose. |
| Steam connection | OpenID 2.0 sign-in verified with Steam's `check_authentication`, only the SteamID stored, one app-wide Web API key | OAuth2 (Steam doesn't offer it), `passport-steam`, scraping profiles | Steam issues no per-user tokens. Sign-in only proves who owns the SteamID, and game data comes from the app's own key, so there is no per-user secret to store. |
| Email verification | Nodemailer over any SMTP server (Mailpit in dev) | Resend, Brevo API, SendGrid SDKs | Works with every SMTP server, so the provider is just env vars and can change without touching code. A vendor SDK would lock the code to one service. |
| Weather data caching | In-memory TTL cache keyed by rounded lat/lon (10 min default), shared helper for all weather widgets | No cache, Redis, per-widget API calls | OpenWeather recommends at most one call per location every ~10 minutes, so faster refreshes burn quota for identical data. A page refresh for the same place hits the cache. |
| Avatar uploads | Multer (disk storage, type and size limits), served from `/uploads` | busboy or formidable, S3-style object storage, base64 in JSON | Standard multipart handling. The file is named after the user id, so a new upload overwrites the old one and a client-supplied filename can't cause path traversal. Local disk is fine for dev, and a volume or object storage is the next step. |
| Cross-origin access | `cors` restricted to `CORS_ORIGIN` | Allow-all `cors()`, proxy only | Only the dashboard frontend can call the API from a browser, and the origin changes per environment without code edits. |

