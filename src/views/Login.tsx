"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function Login() {
  const dispatch = useAppDispatch();
  const { loading: isLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      toast.success("Welcome back");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : err?.detail || "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="flex items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6" data-testid="login-form">
          <div>
            <div className="w-9 h-9 rounded-md bg-foreground text-background flex items-center justify-center font-display font-semibold mb-6">V</div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">Sign in to Vegnar ERP</h1>
            <p className="text-sm text-muted-foreground mt-1">Welcome back. Please enter your details.</p>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input name="email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required data-testid="login-email-input" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input name="password" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required data-testid="login-password-input" className="mt-1" />
            </div>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full h-9" data-testid="login-submit-btn">
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            No account? <Link href="/register" className="underline underline-offset-2 text-foreground" data-testid="register-link">Create organization</Link>
          </p>
          <div className="text-[11px] text-muted-foreground bg-muted/50 border border-border rounded-md p-3">
            <p className="font-medium text-foreground/80 mb-1">Default super admin</p>
            <p>Run <span className="font-mono">npm run seed</span> to create the first admin account.</p>
          </div>
        </form>
      </div>
      <div className="hidden lg:block relative overflow-hidden border-l border-border">
        <img src="https://images.unsplash.com/photo-1635776062360-af423602aff3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYWJzdHJhY3QlMjBncmFkaWVudHxlbnwwfHx8fDE3ODc3MDMyMDJ8MA&ixlib=rb-4.1.0&q=85"
          alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-background/10 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 space-y-2">
          <p className="text-xs uppercase tracking-widest text-foreground/70">Vegnar ERP</p>
          <p className="font-display text-2xl font-semibold max-w-md">One system for your leads, sales, inventory & GST invoicing.</p>
        </div>
      </div>
    </div>
  );
}
