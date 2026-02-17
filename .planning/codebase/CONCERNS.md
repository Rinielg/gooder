# Codebase Concerns

**Analysis Date:** 2026-02-17

## Tech Debt

**Pervasive use of `any` types in API endpoints:**
- Issue: Type safety is bypassed throughout request handling, particularly for message transformations and API response parsing
- Files: `src/app/api/chat/route.ts`, `src/app/api/training/route.ts`, `src/app/api/adherence/route.ts`, `src/app/api/training/upload/route.ts`
- Impact: Runtime errors from malformed data go undetected until production; difficult to refactor message handling; poor IDE support
- Fix approach: Create strict TypeScript interfaces for `UIMessage`, API responses, and internal data structures. Use Zod for runtime validation at API boundaries

**Untyped nested object manipulation:**
- Issue: `setNestedValue()` in `src/app/api/training/route.ts` uses `any` to dynamically mutate complex nested objects based on string paths
- Files: `src/app/api/training/route.ts` lines 38-57
- Impact: No compile-time validation of object structure mutations; impossible to trace what fields can be modified; high risk of data corruption during profile updates
- Fix approach: Create a type-safe path builder or use a proper lens/optics library. Or replace dynamic paths with explicit object builders

**Fragile JSON parsing from Claude responses:**
- Issue: Multiple endpoints use regex `/\{[\s\S]*\}/` to extract JSON from Claude responses without validation
- Files: `src/app/api/chat/route.ts`, `src/app/api/adherence/route.ts`, `src/lib/training/analyze.ts`
- Impact: Malformed JSON silently fails; incomplete JSON fragments may match; AI response changes break parsing; no recovery mechanism
- Fix approach: Use a JSON parser with error recovery (e.g., `json5`) or add post-processing validation with Zod schemas before using extracted data

**Inconsistent error handling across API routes:**
- Issue: Some routes return `NextResponse.json()`, others return `Response.json()` with different error shapes; error messages inconsistently logged
- Files: All `src/app/api/*` routes
- Impact: Frontend cannot reliably parse error responses; debug logs contain arbitrary error structures; harder to add centralized error tracking
- Fix approach: Create a standardized error handler wrapper that normalizes all API responses and logging

**Missing input validation at API boundaries:**
- Issue: Request bodies are destructured without validation; file uploads checked minimally; string inputs used in prompts without sanitization
- Files: `src/app/api/chat/route.ts`, `src/app/api/adherence/route.ts`, `src/app/api/figma/route.ts`, `src/app/api/training/route.ts`
- Impact: Injection attacks possible via prompt content; malformed requests cause unhandled exceptions; limits impossible to enforce
- Fix approach: Use Zod schemas for all request validation at route entry points

**Commented-out code for intelligent model routing:**
- Issue: Lines 23-37 in `src/lib/ai/models.ts` contain commented complex task detection that's disabled
- Files: `src/lib/ai/models.ts`
- Impact: Dead code path; unclear if disabling was intentional; technical debt from optimization attempt; increases maintenance burden
- Fix approach: Either commit to single-model strategy and remove, or enable with feature flag

**Hard-coded model strings instead of centralized config:**
- Issue: Model IDs like `claude-sonnet-4-5-20250929` appear in multiple files without a single source of truth
- Files: `src/lib/training/analyze.ts` (line 7), `src/lib/ai/models.ts` (lines 5-6)
- Impact: Updating models requires changes in multiple places; easy to introduce version mismatches
- Fix approach: Move all model IDs to a single config file, import consistently

## Security Considerations

**Service role key exposed in client-side context:**
- Risk: `SUPABASE_SERVICE_ROLE_KEY` used in `src/lib/supabase/server.ts` is a server-side secret that could accidentally be logged or sent to client
- Files: `src/lib/supabase/server.ts` line 36
- Current mitigation: Key is stored in `.env.local` (not committed), only used in server functions
- Recommendations: Add explicit checks to ensure service client is only instantiated in server functions; consider using Row-Level Security instead of service role for sensitive operations. Document the difference between client (anon key) and service (secret key) usage

**Figma token passed as plaintext header:**
- Risk: `FIGMA_ACCESS_TOKEN` sent to Figma API with no additional protection or rate limiting
- Files: `src/app/api/figma/route.ts` line 185
- Current mitigation: Token in `.env.local`, endpoint requires Supabase auth
- Recommendations: Add API rate limiting per user; log Figma API calls for audit; consider token rotation strategy. If token is compromised, add ability to revoke it without redeployment

**Workspace isolation not enforced at database level:**
- Risk: Queries filter by `workspace_id` at application layer; no database constraints prevent cross-workspace access if query is bypassed
- Files: Throughout `src/app/api/*` routes
- Current mitigation: Auth check + workspace membership check before any data access
- Recommendations: Add database-level RLS (Row-Level Security) policies; add workspace_id check at Supabase middleware level. Test cross-workspace queries manually

