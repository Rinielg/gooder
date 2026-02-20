# Phase 6: Chat Interface Core - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign the chat page's visual layer — message layout, rendering, streaming display, markdown formatting, and input area — while leaving all streaming logic (Vercel AI SDK / `useChat()`), data fetching, and business behavior untouched. Phase 7 handles scoring cards and Figma extraction UI.

</domain>

<decisions>
## Implementation Decisions

### Message Layout & Visual Distinction
- Opposite-side alignment: user messages right-aligned, AI responses left-aligned (classic chat layout)
- Both sides use a subtle card/surface with moderate border-radius and a light background fill — not pill bubbles
- User message surface: zinc/neutral (light gray card)
- AI response surface: white card with a soft shadow — elevated feel, AI responses as primary content
- Sender label only — "You" above user turns, "Gooder" above AI turns — no avatar images
- Generous spacing between turns: 32px+ between message groups
- Max width for both sides: ~80% of the chat content area

### Streaming & Scroll Behavior
- Pre-first-token indicator: typing indicator — animated bouncing dots inside an AI card (iMessage-style)
- Streaming cursor: pulsing ellipsis (...) appended after the last token during generation
- After streaming: brief highlight flash on the completed message card to signal completion, then copy button fades in
- Chat area width: full width of the content area (no max-width column constraint on the chat container itself)
- Auto-scroll during streaming; when user scrolls up, pause auto-scroll and show a "Jump to bottom" button anchored to the bottom-right corner of the message list
- During streaming: send button transforms into a stop/cancel button to cancel generation mid-stream
- Input area and the stop button are not disabled during streaming — user can cancel

### Markdown & Code Rendering
- Markdown renders live during streaming (not deferred to completion)
- Code blocks: light-themed (no dark background) with syntax highlighting
- Code block chrome: language label in the top-left, copy button in the top-right (GitHub/VS Code style)
- Message-level copy button: positioned below the message, left-aligned with the card — always visible, no hover required

### Input Area Design
- Textarea auto-resizes as user types — starts as single line, grows to a max height then scrolls internally
- Send button sits inside the textarea, anchored to the bottom-right corner (compact, like ChatGPT)
- Subtle "Cmd+Enter to send" hint displayed below the textarea in small gray text — always visible
- Input area is sticky — always visible at the bottom of the viewport regardless of scroll position

### Claude's Discretion
- Exact timing and easing of the typing indicator animation
- Specific shadow values for AI response cards (should align to existing elevation tokens)
- Max height before textarea scrolls internally
- Exact color of the completion highlight flash (should be brief and subtle)
- Spacing tokens used between sender label and message card
- Exact border-radius values (should align to established card patterns)

</decisions>

<specifics>
## Specific Ideas

- The typing indicator and streaming cursor should feel cohesive — animated dots while waiting, then ellipsis during token generation
- The "Jump to bottom" button should appear/disappear smoothly — not jarring when the user scrolls back down
- Light-themed code blocks should still be clearly distinguished from the surrounding AI card surface (use a slightly different background tone)
- The stop button transformation during streaming should be visually clear — not just a color change on the send icon

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. (Scoring cards and Figma extraction UI are Phase 7 per the roadmap.)

</deferred>

---

*Phase: 06-chat-interface-core*
*Context gathered: 2026-02-20*
