# External Integrations

**Analysis Date:** 2026-02-17

## APIs & External Services

**LLM/AI:**
- Anthropic Claude API - Core AI engine for brand voice analysis, content generation, and adherence scoring
  - SDK: `@anthropic-ai/sdk` 0.74.0 + `@ai-sdk/anthropic` 3.0.41
  - Auth: `ANTHROPIC_API_KEY` environment variable
  - Models used:
    - `claude-sonnet-4-5-20250929` - Default model for most tasks (via `src/lib/ai/models.ts`)
    - `claude-opus-4-6` - For complex tasks (currently disabled, see `src/lib/ai/models.ts` comments)
  - Endpoints accessed by:
    - `src/app/api/chat/route.ts` - Streaming content generation with brand profile context
    - `src/app/api/training/analyze/route.ts` - Document analysis and brand profile extraction
    - `src/app/api/adherence/route.ts` - Brand voice adherence scoring
    - `src/lib/training/analyze.ts` - Direct SDK usage for background analysis

**Design Systems (Optional):**
- Figma API - Design system extraction and context
  - Auth: `FIGMA_ACCESS_TOKEN` environment variable
  - Endpoint: `https://api.figma.com/v1/files/{fileKey}/nodes`
  - Implementation: `src/app/api/figma/route.ts`
  - Features: Component extraction, text analysis, layout analysis
  - Status: Optional for MVP (no error if token missing, returns 503)

## Data Storage

**Primary Database:**
- Supabase PostgreSQL - All persistent data
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (browser)
  - Admin access: `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - Client initialization:
    - Browser: `src/lib/supabase/client.ts` (uses `createBrowserClient` from `@supabase/ssr`)
    - Server: `src/lib/supabase/server.ts` (uses `createServerClient` from `@supabase/ssr`)

**Database Tables & Schema:**
All tables defined in `supabase/migration.sql`:

- `workspaces` - Workspace container for team collaboration
  - Fields: id, name, created_at, updated_at, settings (JSONB)

- `workspace_members` - User workspace assignments with roles
  - Fields: id, workspace_id, user_id, role (admin|editor), created_at
  - Unique constraint on (workspace_id, user_id)

- `brand_profiles` - Brand voice definitions and training state
  - Fields: id, workspace_id, name, status (draft|training|active|archived), completeness, profile_data (JSONB), active_modules, tier_config, training_sources, created_at, updated_at, created_by

- `platform_standards` - Platform-specific brand guidelines
  - Fields: id, workspace_id, name, type (predefined|custom), category (all|ux_journey|email|sms|push|general), content (JSONB), is_active, created_at, updated_at

- `objectives` - Brand objectives and priorities
  - Fields: id, workspace_id, title, description, priority, is_active, created_at

- `definitions` - Terminology and glossary entries
  - Fields: id, workspace_id, term, definition, created_at, updated_at

- `saved_outputs` - Generated content and adherence scores
  - Fields: id, workspace_id, brand_profile_id, type (ux_journey|email|sms|push), title, content (JSONB), adherence_score (JSONB), objective_scores (JSONB), metadata (JSONB), created_at, created_by

- `training_documents` - Uploaded source documents for brand analysis
  - Fields: id, brand_profile_id, workspace_id, file_name, file_type, file_size, extracted_text, analysis_status, analysis_result (JSONB), created_at

**File Storage:**
- Supabase Storage - Document uploads
  - Used by: `src/app/api/training/upload/route.ts`
  - File types: PDF, DOCX, TXT (extracted via `unpdf` and `mammoth`)
  - Access: Row Level Security controlled by workspace membership

**Caching:**
- None detected - No Redis or external caching service

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Email/password authentication via PostgreSQL `auth.users` table
  - Implementation: Email-based auth enabled at project level
  - Session management: Cookie-based with `@supabase/ssr` helpers
  - Middleware: `src/middleware.ts` refreshes sessions and redirects unauthenticated users

**Auth Flows:**
- Registration: `src/app/api/auth/register/route.ts` → Creates Supabase user + workspace
- Login: `src/app/(auth)/login/page.tsx` → Client-side Supabase auth
- Session check: Middleware validates on every request, refreshes token as needed

**Authorization:**
- Row Level Security (RLS) policies on all tables
- Workspace-scoped data access (users only see their workspace's data)
- Role-based access: admin, editor roles in workspace_members table

## Monitoring & Observability

**Error Tracking:**
- Not detected - No Sentry, LogRocket, or error tracking service

**Logs:**
- Console logs only - `console.error()` used in:
  - `src/app/api/figma/route.ts` - Figma API errors
  - `src/lib/training/analyze.ts` - Analysis errors
- No centralized logging service detected

## CI/CD & Deployment

**Hosting:**
- Vercel - Primary deployment platform
  - Configuration: `vercel.json` defines serverless function durations (60s max)
  - Trigger: GitHub push (no config file detected but standard Vercel + GitHub integration)

**Deployment Target:**
- Edge Runtime - Next.js API routes execute on Vercel's edge network
- Serverless Functions - Long-running operations (training, chat) with 60s timeout

**Environment Management:**
- Vercel project variables (no GitHub Actions CI detected)
- Environment variables added via Vercel dashboard

## Webhooks & Callbacks

**Incoming:**
- POST endpoints accepting:
  - `src/app/api/chat/route.ts` - Chat message streaming
  - `src/app/api/adherence/route.ts` - Adherence scoring requests
  - `src/app/api/training/upload/route.ts` - Document upload + extraction
  - `src/app/api/training/analyze/route.ts` - Document analysis requests
  - `src/app/api/training/delete/route.ts` - Training document deletion
  - `src/app/api/figma/route.ts` - Figma design extraction
  - `src/app/api/auth/register/route.ts` - User registration

**Outgoing:**
- None detected - No webhook callbacks to external services

## Environment Configuration

**Required Environment Variables:**

Public (safe for browser):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (format: `https://[project-id].supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public anon key
- `NEXT_PUBLIC_APP_URL` - Frontend base URL (default: `http://localhost:3000`)

Secret (server-only):
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key for admin operations
- `ANTHROPIC_API_KEY` - Claude API key (format: `sk-...`)

Optional:
- `FIGMA_ACCESS_TOKEN` - Figma personal access token (only required if using design extraction)

**Secrets Location:**
- Development: `.env.local` (git-ignored)
- Production: Vercel Environment Variables dashboard
- Reference: `.env.local.example` in repository root

**Example Configuration Flow:**
```
1. Create Supabase project → copy URL + keys
2. Create Anthropic API key
3. (Optional) Create Figma personal token
4. Set .env.local locally
5. Push to GitHub
6. Add env vars in Vercel dashboard before deploying
```

---

*Integration audit: 2026-02-17*
