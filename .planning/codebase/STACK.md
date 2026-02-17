# Technology Stack

**Analysis Date:** 2026-02-17

## Languages

**Primary:**
- TypeScript 5 - All source code, frontend and backend
- JavaScript (JSX/TSX) - React components and Next.js pages

**Secondary:**
- SQL - Supabase database operations via migrations (`supabase/migration.sql`)

## Runtime

**Environment:**
- Node.js (version specified by `.nvmrc` if present, otherwise latest stable)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present and up-to-date as of Feb 16, 2025)

## Frameworks

**Core:**
- Next.js 14.2.35 - Full-stack React framework with App Router
  - Server Components (`src/app/api/*` routes)
  - Client Components (pages under `src/app/(auth)` and `src/app/(dashboard)`)
  - API routes with 60s max duration for long operations (`vercel.json`)

**UI & Styling:**
- React 18 - Component library and hooks
- Tailwind CSS 3.4.1 - Utility-first CSS framework
- Radix UI (multiple packages) - Headless component primitives
  - `@radix-ui/react-alert-dialog`
  - `@radix-ui/react-avatar`
  - `@radix-ui/react-dialog`
  - `@radix-ui/react-dropdown-menu`
  - `@radix-ui/react-label`
  - `@radix-ui/react-progress`
  - `@radix-ui/react-scroll-area`
  - `@radix-ui/react-select`
  - `@radix-ui/react-separator`
  - `@radix-ui/react-slot`
  - `@radix-ui/react-switch`
  - `@radix-ui/react-tabs`
  - `@radix-ui/react-tooltip`
- Lucide React 0.563.0 - Icon library
- Framer Motion 12.34.0 - Animation library
- Sonner 2.0.7 - Toast notification library
- class-variance-authority 0.7.1 - CSS utility composition

**AI & LLM:**
- Vercel AI SDK 6.0.79 - Unified AI interface
  - `@ai-sdk/anthropic` 3.0.41 - Anthropic Claude integration
  - `@ai-sdk/react` 3.0.83 - React hooks for streaming (`useChat`)
- Anthropic SDK (`@anthropic-ai/sdk`) 0.74.0 - Direct Claude API access for analysis

**Data & State:**
- Zod 4.3.6 - TypeScript-first schema validation

**Database:**
- Supabase (@supabase/supabase-js) 2.95.3 - PostgreSQL client with Auth + Storage
- @supabase/ssr 0.8.0 - Server-side auth helpers for Next.js

**File Processing:**
- unpdf 1.4.0 - PDF text extraction
- mammoth 1.11.0 - Word document (.docx) conversion to HTML

**Utilities:**
- date-fns 4.1.0 - Date manipulation
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.4.0 - Merge Tailwind CSS classes intelligently

## Key Dependencies

**Critical:**
- `@ai-sdk/anthropic` + `@anthropic-ai/sdk` - Primary AI backbone for brand voice analysis, content generation, and adherence scoring
- `@supabase/supabase-js` + `@supabase/ssr` - Authentication, data persistence, file storage, and Row Level Security
- `ai` (Vercel SDK) - Streaming responses and real-time chat interface
- `next` - Server-side rendering, API routes, and full-stack framework

**Infrastructure:**
- `unpdf` - Enables document analysis from PDFs
- `mammoth` - Enables document analysis from Word documents (.docx)
- Radix UI - Accessible component foundation preventing UI bugs

## Configuration

**Environment:**
- `.env.local.example` defines required environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public, browser-safe)
  - `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key (secret, server-only)
  - `ANTHROPIC_API_KEY` - Claude API key (secret, server-only)
  - `FIGMA_ACCESS_TOKEN` - Figma API token for design extraction (optional)
  - `NEXT_PUBLIC_APP_URL` - Frontend URL (defaults to http://localhost:3000)

**Build:**
- `tsconfig.json` - TypeScript configuration with path aliases (`@/*` → `./src/*`)
- `next.config.js` - Configures:
  - Server component external packages: `unpdf`
  - Remote image patterns for Supabase CDN (*.supabase.co)
  - TypeScript strict mode (errors not ignored)
  - ESLint build warnings ignored
- `.eslintrc.json` - ESLint config extends Next.js core-web-vitals
- `tailwind.config.ts` - Dark mode support (class-based), custom color system
- `postcss.config.mjs` - PostCSS configured for Tailwind CSS processing

**Deployment:**
- `vercel.json` - Serverless function configurations with 60s timeouts for:
  - Chat streaming
  - Training document analysis
  - PDF/document upload processing
  - Adherence scoring

## Platform Requirements

**Development:**
- Node.js 18+ (TypeScript 5 compatibility)
- npm for dependency management
- Modern browser with ES2020+ support
- Local environment variables file (`.env.local`)

**Production:**
- Vercel hosting (primary deployment target)
- Supabase cloud project
- Anthropic API key with Claude access
- (Optional) Figma API token for design extraction feature

---

*Stack analysis: 2026-02-17*
