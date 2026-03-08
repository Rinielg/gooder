# Gooder Skills — Design Document
**Date:** 2026-03-08
**Status:** Approved

---

## Overview

Three distributable Claude skill files (`.md`) that expose the Gooder brand voice platform's core capabilities to any LLM conversation without requiring the web app. Skills are self-contained prompt files installed to `~/.claude/` by clients, with brand profiles stored locally as markdown files.

---

## Architecture

### Delivery Format
Standalone `.md` skill files distributed to Gooder clients. Installed into the client's Claude plugins directory alongside existing skills.

### Profile Storage
```
~/.claude/gooder/
  profiles/
    <brand-name>.md     ← one file per brand
```

- **Written by:** Skill 1 (Brand Trainer)
- **Read by:** Skills 2 (Validator) and 3 (UX Guide)
- Supports multiple named brand profiles per machine
- Configurable storage path chosen by client on first use

### Skill Files
```
skills/
  gooder-brand-trainer.md
  gooder-tone-validator.md
  gooder-ux-guide.md
```

---

## Brand Profile Format

Each profile is a structured markdown file. Fields map to the BVST-2026 framework used in the Gooder platform.

```markdown
# Brand Profile: <name>
Last updated: <date>
Completeness: <0-100>%
Training sources: <list of ingested documents>

## Voice Identity
### Voice Pillars
| Pillar | Meaning | Sounds Like | Never Sounds Like | Dial Range |
|--------|---------|-------------|-------------------|------------|

### Brand Archetype
- Primary:
- Secondary:
- Description:
- Sounds like:
- Never sounds like:

### Voice Spectrum
- Formality: /10
- Seriousness: /10
- Technicality: /10
- Enthusiasm: /10
- Authority: /10

## Tone Architecture
### Situational Tone Map
| Situation | Default Tone | Leading Pillar | Guidance |
|-----------|-------------|----------------|----------|

### Tone Rules
(freeform — extracted from brand materials)

## Grammar & Style
- Voice: active / passive
- Tense:
- Person: first / second / third
- Contractions: yes / no
- Punctuation preferences:
- Sentence length preference:

## Channel Adaptation
### Email
- Tone range:
- Length guidance:
- Format notes:

### SMS
- Tone range:
- Max characters: 160
- Format notes:

### Push Notification
- Title max: 50 chars
- Body max: 100 chars
- Tone notes:

### UX Journey
- Tone range:
- Length guidance:
- Format notes:

## Terminology & Definitions
| Term | Definition | Deprecated Alternatives |
|------|------------|------------------------|

## Training Log
| Source | Type | Date Added | Notes |
|--------|------|------------|-------|
```

---

## Skill 1: `gooder-brand-trainer`

### Purpose
Train or update a brand voice profile by ingesting source materials and asking targeted questions. Outputs a structured brand profile markdown file.

### Trigger
User invokes when setting up a new brand or adding to an existing profile.

### Supported Input Formats
- PDF, TXT, DOCX — via Read tool
- PNG, JPG — via Read tool (visual analysis)
- HTML files — via Read tool
- Web URLs — via WebFetch tool
- Pasted text — inline in conversation

### Flow
1. Ask for brand name → check `~/.claude/gooder/profiles/<brand-name>.md`
   - If exists: load and show current completeness, offer to update
   - If not: confirm profile path with client (first-time setup), then start fresh
2. Accept source materials one or more at a time
3. Analyse materials, extract patterns mapped to BVST-2026 fields:
   - Voice patterns (formality, personality, archetype signals)
   - Terminology and naming conventions
   - Tone examples across situations
   - Audience addressing patterns
   - Grammar and style signals
4. Ask targeted follow-up questions only for missing critical fields — one at a time, conversational
5. Show completeness score after each round — 80%+ activates the profile
6. Write/update `~/.claude/gooder/profiles/<brand-name>.md`
7. Confirm save and show what was added or updated

### Critical Fields (must reach 80%+)
- Minimum 3 voice pillars with meaning, sounds-like, anti-pattern
- Brand archetype (primary + secondary)
- Voice spectrum (all 5 axes)
- Minimum 3 situational tones
- Grammar preferences (voice, tense, person, contractions)

