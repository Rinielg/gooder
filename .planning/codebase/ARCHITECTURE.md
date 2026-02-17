# Architecture

**Analysis Date:** 2026-02-17

## Pattern Overview

**Overall:** Next.js 14 full-stack application with multi-agent AI backend and workspace-based data model

**Key Characteristics:**
- Three-tier AI agent system: Output Agent (content generation), Adherence Agent (scoring), Setup Agent (training)
- Workspace-scoped data model with role-based access control
- Server-side Supabase authentication via middleware
- Real-time streaming responses for chat interface
- Profile-driven context injection for AI model prompts
- Modular brand voice framework with layered abstraction

## Layers

**Presentation Layer (Next.js Pages & Components):**
- Purpose: User interface and page layouts
- Location: `src/app/` (pages), `src/components/` (reusable components)
- Contains: Server Components (layouts), Client Components (interactive features), UI primitives (buttons, inputs, forms)
- Depends on: Supabase client, API routes, utility functions
- Used by: Browser clients

**API Layer (Route Handlers):**
- Purpose: Backend logic, data validation, orchestration
- Location: `src/app/api/`
- Contains: RESTful endpoints for chat, adherence scoring, training management, profile CRUD, file uploads, authentication
- Depends on: Supabase (database, auth), Anthropic SDK, document extraction libraries, training analysis module
- Used by: Frontend pages, client-side fetch requests

**AI Agent Layer:**
- Purpose: Intelligent text generation, scoring, and profile training
- Location: `src/lib/ai/` (model selection, prompts, agents)
- Contains:
  - Model selection logic (`src/lib/ai/models.ts` - Sonnet 4.5 primary, Opus 4.6 available)
  - System prompts for Output Agent, Adherence Agent, Setup Agent (`src/lib/ai/prompts/system.ts`, `src/lib/ai/prompts/title.ts`)
  - Agent specifications (prompt construction for specialized tasks)
- Depends on: Anthropic SDK, AI Vercel SDK (`ai` package for streaming)
- Used by: `/api/chat`, `/api/adherence`, `/api/training/analyze`

**Data Layer (Supabase):**
- Purpose: Persistent data storage, authentication, real-time subscriptions
- Location: `src/lib/supabase/` (client factories)
- Contains:
  - Server client (`createClient()` - uses cookies for session management)
  - Service client (`createServiceClient()` - uses service role key for admin operations)
  - Browser client (`createClient()` from `src/lib/supabase/client.ts`)
- Depends on: @supabase/ssr, @supabase/supabase-js
- Used by: All API routes, middleware, client components

**Training & Analysis Layer:**
- Purpose: Document extraction, brand profile analysis, data merging
- Location: `src/lib/training/`
- Contains:
  - `analyze.ts`: Claude-powered brand voice extraction from documents
  - `merge.ts`: Merging extracted profile data with existing profiles
  - `completeness.ts`: Calculating profile completeness percentage
- Depends on: Anthropic SDK, document parsing libraries (unpdf, mammoth)
- Used by: `/api/training/upload`, `/api/training/analyze`

**Type System:**
- Purpose: Centralized type definitions for type safety
- Location: `src/types/index.ts`
- Contains: 25+ types for Users, Workspaces, BrandProfiles, Documents, Standards, Objectives, Outputs, Scoring, etc.
- Used by: All layers for compile-time type checking

**Utilities:**
- Purpose: Shared helper functions
- Location: `src/lib/utils.ts`
- Contains: `cn()` (className merger), `generateId()`, `formatDate()`, `truncate()`, `sanitizeInput()`, `wrapInXmlTag()`
- Used by: Components, API routes, prompt builders

## Data Flow

**User Authentication & Session:**
1. User submits credentials to `/api/auth/register` or login page
2. Supabase handles auth (password hashing, JWT)
3. Middleware (`src/middleware.ts`) intercepts requests, checks Supabase session
4. Protected routes redirect unauthenticated users to `/login`
5. Authenticated users redirected to `/chat` (default dashboard)
6. Session persists via cookies managed by `@supabase/ssr`

