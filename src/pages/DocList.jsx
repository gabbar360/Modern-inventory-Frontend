import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, money, fmtDate } from "@/lib/api";
import { PageHeader, StatusPill, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Trash } from "@phosphor-icons/react";

export function DocForm({ kind, endpoint, onCreated, trigger, defaultCustomerId, openControl }) {
  // kind: "quotation" | "sales-order" | "invoice"
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customer_id, setCustomerId] = useState(defaultCustomerId || "");
  const [items, setItems] = useState([{ product_id: "", name: "", hsn: "", quantity: 1, unit: "PCS", rate: 0, discount_pct: 0, gst_rate: 18 }]);
  const [notes, setNotes] = useState("");

  useEffect(() => { setCustomerId(defaultCustomerId || ""); }, [defaultCustomerId]);
  useEffect(() => { if (openControl?.prefillItems) setItems(openControl.prefillItems); }, [openControl?.prefillItems]);
  useEffect(() => { if (!open) return;
    Promise.all([api.get("/customers"), api.get("/products")])
      .then(([c,p]) => { setCustomers(c.data || []); setProducts(p.data || []); })
      .catch((err) => console.warn("Failed to load customers/products:", err.message));
  }, [open]);
  useEffect(() => { if (openControl?.open !== undefined) setOpen(openControl.open); }, [openControl]);

  const totals = useMemo(() => {
    let sub = 0, tax = 0, cost = 0;
    for (const it of items) {
      const qty = Number(it.quantity || 0);
      const rate = Number(it.rate || 0);
      const costPrice = Number(it.purchase_price !== undefined ? it.purchase_price : (it.cost_price !== undefined ? it.cost_price : (products.find(p => p.id === it.product_id)?.purchase_price || 0)));
      const line = qty * rate;
      const afterDisc = line * (1 - Number(it.discount_pct || 0) / 100);
      const t = afterDisc * Number(it.gst_rate || 0) / 100;
      sub += afterDisc;
      tax += t;
      cost += qty * costPrice;
    }
    const profit = sub - cost;
    const marginPct = sub > 0 ? (profit / sub) * 100 : 0;
    return { sub, tax, cost, profit, marginPct, total: sub + tax };
  }, [items, products]);

  const setItem = (idx, k, v) => setItems((arr)=>arr.map((it,i)=>i===idx?{...it, [k]: k==="name"||k==="hsn"||k==="unit"||k==="product_id"?v:Number(v)}:it));
  const pickProduct = (idx, pid) => {
    const p = products.find((x)=>x.id===pid);
    if (!p) return;
    setItems((arr)=>arr.map((it,i)=>i===idx?{
      product_id: p.id,
      name: p.name,
      hsn: p.hsn,
      quantity: it.quantity || 1,
      unit: p.unit,
      rate: p.selling_price,
      purchase_price: p.purchase_price || 0,
      cost_price: p.purchase_price || 0,
      discount_pct: 0,
      gst_rate: p.gst_rate
    }:it));
  };
  const addRow = () => setItems((a)=>[...a,{ product_id:"", name:"", hsn:"", quantity:1, unit:"PCS", rate:0, discount_pct:0, gst_rate:18 }]);
  const rmRow = (i) => setItems((a)=>a.filter((_,idx)=>idx!==i));

  const submit = async () => {
    if (!customer_id) return toast.error("Select a customer");
    if (!items.length || items.some((i)=>!i.name)) return toast.error("Add at least one line item");
    try { const { data } = await api.post(endpoint, { customer_id, items, notes }); toast.success(`${kind} created (${data.number})`); setOpen(false); onCreated && onCreated(data); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };

  return (
    <Sheet open={open} onOpenChange={(v)=>{ setOpen(v); openControl?.onOpenChange?.(v); }}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader><SheetTitle className="capitalize">New {kind.replace("-", " ")}</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-4 text-sm">
          <div><Label className="text-xs">Customer</Label>
            <Select value={customer_id} onValueChange={setCustomerId}>
              <SelectTrigger data-testid={`${kind}-customer-select`}><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>{customers.map((c)=><SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="border border-border rounded-md overflow-hidden">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-[10px]">Product</TableHead><TableHead className="text-[10px] w-16">Qty</TableHead>
                <TableHead className="text-[10px] w-20">Rate</TableHead><TableHead className="text-[10px] w-16">Disc%</TableHead>
                <TableHead className="text-[10px] w-16">GST%</TableHead><TableHead className="text-[10px] text-right">Line</TableHead><TableHead className="w-8"></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {items.map((it, idx) => {
                  const line = it.quantity*it.rate*(1-it.discount_pct/100)*(1+it.gst_rate/100);
                  return (<TableRow key={idx} className="tbl-row">
                    <TableCell className="p-1">
                      <Select value={it.product_id} onValueChange={(v)=>pickProduct(idx, v)}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue placeholder={it.name || "Pick product"} /></SelectTrigger>
                        <SelectContent>{products.map((p)=><SelectItem key={p.id} value={p.id}>{p.name} · {p.sku}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1"><Input className="h-7 text-xs" type="number" value={it.quantity} onChange={(e)=>setItem(idx,"quantity",e.target.value)} /></TableCell>
                    <TableCell className="p-1"><Input className="h-7 text-xs" type="number" value={it.rate} onChange={(e)=>setItem(idx,"rate",e.target.value)} /></TableCell>
                    <TableCell className="p-1"><Input className="h-7 text-xs" type="number" value={it.discount_pct} onChange={(e)=>setItem(idx,"discount_pct",e.target.value)} /></TableCell>
                    <TableCell className="p-1"><Input className="h-7 text-xs" type="number" value={it.gst_rate} onChange={(e)=>setItem(idx,"gst_rate",e.target.value)} /></TableCell>
                    <TableCell className="p-1 text-right tabular text-xs">{money(line)}</TableCell>
                    <TableCell className="p-1"><Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={()=>rmRow(idx)}><Trash size={12}/></Button></TableCell>
                  </TableRow>);
                })}
              </TableBody>
            </Table>
          </div>
          <Button type="button" variant="outline" size="sm" className="h-7" onClick={addRow}><Plus size={12} className="mr-1"/>Add line</Button>

          {/* Real-time Profit & Loss (P&L) Estimation Card */}
          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                Real-Time Profit & Margin (P&L)
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold tabular ${
                totals.marginPct >= 20 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" :
                totals.marginPct >= 10 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" :
                "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
              }`}>
                {totals.marginPct.toFixed(1)}% Gross Margin
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/50 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground block">Revenue (Subtotal)</span>
                <span className="font-medium tabular">{money(totals.sub)}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Est. Cost (COGS)</span>
                <span className="font-medium tabular text-slate-600 dark:text-slate-400">{money(totals.cost)}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Est. Gross Profit</span>
                <span className={`font-bold tabular ${totals.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {money(totals.profit)}
                </span>
              </div>
            </div>

            {totals.marginPct < 10 && totals.sub > 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 pt-0.5">
                ⚠️ Low Margin Notice: Gross margin is below 10%. Selling price is very close to purchase cost.
              </p>
            )}
          </div>

          <div className="ml-auto text-right space-y-1 text-xs">
            <div className="flex justify-end gap-6"><span className="text-muted-foreground">Subtotal</span><span className="tabular w-24">{money(totals.sub)}</span></div>
            <div className="flex justify-end gap-6"><span className="text-muted-foreground">Tax</span><span className="tabular w-24">{money(totals.tax)}</span></div>
            <div className="flex justify-end gap-6 font-medium text-sm"><span>Total</span><span className="tabular w-24">{money(totals.total)}</span></div>
          </div>
          <div><Label className="text-xs">Notes</Label><Textarea rows={2} value={notes} onChange={(e)=>setNotes(e.target.value)} /></div>
          <Button className="w-full h-9" onClick={submit} data-testid={`save-${kind}-btn`}>Create {kind.replace("-", " ")}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DocList({ title, subtitle, endpoint, kind, detailPath, extraCols }) {
  const [rows, setRows] = useState([]);
  const nav = useNavigate();
  const load = async () => {
    try {
      const { data } = await api.get(endpoint);
      setRows(data || []);
    } catch (err) {
      console.warn(`Failed to load ${endpoint}:`, err.message);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [endpoint]);
  return (
    <div className="space-y-4" data-testid={`${kind}-page`}>
      <PageHeader title={title} subtitle={subtitle} actions={
        <DocForm kind={kind} endpoint={endpoint} onCreated={load}
          trigger={<Button size="sm" className="h-8" data-testid={`new-${kind}-btn`}><Plus size={14} className="mr-1"/>New {title.slice(0,-1).toLowerCase()}</Button>} />
      } />
      {rows.length === 0 ? <EmptyState title={`No ${title.toLowerCase()} yet`} /> :
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">#</TableHead><TableHead className="text-xs">Customer</TableHead>
              <TableHead className="text-xs">Date</TableHead><TableHead className="text-xs text-right">Total</TableHead>
              <TableHead className="text-xs text-right">Profit (₹)</TableHead>
              <TableHead className="text-xs text-center">Margin %</TableHead>
              {extraCols?.headers?.map((h)=><TableHead key={h} className="text-xs text-right">{h}</TableHead>)}
              <TableHead className="text-xs">Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rows.map((r) => {
                const profit = r.gross_profit || 0;
                const margin = r.gross_margin_pct || 0;
                return (
                  <TableRow key={r.id} className="tbl-row hover:bg-muted/40 cursor-pointer" onClick={()=>detailPath && nav(detailPath(r))} data-testid={`${kind}-row-${r.id}`}>
                    <TableCell className="py-1.5 px-3 font-mono text-xs">{r.number}</TableCell>
                    <TableCell className="py-1.5 px-3 font-medium">{r.customer_name}</TableCell>
                    <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{fmtDate(r.quote_date || r.order_date || r.invoice_date)}</TableCell>
                    <TableCell className="py-1.5 px-3 text-right tabular font-medium">{money(r.grand_total)}</TableCell>
                    <TableCell className="py-1.5 px-3 text-right tabular text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {profit ? money(profit) : "—"}
                    </TableCell>
                    <TableCell className="py-1.5 px-3 text-center">
                      {margin ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tabular ${
                          margin >= 20 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" :
                          margin >= 10 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" :
                          "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                        }`}>
                          {margin.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    {extraCols?.render?.(r)}
                    <TableCell className="py-1.5 px-3"><StatusPill status={r.status} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>}
    </div>
  );
}

export default DocList;
