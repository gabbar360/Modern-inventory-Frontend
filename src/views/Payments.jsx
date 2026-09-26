import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, money, fmtDate } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "@phosphor-icons/react";

export default function Payments() {
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ customer_id:"", amount:0, mode:"Bank Transfer", reference:"", bank:"", utr:"" });
  const upd = (k) => (e) => setF((s)=>({...s, [k]: e?.target ? e.target.value : e}));
  const load = async () => {
    try {
      const [p, c] = await Promise.all([api.get("/payments"), api.get("/customers")]);
      setRows(p.data || []);
      setCustomers(c.data || []);
    } catch (err) {
      console.warn("Failed to load payments:", err.message);
    }
  };
  useEffect(() => { load(); }, []);
  const submit = async () => {
    if (!f.customer_id) return toast.error("Select customer");
    try { await api.post("/payments", { ...f, amount: Number(f.amount) }); toast.success("Payment recorded"); setOpen(false); load(); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };
  return (
    <div className="space-y-4" data-testid="payments-page">
      <PageHeader title="Payments" subtitle="Money received from customers, allocated to invoices." actions={
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild><Button size="sm" className="h-8" data-testid="new-payment-btn"><Plus size={14} className="mr-1"/>Receive payment</Button></SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader><SheetTitle>Receive Payment</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-3 text-sm">
              <div><Label htmlFor="payments-amount" className="text-xs">Customer</Label>
                <Select value={f.customer_id} onValueChange={upd("customer_id")}>
                  <SelectTrigger name="amount" id="payments-amount" data-testid="payment-customer-select"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{customers.map((c)=><SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}</SelectContent>
                </Select></div>
              <div><Label htmlFor="payments-amount" className="text-xs">Amount</Label><Input name="amount" id="payments-amount" type="number" value={f.amount} onChange={upd("amount")} data-testid="payment-amount-input" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label htmlFor="payments-mode" className="text-xs">Mode</Label><Input name="mode" id="payments-mode" value={f.mode} onChange={upd("mode")} /></div>
                <div><Label htmlFor="payments-reference" className="text-xs">Reference</Label><Input name="reference" id="payments-reference" value={f.reference} onChange={upd("reference")} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label htmlFor="payments-bank" className="text-xs">Bank</Label><Input name="bank" id="payments-bank" value={f.bank} onChange={upd("bank")} /></div>
                <div><Label htmlFor="payments-utr" className="text-xs">UTR</Label><Input name="utr" id="payments-utr" value={f.utr} onChange={upd("utr")} /></div>
              </div>
              <Button className="w-full h-9" onClick={submit} data-testid="save-payment-btn">Record</Button>
            </div>
          </SheetContent>
        </Sheet>
      } />
      {rows.length === 0 ? <EmptyState title="No payments yet" /> :
        <div className="border border-border rounded-lg bg-card">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Receipt #</TableHead><TableHead className="text-xs">Customer</TableHead>
              <TableHead className="text-xs">Date</TableHead><TableHead className="text-xs">Mode</TableHead>
              <TableHead className="text-xs">Reference</TableHead><TableHead className="text-xs text-right">Amount</TableHead>
            </TableRow></TableHeader>
            <TableBody>{rows.map((r) => (
              <TableRow key={r.id} className="tbl-row" data-testid={`payment-row-${r.id}`}>
                <TableCell className="py-1.5 px-3 font-mono text-xs">{r.number}</TableCell>
                <TableCell className="py-1.5 px-3">{r.customer_name}</TableCell>
                <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{fmtDate(r.payment_date)}</TableCell>
                <TableCell className="py-1.5 px-3 text-xs">{r.mode}</TableCell>
                <TableCell className="py-1.5 px-3 text-xs font-mono">{r.reference || r.utr || "—"}</TableCell>
                <TableCell className="py-1.5 px-3 text-right tabular font-medium">{money(r.amount)}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>}
    </div>
  );
}
