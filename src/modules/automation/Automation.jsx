import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Lightning } from "@phosphor-icons/react";

const TRIGGERS = ["invoice_created", "payment_received", "lead_created", "so_confirmed", "dispatch_scheduled", "quotation_created", "low_stock"];
const ACTIONS = ["send_whatsapp", "create_task", "send_alert"];

export default function Automation() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name:"", trigger:"invoice_created", action:"send_whatsapp", template:"", enabled:true });
  const upd = (k)=>(v)=>setF((s)=>({...s, [k]: v?.target ? v.target.value : v}));
  const load = async () => { const { data } = await api.get("/automation-rules"); setRows(data); };
  useEffect(()=>{load();}, []);
  const submit = async () => {
    if (!f.name) return toast.error("Name required");
    try { await api.post("/automation-rules", f); toast.success("Rule created"); setOpen(false); load(); }
    catch(e){ toast.error(e?.response?.data?.detail || "Failed"); }
  };
  const toggle = async (r) => { await api.patch(`/automation-rules/${r.id}`, { enabled: !r.enabled }); load(); };
  return (
    <div className="space-y-4" data-testid="automation-page">
      <PageHeader title="Automation" subtitle="No-code rules: when X happens, automatically do Y." actions={
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild><Button size="sm" className="h-8" data-testid="new-rule-btn"><Plus size={14} className="mr-1"/>New rule</Button></SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader><SheetTitle>New automation rule</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-3 text-sm">
              <div><Label className="text-xs">Name</Label><Input value={f.name} onChange={upd("name")} data-testid="rule-name-input" /></div>
              <div><Label className="text-xs">When (trigger)</Label>
                <Select value={f.trigger} onValueChange={upd("trigger")}>
                  <SelectTrigger data-testid="rule-trigger-select"><SelectValue /></SelectTrigger>
                  <SelectContent>{TRIGGERS.map(t=><SelectItem key={t} value={t}>{t.replace(/_/g," ")}</SelectItem>)}</SelectContent>
                </Select></div>
              <div><Label className="text-xs">Then (action)</Label>
                <Select value={f.action} onValueChange={upd("action")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ACTIONS.map(a=><SelectItem key={a} value={a}>{a.replace(/_/g," ")}</SelectItem>)}</SelectContent>
                </Select></div>
              <div><Label className="text-xs">Message / template</Label>
                <Textarea rows={3} value={f.template} onChange={upd("template")} placeholder="e.g. Hi {customer}, your invoice {number} for ₹{total} is ready" /></div>
              <Button className="w-full h-9" onClick={submit} data-testid="save-rule-btn">Create rule</Button>
            </div>
          </SheetContent>
        </Sheet>
      } />
      {rows.length === 0 ? <EmptyState title="No rules yet" hint="Automate WhatsApp acknowledgements, follow-up tasks and alerts." /> :
        <div className="border border-border rounded-lg bg-card">
          <Table><TableHeader><TableRow>
            <TableHead className="text-xs w-8"></TableHead>
            <TableHead className="text-xs">Name</TableHead><TableHead className="text-xs">When</TableHead>
            <TableHead className="text-xs">Then</TableHead><TableHead className="text-xs">Enabled</TableHead>
          </TableRow></TableHeader><TableBody>
          {rows.map((r)=>(<TableRow key={r.id} className="tbl-row" data-testid={`rule-row-${r.id}`}>
            <TableCell className="py-1.5 px-3"><Lightning size={14}/></TableCell>
            <TableCell className="py-1.5 px-3 font-medium">{r.name}
              {r.template && <div className="text-[11px] text-muted-foreground truncate max-w-md">{r.template}</div>}
            </TableCell>
            <TableCell className="py-1.5 px-3 text-xs capitalize">{r.trigger?.replace(/_/g," ")}</TableCell>
            <TableCell className="py-1.5 px-3 text-xs capitalize">{r.action?.replace(/_/g," ")}</TableCell>
            <TableCell className="py-1.5 px-3"><Switch checked={r.enabled} onCheckedChange={()=>toggle(r)} data-testid={`toggle-rule-${r.id}`}/></TableCell>
          </TableRow>))}
          </TableBody></Table>
        </div>}
    </div>
  );
}
