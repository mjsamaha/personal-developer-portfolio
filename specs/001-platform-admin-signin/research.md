# Research: Platform Foundation and Admin Sign-In

## 1. Administrator identification

- **Decision**: Allow-list of Clerk user IDs held in a Convex environment variable (`ADMIN_CLERK_USER_IDS`, comma-separated). `requireAdmin` compares the verified token `subject` to the list.
- **Rationale**: Works with no Clerk JWT customization, no extra table (constitution I), and is changed without a deploy. One administrator at launch.
- **Alternatives**: Role claim in Clerk session token (needs JWT template/metadata setup; revisit when the `EDITOR` role arrives); `adminUsers` table (rejected by docs).

## 2. Restricting sign-in to the administrator (spec clarification)

- **Decision**: Configure Clerk so sign-up is closed (restricted/invite-only mode) and only the administrator's Google account exists; hide sign-up UI. Backend allow-list still guards everything.
- **Rationale**: Prevents stray accounts; defense in depth with the backend check.
- **Alternatives**: Open sign-up plus access-denied (rejected by clarification); Clerk email allow-list (plan-dependent, verify availability on the free plan during setup).
- **Verify at provisioning**: exact Clerk setting names and plan availability; record result in `quickstart.md` notes.

## 3. Clerk + Convex token validation

- **Decision**: Clerk "convex" JWT template; `convex/auth.config.ts` with the Clerk issuer domain; `ConvexProviderWithClerk` in a client provider. Issuer domain differs per environment.
- **Rationale**: Native, documented integration; Convex verifies tokens (Tech Stack key decision).

## 4. Route protection and UX gating

- **Decision**: Clerk middleware (`proxy.ts` on current Next.js, `middleware.ts` on older versions) protects `/admin(.*)`, redirecting to `/sign-in`. A client gate in the admin layout calls `access.current` and renders the shell, an access-denied view, or a redirect to sign-in. Session end redirects straight to sign-in (clarification).
- **Rationale**: Middleware and UI are UX only; the real boundary is `requireAdmin`.
- **Note**: `access.current` is intentionally not an admin function: it returns only the caller's own state (`admin`, `denied`, `unauthenticated`) and no content.

## 5. Indexing

- **Decision**: `robots` metadata `noindex, nofollow` in the admin layout plus `robots.ts` disallowing `/admin`.

## 6. Theme

- **Decision**: Tokens from `docs/Design System.md` placed in `:root` of `globals.css`, static `dark` class on `<html>`, `color-scheme: dark`, `theme-color` meta; Geist and Geist Mono via `next/font`; register `--success` and `--warning` in the Tailwind theme. No theme provider or toggle. Verify shadcn/Tailwind version's expected variable format when initializing.
- **Components initialized now**: button, card, skeleton, sidebar (plus its dependencies), separator. Others added when needed.

## 7. Testing

- **Decision**: Adopt Vitest + `convex-test` now. Playwright and component tests deferred.
- **Need (constitution V)**: FR-013 and constitution VII require automated authorization tests; `convex-test` is the documented tool for that. This resolves the Milestone 14 candidate for these two tools only.
- **Cases**: signed-out rejected, non-admin rejected, admin accepted, empty allow-list rejects everyone, audit helper writes an append-only record without bodies.

## 8. Package manager

- **Decision**: npm, with committed `package-lock.json`; Node.js 22 LTS (`engines`/CI pin).
- **Rationale**: No extra tooling to install; ships with Node.js and is supported by Vercel and CI. Resolves the open item in the docs.
- **Alternatives**: pnpm (faster installs, stricter resolution) was tried first and replaced by npm for simplicity.

## 9. CI and deployments

- **Decision**: GitHub Actions on pull requests and `main`: install, ESLint, Prettier check, `tsc --noEmit`, Vitest, `next build`. Vercel Git integration gives previews. Branch protection requires the CI check.
- **Open (plan-dependent)**: whether previews get an isolated Convex backend; start with previews pointing at the development Convex deployment and separate Clerk dev instance, revisit at Milestone 15.

## 10. Audit helper

- **Decision**: `writeAudit(ctx, { actorId, action, entityTable, entityId, summary?, changedFields? })` inserts into `auditLogs`; append-only (no update/delete functions); called inside the same mutation as the change. Only the helper and table ship now; no viewer (clarification).
