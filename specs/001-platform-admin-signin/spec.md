# Feature Specification: Platform Foundation and Admin Sign-In

**Feature Branch**: `001-platform-admin-signin`

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "Platform foundation and admin sign-in: a Next.js app with Clerk sign-in, Convex backend, requireAdmin protection, shared dark theme, and an empty admin shell. See docs/Product Requirements.md and docs/Design System.md."

## Clarifications

### Session 2026-11-15

- Q: Should sign-in be open to any Google account or limited to the administrator? → A: Sign-in is restricted to the administrator only.
- Q: Should this feature include an audit log viewer or only the recording mechanism? → A: Recording mechanism only; the viewer is deferred to a later feature.
- Q: What should the public landing page show? → A: A static "coming soon" placeholder with no sign-in link.
- Q: What happens when the session expires or the administrator signs out while in the admin shell? → A: They are redirected straight to the sign-in page.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Administrator signs in and reaches the admin area (Priority: P1)

The administrator opens the private admin area, signs in with the approved sign-in method, and lands in an empty admin shell (navigation frame with a placeholder dashboard) ready for later modules to plug into.

**Why this priority**: Every later content-management feature depends on a secure, working admin entry point (PRD ADM-01).

**Independent Test**: Visit the admin area while signed out, sign in as the administrator, and confirm the admin shell appears; sign out and confirm access is lost.

**Acceptance Scenarios**:

1. **Given** a signed-out visitor, **When** they open any admin address, **Then** they are directed to sign in and see no admin content.
2. **Given** the administrator on the sign-in page, **When** they complete sign-in, **Then** they land in the admin shell showing their signed-in state and a sign-out control.
3. **Given** a signed-in administrator, **When** they sign out, **Then** admin addresses require sign-in again.

---

### User Story 2 - Everyone else is denied, even when bypassing the interface (Priority: P1)

A person who is not the administrator (signed-out or signed in with a different account) cannot view admin content or perform any admin action, including by calling the backend directly.

**Why this priority**: The constitution makes the backend the security boundary (NON-NEGOTIABLE); PRD ADM-01 requires denial to hold without the UI.

**Independent Test**: Call a protected backend function (a sample admin-only function) as signed-out, as a non-admin signed-in user, and as the administrator; only the last succeeds.

**Acceptance Scenarios**:

1. **Given** a signed-out caller, **When** they invoke an admin-only backend function directly, **Then** it is rejected and returns no data.
2. **Given** a non-admin account that somehow holds a session, **When** they open the admin area or invoke an admin-only function, **Then** they see an access-denied message and the function is rejected.
3. **Given** a person with a non-administrator Google account, **When** they attempt to sign up or sign in, **Then** the attempt is refused and no account or session is created.
4. **Given** the administrator, **When** they invoke an admin-only function, **Then** it succeeds.

---

### User Story 3 - Consistent dark theme across public and admin (Priority: P2)

Visitors and the administrator see one shared dark visual theme (near-black neutral base, light-blue interactive accent, deep-blue selected surfaces) on a minimal public landing page and on the admin shell.

**Why this priority**: Establishes the shared look every module inherits (Design System), but is secondary to access control.

**Independent Test**: Open the public landing page and admin shell and compare against the documented palette, focus ring, and contrast rules.

**Acceptance Scenarios**:

1. **Given** any public or admin page, **When** it loads, **Then** it uses only the dark theme with no light mode or toggle.
2. **Given** any interactive element, **When** it receives keyboard focus, **Then** a visible focus ring appears.
3. **Given** the admin shell, **When** viewed on phone, tablet, and desktop widths, **Then** layout remains usable and readable.

---

### User Story 4 - Project can be set up and deployed from the repository (Priority: P3)

A developer can clone the repository, configure documented environment variables, run the app locally, and have every change checked automatically before merge.

**Why this priority**: Enables all later work; delivers no visitor-facing value itself.

**Independent Test**: On a clean machine, follow the setup steps and reach the working sign-in page; open a pull request and see automated checks and a preview run.

**Acceptance Scenarios**:

1. **Given** a fresh clone, **When** the developer follows the documented setup using a variable template listing names only, **Then** the app runs locally with sign-in working.
2. **Given** a pull request, **When** it is opened, **Then** automated checks (lint, formatting, type-check, tests, build) run and a preview deployment is produced.

