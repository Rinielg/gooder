"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface ProfileSelectorProps {
  profiles: Array<{ id: string; name: string; status: string; completeness: number }>;
  activeProfileId: string | null;
  onProfileChange: (id: string) => void;
  collapsed: boolean;
}

export function ProfileSelector({
  profiles,
  activeProfileId,
  onProfileChange,
  collapsed,
}: ProfileSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Get active profile
  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  // Filter profiles: only active/training, and match search term
  const filteredProfiles = profiles
    .filter((p) => p.status === "active" || p.status === "training")
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Reset search when popover closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchTerm("");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {collapsed ? (
          // Collapsed: Circle avatar with first letter
          <Button
            variant="ghost"
            className="h-9 w-9 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center p-0"
          >
            {activeProfile ? activeProfile.name.charAt(0).toUpperCase() : "?"}
          </Button>
        ) : (
          // Expanded: Full button with brand name
          <Button
            variant="ghost"
            className="w-full justify-between text-sm font-medium"
          >
            <span className="truncate">
              {activeProfile ? activeProfile.name : "Select profile"}
            </span>
            <ChevronsUpDown className="h-4 w-4 flex-shrink-0 opacity-50" />
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-64 p-0" align="start" sideOffset={8}>
        {/* Search input */}
        <div className="p-2">
          <Input
            placeholder="Search profiles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
        </div>

        {/* Profile list */}
        <ScrollArea className="max-h-64">
          <div className="p-1">
            {filteredProfiles.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No profiles found
              </div>
            ) : (
              filteredProfiles.map((profile) => {
                const isActive = profile.id === activeProfileId;
                return (
                  <button
                    key={profile.id}
                    onClick={() => {
                      onProfileChange(profile.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors",
                      isActive ? "bg-accent" : "hover:bg-accent"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        isActive ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate flex-1 text-left">
                      {profile.name}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
