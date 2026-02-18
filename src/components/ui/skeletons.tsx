import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface CardSkeletonProps {
  count?: number;
  className?: string;
}

export function CardSkeleton({ count = 3, className }: CardSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-6 space-y-4">
          {/* Top row: avatar + title + subtitle */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          {/* Middle: text lines */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-[80%]" />
            <Skeleton className="h-3 w-[60%]" />
          </div>
          {/* Bottom: action button */}
          <Skeleton className="h-8 w-24 rounded-md" />
        </Card>
      ))}
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn("w-full rounded-lg border", className)}>
      {/* Header row */}
      <div className="flex items-center gap-4 bg-muted/50 px-4 py-3">
        <Skeleton className="h-4 w-40" />
        {Array.from({ length: columns - 1 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 border-t px-4 py-3">
          <Skeleton className="h-3 w-48" />
          {Array.from({ length: columns - 1 }).map((_, colIndex) => {
            const widths = ["w-20", "w-32", "w-24"];
            return <Skeleton key={colIndex} className={cn("h-3", widths[colIndex % widths.length])} />;
          })}
        </div>
      ))}
    </div>
  );
}

interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

export function FormSkeleton({ fields = 4, className }: FormSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Form fields */}
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          {/* Label */}
          <Skeleton className={cn("h-3", i === 0 ? "w-32" : "w-20")} />
          {/* Input */}
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      {/* Submit button */}
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  );
}
