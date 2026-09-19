import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api, money, fmtDate } from "@/lib/api";
import { PageHeader, StatusPill, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Trash } from "@phosphor-icons/react";

export default function PurchaseOrders() {
  const [rows, setRows] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [vendor_id, setVendorId] = useState("");
  const [items, setItems] = useState([{ product_id:"", name:"", hsn:"", quantity:1, unit:"PCS", rate:0, discount_pct:0, gst_rate:18 }]);
  const [notes, setNotes] = useState("");

  const load = async () => {
    const [po, v, p] = await Promise.all([api.get("/purchase-orders"), api.get("/vendors"), api.get("/products")]);
    setRows(po.data); setVendors(v.data); setProducts(p.data);
  };
  useEffect(()=>{ load(); }, []);

  const setItem = (idx, k, v) => setItems((arr)=>arr.map((it,i)=>i===idx?{...it, [k]: ["name","hsn","unit","product_id"].includes(k)?v:Number(v)}:it));
  const pick = (idx, pid) => {
    const p = products.find(x=>x.id===pid);
    if (!p) return;
    setItems((a)=>a.map((it,i)=>i===idx?{ product_id:p.id, name:p.name, hsn:p.hsn, quantity:it.quantity||1, unit:p.unit, rate:p.purchase_price, discount_pct:0, gst_rate:p.gst_rate }:it));
  };
  const totals = useMemo(()=>{
    let s=0,t=0; for(const it of items){ const l=it.quantity*it.rate*(1-it.discount_pct/100); s+=l; t+=l*it.gst_rate/100; }
    return { s, t, total: s+t };
  }, [items]);
  const submit = async () => {
    if (!vendor_id) return toast.error("Select vendor");
    try{ await api.post("/purchase-orders", { vendor_id, items, notes }); toast.success("PO created"); setOpen(false); setItems([{ product_id:"", name:"", hsn:"", quantity:1, unit:"PCS", rate:0, discount_pct:0, gst_rate:18 }]); load(); }
    catch(e){ toast.error(e?.response?.data?.detail || "Failed"); }
  };
  return (
    <div className="space-y-4" data-testid="purchase-orders-page">
      <PageHeader title="Purchase Orders" subtitle="Raise POs on vendors, receive stock via GRN." actions={
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild><Button size="sm" className="h-8" data-testid="new-po-btn"><Plus size={14} className="mr-1"/>New PO</Button></SheetTrigger>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader><SheetTitle>New Purchase Order</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-4 text-sm">
              <div><Label className="text-xs">Vendor</Label>
                <Select value={vendor_id} onValueChange={setVendorId}>
                  <SelectTrigger data-testid="po-vendor-select"><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>{vendors.map((v)=><SelectItem key={v.id} value={v.id}>{v.company_name}</SelectItem>)}</SelectContent>
                </Select></div>
              <div className="border border-border rounded-md overflow-hidden">
                <Table><TableHeader><TableRow>
                  <TableHead className="text-[10px]">Product</TableHead><TableHead className="text-[10px] w-16">Qty</TableHead>
                  <TableHead className="text-[10px] w-20">Rate</TableHead><TableHead className="text-[10px] w-16">GST%</TableHead>
                  <TableHead className="text-[10px] text-right">Line</TableHead><TableHead className="w-8"></TableHead>
                </TableRow></TableHeader>
                <TableBody>{items.map((it,idx)=>{
                  const line = it.quantity*it.rate*(1-it.discount_pct/100)*(1+it.gst_rate/100);
                  return (<TableRow key={idx} className="tbl-row">
                    <TableCell className="p-1"><Select value={it.product_id} onValueChange={(v)=>pick(idx,v)}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue placeholder={it.name || "Pick"} /></SelectTrigger>
                      <SelectContent>{products.map((p)=><SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></TableCell>
                    <TableCell className="p-1"><Input type="number" className="h-7 text-xs" value={it.quantity} onChange={(e)=>setItem(idx,"quantity",e.target.value)} /></TableCell>
                    <TableCell className="p-1"><Input type="number" className="h-7 text-xs" value={it.rate} onChange={(e)=>setItem(idx,"rate",e.target.value)} /></TableCell>
                    <TableCell className="p-1"><Input type="number" className="h-7 text-xs" value={it.gst_rate} onChange={(e)=>setItem(idx,"gst_rate",e.target.value)} /></TableCell>
                    <TableCell className="p-1 text-right tabular text-xs">{money(line)}</TableCell>
                    <TableCell className="p-1"><Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={()=>setItems(a=>a.filter((_,i)=>i!==idx))}><Trash size={12}/></Button></TableCell>
                  </TableRow>);
                })}</TableBody></Table>
              </div>
              <Button type="button" variant="outline" size="sm" className="h-7" onClick={()=>setItems(a=>[...a,{ product_id:"", name:"", hsn:"", quantity:1, unit:"PCS", rate:0, discount_pct:0, gst_rate:18 }])}><Plus size={12} className="mr-1"/>Add line</Button>
              <div className="text-right text-xs space-y-1">
                <div>Subtotal: <span className="tabular">{money(totals.s)}</span></div>
                <div>Tax: <span className="tabular">{money(totals.t)}</span></div>
                <div className="font-medium text-sm">Total: <span className="tabular">{money(totals.total)}</span></div>
              </div>
              <div><Label className="text-xs">Notes</Label><Textarea rows={2} value={notes} onChange={(e)=>setNotes(e.target.value)} /></div>
              <Button className="w-full h-9" onClick={submit} data-testid="save-po-btn">Create PO</Button>
            </div>
          </SheetContent>
        </Sheet>
      } />
      {rows.length === 0 ? <EmptyState title="No purchase orders" /> :
        <div className="border border-border rounded-lg bg-card">
          <Table><TableHeader><TableRow>
            <TableHead className="text-xs">PO #</TableHead><TableHead className="text-xs">Vendor</TableHead>
            <TableHead className="text-xs">Date</TableHead><TableHead className="text-xs text-right">Total</TableHead>
            <TableHead className="text-xs">Status</TableHead></TableRow></TableHeader>
            <TableBody>{rows.map((r)=>(
              <TableRow key={r.id} className="tbl-row" data-testid={`po-row-${r.id}`}>
                <TableCell className="py-1.5 px-3 font-mono text-xs">{r.number}</TableCell>
                <TableCell className="py-1.5 px-3">{r.vendor_name}</TableCell>
                <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{fmtDate(r.po_date)}</TableCell>
                <TableCell className="py-1.5 px-3 text-right tabular">{money(r.grand_total)}</TableCell>
                <TableCell className="py-1.5 px-3"><StatusPill status={r.status} /></TableCell>
              </TableRow>
            ))}</TableBody></Table>
        </div>}
    </div>
  );
}
