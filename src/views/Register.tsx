"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function Register() {
  const dispatch = useAppDispatch();
  const { loading: isLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", organization_name: "" });
  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(registerUser(form)).unwrap();
      toast.success("Organization created");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : err?.detail || "Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5" data-testid="register-form">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Create your workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">One organization can host multiple brands.</p>
        </div>
        <div className="space-y-3">
          <div><Label htmlFor="register-name" className="text-xs">Full name</Label>
            <Input name="name" id="register-name" value={form.name} onChange={upd("name")} required className="mt-1" data-testid="register-name-input" /></div>
          <div><Label htmlFor="register-org" className="text-xs">Company / Organization</Label>
            <Input name="organization_name" id="register-org" value={form.organization_name} onChange={upd("organization_name")} required className="mt-1" data-testid="register-company-input" /></div>
          <div><Label htmlFor="register-email" className="text-xs">Email</Label>
            <Input name="email" id="register-email" type="email" value={form.email} onChange={upd("email")} required className="mt-1" data-testid="register-email-input" /></div>
          <div><Label htmlFor="register-password" className="text-xs">Password</Label>
            <Input name="password" id="register-password" type="password" value={form.password} onChange={upd("password")} required minLength={6} className="mt-1" data-testid="register-password-input" /></div>
        </div>
        <Button className="w-full h-9" type="submit" disabled={isLoading} data-testid="register-submit-btn">
          {isLoading ? "Creating…" : "Create organization"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Already have an account? <Link href="/login" className="text-foreground underline underline-offset-2">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
