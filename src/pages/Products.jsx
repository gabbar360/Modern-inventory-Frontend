import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, money } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, X } from "@phosphor-icons/react";

export default function Products() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name:"", sku:"", category:"", hsn:"", gst_rate:18, unit:"PCS", selling_price:0, purchase_price:0, opening_stock:0, min_stock:0, packaging_levels: [{name: "Pack", qty: 1}], weight_kg:0, description:"" });
  const upd = (k) => (e) => setF((s)=>({...s, [k]: e?.target ? (typeof s[k]==="number" ? Number(e.target.value) : e.target.value) : e}));
  const addPkg = () => setF(s => ({...s, packaging_levels: [...(s.packaging_levels||[]), { name: "", qty: 1 }]}));
  const updPkg = (i, k, v) => setF(s => { const p = [...(s.packaging_levels||[])]; p[i][k] = k==='qty' ? Number(v) : v; return {...s, packaging_levels: p}; });
  const rmPkg = (i) => setF(s => { const p = [...(s.packaging_levels||[])]; p.splice(i, 1); return {...s, packaging_levels: p}; });
  const load = async () => { const { data } = await api.get("/products"); setRows(data); };
  useEffect(() => { load(); }, []);
  const submit = async () => {
    if (!f.name || !f.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!f.sku || !f.sku.trim()) {
      toast.error("Product SKU is required");
      return;
    }
    try { await api.post("/products", { ...f, name: f.name.trim(), sku: f.sku.trim() }); toast.success("Product created"); setOpen(false); load(); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };
  const filtered = q ? rows.filter((r)=>r.name.toLowerCase().includes(q.toLowerCase()) || r.sku.toLowerCase().includes(q.toLowerCase())) : rows;
  return (
    <div className="space-y-4" data-testid="products-page">
      <PageHeader title="Products" subtitle="Catalog with pricing, HSN, GST and packing hierarchy." actions={
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild><Button size="sm" className="h-8" data-testid="new-product-btn"><Plus size={14} className="mr-1"/>New product</Button></SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader><SheetTitle>New product</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-3 text-sm">
              <div><Label className="text-xs">Name</Label><Input value={f.name} onChange={upd("name")} data-testid="prod-name-input" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">SKU</Label><Input value={f.sku} onChange={upd("sku")} /></div>
                <div><Label className="text-xs">Unit</Label><Input value={f.unit} onChange={upd("unit")} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Category</Label><Input value={f.category} onChange={upd("category")} /></div>
                <div><Label className="text-xs">HSN</Label><Input value={f.hsn} onChange={upd("hsn")} /></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label className="text-xs">Purchase ₹</Label><Input type="number" value={f.purchase_price} onChange={upd("purchase_price")} /></div>
                <div><Label className="text-xs">Selling ₹</Label><Input type="number" value={f.selling_price} onChange={upd("selling_price")} /></div>
                <div><Label className="text-xs">GST %</Label><Input type="number" value={f.gst_rate} onChange={upd("gst_rate")} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Opening stock</Label><Input type="number" value={f.opening_stock} onChange={upd("opening_stock")} /></div>
                <div><Label className="text-xs">Min stock</Label><Input type="number" value={f.min_stock} onChange={upd("min_stock")} /></div>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Packing hierarchy</p>
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={addPkg}><Plus size={12} className="mr-1"/>Add Level</Button>
                </div>
                <div className="space-y-2">
                  {(f.packaging_levels||[]).map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input placeholder="Level Name (e.g. Box)" value={p.name} onChange={(e)=>updPkg(i, 'name', e.target.value)} className="flex-1" />
                      <Input type="number" placeholder="Qty" value={p.qty} onChange={(e)=>updPkg(i, 'qty', e.target.value)} className="w-20" />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={()=>rmPkg(i)}><X size={14}/></Button>
                    </div>
                  ))}
                </div>
              </div>
              <div><Label className="text-xs">Description</Label><Textarea rows={2} value={f.description} onChange={upd("description")} /></div>
              <Button className="w-full h-9" onClick={submit} data-testid="save-product-btn">Save product</Button>
            </div>
          </SheetContent>
        </Sheet>
      } />
      <Input placeholder="Search products…" value={q} onChange={(e)=>setQ(e.target.value)} className="h-8 max-w-sm" data-testid="product-search" />
      {filtered.length === 0 ? <EmptyState title="No products" /> :
        <div className="border border-border rounded-lg bg-card">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Product</TableHead><TableHead className="text-xs">SKU</TableHead>
              <TableHead className="text-xs">HSN</TableHead><TableHead className="text-xs text-right">GST</TableHead>
              <TableHead className="text-xs text-right">Selling</TableHead><TableHead className="text-xs text-right">Stock</TableHead>
              <TableHead className="text-xs">Packing</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="tbl-row" data-testid={`product-row-${r.id}`}>
                  <TableCell className="py-1.5 px-3 font-medium">{r.name}<div className="text-[11px] text-muted-foreground">{r.category}</div></TableCell>
                  <TableCell className="py-1.5 px-3 font-mono text-xs">{r.sku}</TableCell>
                  <TableCell className="py-1.5 px-3 text-xs">{r.hsn}</TableCell>
                  <TableCell className="py-1.5 px-3 text-right tabular text-xs">{r.gst_rate}%</TableCell>
                  <TableCell className="py-1.5 px-3 text-right tabular">{money(r.selling_price)}</TableCell>
                  <TableCell className="py-1.5 px-3 text-right tabular">{Number(r.current_stock || 0).toLocaleString("en-IN")}</TableCell>
                  <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{(r.packaging_levels||[]).map(p=>`${p.qty} ${p.name}`).join(' → ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>}
    </div>
  );
}
