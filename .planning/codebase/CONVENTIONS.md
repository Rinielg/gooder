# Coding Conventions

**Analysis Date:** 2026-02-17

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `AppSidebar`, `Button`)
- Utility/library files: camelCase (e.g., `utils.ts`, `models.ts`, `analyze.ts`)
- API route files: `route.ts` in directory structure
- Type definition files: `index.ts` in `src/types/`
- Pages: kebab-case directories with `page.tsx` files (e.g., `/profiles/[id]/page.tsx`)

**Functions:**
- Async/exported functions: camelCase (e.g., `analyzeDocument`, `buildSystemPrompt`, `detectContentType`)
- Helper/private functions: camelCase (e.g., `clampScore`, `parseDimension`, `getFileExtension`)
- React component functions: PascalCase (e.g., `AppSidebar`, `Button`, `RootLayout`)

**Variables:**
- Constants (module-level): UPPERCASE_SNAKE_CASE (e.g., `MAX_FILE_SIZE`, `ALLOWED_TYPES`, `DEFAULT_WEIGHTS`, `MODELS`)
- Object constants: camelCase within UPPERCASE names (e.g., `MODELS.sonnet`, `DEFAULT_WEIGHTS.voice_consistency`)
- Regular variables: camelCase (e.g., `workspaceId`, `profileId`, `extractedText`, `trainingContext`)
- Props interfaces: PascalCase suffix (e.g., `ButtonProps`, `SidebarProps`, `InputProps`)

**Types:**
- Interfaces: PascalCase (e.g., `BrandProfile`, `Workspace`, `AdherenceScore`, `DimensionScore`)
- Type aliases: PascalCase (e.g., `UserRole`, `ProfileStatus`, `ProcessingStatus`)
- Union types: lowercase with pipes (e.g., `"draft" | "training" | "active" | "archived"`)
- Record/object types: PascalCase or descriptive (e.g., `Record<string, unknown>`)

## Code Style

**Formatting:**
- No explicit formatter configured (Prettier not present)
- Next.js ESLint extends `next/core-web-vitals`
- Code appears hand-formatted with consistent 2-space indentation
- Multiline blocks use consistent alignment

**Linting:**
- ESLint enabled with config at `.eslintrc.json`
- Rules disabled: `no-unused-vars` (off), `react-hooks/exhaustive-deps` (warn)
- Build behavior: ESLint ignored during builds (`ignoreDuringBuilds: true` in `next.config.js`)
- TypeScript strict mode enabled, build errors NOT ignored

**Line length:** No hard limit enforced; practical maximum around 100-120 characters observed

## Import Organization

**Order:**
1. External framework imports (React, Next, Supabase SDK)
2. AI/Anthropic SDK imports
3. Internal lib imports (prefixed with `@/lib/`)
4. Internal component imports (prefixed with `@/components/`)
5. Internal type imports (prefixed with `@/types`)
6. Side-effect imports (CSS, etc.)

**Example pattern from `src/app/api/adherence/route.ts`:**
```typescript
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildAdherencePrompt } from "@/lib/ai/prompts/system";
import { MODELS } from "@/lib/ai/models";
import type {
  BrandProfile,
  PlatformStandard,
  Objective,
  Definition,
  AdherenceScore,
  DimensionScore,
  AdherenceFlag,
} from "@/types";
```

**Path Aliases:**
- `@/*` resolves to `./src/*` (configured in `tsconfig.json`)
- All internal imports use the `@/` prefix, never relative paths
- Type imports explicitly marked with `type` keyword

## Error Handling

**Patterns:**
- API routes: Return `NextResponse.json({ error: message }, { status: code })`
- Functions: Throw `new Error(message)` for critical failures
- Async operations: Try-catch wrapping all async functions
- Database errors: Log with `console.error()` and return appropriate HTTP status
- JSON parsing failures: Use regex match with fallback error messaging

