import * as React from "react"
import { type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: LucideIcon
  heading: string
  description: string
  actionLabel: string
  onAction: () => void
  className?: string
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon: Icon, heading, description, actionLabel, onAction, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center py-16", className)}
      >
        <div className="rounded-full bg-muted p-3">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">{heading}</h3>
        <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
          {description}
        </p>
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState }
