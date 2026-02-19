"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { FormInput, FormErrorSummary } from "@/components/ui/form-field";
import { toast } from "sonner";
import { Loader2, Zap } from "lucide-react";

const registerSchema = z.object({
  workspaceName: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  async function onSubmit(values: RegisterFormValues) {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      if (!authData.user) {
        toast.error("Failed to create account");
        return;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authData.user.id,
          workspaceName:
            values.workspaceName ||
            `${values.email.split("@")[0]}'s Workspace`,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        toast.error(errData.error || "Failed to set up workspace");
        return;
      }

      toast.success("Account created! Redirecting...");
      router.push("/chat");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Brand panel — left, hidden on mobile */}
      <div className="hidden md:flex md:w-[45%] flex-col items-center justify-center bg-primary/5 p-12 relative overflow-hidden">
        {/* Wordmark */}
        <div className="flex items-center gap-2 mb-10">
          <Zap className="w-6 h-6 text-primary" />
          <span className="text-xl font-semibold tracking-tight">Gooder</span>
        </div>

        {/* Screenshot */}
        <div className="w-full max-w-sm shadow-elevation-3 rounded-xl ring-1 ring-border/50 overflow-hidden rotate-[-2deg]">
          <Image
            src="/screenshots/dashboard-preview.png"
            alt="Gooder dashboard preview"
            width={640}
            height={400}
            className="w-full h-auto"
            priority
          />
        </div>

        {/* Tagline */}
        <p className="mt-10 text-center text-muted-foreground text-sm max-w-xs leading-relaxed">
          Brand voice that sounds like you — every time.
        </p>
      </div>

      {/* Form panel — right, full width on mobile */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile-only wordmark (brand panel is hidden on mobile) */}
          <div className="flex md:hidden items-center justify-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-lg font-semibold tracking-tight">Gooder</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Set up your workspace to get started
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormErrorSummary />
              <FormInput name="workspaceName" label="Workspace name">
                <Input
                  type="text"
                  placeholder="My Brand Team"
                  autoComplete="organization"
                />
              </FormInput>
              <FormInput name="email" label="Email">
                <Input
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </FormInput>
              <FormInput
                name="password"
                label="Password"
                description="Min 8 characters"
              >
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </FormInput>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create account
              </Button>
            </form>
          </Form>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