**Example from `src/app/api/adherence/route.ts`:**
```typescript
const jsonMatch = text.match(/\{[\s\S]*\}/);
if (!jsonMatch) {
  console.error("Adherence: no JSON in response", text.slice(0, 300));
  return NextResponse.json(
    { error: "Failed to parse adherence response" },
    { status: 502 }
  );
}

try {
  rawResult = JSON.parse(jsonMatch[0]);
} catch {
  console.error("Adherence: invalid JSON", jsonMatch[0].slice(0, 300));
  return NextResponse.json(
    { error: "Invalid JSON from adherence model" },
    { status: 502 }
  );
}
```

**Common status codes:**
- 400: Missing/invalid required fields
- 401: Unauthorized (no auth user)
- 403: Forbidden (no workspace access)
- 404: Resource not found
- 500: Server error
- 502: Bad gateway (external API failure)

## Logging

**Framework:** Native `console` object only

**Patterns:**
- `console.error()`: API errors, database failures, unexpected exceptions (includes stack trace context)
- `console.warn()`: Non-critical warnings (e.g., Mammoth conversion warnings)
- Log messages include context: operation name, error details, partial data for debugging

**Example from `src/app/api/training/upload/route.ts`:**
```typescript
console.error("Storage upload error:", uploadError);
console.error("Document record error:", docError);
console.error("Post-upload analysis error:", err.message);
console.warn("Mammoth warnings:", result.messages.map((m: any) => m.message));
```

**No structured logging:** Logs are unstructured console output only

## Comments

**When to Comment:**
- Section separators using `// ── Title ─────────────────` pattern (see `src/app/api/adherence/route.ts`)
- Complex logic explanations (e.g., weighted score calculations)
- CRITICAL rules or non-obvious requirements (see `src/lib/ai/prompts/system.ts`)
- TODO/FIXME notes for disabled/incomplete features

**JSDoc/TSDoc:**
- Light usage, primarily for exported functions with complex behavior
- Example from `src/lib/training/analyze.ts`:
```typescript
/**
 * Analyze extracted document text and merge results into the brand profile.
 * Used by both the upload route (inline) and the standalone analyze route.
 */
export async function analyzeDocument(params: AnalyzeParams): Promise<AnalysisResult> {
```

**Section markers:** Consistently use `// ── Section Name ──────────────────` to organize code blocks

## Function Design

**Size:** Functions range from single-purpose (5-15 lines) to complex aggregators (200+ lines for analysis)
- API route handlers: 40-200 lines (includes auth, validation, queries, response formatting)
- Utility functions: 5-30 lines
- Parsing/analysis functions: 80-250 lines

**Parameters:**
- Named destructuring for complex functions (see `analyzeDocument` with `AnalyzeParams`)
- Single object param for functions with 3+ arguments
- Type annotations always present

**Return Values:**
- Explicit return types on function signatures
- Async functions return Promise<T>
- API handlers return Response or NextResponse
- Utility functions return simple types (string, number, boolean) or typed objects

**Example pattern from `src/lib/ai/models.ts`:**
```typescript
export function detectContentType(message: string): ContentTypeDetection {
  const lower = message.toLowerCase();

  if (/\b(ux|user experience|journey|flow|screen|page|onboarding|checkout|form|modal|tooltip|empty state|error state)\b/.test(lower)) {
    return "ux_journey";
  }
  // ... more checks
  return "unknown";
}
```

## Module Design

**Exports:**
- Named exports for all public functions and types
- Single default export only for layout/page components
- Explicit `export` keyword on function/type definitions

**Barrel Files:**
- Single barrel file at `src/types/index.ts` collecting all type definitions
- No barrel files in `src/lib/` (direct imports preferred)
- No barrel files in `src/components/` (direct imports preferred)

**File structure principles:**
- One main export per library file (e.g., `analyzeDocument` from `analyze.ts`)
- Related utilities grouped (e.g., all training functions in `src/lib/training/`)
- Clear separation: API routes, components, utilities, types

---

*Convention analysis: 2026-02-17*
