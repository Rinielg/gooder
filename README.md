# Brand Voice Platform — MVP

AI-powered brand voice management and content generation platform.

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database**: Supabase (Postgres + Auth + Storage + RLS)
- **AI**: Anthropic Claude API via Vercel AI SDK v6
- **UI**: Custom shadcn/ui components (Radix primitives)
- **Hosting**: Vercel

## Setup Instructions

### 1. Create Supabase Project
1. Go to supabase.com → New Project
2. Copy: Project URL, Anon Key, Service Role Key (Settings → API)
3. Run `supabase/migration.sql` in SQL Editor (creates 8 tables + RLS policies)
4. Enable email auth (Authentication → Providers → Email)

### 2. Configure Environment
```bash
cp .env.local.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
```

### 3. Install & Run
```bash
npm install
npm run dev
```

### 4. Deploy to Vercel
Push to GitHub, import in Vercel, add env vars, deploy.

## Architecture
- 3-Agent System: Setup Agent (training), Output Agent (generation), Adherence Agent (scoring)
- Intelligent model selection: Sonnet 4.5 for simple, Opus 4.6 for complex tasks
- Content type auto-detection (UX/email/SMS/push)
- Full BVST-2026 template injection into system prompts
- XML-tag prompt injection defense