**Content Generation (Chat):**
1. Frontend sends message + profileId to `/api/chat` (POST)
2. Route handler validates auth, loads user's workspace
3. Parallel data fetch: brand profile, standards, objectives, definitions, training documents
4. System prompt builder constructs comprehensive context (`buildSystemPrompt()`)
5. Model selection logic chooses Claude model (Sonnet 4.5 default, Opus available)
6. `streamText()` from Vercel AI SDK streams response in real-time
7. Response serialized to `UIMessageStreamResponse()` for browser consumption
8. Frontend displays streamed text as it arrives

**Brand Profile Training:**
1. User uploads document to `/api/training/upload` (POST multipart)
2. File validated (type, size)
3. Text extracted via:
   - Plain text/Markdown: Direct read
   - PDF: `unpdf` library
   - DOCX: `mammoth` library
4. Extracted text stored in `training_documents` table
5. Trigger calls `/api/training/analyze` via client-side request
6. Analysis route calls `analyzeDocument()` which:
   - Loads current profile
   - Calls Claude with structured analysis prompt
   - Parses JSON response for extracted fields
   - Merges extracted data into profile (`mergeProfileData()`)
   - Calculates new completeness score
   - Updates profile status (draft → training → active)
   - Upserts new terminology definitions
7. Response sent back to client with completeness, fields populated, gaps

**Content Adherence Scoring:**
1. Frontend sends generated content + profileId to `/api/adherence` (POST)
2. Route loads profile, standards, objectives, definitions
3. Builds adherence scoring prompt (`buildAdherencePrompt()`)
4. Calls Claude Sonnet with scoring schema
5. Parses 8-dimensional scores from JSON response
6. Calculates weighted overall score
7. Determines pass/fail based on compliance dimension and thresholds
8. Returns `AdherenceScore` object with flags, suggestions
9. Frontend displays score with visual indicators

**State Management:**
- **Authentication state**: Managed by Supabase, persisted in cookies, checked via middleware
- **Workspace data**: Loaded once in dashboard layout (`src/app/(dashboard)/layout.tsx`), stored in React state + localStorage
- **Active profile**: Stored in localStorage with key `bvp_active_profile`, synced across pages via custom events (`bvp-profile-change`)
- **Chat history**: Managed client-side by Vercel AI SDK (useChat hook pattern)
- **UI state**: Local React state in components

## Key Abstractions

**BrandProfile (Core Entity):**
- Purpose: Encapsulates complete brand voice definition
- Definition: `src/types/index.ts` lines 24-36
- Pattern: Nested JSON structure with layered voice components
- Layers:
  - `voice_identity`: Pillars, archetype, spectrum (foundational)
  - `tone_architecture`: Situational tones, emotional gradients
  - `lifecycle_language`: Stage-specific language patterns
  - `grammar_style`, `channel_adaptation`, `governance`: Refinements
- Completeness: Numeric score (0-100) indicating profile maturity
- Status: draft → training → active → archived

**System Prompt (Context Injection):**
- Purpose: Single source of truth for brand voice application
- Definition: `buildSystemPrompt()` in `src/lib/ai/prompts/system.ts`
- Pattern: Multi-section text document assembled from:
  - Brand profile data (voice, tone, lifecycle)
  - Platform standards (mandatory rules)
  - Business objectives (scoring criteria)
  - Definitions glossary (terminology)
  - Figma frames (visual context)
  - Training documents (reference materials)
  - Tone Decision Tree (8-step reasoning framework)
- Injection: Passed to Claude as `system` parameter in `streamText()` call
- Size: Variable, typically 10K-50K tokens depending on profile completeness

**Adherence Score (Multi-Dimensional):**
- Purpose: Quantify content quality across 8 dimensions
- Definition: `AdherenceScore` in `src/types/index.ts` lines 211-226
- Pattern: 8 weighted dimension scores + flags + suggestions
- Dimensions:
  1. voice_consistency (20% weight)
  2. tone_accuracy (15%)
  3. compliance (20%) - critical, auto-fail if < 7
  4. terminology (10%)
  5. platform_optimization (10%)
  6. objective_alignment (10%)
  7. pattern_adherence (10%)
  8. overall_quality (5%)
- Calculation: Weighted average, rounded to 0-100, pass threshold = 70
- Flags: Per-dimension issues with severity levels (info, warning, fail, automatic_fail)

