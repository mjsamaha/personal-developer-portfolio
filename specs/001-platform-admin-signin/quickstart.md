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

### Scenario results (T042)

Verified on 2026-11-15 against a local production build (`npm run build` + `npm run start`) with `curl`, plus the automated suite:

- [x] 1. Signed out, `/admin` → `307` redirect to `/sign-in`.
- [ ] 2. Sign in as the administrator, see shell, sign out → needs a browser session (manual).
- [ ] 3. Another Google account refused → needs a second Google account and Clerk Invite-only enabled (manual).
- [x] 4. `admin.adminPing` rejects unauthenticated and non-admin, succeeds for admin, rejects everyone on an empty list → covered by `tests/convex/auth.test.ts` (12 tests pass). Optional extra check from the Convex dashboard is still manual.
- [ ] 5. Design System tokens, focus ring, and widths → see the T036 section; keyboard and width check is manual.
- [x] 6. `/admin` carries `noindex, nofollow`; `/robots.txt` disallows `/admin`.
- [ ] 7. Pull request runs CI and a Vercel preview is created → needs the branch pushed (see the T040 section).

Also confirmed: the public home page has one `<h1>` and no link to `/sign-in` or `/admin`.

## Clerk and Convex provisioning steps

The backend allow-list (`ADMIN_CLERK_USER_IDS`) is the real security boundary; the Clerk settings below reduce who can create an account at all.

1. **Restrict sign-up**: Clerk Dashboard → Configure → Restrictions → Sign-up mode → **Invite-only** (sign-up only via invitation or manual user creation). Do not leave it on Public.
2. **Enable Google SSO**: Configure → SSO connections → add Google (development instances use shared credentials; production needs your own Google OAuth client). Disable other sign-in methods (email/password, other providers).
3. **Create the administrator account**: with Invite-only on, sign-up is closed, so invite the administrator's Google email (`matthewsamaha@gmail.com`) from Users → Invitations (or create the user manually), accept the invitation, and sign in once.
4. **Create the `convex` JWT template**: Configure → JWT templates → New template → Convex (name must be `convex`). Copy the **Issuer** URL.
5. **Set Convex environment variables** (development deployment; repeat per deployment):

   ```text
   npx convex env set CLERK_JWT_ISSUER_DOMAIN <issuer-url-from-step-4>
   npx convex env set ADMIN_CLERK_USER_IDS <user_id-of-administrator>
   ```

   The administrator's Clerk user ID (`user_...`) is shown under Users → the user's profile. Multiple IDs are comma-separated. An unset or empty value denies everyone.

## Theme and accessibility verification (T036)

Contrast ratios were recomputed with the WCAG 2.x relative-luminance formula from the token hex values in `app/globals.css`; all match `docs/Design System.md` section 3.3.

| Pair | Ratio | Needed | Result |
|---|---|---|---|
| Main text on background / card / popover | 16.1 / 15.3 / 14.4 | 4.5 | Pass |
| Secondary text on background / card / popover | 7.4 / 7.0 / 6.6 | 4.5 | Pass |
| Primary on background / card / deep blue | 7.4 / 7.0 / 5.7 | 4.5 | Pass |
| Text on primary button | 7.3 | 4.5 | Pass |
| Main / secondary text on deep blue | 12.4 / 5.6 | 4.5 | Pass |
| Success / warning / destructive on card | 7.8 / 8.0 / 6.1 | 4.5 | Pass |
| Focus ring on background / card | 7.4 / 7.0 | 3 | Pass |
| Form control border (`--input`) on background / card / popover | 3.6 / 3.4 / 3.2 | 3 | Pass |

Checked in code and the production build (`npm run build`, then `GET /` and `/robots.txt`):

- `<html>` has `class="dark"`, `theme-color` `#111113`, and `color-scheme` `dark`; there is no theme provider or toggle.
- `/robots.txt` disallows `/admin`.
- Focus: one unlayered `:focus-visible` rule in `app/globals.css` draws a 2px `--ring` outline with 2px offset and overrides component `outline-none`; the per-component focus rings were removed so it is not doubled.
- Controls: button (default, sm, lg, icon) and input are 40px high.
- Motion: transitions default to 150ms ease-out; `prefers-reduced-motion` disables them.
- Responsive: the shadcn sidebar uses its mobile sheet below the breakpoint; the content area has `min-w-0` to avoid horizontal scroll.

Still to do by hand (needs a signed-in session): Tab through the admin shell at phone, tablet, and desktop widths and confirm the ring is visible on every control and there is no horizontal scroll. Result: [ ] confirmed.

## Deployment setup: Vercel, Convex, Clerk, branch protection (T040)

