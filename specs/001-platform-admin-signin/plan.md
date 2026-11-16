# Implementation Plan: Platform Foundation and Admin Sign-In

**Branch**: `001-platform-admin-signin` | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-platform-admin-signin/spec.md`

## Summary

Stand up the single-repository application skeleton: a Next.js (App Router) app with a placeholder public landing page and a private admin area, Clerk sign-in restricted to the administrator, a Convex backend that validates Clerk tokens, the shared `requireAdmin` guard and audit helper, the single dark theme from the Design System, an empty admin shell (sidebar, user indicator, sign-out, placeholder dashboard), automated authorization tests, CI, and environment documentation. No content modules, media, or audit viewer.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22 LTS

**Primary Dependencies**: Next.js (App Router) + React, Convex, `@clerk/nextjs`, Tailwind CSS, shadcn/ui, `next/font` (Geist, Geist Mono), `lucide-react`

**Storage**: Convex database (only the `auditLogs` table in this feature); R2 not touched

**Testing**: Vitest + `convex-test` (backend authorization and audit tests); ESLint, Prettier check, `tsc --noEmit` in CI. Playwright deferred.

**Target Platform**: Vercel (Next.js), Convex Cloud, Clerk hosted; modern browsers on phone, tablet, desktop

**Project Type**: Web application, single repository (Next.js + Convex)

**Performance Goals**: Sign-in to admin shell under 30 s (SC-001); no numeric page-load targets yet (PRD open question)

**Constraints**: Backend is the security boundary; dark theme only; admin never indexed; free/low-cost tiers; secrets only in env config

**Scale/Scope**: One administrator, three routes (landing, sign-in, admin shell), one table, one guard, one audit helper

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | How the plan satisfies it |
|---|---|---|
| I. Backend is the security boundary | PASS | `requireAdmin` in `convex/lib/auth.ts` is the first call of every `admin*` function; middleware and UI are UX only; audit helper provided |
| II. Published means public | PASS (no content yet) | `adminPing` is separate from any public function; the access-state query leaks nothing |
| III. Media and secrets | PASS | No media; `.env.example` lists names only; separate dev/preview/prod config documented |
| IV. Typed end to end | PASS | Strict TS, argument validators on all functions, `convex/schema.ts` and `convex/lib/validators.ts` |
| V. Minimal, modular, single repo | PASS | One repo; only needed dependencies; Vitest + `convex-test` adopted now because FR-013 requires authorization tests (need written in research.md) |
| VI. Frontend, design, accessibility | PASS | Server-rendered public page, client admin, Design System tokens, focus ring, reduced motion, `noindex` admin |
| VII. Spec-driven and testing | PASS | Authorization tests included; acceptance criteria in spec |

Open item resolved here: package manager = npm (research.md). No violations.

**Post-design re-check (Phase 1)**: unchanged, all PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-platform-admin-signin/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── backend-functions.md
│   └── routes.md
└── tasks.md             # created by /speckit-tasks
```

### Source Code (repository root)

```text
app/
├── layout.tsx                    # <html className="dark">, Geist fonts, providers
├── globals.css                   # design tokens (single dark theme)
├── page.tsx                      # public "coming soon" placeholder
├── robots.ts                     # disallow /admin
├── sign-in/[[...sign-in]]/page.tsx
└── admin/
    ├── layout.tsx                # noindex metadata + access gate + shell
    └── page.tsx                  # placeholder dashboard
components/
├── ui/                           # shadcn: button, card, skeleton, sidebar, separator
├── providers/convex-client-provider.tsx
└── admin/{admin-sidebar,user-menu,access-gate}.tsx
convex/
├── schema.ts                     # auditLogs table
├── auth.config.ts                # Clerk issuer for token validation
├── access.ts                     # `current` query (admin | denied | unauthenticated)
├── admin.ts                      # `adminPing` sample admin function
└── lib/
    ├── auth.ts                   # requireAdmin
    ├── audit.ts                  # writeAudit helper
    └── validators.ts
lib/utils.ts
proxy.ts                          # Clerk middleware: protect /admin (middleware.ts on older Next)
tests/convex/{auth,audit}.test.ts
.github/workflows/ci.yml
.env.example
```

**Structure Decision**: Single web-application repo following the Tech Stack's proposed layout; route groups arrive with public modules (`app/page.tsx` is the lone public route now).

## Complexity Tracking

No constitution violations to justify.