**Workspace (Multi-Tenancy):**
- Purpose: Organizational boundary for all data
- Definition: `Workspace` type in `src/types/index.ts` lines 13-19
- Pattern: Every user belongs to exactly one workspace, all data scoped by workspace_id
- Access: Via `workspace_members` join table with role-based permissions (admin, editor)
- Isolation: Database queries filter by `workspace_id` to prevent cross-tenant access

## Entry Points

**Root Page:**
- Location: `src/app/page.tsx`
- Triggers: User navigates to `/`
- Responsibilities: Redirects to `/chat` (default dashboard)

**Authentication Pages:**
- Location: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
- Triggers: User visits `/login` or `/register` without auth session
- Responsibilities: Form submission to Supabase, session creation, redirect to `/chat` on success

**Dashboard Layout:**
- Location: `src/app/(dashboard)/layout.tsx`
- Triggers: Authenticated user accesses any dashboard route
- Responsibilities:
  - Loads workspace and brand profiles
  - Restores active profile from localStorage
  - Renders sidebar navigation
  - Provides profile context to child pages
  - Uses `'use client'` to manage client state

**Chat Interface:**
- Location: `src/app/(dashboard)/chat/page.tsx`
- Triggers: User navigates to `/chat`
- Responsibilities: Renders message history, input form, streaming responses
- Uses Vercel AI SDK `useChat()` hook for message management

**Profile Management:**
- Location: `src/app/(dashboard)/profiles/page.tsx`, `src/app/(dashboard)/profiles/[id]/page.tsx`, `src/app/(dashboard)/profiles/[id]/train/page.tsx`
- Triggers: User navigates to `/profiles/*`
- Responsibilities: List profiles, view profile details, upload training documents

**API Chat Route:**
- Location: `src/app/api/chat/route.ts`
- Triggers: POST request from `/chat` page
- Responsibilities:
  - Validate authentication
  - Load brand profile and context data
  - Select AI model
  - Build system prompt
  - Stream Claude response
  - Error handling

**API Training Routes:**
- Location: `src/app/api/training/upload/route.ts`, `src/app/api/training/analyze/route.ts`
- Triggers: POST requests from profile training page
- Responsibilities: Extract documents, analyze brand voice, update profile, calculate completeness

**API Adherence Route:**
- Location: `src/app/api/adherence/route.ts`
- Triggers: POST request from chat or outputs page
- Responsibilities: Score generated content against brand profile, return multi-dimensional scores

**Middleware:**
- Location: `src/middleware.ts`
- Triggers: Every HTTP request (matched by config)
- Responsibilities: Check auth session, redirect to login if needed, refresh session cookies

## Error Handling

**Strategy:** Try-catch at route handler level with consistent error response format

**Patterns:**
- Auth errors: Return 401 "Unauthorized"
- Validation errors: Return 400 with specific error message
- Not found errors: Return 404 or 403 depending on context
- Processing errors: Return 500 with generic message (logging details server-side)
- Network/service errors: Return 500, log to console
- File processing errors: Return 400 with specific extraction failure message

**Example (from `/api/chat/route.ts`):**
```typescript
if (authError || !user) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
```

**Client-side:** Using `sonner` toast library for user-facing error notifications

## Cross-Cutting Concerns

**Logging:** console.error(), console.warn() used throughout for debugging
- Chat errors logged in `/api/chat/route.ts` line 170
- Training analysis logged for warnings in `/api/training/upload/route.ts`

**Validation:**
- Input validation at route handlers (profileId check, auth check)
- File validation (size, MIME type, extension)
- Type validation via TypeScript strict mode
- Zod schema not actively used, relying on TypeScript

**Authentication:**
- Middleware-based session check via Supabase
- Public routes: `/login`, `/register`, `/api/auth/*`
- Protected routes: Everything in `/(dashboard)/*`
- Server-side session validation in API routes
- Client-side Supabase instance for browser interactions

**Data Consistency:**
- Database schema enforced by Supabase
- Foreign key relationships via workspace_id
- Training source tracking to prevent duplicate analysis
- Profile status state machine (draft → training → active → archived)

**Performance:**
- Parallel data loading in chat route (Promise.all for standards, objectives, definitions, training docs)
- Streaming responses for real-time chat experience
- Image fonts cached in `src/app/fonts/`
- Next.js incremental static generation for pages
- Document text truncation (first 50K chars sent to Claude for analysis)

---

*Architecture analysis: 2026-02-17*
