# Gooder Skills — Installation Guide

## What You're Installing

Three Claude Code skills that bring Gooder's brand voice system into any Claude conversation:

| Skill | What it does |
|-------|-------------|
| **gooder-brand-trainer** | Train a brand voice profile from your brand documents (PDF, DOCX, TXT, PNG, JPG, HTML, URLs) |
| **gooder-tone-validator** | QA any copy against your brand voice — scores 8 dimensions, flags issues, suggests fixes |
| **gooder-ux-guide** | UX writing guidance with your brand voice applied — onboarding, errors, empty states, CTAs, forms, modals, notifications |

---

## Requirements

- [Claude Code](https://claude.ai/claude-code) installed and running
- macOS or Linux (Windows: replace `~` with your user home path)

---

## Step 1 — Copy the plugin to your Claude plugins directory

Open Terminal and run:

```bash
# Create the plugins directory if it doesn't exist
mkdir -p ~/.claude/plugins/cache/local/gooder/1.0.0

# Copy the plugin folder (run this from wherever you saved the gooder-skills folder)
cp -r .claude-plugin ~/.claude/plugins/cache/local/gooder/1.0.0/
cp -r skills ~/.claude/plugins/cache/local/gooder/1.0.0/
```

Your directory should now look like this:

```
~/.claude/plugins/cache/local/gooder/1.0.0/
  .claude-plugin/
    plugin.json
  skills/
    gooder-brand-trainer/
      SKILL.md
    gooder-tone-validator/
      SKILL.md
    gooder-ux-guide/
      SKILL.md
```

---

## Step 2 — Register the plugin in installed_plugins.json

Open `~/.claude/plugins/installed_plugins.json` in any text editor.

If the file **does not exist**, create it with this content:

```json
{
  "version": 2,
  "plugins": {
    "gooder@local": [
      {
        "scope": "user",
        "installPath": "/Users/YOUR_USERNAME/.claude/plugins/cache/local/gooder/1.0.0",
        "version": "1.0.0",
        "installedAt": "2026-01-01T00:00:00.000Z",
        "lastUpdated": "2026-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

If the file **already exists** (you have other plugins), add the `"gooder@local"` entry inside the existing `"plugins"` object:

```json
{
  "version": 2,
  "plugins": {
    "gooder@local": [
      {
        "scope": "user",
        "installPath": "/Users/YOUR_USERNAME/.claude/plugins/cache/local/gooder/1.0.0",
        "version": "1.0.0",
        "installedAt": "2026-01-01T00:00:00.000Z",
        "lastUpdated": "2026-01-01T00:00:00.000Z"
      }
    ],
    "...existing plugins stay here...": []
  }
}
```

**Important:** Replace `YOUR_USERNAME` with your actual macOS username. To find it, run `whoami` in Terminal.

---

## Step 3 — Restart Claude Code

Close and reopen Claude Code, or start a new session. The skills are now available.

---

## Step 4 — Verify installation

In a Claude Code session, ask:

> "What skills do you have available?"

You should see `gooder-brand-trainer`, `gooder-tone-validator`, and `gooder-ux-guide` listed.

---

## Using the Skills

### Skill 1: Train your brand voice

Tell Claude: **"Use the gooder-brand-trainer skill"**

Claude will ask for your brand name, then guide you through uploading or pasting brand materials. It will extract your brand voice patterns and save a profile file to `~/.claude/gooder/profiles/`.

Supported input formats:
- Paste text directly into the chat
- Share file paths: PDFs, Word docs, TXT, HTML, images (PNG/JPG)
- Share URLs to brand websites, style guides, or campaign pages

On first use you'll be asked to confirm where to save your brand profiles (default: `~/.claude/gooder/profiles/`).

---

### Skill 2: Validate copy against your brand voice

Tell Claude: **"Use the gooder-tone-validator skill"**

Claude will ask which brand profile to use, then accept the copy you want to validate (paste, file, or URL). It returns:
- An overall score out of 100 (pass threshold: 75)
- Per-dimension scores across 8 areas
- Severity-flagged issues (INFO / WARNING / FAIL / AUTOMATIC FAIL)
- Actionable improvement suggestions
- Optional: rewritten copy that fixes flagged issues

Works with: email, SMS, push notifications, UX journey copy, social copy, concept copy, general copy.

**Requires:** A brand profile trained with gooder-brand-trainer.

---

### Skill 3: Write UX copy with your brand voice

Tell Claude: **"Use the gooder-ux-guide skill"**

Claude will optionally load your brand profile, then help you:
- Write new UX copy for any screen or component
- Review and improve existing UX copy
- Get guidance on a full journey or flow

Works with: onboarding, error states, empty states, CTAs, form copy, tooltips, modals, push notifications, success states, loading states.

Can run without a brand profile (uses universal UX writing best practices) or with one (adds your brand voice on top).

---

## Using All 3 Skills Together (Recommended Workflow)

1. **Train** — Run gooder-brand-trainer with your brand materials. Takes 10–20 minutes the first time.
2. **Write** — Use gooder-ux-guide to produce UX copy with your brand voice applied.
3. **Validate** — Use gooder-tone-validator to score the copy before it goes to design or production.

---

## Multiple Brands

Each brand gets its own profile file. You can train as many brands as you like:
- `~/.claude/gooder/profiles/acme-corp.md`
- `~/.claude/gooder/profiles/acme-foundation.md`
- `~/.claude/gooder/profiles/client-brand.md`

When you invoke Skill 2 or 3, simply tell Claude which brand profile to use.

---

## Updating a Brand Profile

Run gooder-brand-trainer again with the same brand name. New materials are merged into the existing profile — nothing is overwritten unless you explicitly ask to update a field.

---

## Troubleshooting

**Skills not showing up after installation:**
- Make sure `installed_plugins.json` has valid JSON (no trailing commas)
- Check the `installPath` matches your actual username
- Restart Claude Code

**"Profile not found" error in Skill 2 or 3:**
- Run gooder-brand-trainer first to create the profile
- Check the brand name matches exactly (case-sensitive, hyphens not spaces)

**Profile saved to wrong location:**
- The first time you run gooder-brand-trainer, it asks you to confirm the storage path
- To change it, re-run the skill and specify the new path when prompted

---

## Support

Contact your Gooder account manager for help with installation or training.
