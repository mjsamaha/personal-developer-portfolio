<!--
Sync Impact Report
Version change: (unversioned template) → 1.0.0
Modified principles: none renamed (all principles newly defined)
Added sections: Core Principles I–VII, Technology & Delivery Constraints,
  Development Workflow & Quality Gates, Governance
Removed sections: none
Source docs: docs/Engineering Principles.md (primary), Data Model and Schema Conventions.md,
  Design System.md, Product Requirements.md, Tech Stack (v2).md,
  High-level application overview (v2).md
Follow-up TODOs:
  - TODO(PACKAGE_MANAGER): resolved in feature 001 (npm); update the constitution text in a PATCH amendment.
  - TODO(TEST_TOOLING): choose Vitest / convex-test / Playwright at Milestone 14.
  - TODO(REVIEW_STATUS): decide whether "review" is an enforced step or only a label.
  - Note: the request referenced docs/Tech_Stack_v2.md and High-Level_Overview_v2.md; the
    actual files are "Tech Stack (v2).md" and "High-level application overview (v2).md".
-->
# Personal Developer Portfolio Constitution

## Core Principles

### I. Backend Is the Security Boundary (NON-NEGOTIABLE)
- Every admin query, mutation, and action MUST call the shared `requireAdmin` check before
  doing anything else.
- Next.js middleware, Clerk components, and hidden UI are UX only. They MUST NOT be the only
  protection for any operation.
- Admin identity MUST come from the verified Clerk token (role claim or allowed Clerk user ID).
  There is no `adminUsers` table at launch.
- Every administrative change MUST write an `auditLogs` record through the shared audit helper,
  logging what changed (action, entity, field names), never full bodies, tokens, or credentials.

Rationale: authorization that lives in the UI can be bypassed by calling the backend directly.

### II. Published Means Public (NON-NEGOTIABLE)
- Public queries and admin queries MUST be separate functions.
- Public queries MUST filter on `status == "published"` using the `status` index.
- Draft, review, and archived content, and the media it references, MUST NOT be returned by a
  public query.
- Child records MUST inherit visibility from their parent (for example a documentation page
  query MUST also confirm its space is published).
- Every content table MUST carry a `status` field and an index starting with `status`.
- Archived is the soft delete; hard delete is allowed for drafts only.

Rationale: unpublished content leaking publicly is the highest-impact failure for this site.

### III. Media and Secrets Handling
- Image bytes MUST live only in Cloudflare R2; metadata and relationships live in Convex
  (`mediaAssets`). Convex MUST NOT store image or file bytes.
- Upload URLs MUST be issued only to the administrator from an admin-checked mutation.
- Object keys MUST be random (for example UUIDs plus extension), never derived from filenames
  or titles.
- Public pages MUST receive image URLs only through queries that return published content.
- Alt text MUST be present for any image shown on a public page.
- Raw EXIF MUST NOT be rendered publicly; public display uses curated fields. Precise
  coordinates MUST NOT be stored at launch (free-text location label only).
- Secrets (R2 credentials, Clerk keys) MUST live only in Convex/Vercel environment
  configuration and MUST NOT be committed. Money, secrets, and credentials MUST NOT be stored
  in content tables.
- Development, preview, and production MUST use separate Clerk instances, Convex deployments,
  and R2 buckets. The repo MUST include a `.env.example` listing variable names only.
- Store web-quality masters (long edge roughly 3000–4000 px); RAW files MUST NOT be stored.

### IV. Typed End to End, Schema as Source of Truth
- TypeScript strict mode MUST be on. `any` and non-null assertions MUST carry a comment
  explaining why.
- All Convex functions MUST declare argument validators. `schema.ts` is the single source of
  truth for table shapes; shared validators live in one place (e.g. `convex/lib/validators.ts`).
- Admin forms SHOULD validate with shapes mirroring the backend validators (e.g. `zod`).
- Schema changes MUST follow widen, backfill, tighten; widening and tightening MUST NOT occur
  in the same deploy.
- Every filtering query MUST use an index; tables MUST NOT be scanned and filtered in code.
  Queries SHOULD return only the fields a page needs.
- Slugs MUST be lowercase, hyphenated ASCII, and create/update mutations MUST check the
  `by_slug` index in the same transaction and reject duplicates.
- Markdown fields MUST be stored as plain Markdown, never HTML. Optional values MUST use
  `v.optional(...)`, not `null`. Searchable tables MUST build `searchText` through the one
  shared helper.
