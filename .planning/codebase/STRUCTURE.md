# Codebase Structure

**Analysis Date:** 2026-02-17

## Directory Layout

```
src/
├── app/                           # Next.js App Router (pages, layouts, API routes)
│   ├── (auth)/                    # Authentication route group
│   │   ├── login/page.tsx         # Login page
│   │   └── register/page.tsx      # Registration page
│   ├── (dashboard)/               # Protected dashboard route group
│   │   ├── chat/page.tsx          # Main chat interface
│   │   ├── profiles/              # Brand profile management
│   │   │   ├── page.tsx           # List profiles
│   │   │   └── [id]/              # Profile details
│   │   │       ├── page.tsx       # Profile view
│   │   │       └── train/page.tsx # Training document upload
│   │   ├── standards/page.tsx     # Platform standards management
│   │   ├── objectives/page.tsx    # Business objectives
│   │   ├── definitions/page.tsx   # Terminology glossary
│   │   ├── outputs/page.tsx       # Saved generated content
│   │   ├── settings/page.tsx      # Workspace/account settings
│   │   └── layout.tsx             # Dashboard wrapper (workspace + profile context)
│   ├── api/                       # RESTful API routes
│   │   ├── chat/route.ts          # Content generation streaming
│   │   ├── adherence/route.ts     # Content scoring
│   │   ├── training/              # Document analysis
│   │   │   ├── route.ts           # List/get training docs
│   │   │   ├── upload/route.ts    # File upload + text extraction
│   │   │   ├── analyze/route.ts   # Brand voice analysis
│   │   │   └── delete/route.ts    # Delete documents
│   │   ├── auth/                  # Authentication endpoints
│   │   │   ├── register/route.ts  # User registration
│   │   │   └── login/route.ts     # Login (if custom)
│   │   ├── profiles/              # Brand profile CRUD
│   │   │   ├── route.ts           # List/create profiles
│   │   │   └── [id]/route.ts      # Get/update/delete single profile
│   │   ├── standards/route.ts     # Platform standards CRUD
│   │   ├── objectives/route.ts    # Objectives CRUD
│   │   ├── definitions/route.ts   # Terminology CRUD
│   │   ├── outputs/route.ts       # Saved outputs CRUD
│   │   ├── workspace/route.ts     # Workspace info
│   │   ├── figma/route.ts         # Figma frame extraction
│   │   └── (other routes)
│   ├── layout.tsx                 # Root layout (HTML, metadata, Toaster)
│   ├── page.tsx                   # Root redirect to /chat
│   ├── globals.css                # Tailwind + global styles
│   └── fonts/                     # Web fonts (Geist)
├── components/                    # React components
│   ├── ui/                        # Primitive UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── shared.tsx             # Common UI patterns
│   │   └── (other primitives)
│   ├── layout/                    # Layout components
│   │   └── app-sidebar.tsx        # Dashboard sidebar navigation
│   ├── brand/                     # Brand-specific components
│   ├── settings/                  # Settings page components
│   └── (other feature components)
├── lib/                           # Utilities and services
│   ├── ai/                        # AI/LLM integration
│   │   ├── models.ts              # Model selection logic
│   │   ├── agents/                # Agent implementations (if any)
│   │   └── prompts/               # System prompts
│   │       ├── system.ts          # Main system prompts (Output, Adherence, Setup agents)
│   │       └── title.ts           # Title generation prompts
│   ├── supabase/                  # Supabase client factories
│   │   ├── server.ts              # Server-side client + service client
│   │   └── client.ts              # Browser client
│   ├── training/                  # Brand profile training/analysis
│   │   ├── analyze.ts             # Claude-powered analysis
│   │   ├── merge.ts               # Data merging
│   │   └── completeness.ts        # Completeness calculation
│   └── utils.ts                   # General utilities (cn, formatDate, etc)
├── types/                         # TypeScript type definitions
│   └── index.ts                   # All domain types (25+)
└── middleware.ts                  # Next.js middleware (auth check)

Root files:
├── package.json                   # Dependencies, scripts
├── tsconfig.json                  # TypeScript config (paths: @/* → ./src/*)
├── tailwind.config.ts             # Tailwind CSS config
├── postcss.config.mjs             # PostCSS config (for Tailwind)
├── next.config.js                 # Next.js config
├── components.json                # UI library config (Shadcn)
├── .eslintrc.json                 # ESLint rules
├── .env.local (not committed)     # Environment secrets
├── .env.local.example             # Environment template
└── .next/                         # Build output (not committed)
```

## Directory Purposes

**`src/app/(auth)/`:**
- Purpose: Public authentication pages
- Contains: Login, registration forms
- Key files: `login/page.tsx`, `register/page.tsx`
- Auth handled by Supabase, forms submit to auth routes

