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
