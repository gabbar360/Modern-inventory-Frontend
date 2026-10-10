import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, money, compactMoney } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Warning } from "@phosphor-icons/react";

export default function Reorder() {
  const [rows, setRows] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selected, setSelected] = useState({});
  const [open, setOpen] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const load = async () => {
    try {
      const [s, v] = await Promise.all([api.get("/reorder-suggestions"), api.get("/vendors")]);
      const suggestions = Array.isArray(s.data?.suggestions) ? s.data.suggestions : (Array.isArray(s.data) ? s.data : []);
      setRows(suggestions); setVendors(v.data || []);
    } catch (e) {
      toast.error("Failed to load reorder suggestions");
    }
  };
  useEffect(() => { load(); }, []);
  const toggle = (id) => setSelected(s => ({ ...s, [id]: !s[id] }));
  const totalPicked = (rows || []).filter(r => selected[r.product_id]).reduce((a, r) => a + (r.estimated_cost || 0), 0);
  const createPO = async () => {
    if (!vendorId) return toast.error("Select a vendor");
    const items = (rows || []).filter(r => selected[r.product_id]).map(r => ({ product_id: r.product_id, quantity: r.suggested_qty }));
    if (!items.length) return toast.error("Select at least one product");
    try { const { data } = await api.post("/reorder-suggestions/create-po", { vendor_id: vendorId, items });
      toast.success(`Auto-PO ${data.number || ''} created`); setOpen(false); setSelected({}); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };

  const critical = (rows || []).filter(r => r.urgency === "critical").length;
  const picked = Object.values(selected).filter(Boolean).length;

  return (
    <div className="space-y-4" data-testid="reorder-page">
      <PageHeader title="Reorder Suggestions" subtitle="Auto-suggested purchase quantities from 90-day sales velocity." actions={
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild><Button size="sm" className="h-8" disabled={!picked} data-testid="create-auto-po-btn"><ShoppingCart size={14} className="mr-1"/>Create PO ({picked})</Button></SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader><SheetTitle>Create Auto-PO</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-3 text-sm">
              <p className="text-xs text-muted-foreground">{picked} products · Estimated {money(totalPicked)}</p>
              <div><label htmlFor="auto-po-vendor-select" className="text-xs">Vendor</label>
                <Select value={vendorId} onValueChange={setVendorId}>
                  <SelectTrigger name="auto-po-vendor" id="auto-po-vendor-select" data-testid="auto-po-vendor-select"><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>{vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.company_name}</SelectItem>)}</SelectContent>
                </Select></div>
              <Button className="w-full h-9" onClick={createPO} data-testid="confirm-auto-po-btn">Generate PO</Button>
            </div>
          </SheetContent>
        </Sheet>
      } />
      <div className="grid md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-[11px] uppercase tracking-wider text-muted-foreground">To reorder</p><p className="text-2xl font-display font-semibold tabular mt-1">{rows.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-[11px] uppercase tracking-wider text-muted-foreground">Critical</p><p className="text-2xl font-display font-semibold tabular mt-1 text-rose-600">{critical}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-[11px] uppercase tracking-wider text-muted-foreground">Estimated cost</p><p className="text-2xl font-display font-semibold tabular mt-1">{compactMoney(rows.reduce((a,r)=>a+r.estimated_cost,0))}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-[11px] uppercase tracking-wider text-muted-foreground">Selected</p><p className="text-2xl font-display font-semibold tabular mt-1">{picked}</p></CardContent></Card>
      </div>
      {rows.length === 0 ? <EmptyState title="All good" hint="Every SKU has sufficient cover based on 90-day velocity." /> :
        <div className="border border-border rounded-lg bg-card">
          <Table><TableHeader><TableRow>
            <TableHead className="text-xs w-8"></TableHead>
            <TableHead className="text-xs">Product</TableHead><TableHead className="text-xs text-right">Stock</TableHead>
            <TableHead className="text-xs text-right">Velocity/day</TableHead><TableHead className="text-xs text-right">Days left</TableHead>
            <TableHead className="text-xs text-right">Suggested</TableHead><TableHead className="text-xs text-right">Est. cost</TableHead>
            <TableHead className="text-xs">Urgency</TableHead>
          </TableRow></TableHeader>
          <TableBody>{rows.map((r) => (
            <TableRow key={r.product_id} className="tbl-row" data-testid={`reorder-row-${r.product_id}`}>
              <TableCell className="py-1.5 px-3">
                <input name="input_2" id="reorder-input-1" type="checkbox" checked={!!selected[r.product_id]} onChange={() => toggle(r.product_id)} className="h-4 w-4" data-testid={`select-${r.product_id}`}/>
              </TableCell>
              <TableCell className="py-1.5 px-3 font-medium">{r.product_name}<div className="text-[11px] text-muted-foreground font-mono">{r.sku}</div></TableCell>
              <TableCell className="py-1.5 px-3 text-right tabular">{r.current_stock}</TableCell>
              <TableCell className="py-1.5 px-3 text-right tabular text-xs">{r.daily_velocity}</TableCell>
              <TableCell className={`py-1.5 px-3 text-right tabular text-xs ${r.days_of_cover < 7 ? "text-rose-600" : "text-muted-foreground"}`}>{r.days_of_cover}</TableCell>
              <TableCell className="py-1.5 px-3 text-right tabular font-medium">{r.suggested_qty}</TableCell>
              <TableCell className="py-1.5 px-3 text-right tabular text-xs">{money(r.estimated_cost)}</TableCell>
              <TableCell className="py-1.5 px-3">
                <span className={`pill ${r.urgency === "critical" ? "pill-rose" : r.urgency === "high" ? "pill-amber" : "pill-slate"}`}>
                  {r.urgency === "critical" && <Warning size={10} className="mr-0.5"/>}{r.urgency}
                </span>
              </TableCell>
            </TableRow>
          ))}</TableBody></Table>
        </div>}
    </div>
  );
}
