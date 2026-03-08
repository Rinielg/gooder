# Gooder Skills — Installation Guide

## What You're Installing

Three Claude skills that bring Gooder's brand voice system into any Claude conversation:

1. **gooder-brand-trainer** — Train a brand voice profile from your brand documents
2. **gooder-tone-validator** — QA any copy against your brand voice
3. **gooder-ux-guide** — UX writing guidance with your brand voice applied

## Requirements

- Claude Code (claude.ai/claude-code)
- Claude Code plugins directory: `~/.claude/plugins/`

## Installation

1. Copy all three skill files to your Claude plugins directory:

```bash
mkdir -p ~/.claude/plugins/gooder
cp gooder-brand-trainer.md ~/.claude/plugins/gooder/
cp gooder-tone-validator.md ~/.claude/plugins/gooder/
cp gooder-ux-guide.md ~/.claude/plugins/gooder/
```

2. Restart Claude Code (or open a new session).

3. Skills are now available via the Skill tool. To use them, tell Claude:
   - "Use the gooder-brand-trainer skill"
   - "Use the gooder-tone-validator skill"
   - "Use the gooder-ux-guide skill"

## First-Time Setup

On first use of `gooder-brand-trainer`, you'll be asked where to store your brand profiles.
The default is `~/.claude/gooder/profiles/`. Press Enter to accept or provide a custom path.
This path is shared across all three skills.

## Multiple Brands

Each brand gets its own profile file. Name them clearly:
- `acme-corp.md`
- `acme-retail.md`
- `acme-foundation.md`

## Support

Contact your Gooder account manager or visit gooder.ai
