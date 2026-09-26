import { useEffect, useState } from "react";
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

export default function PaymentsMade() {
  const [rows, setRows] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ vendor_id:"", amount:0, mode:"Bank Transfer", reference:"", bank:"", utr:"" });
  const upd = (k)=>(v)=>setF((s)=>({...s, [k]: v?.target ? v.target.value : v}));
  const load = async () => {
    try {
      const [p, v] = await Promise.all([api.get("/payments-made"), api.get("/vendors")]);
      setRows(p.data || []);
      setVendors(v.data || []);
    } catch (err) {
      console.warn("Failed to load payments made:", err.message);
    }
  };
  useEffect(()=>{load();}, []);
  const submit = async () => {
    if (!f.vendor_id) return toast.error("Select vendor");
    try { await api.post("/payments-made", { ...f, amount: Number(f.amount) }); toast.success("Payment recorded"); setOpen(false); load(); }
    catch(e){ toast.error(e?.response?.data?.detail || "Failed"); }
  };
  return (
    <div className="space-y-4" data-testid="payments-made-page">
      <PageHeader title="Payments Made" subtitle="Money paid to vendors and other parties." actions={
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild><Button size="sm" className="h-8" data-testid="new-payment-made-btn"><Plus size={14} className="mr-1"/>Pay vendor</Button></SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader><SheetTitle>Pay vendor</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-3 text-sm">
              <div><Label htmlFor="paymentsmade-amount" className="text-xs">Vendor</Label>
                <Select value={f.vendor_id} onValueChange={upd("vendor_id")}>
                  <SelectTrigger name="amount" id="paymentsmade-amount" data-testid="pm-vendor-select"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{vendors.map((v)=><SelectItem key={v.id} value={v.id}>{v.company_name}</SelectItem>)}</SelectContent>
                </Select></div>
              <div><Label htmlFor="paymentsmade-amount" className="text-xs">Amount</Label><Input name="amount" id="paymentsmade-amount" type="number" value={f.amount} onChange={upd("amount")} data-testid="pm-amount-input" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label htmlFor="paymentsmade-mode" className="text-xs">Mode</Label><Input name="mode" id="paymentsmade-mode" value={f.mode} onChange={upd("mode")} /></div>
                <div><Label htmlFor="paymentsmade-reference" className="text-xs">Reference</Label><Input name="reference" id="paymentsmade-reference" value={f.reference} onChange={upd("reference")} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label htmlFor="paymentsmade-bank" className="text-xs">Bank</Label><Input name="bank" id="paymentsmade-bank" value={f.bank} onChange={upd("bank")} /></div>
                <div><Label htmlFor="paymentsmade-utr" className="text-xs">UTR</Label><Input name="utr" id="paymentsmade-utr" value={f.utr} onChange={upd("utr")} /></div>
              </div>
              <Button className="w-full h-9" onClick={submit} data-testid="save-payment-made-btn">Record</Button>
            </div>
          </SheetContent>
        </Sheet>
      } />
      {rows.length === 0 ? <EmptyState title="No vendor payments yet" /> :
        <div className="border border-border rounded-lg bg-card">
          <Table><TableHeader><TableRow>
            <TableHead className="text-xs">#</TableHead><TableHead className="text-xs">Vendor</TableHead>
            <TableHead className="text-xs">Date</TableHead><TableHead className="text-xs">Mode</TableHead>
            <TableHead className="text-xs">Ref</TableHead><TableHead className="text-xs text-right">Amount</TableHead>
          </TableRow></TableHeader>
          <TableBody>{rows.map((r)=>(<TableRow key={r.id} className="tbl-row" data-testid={`pm-row-${r.id}`}>
            <TableCell className="py-1.5 px-3 font-mono text-xs">{r.number}</TableCell>
            <TableCell className="py-1.5 px-3">{r.vendor_name}</TableCell>
            <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{fmtDate(r.payment_date)}</TableCell>
            <TableCell className="py-1.5 px-3 text-xs">{r.mode}</TableCell>
            <TableCell className="py-1.5 px-3 text-xs font-mono">{r.reference || r.utr || "—"}</TableCell>
            <TableCell className="py-1.5 px-3 text-right tabular font-medium">{money(r.amount)}</TableCell>
          </TableRow>))}</TableBody></Table>
        </div>}
    </div>
  );
}
