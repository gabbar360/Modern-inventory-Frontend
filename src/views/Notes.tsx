"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api, money, fmtDate } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus } from "@phosphor-icons/react";

function NoteForm({ kind, endpoint, onCreated }) {
  const isCredit = kind === "credit-note";
  const [open, setOpen] = useState(false);
  const [parties, setParties] = useState([]);
  const [products, setProducts] = useState([]);
  const [f, setF] = useState({ party_id: "", reason: "", items: [{ name: "", quantity: 1, unit: "PCS", rate: 0, discount_pct: 0, gst_rate: 18 }] });
  useEffect(() => { if (!open) return;
    Promise.all([api.get(isCredit ? "/customers" : "/vendors"), api.get("/products")])
      .then(([p, pr]) => { setParties(p.data || []); setProducts(pr.data || []); })
      .catch((err) => console.warn("Failed to load parties/products:", err.message));
  }, [open, isCredit]);
  const totals = useMemo(()=>{ let s=0,t=0; for(const it of f.items){ const l=it.quantity*it.rate*(1-it.discount_pct/100); s+=l; t+=l*it.gst_rate/100; } return { s, t, total:s+t }; }, [f.items]);
  const submit = async () => {
    if (!f.party_id) return toast.error("Select party");
    const payload = isCredit ? { customer_id: f.party_id, reason: f.reason, items: f.items } : { vendor_id: f.party_id, reason: f.reason, items: f.items };
    try { const { data } = await api.post(endpoint, payload); toast.success(`${data.number} created`); setOpen(false); onCreated(); }
    catch(e){ toast.error(e?.response?.data?.detail || "Failed"); }
  };
  const setItem = (i, k, v) => setF(s=>({...s, items: s.items.map((it,idx)=>idx===i?{...it,[k]:k==="name"||k==="unit"?v:Number(v)}:it)}));
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild><Button size="sm" className="h-8" data-testid={`new-${kind}-btn`}><Plus size={14} className="mr-1"/>New {isCredit?"credit":"debit"} note</Button></SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader><SheetTitle>New {isCredit?"credit":"debit"} note</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-3 text-sm">
          <div><Label htmlFor="notes-reason" className="text-xs">{isCredit?"Customer":"Vendor"}</Label>
            <Select value={f.party_id} onValueChange={(v)=>setF({...f, party_id:v})}>
              <SelectTrigger name="reason" id="notes-reason" data-testid={`${kind}-party-select`}><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{parties.map((p)=><SelectItem key={p.id} value={p.id}>{p.company_name}</SelectItem>)}</SelectContent>
            </Select></div>
          <div><Label htmlFor="notes-reason" className="text-xs">Reason</Label><Input name="reason" id="notes-reason" value={f.reason} onChange={(e)=>setF({...f, reason:e.target.value})} /></div>
          {f.items.map((it, i)=>(
            <div key={i} className="grid grid-cols-4 gap-2">
              <Input name="item" id="notes-item" placeholder="Item" value={it.name} onChange={(e)=>setItem(i,"name",e.target.value)} className="col-span-2 h-8 text-xs"/>
              <Input name="quantity" id="notes-quantity" type="number" value={it.quantity} onChange={(e)=>setItem(i,"quantity",e.target.value)} placeholder="Qty" className="h-8 text-xs"/>
              <Input name="rate" id="notes-rate" type="number" value={it.rate} onChange={(e)=>setItem(i,"rate",e.target.value)} placeholder="Rate" className="h-8 text-xs"/>
            </div>
          ))}
          <Button variant="outline" size="sm" className="h-7" onClick={()=>setF(s=>({...s, items:[...s.items, { name:"", quantity:1, unit:"PCS", rate:0, discount_pct:0, gst_rate:18 }]}))}>Add line</Button>
          <div className="text-right text-sm font-medium">Total: <span className="tabular">{money(totals.total)}</span></div>
          <Button className="w-full h-9" onClick={submit} data-testid={`save-${kind}-btn`}>Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function CreditNotes() {
  const [rows, setRows] = useState([]);
  const load = async () => { const { data } = await api.get("/credit-notes"); setRows(data); };
  useEffect(()=>{load();}, []);
  return (
    <div className="space-y-4" data-testid="credit-notes-page">
      <PageHeader title="Credit Notes" subtitle="Refund adjustments against customer invoices." actions={<NoteForm kind="credit-note" endpoint="/credit-notes" onCreated={load} />} />
      {rows.length === 0 ? <EmptyState title="No credit notes" /> :
        <div className="border border-border rounded-lg bg-card">
          <Table><TableHeader><TableRow>
            <TableHead className="text-xs">CN #</TableHead><TableHead className="text-xs">Customer</TableHead>
            <TableHead className="text-xs">Reason</TableHead><TableHead className="text-xs">Date</TableHead>
            <TableHead className="text-xs text-right">Amount</TableHead>
          </TableRow></TableHeader><TableBody>
          {rows.map((r)=>(<TableRow key={r.id} className="tbl-row" data-testid={`cn-row-${r.id}`}>
            <TableCell className="py-1.5 px-3 font-mono text-xs">{r.number}</TableCell>
            <TableCell className="py-1.5 px-3">{r.customer_name}</TableCell>
            <TableCell className="py-1.5 px-3 text-xs">{r.reason || "—"}</TableCell>
            <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{fmtDate(r.note_date)}</TableCell>
            <TableCell className="py-1.5 px-3 text-right tabular">{money(r.grand_total)}</TableCell>
          </TableRow>))}
          </TableBody></Table>
        </div>}
    </div>
  );
}

export function DebitNotes() {
  const [rows, setRows] = useState([]);
  const load = async () => { const { data } = await api.get("/debit-notes"); setRows(data); };
  useEffect(()=>{load();}, []);
  return (
    <div className="space-y-4" data-testid="debit-notes-page">
      <PageHeader title="Debit Notes" subtitle="Adjustments raised on vendor bills." actions={<NoteForm kind="debit-note" endpoint="/debit-notes" onCreated={load} />} />
      {rows.length === 0 ? <EmptyState title="No debit notes" /> :
        <div className="border border-border rounded-lg bg-card">
          <Table><TableHeader><TableRow>
            <TableHead className="text-xs">DN #</TableHead><TableHead className="text-xs">Vendor</TableHead>
            <TableHead className="text-xs">Reason</TableHead><TableHead className="text-xs">Date</TableHead>
            <TableHead className="text-xs text-right">Amount</TableHead>
          </TableRow></TableHeader><TableBody>
          {rows.map((r)=>(<TableRow key={r.id} className="tbl-row" data-testid={`dn-row-${r.id}`}>
            <TableCell className="py-1.5 px-3 font-mono text-xs">{r.number}</TableCell>
            <TableCell className="py-1.5 px-3">{r.vendor_name}</TableCell>
            <TableCell className="py-1.5 px-3 text-xs">{r.reason || "—"}</TableCell>
            <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{fmtDate(r.note_date)}</TableCell>
            <TableCell className="py-1.5 px-3 text-right tabular">{money(r.grand_total)}</TableCell>
          </TableRow>))}
          </TableBody></Table>
        </div>}
    </div>
  );
}

export default function Notes() {
  return <CreditNotes />;
}