**User-controlled file upload content extraction:**
- Risk: `extractText()` in `src/app/api/training/upload/route.ts` processes user files with third-party libraries (unpdf, mammoth) with minimal sandboxing
- Files: `src/app/api/training/upload/route.ts` lines 25-107
- Current mitigation: File size limit (10MB), extension whitelist, MIME type check
- Recommendations: Add timeout to extraction operations; consider extracting files in a worker process; validate extracted text before sending to Claude (length limits already in place). Monitor for ReDoS attacks in regex extraction

**Profile data merged without validation:**
- Risk: Claude's extracted profile_data is directly merged into user profiles without schema validation
- Files: `src/lib/training/analyze.ts` lines 186-189
- Current mitigation: Completeness score prevents incomplete profiles from being marked active
- Recommendations: Add Zod schema validation on extracted fields before merge; make merge operation idempotent; add audit log of what changed

## Performance Bottlenecks

**Unbounded training document text storage:**
- Problem: Full extracted text stored in `extracted_content` JSONB field with only 500k character limit noted in comment
- Files: `src/app/api/training/upload/route.ts` lines 279-282
- Cause: No explicit database storage limit; JSONB columns can grow large; chat route truncates to 2000 chars anyway (line 96 in `src/app/api/chat/route.ts`)
- Improvement path: Move extracted text to separate `training_document_content` table with limit enforcement; cache truncated versions to avoid re-processing

**Parallel queries without connection pooling awareness:**
- Problem: Multiple concurrent `Promise.all()` queries without documented connection limits
- Files: `src/app/api/chat/route.ts` lines 73-89, `src/app/api/adherence/route.ts` lines 130-149
- Cause: Supabase connections have limits; no circuit breaker or fallback
- Improvement path: Add explicit connection limits; implement query timeouts; batch related queries instead of parallel for high-load scenarios

**Full profile context sent to Claude for every chat:**
- Problem: All standards, objectives, definitions, training docs sent with every message
- Files: `src/app/api/chat/route.ts` lines 73-89
- Cause: No context caching or compression; system prompt rebuilds on every request
- Improvement path: Cache context data per workspace; use Claude's token cache feature if available; send incremental diffs

**No pagination for large result sets:**
- Problem: Standards, objectives, definitions queries have no limit; large workspaces return all rows
- Files: `src/app/api/chat/route.ts` lines 79-81, `src/app/api/adherence/route.ts` lines 135-148
- Cause: Simple select without pagination; JSONB queries must deserialize everything
- Improvement path: Add pagination, filtering, and lazy-loading for large datasets. Consider materialized views for frequently-accessed standards

**Profile completeness recalculation on every document upload:**
- Problem: `calculateCompleteness()` called on every training operation; no caching or memoization
- Files: `src/lib/training/analyze.ts` line 191, `src/app/api/training/route.ts` line 220
- Cause: Calculation is fast but accumulates with scale
- Improvement path: Only recalculate when specific fields change; use database-level triggers for async recalculation

## Fragile Areas

**AI model response parsing depends on exact format:**
- Files: `src/app/api/adherence/route.ts` (JSON extraction), `src/lib/training/analyze.ts` (JSON extraction), `src/app/api/training/route.ts` (profile_update blocks)
- Why fragile: Claude may occasionally vary formatting (extra whitespace, comments, different JSON structure); regex patterns assume specific structure; no fallback parsing
- Safe modification: Add a "strict mode" parser that validates against Zod schema first, then falls back to lenient mode with manual mapping. Test with intentionally malformed Claude outputs
- Test coverage: No test files exist for parsing logic

**Profile data merging logic with complex nested structures:**
- Files: `src/lib/training/merge.ts`
- Why fragile: Custom merge functions manually recurse through nested objects; array deduplication by name is fragile if names change; no deep equality checks
- Safe modification: Add comprehensive unit tests for all merge scenarios before changes. Document the deduplication rules. Consider using a battle-tested library like `lodash/merge`
- Test coverage: Zero tests

**Figma URL parsing with regex:**
- Files: `src/app/api/figma/route.ts` lines 48-69
- Why fragile: URL structure may change; node ID format conversion (hyphen to colon) is brittle; no validation that node ID actually exists before calling API
- Safe modification: Add tests for various Figma URL formats (new vs old URLs, different node ID formats). Consider using URL parsing library instead of custom regex
- Test coverage: Zero tests

**Workspace membership assumed to return single row:**
- Files: Throughout API routes (`.limit(1).single()` pattern)
- Why fragile: If user has multiple workspace memberships (future feature), logic breaks; `.single()` throws on empty/multiple results without try-catch in some cases
- Safe modification: Handle multiple workspace case explicitly; default to most recently created or use explicit selector. Add error boundary for `.single()` calls
- Test coverage: Not tested with multiple memberships

**Chat message structure assumptions:**
- Files: `src/app/api/chat/route.ts` lines 103-115, `src/app/api/training/route.ts` lines 178-192
- Why fragile: Code assumes `UIMessage` has either string `content` or array of `parts`; defensive checks convert both formats but logic is repeated
- Safe modification: Extract message normalization to utility function; add comprehensive tests for both message formats
- Test coverage: Zero tests

## Scaling Limits

