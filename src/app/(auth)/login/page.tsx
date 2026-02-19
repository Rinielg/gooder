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

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  async function onSubmit(values: LoginFormValues) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

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
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to continue
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormErrorSummary />
              <FormInput name="email" label="Email">
                <Input
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </FormInput>
              <FormInput name="password" label="Password">
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </FormInput>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>
          </Form>

          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