### Behaviour Rules
- Incremental: adding more documents merges into existing profile, doesn't overwrite
- Celebrates progress ("Great — that gives us 4 of 5 critical fields")
- Never blocks on incomplete profile — flags gaps and continues
- Logs every source document in Training Log section

---

## Skill 2: `gooder-tone-validator`

### Purpose
QA any content against a brand's tone and voice profile. Returns scored assessment with actionable flags.

### Trigger
User invokes when they want to validate content before publishing or to check adherence.

### Supported Content Types
Email, SMS, push notification, UX journey copy, concept copy, social, general copy

### Flow
1. Ask which brand profile to use → read `~/.claude/gooder/profiles/<brand-name>.md`
2. Accept content to validate (pasted, file, URL) + content type
3. Score across 8 weighted dimensions:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Voice consistency | 20% | Brand voice pillars present, anti-patterns absent |
| Tone accuracy | 15% | Tone matches situation, audience, emotional context |
| Compliance | 20% | Rules followed, no prohibited language, disclosures present |
| Terminology | 10% | Canonical terms used, deprecated terms absent |
| Platform optimisation | 10% | Length, format, structure match channel constraints |
| Objective alignment | 10% | Content serves brand's stated business objectives |
| Pattern adherence | 10% | Follows brand content patterns and custom standards |
| Overall quality | 5% | Readability, grammar, clarity, active voice |

4. Flag issues by severity: `info` / `warning` / `fail` / `automatic fail`
5. Auto-fail triggers: compliance score < 7, missing required disclosures, prohibited language
6. Return: overall weighted score, per-dimension breakdown, all flags, actionable suggestions
7. Optionally: rewrite flagged sections inline to bring them into adherence

### Output Format
- Overall score (0–100) with pass/fail threshold (default: 75)
- Per-dimension score + flags + notes
- Prioritised suggestion list
- If requested: revised copy with changes highlighted

---

## Skill 3: `gooder-ux-guide`

### Purpose
UX writing guidance for journeys, screens, and components — with brand voice layered on top when a profile is available. Works alongside Skills 1 and 2.

### Trigger
User invokes when writing or reviewing UX copy for any digital product.

### Flow
1. Optionally load brand profile (runs on generic best practices without one)
2. Accept context: screen type, journey stage, user state, existing copy (if any)
3. Apply UX writing frameworks per component type:
   - **Onboarding:** progressive disclosure, benefit-led, minimal friction
   - **Empty states:** helpful, actionable, not apologetic
   - **Error messages:** cause + fix, human, no blame language
   - **CTAs:** specific action verb, clear outcome, no "click here"
   - **Form copy:** labels, placeholders, helper text, inline validation
   - **Tooltips/modals:** concise, contextual, dismissible-by-design
   - **Notifications/alerts:** timely, actionable, priority-appropriate tone
4. Layer brand voice on top if profile loaded — adjust formality, pillar expression, terminology
5. Output structured copy per screen/component with UX rationale for each decision
6. Flag UX writing anti-patterns: passive voice, jargon, blame language, vague CTAs, wall-of-text
7. Offer to hand off to Skill 2 (`gooder-tone-validator`) for formal validation score

### Skill Interplay
- Skill 3 + Skill 1: reference trained brand profile for voice-specific UX copy
- Skill 3 + Skill 2: formal adherence scoring after UX copy is drafted
- All 3 together: full pipeline — train → write → validate

---

## Distribution

Skills are distributed as a set of 3 `.md` files by Gooder to clients. Clients install them into their Claude plugins directory. On first use of Skill 1, the client sets their preferred profile storage path which is used across all 3 skills.

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage format | Markdown file | Human-readable, editable, Git-friendly, works with Claude's Read/Write tools |
| Profile location | `~/.claude/gooder/profiles/` (configurable) | Global across projects, familiar to Claude Code users |
| Multi-brand support | Named profiles | Matches platform's multi-profile workspace model |
| Backend dependency | None | Skills are fully standalone — no web app required |
| Framework alignment | BVST-2026 | Reuses existing platform schema — profiles can inform platform and vice versa |
