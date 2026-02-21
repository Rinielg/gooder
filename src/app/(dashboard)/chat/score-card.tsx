"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Sparkles, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { AdherenceScore } from "@/types"

// ── Ring constants ───────────────────────────────────────────────────────
const RING_SIZE = 80
const RING_STROKE = 8
const RADIUS = (RING_SIZE - RING_STROKE) / 2  // 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS     // ~226.2

// Threshold = 7 (per CONTEXT.md "~7+" decision)
// Note: existing scoreColor/scoreBadgeVariant/scoreBarColor in page.tsx use 8 — those
// are Phase 6 functions and are untouched. This file uses 7 consistently.
function getRingColor(score: number): string {
  if (score >= 7) return "hsl(142 71% 45%)"  // green
  if (score >= 5) return "hsl(38 92% 50%)"   // yellow
  return "hsl(0 84% 60%)"                     // red — matches --destructive token
}

function getDimBadgeVariant(score: number): "success" | "warning" | "destructive" {
  if (score >= 7) return "success"
  if (score >= 5) return "warning"
  return "destructive"
}

const DIMENSION_LABELS: Record<string, string> = {
  voice_consistency: "Voice Consistency",
  tone_accuracy: "Tone Accuracy",
  compliance: "Compliance",
  terminology: "Terminology",
  platform_optimization: "Platform Optimization",
  objective_alignment: "Objective Alignment",
  pattern_adherence: "Pattern Adherence",
  overall_quality: "Overall Quality",
}

// ── ScoreRing ────────────────────────────────────────────────────────────

interface ScoreRingProps {
  score: number  // 0–10
}

export function ScoreRing({ score }: ScoreRingProps) {
  const offset = CIRCUMFERENCE * (1 - score / 10)
  const color = getRingColor(score)
  const cx = RING_SIZE / 2

  return (
    <svg
      width={RING_SIZE}
      height={RING_SIZE}
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      role="img"
      aria-label={`Adherence score: ${score.toFixed(1)} out of 10`}
    >
      {/* Track ring */}
      <circle
        cx={cx}
        cy={cx}
        r={RADIUS}
        fill="none"
        stroke="hsl(240 5.9% 90%)"
        strokeWidth={RING_STROKE}
      />
      {/* Progress ring — animated on mount via motion.circle */}
      <motion.circle
        cx={cx}
        cy={cx}
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        initial={{ strokeDashoffset: CIRCUMFERENCE }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        transform={`rotate(-90 ${cx} ${cx})`}
        // CRITICAL: transform is a static SVG attribute here — NOT framer animate target.
        // Framer-motion rotate applies to element center, not SVG coordinate center.
        // If transform is passed to animate={}, the 12-o'clock start position breaks.
      />
      {/* Score value centered */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="17"
        fontWeight="700"
        fill={color}
        className="font-sans"
      >
        {score.toFixed(1)}
      </text>
    </svg>
  )
}

// ── ScoreCard ─────────────────────────────────────────────────────────────

interface ScoreCardProps {
  messageId: string
  score: AdherenceScore
  isExpanded: boolean          // outer toggle — controlled by expandedIds in page.tsx
  onToggleExpand: () => void   // fires toggleExpand(messageId) in page.tsx
  onImprove: (messageId: string, score: AdherenceScore, dimensionKey?: string) => void
  isSuperseded: boolean        // true when regeneratedFromIds.has(messageId)
}

export function ScoreCard({
  messageId,
  score,
  isExpanded,
  onToggleExpand,
  onImprove,
  isSuperseded,
}: ScoreCardProps) {
  // Per-dimension row expand state — independent of outer card toggle
  const [expandedDims, setExpandedDims] = useState<Set<string>>(new Set())
  // Show passing dimensions toggle
  const [showAll, setShowAll] = useState(false)

  // Failing-first sort
  type DimEntry = [string, { score: number; weight: number; notes: string; flags: any[] }]
  const entries = Object.entries(score.scores) as DimEntry[]
  const failing = entries.filter(([, d]) => d.score < 7)
  const passing = entries.filter(([, d]) => d.score >= 7)
  const sorted = [...failing, ...passing]

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card/50 overflow-hidden",
        isSuperseded && "opacity-40 pointer-events-none"
      )}
    >
      {/* Card header — triggers outer expand */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
      >
        {/* Radial score ring */}
        <ScoreRing score={score.overall_score} />

        {/* Score summary */}
        <div className="flex-1 text-left space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tabular-nums">
              {score.overall_score.toFixed(1)}/10
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                score.pass ? "text-green-600" : "text-red-600"
              )}
            >
              {score.pass ? "Pass" : "Fail"}
            </span>
            {failing.length > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                {failing.length} failing
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Adherence score</p>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded detail area */}
      {isExpanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          {/* Dimension rows */}
          {sorted.map(([key, dim]) => {
            const isFailing = dim.score < 7
            if (!isFailing && !showAll) return null
            const isRowExpanded = expandedDims.has(key)
            return (
              <div key={key} className="rounded-md border border-border">
                {/* Row header */}
                <button
                  onClick={() => {
                    setExpandedDims((prev) => {
                      const next = new Set(prev)
                      next.has(key) ? next.delete(key) : next.add(key)
                      return next
                    })
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-accent/50 transition-colors"
                >
                  <span className="font-medium text-foreground">
                    {DIMENSION_LABELS[key] ?? key}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getDimBadgeVariant(dim.score)}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {dim.score.toFixed(1)}
                    </Badge>
                    <ChevronDown
                      className={cn(
                        "w-3 h-3 transition-transform duration-200",
                        isRowExpanded && "rotate-180"
                      )}
                    />
                  </div>
                </button>

                {/* Expandable content — CSS grid-rows trick for exact-height animation */}
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-200 ease-out",
                    isRowExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-3 pb-2 pt-1 space-y-2 border-t border-border">
                      {dim.notes && (
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          {dim.notes}
                        </p>
                      )}
                      {/* Per-dimension Improve — fires directly, no AlertDialog */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={() => onImprove(messageId, score, key)}
                      >
                        <Sparkles className="w-2.5 h-2.5 mr-1" />
                        Improve
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Show all passing toggle */}
          {passing.length > 0 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAll ? "Hide passing" : `Show ${passing.length} passing`}
            </button>
          )}

          {/* Overall Improve button — AlertDialog confirm, only when NOT superseded and score fails */}
          {!score.pass && !isSuperseded && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  Improve
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Improve with feedback</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    {/* asChild renders as <div> to allow block children — avoids <div> inside <p> hydration error */}
                    <div className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        The following dimensions scored below passing. Claude will regenerate addressing these issues:
                      </p>
                      {failing.map(([key, dim]) => (
                        <div key={key} className="space-y-0.5">
                          <p className="font-medium text-foreground">
                            {DIMENSION_LABELS[key] ?? key} — {dim.score.toFixed(1)}/10
                          </p>
                          {dim.notes && (
                            <p className="text-muted-foreground text-xs">{dim.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onImprove(messageId, score)}>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Send with feedback
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Superseded label — replaces Improve when isSuperseded */}
          {isSuperseded && (
            <p className="text-[10px] text-muted-foreground italic text-center py-1">
              Superseded — new response generated
            </p>
          )}
        </div>
      )}
    </div>
  )
}
