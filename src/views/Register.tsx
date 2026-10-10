"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", company_name: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await register(form); toast.success("Organization created"); router.push("/dashboard"); }
    catch (err) { toast.error(err?.response?.data?.detail || "Failed"); }
    finally { setBusy(false); }
  };
  const upd = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

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
          <div><Label htmlFor="register-company_name" className="text-xs">Company / Organization</Label>
            <Input name="company_name" id="register-company_name" value={form.company_name} onChange={upd("company_name")} required className="mt-1" data-testid="register-company-input" /></div>
          <div><Label htmlFor="register-email" className="text-xs">Email</Label>
            <Input name="email" id="register-email" type="email" value={form.email} onChange={upd("email")} required className="mt-1" data-testid="register-email-input" /></div>
          <div><Label htmlFor="register-password" className="text-xs">Password</Label>
            <Input name="password" id="register-password" type="password" value={form.password} onChange={upd("password")} required minLength={6} className="mt-1" data-testid="register-password-input" /></div>
        </div>
        <Button className="w-full h-9" type="submit" disabled={busy} data-testid="register-submit-btn">
          {busy ? "Creating…" : "Create organization"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Already have an account? <Link href="/login" className="text-foreground underline underline-offset-2">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