**`src/app/(dashboard)/`:**
- Purpose: Protected application pages behind auth
- Contains: Chat interface, profile management, settings
- Wrapper: `layout.tsx` loads workspace and brand profiles, renders sidebar
- Route groups: `(auth)` and `(dashboard)` allow different layouts for different sections

**`src/app/api/`:**
- Purpose: Backend API endpoints
- Pattern: Each file exports `POST`, `GET`, `PUT`, `DELETE` functions
- Auth: Validated in each route handler via Supabase
- Response: JSON for data routes, streaming for chat
- Errors: Consistent error response format with status codes

**`src/components/ui/`:**
- Purpose: Reusable UI primitives
- Library: Shadcn/ui components (Radix UI + Tailwind)
- Files: `button.tsx`, `input.tsx`, `label.tsx`, etc.
- Pattern: Component + styles exported from single file
- Usage: Composed in layout and feature components

**`src/components/layout/`:**
- Purpose: Structural layout components
- Key: `app-sidebar.tsx` - navigation, profile selector, workspace info
- Pattern: Client components managing state (workspace, profiles, navigation)

**`src/lib/ai/`:**
- Purpose: AI/LLM integration
- Model selection: `models.ts` - Sonnet 4.5 primary, Opus 4.6 for complex tasks (currently disabled)
- Prompts: `prompts/system.ts` - Three agent systems:
  - Output Agent: Generates brand-aligned content with tone decision tree
  - Adherence Agent: Scores content across 8 dimensions independently
  - Setup Agent: Trains profiles via document analysis + targeted questions
- Content type detection: Classifies input (ux_journey, email, sms, push)
- Task complexity: Determines which model to use

**`src/lib/supabase/`:**
- Purpose: Supabase client initialization
- Server: `server.ts` - `createClient()` for server components/routes (uses cookies)
- Server: `createServiceClient()` - Admin operations (uses service role key)
- Client: `client.ts` - Browser client (uses anon key)
- Pattern: Factory functions, initialized on-demand

**`src/lib/training/`:**
- Purpose: Brand profile training workflow
- Analyze: `analyze.ts` - Claude extracts brand voice from documents, returns JSON of extracted fields
- Merge: `merge.ts` - Deep merge extracted data into existing profile (preserves existing data)
- Completeness: `completeness.ts` - Calculates percentage of critical fields populated
- Pattern: Composable utilities, used by training API routes

**`src/types/index.ts`:**
- Purpose: Centralized TypeScript definitions (25+ types)
- Categories:
  - Auth: UserRole, Workspace, WorkspaceMember
  - Brand: BrandProfile, BrandProfileData, VoicePillar, etc.
  - Training: TrainingDocument, ProcessingStatus
  - Content: PlatformStandard, Objective, Definition, SavedOutput
  - Scoring: AdherenceScore, DimensionScore, AdherenceFlag, ObjectiveScore
  - AI: AIModel, ModelConfig, ContentTypeDetection
- Usage: Imported throughout codebase for type safety

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Root page (redirects to `/chat`)
- `src/app/(auth)/login/page.tsx`: Login flow
- `src/app/(auth)/register/page.tsx`: Registration flow
- `src/app/(dashboard)/chat/page.tsx`: Main application interface
- `src/middleware.ts`: Authentication check middleware

**Configuration:**
- `tsconfig.json`: TypeScript, path aliases (`@/*`)
- `next.config.js`: Next.js build config
- `tailwind.config.ts`: Tailwind CSS variables and theme
- `.eslintrc.json`: Linting rules
- `package.json`: Dependencies (Next.js 14, Supabase, Anthropic SDK, Radix UI)

**Core Logic:**
- `src/lib/ai/prompts/system.ts`: System prompts (critical for Output Agent behavior)
- `src/lib/training/analyze.ts`: Document analysis with Claude
- `src/app/api/chat/route.ts`: Content generation endpoint
- `src/app/api/adherence/route.ts`: Content scoring endpoint
- `src/app/(dashboard)/layout.tsx`: Workspace and profile loading

**Testing:**
- No test files detected (not yet implemented)

## Naming Conventions

**Files:**
- Pages: lowercase with extension `page.tsx` (Next.js convention)
- Components: PascalCase, each in separate file or directory (e.g., `AppSidebar`)
- API routes: lowercase (e.g., `route.ts` in feature directories)
- Types: `index.ts` for centralized, no separate `*.types.ts` files
- Utilities: lowercase descriptive names (e.g., `utils.ts`, `client.ts`, `server.ts`)

