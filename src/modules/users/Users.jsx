import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, User } from "@phosphor-icons/react";

const ROLES = ["super_admin","admin","sales_manager","sales_executive","purchase_manager","warehouse_manager","accounts","viewer"];

export default function Users() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name:"", email:"", password:"", role:"sales_executive" });
  const upd = (k)=>(v)=>setF((s)=>({...s, [k]: v?.target ? v.target.value : v}));
  const load = async () => { const { data } = await api.get("/users"); setRows(data); };
  useEffect(()=>{load();}, []);
  const submit = async () => {
    if (!f.email || !f.password) return toast.error("Email & password required");
    try { await api.post("/users", f); toast.success("User invited"); setOpen(false); setF({ name:"", email:"", password:"", role:"sales_executive" }); load(); }
    catch(e){ toast.error(e?.response?.data?.detail || "Failed"); }
  };
  const setRole = async (id, role) => { try { await api.patch(`/users/${id}/role`, { role }); toast.success("Role updated"); load(); } catch(e){ toast.error(e?.response?.data?.detail); } };
  return (
    <div className="space-y-4" data-testid="users-page">
      <PageHeader title="Users & Roles" subtitle="Team members with role-based access." actions={
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild><Button size="sm" className="h-8" data-testid="new-user-btn"><Plus size={14} className="mr-1"/>Invite user</Button></SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader><SheetTitle>Invite user</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-3 text-sm">
              <div><Label className="text-xs">Name</Label><Input value={f.name} onChange={upd("name")} data-testid="user-name-input" /></div>
              <div><Label className="text-xs">Email</Label><Input type="email" value={f.email} onChange={upd("email")} data-testid="user-email-input" /></div>
              <div><Label className="text-xs">Temporary password</Label><Input type="password" value={f.password} onChange={upd("password")} data-testid="user-password-input" /></div>
              <div><Label className="text-xs">Role</Label>
                <Select value={f.role} onValueChange={upd("role")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map(r=><SelectItem key={r} value={r}>{r.replace(/_/g," ")}</SelectItem>)}</SelectContent>
                </Select></div>
              <Button className="w-full h-9" onClick={submit} data-testid="save-user-btn">Invite</Button>
            </div>
          </SheetContent>
        </Sheet>
      } />
      {rows.length === 0 ? <EmptyState title="No users yet" /> :
        <div className="border border-border rounded-lg bg-card">
          <Table><TableHeader><TableRow>
            <TableHead className="text-xs"></TableHead>
            <TableHead className="text-xs">Name</TableHead><TableHead className="text-xs">Email</TableHead>
            <TableHead className="text-xs">Role</TableHead>
          </TableRow></TableHeader><TableBody>
          {rows.map((u)=>(<TableRow key={u.id} className="tbl-row" data-testid={`user-row-${u.id}`}>
            <TableCell className="py-1.5 px-3 w-8"><User size={14} className="text-muted-foreground"/></TableCell>
            <TableCell className="py-1.5 px-3 font-medium">{u.name}</TableCell>
            <TableCell className="py-1.5 px-3 text-xs">{u.email}</TableCell>
            <TableCell className="py-1.5 px-3">
              <Select value={u.role} onValueChange={(v)=>setRole(u.id, v)}>
                <SelectTrigger className="h-7 w-44 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map(r=><SelectItem key={r} value={r}>{r.replace(/_/g," ")}</SelectItem>)}</SelectContent>
              </Select>
            </TableCell>
          </TableRow>))}
          </TableBody></Table>
        </div>}
    </div>
  );
}