- Naming: tables camelCase plural; fields camelCase; ID fields end in `Id`/`Ids`; indexes
  `by_` + fields; search indexes `search_` + purpose.

### V. Minimal, Modular, Single Repository
- The whole application (Next.js, Convex, docs, CI) MUST live in one repository with no
  separate backend service to build, host, or version.
- A new service, library, or pattern MUST have a concrete need written down before it is
  added. Items marked _(candidate)_ in the Tech Stack are adopted only at the milestone that
  needs them. No table, index, field, or token exists "just in case".
- Each module MUST have its own Convex file(s) and Next.js route group; shared infrastructure
  (auth, media, audit logging) MUST live in shared files, not be copied into modules.
- Contributors MUST follow existing repo conventions and MUST NOT introduce a second way to do
  something that already has a pattern.

### VI. Frontend, Design, and Accessibility
- Public pages MUST be server-rendered (Server Components with ISR/revalidation,
  `generateMetadata`, generated sitemap, `robots`). The admin portal is client-rendered and
  MUST NOT be indexed.
- UI MUST use shadcn/ui and Tailwind; content images MUST use `next/image`.
- The design is a single dark theme shared by public and admin portals: no light mode, toggle,
  or theme provider. Colors MUST come from the documented tokens in `docs/Design System.md`;
  warm colors are for semantic status only; pure white text MUST NOT be used.
- Accent and dark blue MUST NOT appear behind or around photographs; placeholders are neutral.
- Public pages MUST meet baseline accessibility: semantic HTML, keyboard access, WCAG AA
  contrast, visible focus ring (never removed), responsive layout, and color never the only
  signal. Motion MUST be minimal and respect reduced-motion.
- Documentation and articles are authored in Markdown (textarea with live preview first;
  richer editor only when a real need appears).

### VII. Spec-Driven Development and Testing
- Every feature MUST go through Spec Kit: constitution, specify, clarify, plan, tasks, analyze,
  implement. Specs describe what and why; plans describe how and MUST respect this document.
- When a plan conflicts with a principle, the plan MUST change or the principle MUST be
  amended through Governance; it MUST NOT be quietly ignored.
- Authorization and published-only rules MUST have automated tests: admin functions reject
  non-admins, and public queries never return non-published content.
- Every feature spec MUST state acceptance criteria verifiable by a test or manual check.
- Project documentation lives under `docs/` and MUST be updated in the same pull request as
  the change it describes.

## Technology & Delivery Constraints

- Stack: Next.js (App Router), React, TypeScript, Convex (queries, mutations, actions), Clerk
  (Google SSO, JWT validated by Convex, single `admin` role), Cloudflare R2 via
  `@convex-dev/r2`, Tailwind, shadcn/ui, Vercel hosting, GitHub Actions CI.
- Icons: Phosphor or Lucide. Animations: Motion.dev. Charts: Recharts (or Evil Charts) if
  needed. Test tooling is chosen at Milestone 14 from Vitest, `convex-test`, Playwright.
- Spending limits or alerts MUST be set on Convex, Vercel, and Cloudflare before launch.
  Free-tier figures in docs are approximate and MUST be re-checked against live pricing.
- Production MUST use HTTPS, environment-based secrets, backups, and error monitoring.
- Visitors have no accounts at launch; page-view analytics are deferred.

## Development Workflow & Quality Gates

- CI MUST pass before merge: ESLint, Prettier check, `tsc --noEmit`, tests, and a production
  build. `main` MUST always be deployable.
- Changes MUST be small and reviewable: one feature or fix per pull request.
- Every pull request gets a Vercel preview deployment.
- Notable decisions MUST be recorded in a short decision log (the Key Decisions tables in the
  Tech Stack are the starting point).
- Pending decisions (package manager, test tooling and coverage bar, whether `Review` status
  is enforced) MUST be resolved and recorded before they are relied upon.

## Governance

- This constitution overrides feature plans and convenience.
- A **SHOULD** can be overridden when the reason is recorded in the spec or an ADR entry.
- A **MUST** changes only by amending this document in its own pull request, stating what
  changes and why.
- Versioning follows semantic versioning: MAJOR for backward-incompatible principle removals
  or redefinitions, MINOR for added or materially expanded principles/sections, PATCH for
  clarifications and wording.
- Pull request reviews MUST verify compliance with this constitution; deviations MUST be
  justified in the spec, plan, or ADR.

**Version**: 1.0.0 | **Ratified**: 2026-11-15 | **Last Amended**: 2026-11-15
