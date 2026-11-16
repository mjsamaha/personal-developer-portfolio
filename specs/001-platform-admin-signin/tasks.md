# Tasks: Platform Foundation and Admin Sign-In

**Input**: Design documents from `/specs/001-platform-admin-signin/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included. FR-013 and constitution principle VII require automated authorization tests (Vitest + `convex-test`).

**Organization**: Grouped by user story. Package manager is npm; Node.js 22 LTS.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = admin sign-in and shell, US2 = denial for everyone else, US3 = dark theme, US4 = setup and CI

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Scaffold the Next.js App Router project (TypeScript strict, Tailwind, ESLint, `app/` directory, npm) at the repository root without overwriting `docs/`, `specs/`, `.specify/`, `.github/`; commit `package-lock.json`
- [X] T002 Enable `"strict": true` in `tsconfig.json` and add scripts `lint`, `format:check`, `typecheck` (`tsc --noEmit`), `test`, `build` to `package.json`
- [X] T003 [P] Add Prettier with `.prettierrc` and `.prettierignore`; add `prettier` script `format:check` to `package.json`
- [X] T004 [P] Install runtime deps: `convex`, `@clerk/nextjs`, `lucide-react`; dev deps: `vitest`, `convex-test`, `@edge-runtime/vm` in `package.json`
- [X] T005 Initialize shadcn/ui (neutral base color) via CLI creating `components.json`, `lib/utils.ts`; add components `button`, `card`, `skeleton`, `sidebar`, `separator` in `components/ui/`
- [X] T006 Initialize Convex (`convex/` directory, `convex.json` if needed) and add `vitest.config.ts` configured for `convex-test` with tests under `tests/convex/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Create `convex/lib/validators.ts` exporting the content `status` union: `v.union(v.literal("draft"), v.literal("review"), v.literal("published"), v.literal("archived"))`
- [X] T008 Create `convex/schema.ts` defining only `auditLogs`: `actorId` string (Clerk user ID), `action` string, `entityTable` string, `entityId` string, `summary` `v.optional(v.string())`, `changedFields` `v.optional(v.array(v.string()))`; index `by_entity` on (`entityTable`, `entityId`); no `createdAt` field (use `_creationTime`)
- [X] T009 [P] Create `convex/auth.config.ts` configuring Clerk as the token provider using the `CLERK_JWT_ISSUER_DOMAIN` environment variable and application ID `convex`
- [X] T010 Create `convex/lib/auth.ts` exporting `requireAdmin(ctx)`: reads `ctx.auth.getUserIdentity()`, throws "Unauthenticated" if null, throws "Forbidden" if `identity.subject` is not in comma-separated `ADMIN_CLERK_USER_IDS` (missing or empty list rejects everyone), returns `actorId`
- [X] T011 [P] Create `convex/lib/audit.ts` exporting `writeAudit(ctx, { actorId, action, entityTable, entityId, summary?, changedFields? })` that inserts into `auditLogs`; never accepts bodies, tokens, or credentials; no update or delete function
- [X] T012 Create `convex/access.ts` with public query `current` (no args) returning `"unauthenticated" | "denied" | "admin"` for the caller only, without calling `requireAdmin` and returning no other data
- [X] T013 Create `convex/admin.ts` with query `adminPing` (no args) whose first statement is `await requireAdmin(ctx)` and returns `{ ok: true, actorId }`; declare `args: {}` validator
- [X] T014 Create `components/providers/convex-client-provider.tsx` (client component using `ConvexProviderWithClerk`) and wrap the app with `ClerkProvider` and this provider in `app/layout.tsx`
- [X] T015 [P] Create `.env.example` listing names only: `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, and a comment listing Convex-side vars `CLERK_JWT_ISSUER_DOMAIN`, `ADMIN_CLERK_USER_IDS`; ensure `.env*.local` is in `.gitignore`

**Checkpoint**: Backend guard, schema, and providers exist; stories can begin.

---

## Phase 3: User Story 1 - Administrator signs in and reaches the admin area (Priority: P1) 🎯 MVP

**Goal**: Administrator signs in with Google and reaches an empty admin shell; signed-out users are sent to sign-in; sign-out ends access.

**Independent Test**: Signed out, open `/admin` → redirected to `/sign-in`; sign in as administrator → shell with user indicator and sign-out; sign out → `/admin` requires sign-in again.

- [X] T016 [US1] Create `proxy.ts` (use `middleware.ts` if the installed Next.js lacks `proxy`) with Clerk middleware protecting `/admin(.*)` and redirecting signed-out requests to `/sign-in`
- [X] T017 [P] [US1] Create `app/sign-in/[[...sign-in]]/page.tsx` rendering Clerk `<SignIn />` with Google only and no sign-up link; set `NEXT_PUBLIC_CLERK_SIGN_IN_URL` usage and after-sign-in redirect to `/admin`
- [X] T018 [P] [US1] Create `components/admin/user-menu.tsx` showing the signed-in user (Clerk `UserButton` or name) and a sign-out control that redirects to `/sign-in`
- [X] T019 [P] [US1] Create `components/admin/admin-sidebar.tsx` using shadcn `sidebar` with a Dashboard item as the active entry
- [X] T020 [US1] Create `app/admin/layout.tsx` composing sidebar, header with user menu, and content area; export `metadata.robots = { index: false, follow: false }`; redirect to `/sign-in` immediately when the session ends
- [X] T021 [US1] Create `app/admin/page.tsx` placeholder dashboard (card stating no modules yet) with a single `<h1>`
- [X] T022 [US1] Create `app/page.tsx` public "coming soon" placeholder (server component, no sign-in link, one `<h1>`)

**Checkpoint**: US1 works end to end for a signed-in user.

---

## Phase 4: User Story 2 - Everyone else is denied, even when bypassing the interface (Priority: P1)

**Goal**: Non-admins and signed-out callers cannot see admin content or run admin functions, via UI or direct backend calls; no other account can sign up.

**Independent Test**: Call `admin.adminPing` signed out, as non-admin, and as admin; only admin succeeds; attempt sign-up with another Google account is refused.

### Tests for User Story 2

- [X] T023 [P] [US2] Add `tests/convex/auth.test.ts` with `convex-test` cases: `adminPing` rejects with no identity; rejects identity not in `ADMIN_CLERK_USER_IDS`; returns `{ ok: true }` for allow-listed identity; rejects everyone when the list is empty or unset
- [X] T024 [P] [US2] Add `access.current` cases to `tests/convex/auth.test.ts`: returns `"unauthenticated"`, `"denied"`, `"admin"` for the three identities
- [X] T025 [P] [US2] Add `tests/convex/audit.test.ts`: `writeAudit` inserts a record with `actorId`, `action`, `entityTable`, `entityId`, optional `summary` and `changedFields`; assert the module exports no update/delete helper

### Implementation for User Story 2

- [X] T026 [US2] Create `components/admin/access-gate.tsx` (client) calling `api.access.current`: loading → skeleton; `unauthenticated` → redirect to `/sign-in`; `denied` → access-denied view (no admin content rendered); `admin` → children
- [X] T027 [US2] Wrap the shell in `app/admin/layout.tsx` with `AccessGate` so sidebar and dashboard never render for non-admins
- [X] T028 [US2] Wire the placeholder dashboard in `app/admin/page.tsx` to call `api.admin.adminPing` and show a confirmation line, proving the guarded call works
- [X] T029 [US2] Document in `specs/001-platform-admin-signin/quickstart.md` the verified Clerk steps: restrict sign-up (invite-only/closed), enable Google SSO, create `convex` JWT template, set `CLERK_JWT_ISSUER_DOMAIN` and `ADMIN_CLERK_USER_IDS` in Convex env; record plan availability findings

**Checkpoint**: `npm test` passes; non-admin paths denied in UI and backend.

---

## Phase 5: User Story 3 - Consistent dark theme across public and admin (Priority: P2)

**Goal**: One dark theme from the Design System on public and admin pages, accessible and responsive.

**Independent Test**: Compare pages to documented tokens; Tab through the shell with visible focus ring; check phone/tablet/desktop widths.

- [X] T030 [US3] Replace `app/globals.css` variables with the `:root` block from `docs/Design System.md` section 4 (background `#111113`, card `#17171a`, popover `#1d1d21`, primary `#5ea6f2`, accent `#172a45`, border `#2a2a2f`, input `#6b6b75`, ring `#5ea6f2`, sidebar tokens, `--success`, `--warning`, `--radius: 0.5rem`, `color-scheme: dark`); register `--success` and `--warning` in the Tailwind theme; remove any light-mode or `.dark` overrides
- [X] T031 [US3] Update `app/layout.tsx`: `<html lang="en" className="dark">`, Geist and Geist Mono via `next/font` with fallback stacks, `color-scheme` and `theme-color` (`#111113`) metadata; no ThemeProvider or toggle
- [X] T032 [P] [US3] Ensure interactive elements show a 2px `--ring` focus ring with 2px offset (shared in `components/ui/*` or `app/globals.css`), never removed; controls at least 40px high
- [X] T033 [P] [US3] Add reduced-motion handling (transitions 150-200ms, disabled under `prefers-reduced-motion`) in `app/globals.css`
- [X] T034 [P] [US3] Make admin shell responsive: sidebar collapses on small screens (shadcn sidebar mobile sheet), no horizontal scroll at phone width, in `components/admin/admin-sidebar.tsx` and `app/admin/layout.tsx`
- [X] T035 [P] [US3] Add `app/robots.ts` disallowing `/admin`
- [X] T036 [US3] Verify contrast and keyboard navigation against the Design System table (text 4.5:1, controls 3:1) and note results in `specs/001-platform-admin-signin/quickstart.md`