Sources: [Convex on Vercel](https://docs.convex.dev/production/hosting/vercel). The Vercel Convex build command makes Convex push functions and inject the Convex URL at build time. Complete in this order; record results in the notes below.

### 1. Create the Vercel project

1. Sign in at <https://vercel.com> with GitHub. Click **Add New… → Project**, import `mjsamaha/personal-developer-portfolio`, and grant access to the repository.
2. Framework preset: **Next.js** (auto-detected). Root directory: repository root.
3. Open **Build and Output Settings** and override **Build Command** with: `npx convex deploy --cmd 'npm run build'`. Leave install as `npm install` (auto-detected from `package-lock.json`).
4. Before the first deploy, add environment variables (next section). Then click **Deploy**.
5. Under **Settings → Git**, confirm the production branch is `main`. Vercel then builds a preview for every pull request automatically.

### 2. Convex deploy keys (Convex Dashboard → project → Settings)

- Production: **Generate Production Deploy Key** with the `deployment:deploy` permission.
- Preview: **Generate Preview Deploy Key**. Convex then creates a fresh backend for each preview. Whether preview deployments are available is plan-dependent; confirm on your plan. If unavailable, previews cannot get their own backend, so do not point them at production.
- Preview Convex deployments start empty, so set defaults in Convex project **Settings → Default environment variables** for the preview/dev types: `CLERK_JWT_ISSUER_DOMAIN` (development Clerk instance issuer) and `ADMIN_CLERK_USER_IDS` (your development Clerk user ID).

### 3. Vercel environment variables (Project → Settings → Environment Variables)

Names only; never paste values into the repository. Scope each variable to the listed environment only.

| Variable | Production | Preview |
|---|---|---|
| `CONVEX_DEPLOY_KEY` | production deploy key | preview deploy key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | production Clerk instance | development Clerk instance |
| `CLERK_SECRET_KEY` | production Clerk instance | development Clerk instance |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | `/sign-in` |

`NEXT_PUBLIC_CONVEX_URL` is set by `npx convex deploy` during the build; do not set it by hand on Vercel.

### 4. Production Clerk instance and Convex production environment

- Clerk does not accept a `*.vercel.app` URL for a production instance, so attach a custom domain in Vercel (**Settings → Domains**) first, then create the production instance in Clerk and add that domain.
- In the production Clerk instance repeat the steps in "Clerk and Convex provisioning steps" above (Invite-only, Google SSO with your own Google OAuth client, `convex` JWT template).
- In the Convex **production** deployment set `CLERK_JWT_ISSUER_DOMAIN` (production issuer) and `ADMIN_CLERK_USER_IDS` (your production Clerk user ID; it differs from the development ID).
- Until the custom domain exists, do not expose production data; the backend still denies everyone but the allow-listed ID.

### 5. Branch protection requiring CI

After the first workflow run, the status check is named `checks`. In GitHub: **Settings → Branches → Add branch ruleset/protection** for `main`: require a pull request, require status check `checks`, require branches to be up to date. Or with the CLI:

```text
gh api -X PUT repos/mjsamaha/personal-developer-portfolio/branches/main/protection --input protection.json
```

where `protection.json` contains `{"required_status_checks":{"strict":true,"contexts":["checks"]},"enforce_admins":false,"required_pull_request_reviews":null,"restrictions":null}`.

### 6. Spending limits and alerts

- **Vercel**: Team **Settings → Billing → Spend Management**: enable and set a monthly amount and notifications.
- **Convex**: Team **Settings → Billing**: review plan limits and enable usage alerts or a spending cap where offered.
- **Cloudflare**: **Billing → Notifications**: add usage/billing alerts for R2 (R2 is not used yet).

Exact option names change; confirm in each dashboard and record what is available.

### Results to record

- [ ] Vercel project created and first deploy succeeded (URL: ______)
- [ ] Preview deployment created for a pull request
- [ ] Convex preview deployments available on this plan: yes / no
- [ ] Production Clerk instance and custom domain set up
- [ ] Branch protection requires `checks`
- [ ] Spending limits/alerts set: Vercel [ ] Convex [ ] Cloudflare [ ]

## Provisioning notes (record results here)

- Clerk restricted sign-up: documented as **Invite-only** (Restrictions page; the Allowlist feature does not apply in Invite-only mode). Plan availability is not confirmed from documentation alone — confirm in the Dashboard on the current plan and record it here: [ ] confirmed.
- Authorization does not depend on this setting: any account that signs up anyway is `denied` by `access.current` and rejected by every `admin*` function.
- Confirm Convex preview-deployment isolation (plan-dependent).
- Set spending limits/alerts on Convex, Vercel, and Cloudflare before launch.
