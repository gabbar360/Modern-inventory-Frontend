import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Warehouse as WhIcon } from "@phosphor-icons/react";

export default function Warehouses() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name:"", code:"", address:"", manager:"", contact:"", capacity:0, status:"active" });
  const upd = (k)=>(e)=>setF((s)=>({...s, [k]: k==="capacity"?Number(e.target.value):e.target.value}));
  const load = async () => { const { data } = await api.get("/warehouses"); setRows(data); };
  useEffect(()=>{load();}, []);
  const submit = async () => {
    if (!f.name) return toast.error("Name required");
    try { await api.post("/warehouses", f); toast.success("Warehouse added"); setOpen(false); load(); }
    catch(e){ toast.error(e?.response?.data?.detail || "Failed"); }
  };
  return (
    <div className="space-y-4" data-testid="warehouses-page">
      <PageHeader title="Warehouses" subtitle="Multiple stock locations with capacity and manager assignment." actions={
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild><Button size="sm" className="h-8" data-testid="new-wh-btn"><Plus size={14} className="mr-1"/>New warehouse</Button></SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader><SheetTitle>New warehouse</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Name</Label><Input value={f.name} onChange={upd("name")} data-testid="wh-name-input" /></div>
                <div><Label className="text-xs">Code</Label><Input value={f.code} onChange={upd("code")} /></div>
              </div>
              <div><Label className="text-xs">Address</Label><Input value={f.address} onChange={upd("address")} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Manager</Label><Input value={f.manager} onChange={upd("manager")} /></div>
                <div><Label className="text-xs">Contact</Label><Input value={f.contact} onChange={upd("contact")} /></div>
              </div>
              <div><Label className="text-xs">Capacity</Label><Input type="number" value={f.capacity} onChange={upd("capacity")} /></div>
              <Button className="w-full h-9" onClick={submit} data-testid="save-wh-btn">Save</Button>
            </div>
          </SheetContent>
        </Sheet>
      } />
      {rows.length === 0 ? <EmptyState title="No warehouses yet" hint="Add a warehouse to track stock per location." /> :
        <div className="grid md:grid-cols-3 gap-3">
          {rows.map((w)=>(
            <div key={w.id} className="border border-border rounded-lg p-4 card-hover bg-card" data-testid={`wh-card-${w.id}`}>
              <div className="flex items-start gap-3"><WhIcon size={20} className="mt-0.5"/>
                <div className="min-w-0"><p className="font-medium text-sm">{w.name}</p>
                <p className="text-[11px] text-muted-foreground">{w.code} · {w.status}</p></div>
              </div>
              <div className="text-xs text-muted-foreground mt-3 space-y-0.5">
                <p>{w.address || "—"}</p>
                <p>Manager: {w.manager || "—"}</p>
                <p>Contact: {w.contact || "—"}</p>
                <p>Capacity: {w.capacity ? Number(w.capacity).toLocaleString("en-IN") : "—"}</p>
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
}
