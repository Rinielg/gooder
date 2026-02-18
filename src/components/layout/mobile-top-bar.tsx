"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, Plus, Zap } from "lucide-react";

interface MobileTopBarProps {
  onMenuClick: () => void;
}

export function MobileTopBar({ onMenuClick }: MobileTopBarProps) {
  return (
    <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
      {/* Left: Hamburger menu */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Center: Logo/brand */}
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        <span className="text-lg font-semibold">Gooder</span>
      </div>

      {/* Right: New Chat shortcut */}
      <Link href="/chat">
        <Button variant="ghost" size="icon" aria-label="New chat">
          <Plus className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
}
