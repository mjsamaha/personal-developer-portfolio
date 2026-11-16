# Personal Developer Portfolio

A full-stack portfolio platform for sharing professional experience, software projects, technical writing, and photography. The long-term goal is to manage and publish content through a private admin portal without changing application code.

**Project status:** The application is in its foundation stage. The public homepage is currently a “Coming soon” placeholder, and the admin sign-in and application shell are being established. The content modules described below are planned; they are not all implemented yet.

## Vision

The finished site is intended to include:

- **Professional portfolio** — biography, experience, education, skills, certifications, resume, and contact links.
- **Project showcase** — project pages with technology details, images, source repositories, and live demos.
- **Developer documentation** — project spaces and searchable, Markdown-based technical documentation.
- **Articles** — technical articles, tutorials, and discussions authored by the site owner.
- **Photography** — galleries for bird, wildlife, nature, and general photography.
- **Private administration** — a CMS for managing content and media, with draft, review, published, and archived states.

Public visitors will be able to browse published content without an account. Administrative access is intended for the site owner.

## Technology

- [Next.js](https://nextjs.org/) App Router, React, and TypeScript
- [Tailwind CSS](https://tailwindcss.com/) and locally maintained shadcn/ui components
- [Convex](https://www.convex.dev/) for the database and backend functions
- [Clerk](https://clerk.com/) for authentication
- Planned: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) for image and media storage
- Planned hosting: [Vercel](https://vercel.com/) for the web application and Convex Cloud for the backend

Sensitive authorization is designed to be enforced by Convex functions, not only by hiding or protecting interface routes. Public queries will expose published content only.

## Getting started

### Prerequisites

- Node.js 22 or later
- npm
- Development credentials and deployments for Clerk and Convex

### Installation

```bash
git clone https://github.com/mjsamaha/personal-developer-portfolio.git
cd personal-developer-portfolio
npm install
```

Copy `.env.example` to `.env.local` and fill in the values for your development environment. Keep `.env.local` private and never commit credentials.

```bash
cp .env.example .env.local
```

The template lists these Next.js environment variable names:

```text
NEXT_PUBLIC_CONVEX_URL
CONVEX_DEPLOYMENT
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
```

Configure the Convex environment variables separately using the Convex CLI:

```text
CLERK_JWT_ISSUER_DOMAIN
ADMIN_CLERK_USER_IDS
```

`ADMIN_CLERK_USER_IDS` is a comma-separated list of authorized Clerk user IDs. Configure the Clerk JWT issuer to match the Clerk instance used by your Convex deployment. Use separate development, preview, and production credentials and deployments.

### Run locally

Start Convex in one terminal so it can sync the schema and backend functions:

```bash
npx convex dev
```

Start the Next.js development server in another terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The local site requires valid Clerk and Convex configuration to use integrated authentication and backend features.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run format:check` | Check formatting with Prettier |
| `npm run format` | Format supported files with Prettier |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |
| `npm test` | Run the Vitest test suite |

## Repository layout

```text
app/          Next.js routes, layouts, and global styles
components/   Shared UI and admin components
convex/       Convex schema, functions, and shared authorization helpers
docs/         Product, architecture, design, and engineering documentation
specs/        Feature specifications, plans, and implementation tasks
tests/        Automated tests
public/       Static assets
```

## Project documentation

- [High-level application overview](docs/High-level%20application%20overview%20(v2).md)
- [Product requirements](docs/Product%20Requirements.md)
- [Technology stack](docs/Tech%20Stack%20(v2).md)
- [Design system](docs/Design%20System.md)
- [Engineering principles](docs/Engineering%20Principles.md)
- [Data model and schema conventions](docs/Data%20Model%20and%20Schema%20Conventions.md)
- [Platform and admin sign-in feature spec](specs/001-platform-admin-signin/spec.md)

## Security and configuration

- Do not commit `.env.local`, service credentials, or deployment secrets.
- Keep development, preview, and production service configuration separate.
- Admin authorization belongs in backend functions; route protection improves the user experience but is not the security boundary.
- Public-facing data access should return published content only.

See the [engineering principles](docs/Engineering%20Principles.md) and [feature specification](specs/001-platform-admin-signin/spec.md) for the project’s security requirements and implementation scope.

## License

See [LICENSE](LICENSE).