**Directories:**
- Features: lowercase, plural if many items (e.g., `profiles/`, `standards/`)
- Route groups: parentheses for Next.js grouping without URL impact (e.g., `(auth)/`, `(dashboard)/`)
- Utility directories: logical grouping by function (e.g., `lib/ai/`, `lib/supabase/`, `lib/training/`)

**React Components:**
- Export: default export, filename matches component name
- Props: `interface Props { ... }` or destructured inline
- Hooks: `useState`, `useEffect`, `useCallback` from React

**TypeScript Types:**
- Classes and interfaces: PascalCase (e.g., `BrandProfile`, `Workspace`)
- Enums/unions: UPPERCASE or PascalCase (e.g., `UserRole`, `ProcessingStatus`)
- Functions: camelCase (e.g., `buildSystemPrompt`, `createClient`)

**API Routes:**
- HTTP methods: Uppercase function names (`POST`, `GET`, `PUT`, `DELETE`)
- Request body: Destructured with type annotation
- Response: `NextResponse.json()` or `NextResponse` for streams

## Where to Add New Code

**New Feature Endpoint:**
- Create directory: `src/app/api/[feature]/route.ts`
- Export: `async function POST(request: NextRequest) { ... }`
- Auth: Use `createClient()` to get Supabase instance, validate `supabase.auth.getUser()`
- Data: Load workspace via `workspace_members` join, use `workspace_id` for all queries
- Response: Return `NextResponse.json()` with 200, 400, 401, 403, or 500 status
- Example: See `src/app/api/chat/route.ts` (145 lines) for full pattern

**New Dashboard Page:**
- Create file: `src/app/(dashboard)/[feature]/page.tsx`
- Mark as: `'use client'` if using hooks/state
- Props: Receive from layout via context or from URL params
- Data: Fetch via API route (client-side) or via server-side Supabase
- Access: Workspace and active profile available from dashboard layout context or localStorage
- Example: See `src/app/(dashboard)/chat/page.tsx`

**New Component:**
- Create file: `src/components/[category]/ComponentName.tsx`
- Props: Define interface, typed parameters
- State: Use React hooks if client component
- Styles: Use Tailwind classes, compose via `cn()` utility
- Example: `src/components/layout/app-sidebar.tsx` for layout patterns

**New Utility/Service:**
- Create file: `src/lib/[category]/utility-name.ts`
- Export: Named functions, types as needed
- Dependencies: Import from same lib or lib layer
- No circular imports: Maintain clear dependency direction
- Example: `src/lib/training/analyze.ts`, `src/lib/utils.ts`

**New Type:**
- Add to: `src/types/index.ts`
- Export: Named export, no default export
- Documentation: JSDoc comments for complex types
- Grouping: Logical sections with comment headers (e.g., `// ── Auth & Users `)
- Pattern: Interfaces for domain entities, types for unions/literals

## Special Directories

**`src/app/fonts/`:**
- Purpose: Web fonts (Geist family)
- Files: WOFF format
- Generated: No, manually included
- Committed: Yes
- Usage: Referenced in globals.css

**`src/app/api/`:**
- Purpose: RESTful API routes
- Generated: No
- Committed: Yes
- Pattern: Files at paths matching URL structure (e.g., `/api/chat` → `src/app/api/chat/route.ts`)

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (from package-lock.json)
- Committed: No (in .gitignore)

**`.next/`:**
- Purpose: Next.js build output
- Generated: Yes (run `npm run build`)
- Committed: No (in .gitignore)
- Contents: Compiled pages, server functions, static assets

**`.planning/`:**
- Purpose: Planning and documentation
- Generated: By GSD tools
- Committed: Yes
- Contents: Architecture, structure, conventions, testing guides

## Code Organization Patterns

**Middleware Pattern:**
```typescript
// src/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Initialize Supabase client
  // 2. Check auth session
  // 3. Route logic (redirect, pass through)
  // 4. Return response
}

export const config = { matcher: [...] };
```

**API Route Pattern:**
```typescript
// src/app/api/[feature]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();

    // 2. Validate input
    if (!required_field) return NextResponse.json({ error: "..." }, { status: 400 });

    // 3. Check auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 4. Load workspace
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) return NextResponse.json({ error: "No workspace" }, { status: 403 });

    // 5. Perform operation
    const result = await performOperation(membership.workspace_id);

    // 6. Return response
    return NextResponse.json(result);
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

**Client Component Pattern:**
```typescript
// src/app/(dashboard)/[feature]/page.tsx
'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function FeaturePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      try {
        // Fetch data from API or Supabase
        const { data: result } = await supabase.from("table").select("*");
        setData(result);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  if (loading) return <div>Loading...</div>;
  return <div>{/* Render data */}</div>;
}
```

---

*Structure analysis: 2026-02-17*
