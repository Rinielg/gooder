"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FigmaExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string | null;
  expiresAt: string | null;
  loading: boolean;
  error: string | null;
}

export function FigmaExportDialog({
  open,
  onOpenChange,
  code,
  expiresAt,
  loading,
  error,
}: FigmaExportDialogProps) {
  const [copied, setCopied] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;

    function update() {
      const diff = new Date(expiresAt!).getTime() - Date.now();
      setMinutesLeft(Math.max(0, Math.ceil(diff / 60000)));
    }

    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  function handleCopy() {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export for Figma</DialogTitle>
          <DialogDescription>
            Open the Gooder plugin in Figma and enter this code to create your frames.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Creating export...</span>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {code && !loading && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-mono font-bold tracking-widest select-all">
                  {code}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {minutesLeft !== null && minutesLeft > 0 && (
                <p className="text-xs text-muted-foreground">
                  Expires in {minutesLeft} minute{minutesLeft !== 1 ? "s" : ""}
                </p>
              )}

              <div className="text-xs text-muted-foreground text-center space-y-1 mt-2">
                <p>1. Open Figma and run the <strong>Gooder Brand Voice</strong> plugin</p>
                <p>2. Enter the code above and click <strong>Create Frames</strong></p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
