import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api, money, fmtDate } from "@/lib/api";
import { PageHeader, StatusPill, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Trash } from "@phosphor-icons/react";

export default function VendorBills() {
  const [rows, setRows] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ vendor_id:"", bill_number:"", items:[{ product_id:"", name:"", quantity:1, unit:"PCS", rate:0, discount_pct:0, gst_rate:18 }], notes:"" });

  const load = async () => {
    const [b, v, p] = await Promise.all([api.get("/vendor-bills"), api.get("/vendors"), api.get("/products")]);
    setRows(b.data); setVendors(v.data); setProducts(p.data);
  };
  useEffect(()=>{load();}, []);

  const setItem = (idx, k, v) => setF((s)=>({...s, items: s.items.map((it,i)=>i===idx?{...it, [k]: ["name","unit","product_id"].includes(k)?v:Number(v)}:it)}));
  const pick = (idx, pid) => { const p = products.find(x=>x.id===pid); if (!p) return;
    setF((s)=>({...s, items: s.items.map((it,i)=>i===idx?{ product_id:p.id, name:p.name, quantity:it.quantity||1, unit:p.unit, rate:p.purchase_price, discount_pct:0, gst_rate:p.gst_rate }:it)}));
  };
  const totals = useMemo(()=>{ let s=0,t=0; for(const it of f.items){ const l=it.quantity*it.rate*(1-it.discount_pct/100); s+=l; t+=l*it.gst_rate/100; } return { s, t, total:s+t }; }, [f.items]);
  const submit = async () => {
    if (!f.vendor_id) return toast.error("Select vendor");
    try { await api.post("/vendor-bills", f); toast.success("Bill created"); setOpen(false); load(); }
    catch(e){ toast.error(e?.response?.data?.detail || "Failed"); }
  };

  return (
    <div className="space-y-4" data-testid="vendor-bills-page">
      <PageHeader title="Vendor Bills" subtitle="Record vendor invoices and track outstanding payables." actions={
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild><Button size="sm" className="h-8" data-testid="new-bill-btn"><Plus size={14} className="mr-1"/>New bill</Button></SheetTrigger>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader><SheetTitle>New vendor bill</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><Label htmlFor="vendorbills-bill_number" className="text-xs">Vendor</Label>
                  <Select value={f.vendor_id} onValueChange={(v)=>setF({...f, vendor_id:v})}>
                    <SelectTrigger name="bill_number" id="vendorbills-bill_number" data-testid="bill-vendor-select"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{vendors.map((v)=><SelectItem key={v.id} value={v.id}>{v.company_name}</SelectItem>)}</SelectContent>
                  </Select></div>
                <div><Label htmlFor="vendorbills-bill_number" className="text-xs">Vendor bill #</Label><Input name="bill_number" id="vendorbills-bill_number" value={f.bill_number} onChange={(e)=>setF({...f, bill_number:e.target.value})} /></div>
              </div>
              <div className="border border-border rounded-md overflow-hidden">
                <Table><TableHeader><TableRow>
                  <TableHead className="text-[10px]">Product</TableHead><TableHead className="text-[10px] w-14">Qty</TableHead>
                  <TableHead className="text-[10px] w-20">Rate</TableHead><TableHead className="text-[10px] w-14">GST%</TableHead>
                  <TableHead className="text-[10px] text-right">Line</TableHead><TableHead className="w-8"></TableHead>
                </TableRow></TableHeader>
                <TableBody>{f.items.map((it,idx)=>{
                  const l = it.quantity*it.rate*(1-it.discount_pct/100)*(1+it.gst_rate/100);
                  return (<TableRow key={idx} className="tbl-row">
                    <TableCell className="p-1"><Select value={it.product_id} onValueChange={(v)=>pick(idx,v)}>
                      <SelectTrigger name="input_2" id="vendorbills-input-1" className="h-7 text-xs"><SelectValue placeholder={it.name || "Pick"} /></SelectTrigger>
                      <SelectContent>{products.map((p)=><SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></TableCell>
                    <TableCell className="p-1"><Input name="quantity" id="vendorbills-quantity" type="number" className="h-7 text-xs" value={it.quantity} onChange={(e)=>setItem(idx,"quantity",e.target.value)} /></TableCell>
                    <TableCell className="p-1"><Input name="rate" id="vendorbills-rate" type="number" className="h-7 text-xs" value={it.rate} onChange={(e)=>setItem(idx,"rate",e.target.value)} /></TableCell>
                    <TableCell className="p-1"><Input name="gst_rate" id="vendorbills-gst_rate" type="number" className="h-7 text-xs" value={it.gst_rate} onChange={(e)=>setItem(idx,"gst_rate",e.target.value)} /></TableCell>
                    <TableCell className="p-1 text-right tabular text-xs">{money(l)}</TableCell>
                    <TableCell className="p-1"><Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={()=>setF(s=>({...s, items: s.items.filter((_,i)=>i!==idx)}))}><Trash size={12}/></Button></TableCell>
                  </TableRow>);
                })}</TableBody></Table>
              </div>
              <Button type="button" variant="outline" size="sm" className="h-7" onClick={()=>setF(s=>({...s, items:[...s.items, { product_id:"", name:"", quantity:1, unit:"PCS", rate:0, discount_pct:0, gst_rate:18 }]}))}><Plus size={12} className="mr-1"/>Add line</Button>
              <div className="text-right text-xs space-y-1"><div>Total: <span className="font-medium tabular">{money(totals.total)}</span></div></div>
              <Button className="w-full h-9" onClick={submit} data-testid="save-bill-btn">Save bill</Button>
            </div>
          </SheetContent>
        </Sheet>
      } />
      {rows.length === 0 ? <EmptyState title="No vendor bills yet" /> :
        <div className="border border-border rounded-lg bg-card">
          <Table><TableHeader><TableRow>
            <TableHead className="text-xs">Bill #</TableHead><TableHead className="text-xs">Vendor</TableHead>
            <TableHead className="text-xs">Date</TableHead><TableHead className="text-xs">Vendor Ref</TableHead>
            <TableHead className="text-xs text-right">Total</TableHead><TableHead className="text-xs text-right">Balance</TableHead>
            <TableHead className="text-xs">Status</TableHead>
          </TableRow></TableHeader>
          <TableBody>{rows.map((r)=>(<TableRow key={r.id} className="tbl-row" data-testid={`bill-row-${r.id}`}>
            <TableCell className="py-1.5 px-3 font-mono text-xs">{r.number}</TableCell>
            <TableCell className="py-1.5 px-3">{r.vendor_name}</TableCell>
            <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{fmtDate(r.bill_date)}</TableCell>
            <TableCell className="py-1.5 px-3 text-xs font-mono">{r.bill_number || "—"}</TableCell>
            <TableCell className="py-1.5 px-3 text-right tabular">{money(r.grand_total)}</TableCell>
            <TableCell className="py-1.5 px-3 text-right tabular">{money(r.balance_due)}</TableCell>
            <TableCell className="py-1.5 px-3"><StatusPill status={r.status}/></TableCell>
          </TableRow>))}</TableBody></Table>
        </div>}
    </div>
  );
}
