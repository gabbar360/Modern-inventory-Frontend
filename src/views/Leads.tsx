import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, fmtDate, money } from "@/lib/api";
import { PageHeader, StatusPill, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, ArrowRight } from "@phosphor-icons/react";

const STAGES = ["new", "contacted", "qualified", "quotation_sent", "negotiation", "won", "lost"];

function LeadForm({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ company_name: "", contact_person: "", mobile: "", email: "", source: "manual", stage: "new", priority: "medium", product_interest: "", estimated_value: 0, notes: "" });
  const upd = (k) => (v) => setF((s) => ({ ...s, [k]: v?.target ? v.target.value : v }));
  const submit = async () => {
    try { const { data } = await api.post("/leads", f); toast.success(`Lead created`); onCreated(data); setOpen(false); setF({ ...f, company_name: "", contact_person: "", mobile: "", email: "" }); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild><Button size="sm" className="h-8" data-testid="new-lead-btn"><Plus size={14} className="mr-1" />New lead</Button></SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader><SheetTitle>New lead</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-3 text-sm">
          <div><Label htmlFor="leads-company_name" className="text-xs">Company</Label><Input name="company_name" id="leads-company_name" value={f.company_name} onChange={upd("company_name")} data-testid="lead-company-input" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label htmlFor="leads-contact_person" className="text-xs">Contact</Label><Input name="contact_person" id="leads-contact_person" value={f.contact_person} onChange={upd("contact_person")} /></div>
            <div><Label htmlFor="leads-mobile" className="text-xs">Mobile</Label><Input name="mobile" id="leads-mobile" value={f.mobile} onChange={upd("mobile")} /></div>
          </div>
          <div><Label htmlFor="leads-email" className="text-xs">Email</Label><Input name="email" id="leads-email" value={f.email} onChange={upd("email")} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label htmlFor="leads-product_interest" className="text-xs">Source</Label>
              <Select value={f.source} onValueChange={upd("source")}><SelectTrigger name="product_interest" id="leads-product_interest"><SelectValue /></SelectTrigger>
                <SelectContent>{["manual","website","meta","referral","whatsapp","other"].map((s)=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div><Label htmlFor="leads-priority" className="text-xs">Priority</Label>
              <Select value={f.priority} onValueChange={upd("priority")}><SelectTrigger name="priority" id="leads-priority"><SelectValue /></SelectTrigger>
                <SelectContent>{["low","medium","high"].map((s)=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div><Label htmlFor="leads-product_interest" className="text-xs">Product interest</Label><Input name="product_interest" id="leads-product_interest" value={f.product_interest} onChange={upd("product_interest")} /></div>
          <div><Label htmlFor="leads-estimated_value" className="text-xs">Estimated value (₹)</Label><Input name="estimated_value" id="leads-estimated_value" type="number" value={f.estimated_value} onChange={upd("estimated_value")} /></div>
          <div><Label htmlFor="leads-notes" className="text-xs">Notes</Label><Textarea name="notes" id="leads-notes" rows={3} value={f.notes} onChange={upd("notes")} /></div>
          <Button className="w-full h-9" onClick={submit} data-testid="save-lead-btn">Save lead</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [view, setView] = useState("list");
  const [filter, setFilter] = useState("");
  const load = async () => { const { data } = await api.get("/leads"); setLeads(data); };
  useEffect(() => { load(); }, []);
  const moveStage = async (id, stage) => { await api.post(`/leads/${id}/stage`, { stage }); toast.success("Stage updated"); load(); };
  const convert = async (id) => { await api.post(`/leads/${id}/convert`); toast.success("Converted to customer"); load(); };

  const filtered = filter ? leads.filter((l) => l.company_name.toLowerCase().includes(filter.toLowerCase()) || l.email?.toLowerCase().includes(filter.toLowerCase())) : leads;

  return (
    <div className="space-y-4" data-testid="leads-page">
      <PageHeader title="Leads" subtitle="Track prospects from first touch to won." actions={<LeadForm onCreated={() => load()} />} />
      <Tabs value={view} onValueChange={setView}>
        <div className="flex items-center gap-3">
          <TabsList>
            <TabsTrigger value="list" data-testid="leads-view-list">List</TabsTrigger>
            <TabsTrigger value="kanban" data-testid="leads-view-kanban">Kanban</TabsTrigger>
          </TabsList>
          <Input name="filter-leads" id="leads-filter-leads" placeholder="Filter leads…" value={filter} onChange={(e)=>setFilter(e.target.value)} className="h-8 max-w-xs" data-testid="leads-filter" />
        </div>
        <TabsContent value="list" className="mt-4">
          {filtered.length === 0 ? <EmptyState title="No leads yet" hint="Create your first lead to get started." /> :
            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-xs">Company</TableHead><TableHead className="text-xs">Contact</TableHead>
                  <TableHead className="text-xs">Source</TableHead><TableHead className="text-xs">Stage</TableHead>
                  <TableHead className="text-xs text-right">Est. Value</TableHead><TableHead className="text-xs">Created</TableHead><TableHead></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map((l) => (
                    <TableRow key={l.id} className="tbl-row hover:bg-muted/40" data-testid={`lead-row-${l.id}`}>
                      <TableCell className="py-1.5 px-3 font-medium">{l.company_name}</TableCell>
                      <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{l.contact_person || "—"}<br/>{l.mobile}</TableCell>
                      <TableCell className="py-1.5 px-3 text-xs capitalize">{l.source}</TableCell>
                      <TableCell className="py-1.5 px-3">
                        <Select value={l.stage} onValueChange={(v)=>moveStage(l.id, v)}>
                          <SelectTrigger name="input_2" id="leads-input-1" className="h-7 text-xs w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>{STAGES.map((s)=><SelectItem key={s} value={s}>{s.replace(/_/g," ")}</SelectItem>)}</SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-1.5 px-3 text-right tabular">{money(l.estimated_value)}</TableCell>
                      <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{fmtDate(l.created_at)}</TableCell>
                      <TableCell className="py-1.5 px-3">
                        {l.stage !== "won" && <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={()=>convert(l.id)} data-testid={`convert-lead-${l.id}`}>Convert <ArrowRight size={12} className="ml-1"/></Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>}
        </TabsContent>
        <TabsContent value="kanban" className="mt-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {STAGES.map((s) => (
              <div key={s} className="w-64 shrink-0 bg-muted/40 rounded-lg p-2" data-testid={`kanban-col-${s}`}>
                <div className="flex items-center justify-between px-2 py-1"><span className="text-xs font-medium capitalize">{s.replace(/_/g," ")}</span>
                  <span className="text-[10px] text-muted-foreground">{filtered.filter((l)=>l.stage===s).length}</span></div>
                <div className="space-y-2 mt-1">
                  {filtered.filter((l)=>l.stage===s).map((l) => (
                    <div key={l.id} className="bg-card border border-border rounded-md p-2.5 text-xs card-hover" data-testid={`kanban-card-${l.id}`}>
                      <p className="font-medium">{l.company_name}</p>
                      <p className="text-muted-foreground mt-0.5">{l.contact_person}</p>
                      <div className="flex items-center justify-between mt-2"><StatusPill status={l.priority} /><span className="tabular text-[11px]">{money(l.estimated_value)}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
