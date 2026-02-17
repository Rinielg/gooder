# Testing Patterns

**Analysis Date:** 2026-02-17

## Test Framework

**Status:** Not detected

The codebase has **no test files** (no `.test.ts`, `.spec.ts`, or `.test.tsx` files found in `src/`).

**No test runner configured:**
- Jest not present in dependencies
- Vitest not present in dependencies
- No test scripts in `package.json`
- No test configuration files (`jest.config.js`, `vitest.config.ts`)

**Package.json scripts:**
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

No `test` or `test:watch` scripts are defined.

## Test Coverage

**Current State:** Zero test coverage

No unit tests, integration tests, or end-to-end tests are present in the repository.

**Untested areas (Critical):**
- `src/lib/training/analyze.ts` - Document analysis and JSON parsing with Claude
- `src/lib/training/completeness.ts` - Profile completeness calculation
- `src/lib/training/merge.ts` - Profile data merging logic
- `src/app/api/adherence/route.ts` - Adherence scoring with weighted calculations and dimension normalization
- `src/app/api/chat/route.ts` - Content generation streaming and model selection
- `src/app/api/training/upload/route.ts` - File extraction (PDF, DOCX, TXT, MD) and validation
- `src/app/api/training/analyze/route.ts` - Document analysis endpoint
- `src/lib/ai/models.ts` - Content type detection and task complexity classification
- `src/lib/ai/prompts/system.ts` - System prompt construction
- `src/lib/supabase/` - Database client initialization
- `src/middleware.ts` - Auth middleware and route protection

**Risk assessment:** High - core business logic (adherence scoring, training analysis) has zero automated test coverage

## Testing Infrastructure Gaps

**What would be needed to add tests:**

1. **Test runner selection:**
   - Install Jest: `npm install -D jest @types/jest ts-jest`
   - Or Vitest: `npm install -D vitest`
   - Recommended: Vitest (faster, ESM native, Next.js compatible)

2. **Test configuration example for Vitest:**
   ```typescript
   // vitest.config.ts
   import { defineConfig } from 'vitest/config'

   export default defineConfig({
     test: {
       globals: true,
       environment: 'node',
       alias: {
         '@': new URL('./src', import.meta.url).pathname,
       },
     },
   })
   ```

3. **Async testing requirements:**
   - All API route handlers use async/await
   - Database queries return promises via Supabase client
   - AI model calls (Anthropic SDK) are async
   - Would require async test patterns with `await`

4. **Mocking requirements:**
   - Supabase client mocking (database queries)
   - Anthropic API mocking (expensive, non-deterministic)
   - File system operations (PDF/DOCX extraction)
   - Next.js request/response objects

## Code Patterns That Would Benefit From Tests

**1. Adherence Scoring (Critical):**

File: `src/app/api/adherence/route.ts` (268 lines)

Complex logic that needs test coverage:
- Score clamping (0-10 range): `clampScore()` function
- Dimension parsing from API response: `parseDimension()` function
- Weighted overall score calculation
- Compliance automatic fail logic
- Flag and suggestion aggregation

Example function to test:
```typescript
function clampScore(val: unknown): number {
  const n = Number(val);
  if (isNaN(n)) return 0;
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10));
}
```

Test cases needed:
- Valid numbers (0-10)
- Out-of-range numbers (negative, >10)
- Non-numeric values (strings, null, undefined)
- Edge cases (0.1, 9.9, rounding boundaries)
- NaN and Infinity handling

**2. Document Analysis (High Priority):**

File: `src/lib/training/analyze.ts` (254 lines)

Testable components:
- JSON extraction from AI response: `.match(/\{[\s\S]*\}/)`
- Profile merge operations
- Training source deduplication
- Status transitions (draft → training → active)
- Definition insertion logic

Example patterns:
```typescript
// JSON parsing with fallback
const jsonMatch = responseText.match(/\{[\s\S]*\}/);
if (!jsonMatch) {
  throw new Error("No JSON in analysis response");
}

let analysisResult = JSON.parse(jsonMatch[0]);

// Merge with deduplication
const updatedSources = [
  ...existingSources.filter((s) => s.document_id !== documentId),
  newSource,
];
```

**3. File Extraction (Medium Priority):**

File: `src/app/api/training/upload/route.ts` (350+ lines)

Testable file type handling:
- Extension detection: `getFileExtension(filename: string)`
- MIME type validation
- PDF extraction with unpdf library
- DOCX extraction with mammoth library
- Text file direct read
- Error messages for each file type

Example:
```typescript
async function extractText(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ text: string; method: string }>
```

**4. Content Type Detection (Medium Priority):**

File: `src/lib/ai/models.ts` (97 lines)

Simple regex-based detection that's easy to test:
```typescript
export function detectContentType(message: string): ContentTypeDetection {
  const lower = message.toLowerCase();

  if (/\b(ux|user experience|journey|flow|screen|page|onboarding|checkout|form|modal|tooltip|empty state|error state)\b/.test(lower)) {
    return "ux_journey";
  }
  // ... more patterns
  return "unknown";
}
```

Test cases:
- Each content type with keyword variations
- Edge cases (hyphenated terms, abbreviations)
- Unknown content types
- Empty strings
- Case insensitivity

**5. Utility Functions (Easy to Start):**

File: `src/lib/utils.ts` (38 lines)

Pure functions ideal for beginner tests:
```typescript
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", { /* options */ }).format(new Date(date));
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}
```

## Test Organization Structure

**Recommended file structure (if tests were added):**

```
src/
├── __tests__/
│   ├── lib/
│   │   ├── training/
│   │   │   ├── analyze.test.ts
│   │   │   ├── completeness.test.ts
│   │   │   └── merge.test.ts
│   │   ├── ai/
│   │   │   ├── models.test.ts
│   │   │   └── prompts.test.ts
│   │   └── utils.test.ts
│   └── api/
│       ├── adherence.test.ts
│       ├── chat.test.ts
│       └── training/upload.test.ts
├── lib/
├── app/
└── types/
```

**Naming convention:** Co-located or parallel `__tests__` directory with `.test.ts` suffix

## Current State Summary

| Aspect | Status |
|--------|--------|
| Test runner | Not configured |
| Test files | 0 |
| Test coverage | 0% |
| Mock libraries | Not installed |
| Test utilities | Not installed |
| CI/CD test runs | Not configured |

**Recommendation:** This codebase is at high risk due to zero test coverage on critical business logic (adherence scoring, document analysis, file extraction). Adding tests should start with:

1. Install Vitest as test runner
2. Add tests for `src/lib/utils.ts` (simplest, highest value)
3. Add tests for `src/lib/ai/models.ts` (content type detection)
4. Add mocks for Supabase and Anthropic APIs
5. Add integration tests for API routes
6. Establish minimum 60%+ coverage target for all API routes and `lib/` functions

---

*Testing analysis: 2026-02-17*
