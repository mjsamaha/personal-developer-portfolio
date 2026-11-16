# Quickstart: Validation Guide

## Prerequisites

- Node.js 22 LTS, npm.
- Accounts: Clerk (development instance with Google SSO enabled and sign-up restricted), Convex (development deployment), Vercel, GitHub.
- Copy `.env.example` to `.env.local` and fill in values (never commit). Variables (names only): `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`. In Convex environment config: `CLERK_JWT_ISSUER_DOMAIN`, `ADMIN_CLERK_USER_IDS`.

## Run

```text
npm install
npx convex dev           # terminal 1: syncs schema and functions
npm run dev              # terminal 2: Next.js on localhost
```

## Automated checks

```text
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

Expected: all pass; tests cover the cases in [contracts/backend-functions.md](./contracts/backend-functions.md).

## Manual scenarios

1. Signed out, open `/admin` → redirected to `/sign-in` (US1-1).
2. Sign in as the administrator → admin shell with user indicator and sign-out (US1-2); sign out → `/admin` requires sign-in (US1-3).
3. Attempt sign-up/sign-in with another Google account → refused (US2-3).
4. Call `admin.adminPing` from the Convex dashboard/CLI as unauthenticated and non-admin → rejected; as admin → succeeds (US2-1, 2-4).
5. Check `/` and `/admin` against Design System tokens; Tab through the shell to confirm a visible focus ring; resize to phone/tablet/desktop (US3).
6. View page source/robots: `/admin` has `noindex`; `/robots.txt` disallows it.
7. Open a pull request → CI runs all checks and a Vercel preview is created (US4-2).

## Provisioning notes (record results here)

- Confirm Clerk's restricted sign-up setting name and plan availability.
- Confirm Convex preview-deployment isolation (plan-dependent).
- Set spending limits/alerts on Convex, Vercel, and Cloudflare before launch.
