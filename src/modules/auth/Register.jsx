import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", company_name: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await register(form); toast.success("Organization created"); nav("/"); }
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
          <div><Label className="text-xs">Full name</Label>
            <Input value={form.name} onChange={upd("name")} required className="mt-1" data-testid="register-name-input" /></div>
          <div><Label className="text-xs">Company / Organization</Label>
            <Input value={form.company_name} onChange={upd("company_name")} required className="mt-1" data-testid="register-company-input" /></div>
          <div><Label className="text-xs">Email</Label>
            <Input type="email" value={form.email} onChange={upd("email")} required className="mt-1" data-testid="register-email-input" /></div>
          <div><Label className="text-xs">Password</Label>
            <Input type="password" value={form.password} onChange={upd("password")} required minLength={6} className="mt-1" data-testid="register-password-input" /></div>
        </div>
        <Button className="w-full h-9" type="submit" disabled={busy} data-testid="register-submit-btn">
          {busy ? "Creating…" : "Create organization"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Already have an account? <Link to="/login" className="text-foreground underline underline-offset-2">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