### Edge Cases

- A session expires while the administrator is in the admin shell: they are redirected straight to the sign-in page, and admin operations are rejected in the meantime.
- The administrator's account is removed or loses admin status: subsequent admin calls are rejected immediately.
- Sign-in is cancelled or fails at the identity provider: the user sees a clear message and remains signed out.
- A non-admin obtains a session despite sign-in restrictions (for example, a misconfiguration): they are shown access denied, not an error page or partial admin content.
- Direct requests to nonexistent admin addresses behave the same as other admin addresses (sign-in required first).
- Admin pages are never indexed by search engines.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a public landing page (a static "coming soon" placeholder with no link to sign in) and a separate private admin area, sharing one visual theme.
- **FR-002**: The system MUST require sign-in to view any admin address and redirect signed-out users to sign in.
- **FR-003**: The system MUST allow the administrator to sign in with Google single sign-on and to sign out, and MUST refuse sign-up and sign-in for any other account.
- **FR-004**: The system MUST identify the administrator from the verified identity token (role claim or allow-listed user ID); no separate admin user table.
- **FR-005**: Every admin backend operation MUST perform a shared administrator check before doing anything else, and reject non-administrators and signed-out callers.
- **FR-006**: The interface MUST show an access-denied message to any non-administrator who still obtains a session, treating the interface as convenience only and not as protection.
- **FR-007**: The system MUST provide an empty admin shell with navigation frame, signed-in user indicator, sign-out control, and a placeholder dashboard for later modules.
- **FR-008**: The system MUST include at least one sample admin-only operation to demonstrate and test the protection.
- **FR-009**: The system MUST apply the single dark theme using the documented Design System tokens, with no light mode, toggle, or theme provider.
- **FR-010**: Interactive elements MUST show a visible focus ring, and text and controls MUST meet WCAG AA contrast.
- **FR-011**: Layouts MUST work on phone, tablet, and desktop.
- **FR-012**: Admin pages MUST be excluded from search-engine indexing.
- **FR-013**: Automated tests MUST verify that admin operations reject signed-out and non-admin callers and accept the administrator.
- **FR-014**: The repository MUST include a variable template listing every required setting name (no values) and setup documentation; secrets MUST NOT be committed.
- **FR-015**: Development, preview, and production MUST use separate identity, backend, and storage configurations.
- **FR-016**: Every pull request MUST run automated checks (lint, formatting, type-check, tests, build) and receive a preview deployment.
- **FR-017**: Administrative actions that change data MUST be recorded via a shared audit mechanism; this feature MUST provide that shared mechanism for later modules. A screen for viewing the log is out of scope.

### Key Entities

- **Administrator**: The single trusted person identified by the verified sign-in identity; no stored user record.
- **Session**: A signed-in period established by the identity provider; ends on sign-out or expiry.
- **Audit Record**: An entry of who did what and when for an administrative change (action, entity, field names; never bodies or secrets). Only the shared mechanism is in scope here.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The administrator can go from the sign-in page to the admin shell in under 30 seconds.
- **SC-002**: 100% of tested attempts by signed-out or non-admin callers to use admin operations (via interface or direct calls) are denied.
- **SC-003**: 100% of public and admin pages use the single dark theme and meet the documented contrast thresholds (4.5:1 text, 3:1 controls).
- **SC-004**: Keyboard-only users can reach and operate every control in the admin shell, with focus always visible.
- **SC-005**: The admin shell is usable without horizontal scrolling at phone, tablet, and desktop widths.
- **SC-006**: A new developer can run the app locally from the documentation in under 30 minutes.
- **SC-007**: 100% of pull requests run all automated checks before merge is possible.

## Assumptions

- Google single sign-on is the intended admin method (PRD open question; to be confirmed but assumed).
- There is exactly one administrator at launch; the editor role is reserved for later and out of scope.
- Visitors have no accounts; the public landing page is a "coming soon" placeholder, not real content.
- No content modules (portfolio, projects, docs, articles, photos), media handling, or dashboard data are included.
- The package manager choice is an open decision and will be settled during planning.
- Separate development, preview, and production services are available to be provisioned.