**10MB file upload limit is arbitrary:**
- Current capacity: 10MB max per file
- Limit: JSONB storage not designed for large text; extraction libraries may struggle with larger files
- Scaling path: Implement chunked upload; move full text to separate storage system; implement streaming text extraction for large PDFs

**Single workspace_id query pattern will slow at scale:**
- Current capacity: Works fine for 1000s of standards/objectives per workspace
- Limit: At 100k+ standards, loading all of them per request becomes slow; JSONB parsing becomes expensive
- Scaling path: Add indexing on workspace_id + is_active; implement caching layer; add materialized views for frequently-queried combinations

**Claude API streaming timeout at 60 seconds:**
- Current capacity: Most chat/training responses complete in <30s
- Limit: Complex document analysis or long conversations may timeout
- Scaling path: Document typical latencies; add explicit progress indicators for long operations; consider moving to Batch API for non-real-time operations

**No rate limiting on API endpoints:**
- Current capacity: Single user can hammer any endpoint
- Limit: No built-in protection against abuse; could impact shared resources
- Scaling path: Add rate limiting per user ID; implement API quota system; add Circuit breaker for external APIs (Figma, Claude)

## Dependencies at Risk

**unpdf (1.4.0) - PDF text extraction library:**
- Risk: Smaller project with potential abandonment; May not handle newer PDF formats. Some PDFs fail with unclear error messages
- Impact: Document upload fails without clear guidance to user
- Migration plan: Have fallback to alternative PDF library (pdfjs) or recommend users convert to text first. Test with various PDF types regularly

**mammoth (1.11.0) - DOCX extraction library:**
- Risk: May not support newer .docx format variations; Warns about unsupported content but doesn't fail gracefully
- Impact: Some DOCX files extract only partial content without error
- Migration plan: Add explicit support message showing what was extracted; consider pandoc as alternative

**Next.js 14.2.35 - Potential drift from latest:**
- Risk: May be missing security patches; Not LTS version
- Impact: Missing critical fixes; incompatibilities with newer dependencies
- Migration plan: Plan upgrade to next LTS (15+); pin compatible versions for all Next.js plugins

**Supabase dependency coupling:**
- Risk: Deep integration with Supabase-specific APIs; migration away would require major refactor
- Impact: Cannot easily switch database providers; vendor lock-in
- Migration plan: Abstract database access behind interfaces; consider using Drizzle ORM for better portability

## Missing Critical Features

**No audit logging:**
- Problem: Who modified what profile data and when is not tracked
- Blocks: Compliance requirements; debugging user issues; tracking data provenance
- Implementation: Add audit_logs table; capture user_id, action, table, old_value, new_value, timestamp in RLS policies

**No test suite:**
- Problem: Zero automated tests
- Blocks: Refactoring safely; catching regressions; deploying with confidence
- Implementation: Start with API route tests (vitest or jest); add integration tests for profile merge logic; add snapshot tests for Claude response parsing

**No monitoring or error tracking:**
- Problem: Production errors not tracked beyond console.error()
- Blocks: Understanding failure patterns; alerting on critical issues
- Implementation: Integrate Sentry or similar; add structured logging for all API errors; track Claude API failures

**No rate limiting or abuse prevention:**
- Problem: No protection against user spamming endpoints
- Blocks: Preventing resource exhaustion; protecting Claude API quota
- Implementation: Add Redis-backed rate limiter; implement quota system per workspace

**No database migrations system:**
- Problem: Single SQL file; no version control for schema changes
- Blocks: Deploying schema updates safely; rolling back changes; multi-environment deployment
- Implementation: Integrate Supabase migrations CLI or use database migration tool (Flyway, Liquibase)

## Test Coverage Gaps

**API route error handling:**
- What's not tested: Error paths, malformed inputs, auth failures, database errors
- Files: All `src/app/api/*` routes
- Risk: Silent failures in production; error handling logic may be broken
- Priority: High

**Profile data merging logic:**
- What's not tested: Complex nested merges, deduplication, array ordering, null handling
- Files: `src/lib/training/merge.ts`
- Risk: Data corruption during profile updates; data loss when uploading documents
- Priority: High

**Claude response parsing:**
- What's not tested: Malformed JSON, missing fields, extra fields, formatting variations
- Files: `src/app/api/adherence/route.ts`, `src/lib/training/analyze.ts`, `src/app/api/training/route.ts`
- Risk: Production failures from Claude API response changes
- Priority: High

**Figma integration:**
- What's not tested: Invalid URLs, API errors, permission failures, rate limiting
- Files: `src/app/api/figma/route.ts`
- Risk: Poor user experience with vague error messages; silent failures
- Priority: Medium

**File upload extraction:**
- What's not tested: Corrupted files, edge cases (empty files, very large files), malformed PDFs/DOCX
- Files: `src/app/api/training/upload/route.ts`
- Risk: Crashes on unexpected file formats; data loss if extraction fails
- Priority: Medium

**Chat message handling:**
- What's not tested: Message structure variations, missing fields, malformed content
- Files: `src/app/api/chat/route.ts`
- Risk: Runtime errors from unexpected message formats
- Priority: Medium

---

*Concerns audit: 2026-02-17*
