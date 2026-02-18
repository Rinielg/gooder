'use client'

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import React from "react"

interface BreadcrumbsProps {
  /** Override labels for specific path segments. Keys are URL segments, values are display names. */
  overrides?: Record<string, string>
}

export function Breadcrumbs({ overrides }: BreadcrumbsProps) {
  const pathname = usePathname()

  // Split pathname and filter empty strings
  const segments = pathname.split('/').filter(Boolean)

  // Default label mapping
  const defaultLabels: Record<string, string> = {
    chat: 'Chat',
    profiles: 'Profiles',
    standards: 'Standards & Rules',
    objectives: 'Objectives',
    definitions: 'Definitions',
    outputs: 'Output Library',
    settings: 'Settings',
    train: 'Training',
  }

  // Merge overrides into default labels
  const labels = { ...defaultLabels, ...overrides }

  // Return null for top-level pages (single segment)
  if (segments.length <= 1) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          // Build cumulative href
          const href = '/' + segments.slice(0, index + 1).join('/')

          // Resolve display label
          const label = labels[segment] || segment

          // Check if this is the last segment
          const isLast = index === segments.length - 1

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
