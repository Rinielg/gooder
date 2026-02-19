"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic2, ChevronRight } from "lucide-react"
import type { BrandProfile, ProfileStatus } from "@/types"

const statusColors: Record<ProfileStatus, string> = {
  draft: "outline",
  training: "warning",
  active: "success",
  archived: "secondary",
}

interface ProfileCardProps {
  profile: BrandProfile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Link href={`/profiles/${profile.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mic2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{profile.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant={statusColors[profile.status] as any}>
                  {profile.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {profile.completeness}% complete
                </span>
                {profile.active_modules?.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {profile.active_modules.length} modules
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </CardContent>
      </Card>
    </Link>
  )
}
