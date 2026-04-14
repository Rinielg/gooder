# Gooder / SHARE

Next.js 14 app using shadcn/ui (new-york style). This is the source of truth
for all UI components.

## Component locations
- UI primitives: `components/ui/` (shadcn components — owned by this repo, edit freely)
- App components: `components/`
- Stories: `stories/` (Storybook v10, deployed to GitHub Pages)

## Design system
- Figma library: Gooder-Shadcn-ui (file key: KzW4GoFpnpPoz8nAvLJr9B)
- Figma ↔ code mapping: see `.claude/rules/design-system.md`
- Tokens: HSL CSS variables in `app/globals.css`, Tailwind 3.4

## Workflow
- When mirroring Figma changes into code, edit files in `components/ui/` directly.
- Do NOT reference the upstream shadcn/ui GitHub repo — components are owned here.
- Verify visual changes in Storybook (`npm run storybook`) before pushing.

## Don't
- Upgrade Next.js or Tailwind without explicit instruction.
- Touch `package-lock.json` manually — regenerate via `npm install`.