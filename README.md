<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Texora

Texora is a Next.js app backed by local tRPC procedures, better-auth, and Drizzle/Postgres.

## Run Locally

**Prerequisites:** Node.js or Bun, and a Postgres database.

1. Install dependencies:
   `bun install`
2. Copy [.env.example](.env.example) to `.env.local` and set `DATABASE_URL` plus `BETTER_AUTH_SECRET`.
3. Run migrations:
   `bun run db:migrate`
4. Start the app:
   `bun run dev`

The browser app and backend run together through Next.js. Auth is served from `/api/auth/*`; app data mutations and queries are served from `/api/trpc`.

## Production Environment

Set these variables in the production host before deploying:

```env
DATABASE_URL=postgres://user:password@host:5432/texora_db
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=https://your-production-domain.com
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
GEMINI_API_KEY=
```

Run `bun run db:migrate` against the production database before starting the app. For a public demo, run `bun run db:seed:demo` once after migrations.

## Demo Accounts

The seeded demo accounts are also shown on the auth screen:

```text
Creator: creator@texora.demo / TexoraDemo123!
Investor: donor@texora.demo / TexoraDemo123!
```
