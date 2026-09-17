"use client";

import { useActionState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { signUpAction, signInWithGoogleAction, type AuthActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, AlertCircle } from "lucide-react";

const initialState: AuthActionState = {};

export function SignUpForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="rounded-[24px] border border-border/80 bg-card p-2 sm:p-4 shadow-xl">
        <CardHeader className="space-y-1.5 pb-4">
          <CardTitle className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Create your account
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Get started with 5 free active QR codes and real-time scan analytics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {googleEnabled && (
            <>
              <form action={signInWithGoogleAction}>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full h-11 rounded-[14px] font-semibold text-xs flex items-center justify-center gap-2.5 shadow-2xs hover:bg-muted/80"
                >
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign up with Google</span>
                </Button>
              </form>
              <div className="relative text-center text-[11px] font-medium text-muted-foreground my-2">
                <span className="bg-card px-3 relative z-10">or sign up with email</span>
                <div className="absolute inset-x-0 top-1/2 h-px bg-border/80" />
              </div>
            </>
          )}

          <form action={formAction} className="space-y-4">
            {state?.error && (
              <Alert variant="destructive" className="rounded-[14px] text-xs">
                <AlertCircle className="size-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">Your full name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Sarah Connor"
                autoComplete="name"
                required
                className="h-11 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">Work email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="sarah@company.com"
                autoComplete="email"
                required
                className="h-11 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
                className="h-11 text-xs"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-[14px] font-semibold text-xs shadow-md shadow-primary/20 hover:shadow-lg"
              disabled={pending}
            >
              {pending ? "Setting up workspace..." : "Create Account & Start Generating"}
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