**Checkpoint**: Theme applied everywhere; accessibility baseline checked.

---

## Phase 6: User Story 4 - Project can be set up and deployed from the repository (Priority: P3)

**Goal**: Documented local setup and automatic checks on every pull request.

**Independent Test**: Fresh clone reaches the working sign-in page following docs; a pull request runs all checks and gets a preview.

- [ ] T037 [US4] Create `.github/workflows/ci.yml` running on pull requests and pushes to `main`: npm ci, `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run build`
- [ ] T038 [P] [US4] Create or update `README.md` with setup steps (prerequisites, `.env.local`, `npx convex dev`, `npm run dev`) referencing `.env.example` and `specs/001-platform-admin-signin/quickstart.md`
- [ ] T039 [P] [US4] Document in `docs/Tech Stack (v2).md` and `docs/Engineering Principles.md` the resolved decisions: npm as package manager and Vitest + `convex-test` adopted
- [ ] T040 [US4] Connect Vercel Git integration, set per-environment variables (separate Clerk instances, Convex deployments), enable branch protection requiring CI, and set spending limits/alerts on Convex, Vercel, Cloudflare; record in `specs/001-platform-admin-signin/quickstart.md`

**Checkpoint**: Fresh-clone setup works; PRs are gated.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T041 Run all checks (`npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run build`) and fix failures
- [ ] T042 Run every scenario in `specs/001-platform-admin-signin/quickstart.md` and tick results
- [ ] T043 Confirm no secrets are committed and `.env.example` matches all variables used in code
- [ ] T044 Check any `any` or non-null assertion carries an explanatory comment (constitution IV)

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2 → stories**. Phase 2 blocks all stories.
- **US1** and **US2** both P1: US1 first (shell exists); US2 adds the gate and tests on top of it (T026-T028 edit US1 files).
- **US3** can run in parallel with US2 after US1 (T030-T031 touch `app/layout.tsx`/`globals.css`; coordinate with T014).
- **US4** can start after Phase 2; T040 needs a working app (after US1).
- Polish after all stories.

Within tasks: T010 before T012-T013; T014 before T020; T026 before T027; T030 before T036.

## Parallel Examples

```text
Phase 1: T003 + T004
Phase 2: T009 + T011 + T015 (after T007-T008)
US1: T017 + T018 + T019
US2 tests: T023 + T024 + T025
US3: T032 + T033 + T034 + T035
US4: T038 + T039
```

## Implementation Strategy

- **MVP**: Phases 1-2 plus US1 and US2 (secure sign-in with enforced denial). Validate with quickstart scenarios 1-4.
- **Incremental**: add US3 (theme and accessibility), then US4 (CI and docs), then Polish.
- Commit after each task or logical group; stop at any checkpoint to validate.

## Notes

- Deferred from scope: audit log viewer, content modules, media, analytics.
- Verify Clerk restricted sign-up availability on the free plan (T029) before relying on it; backend allow-list remains the boundary regardless.
