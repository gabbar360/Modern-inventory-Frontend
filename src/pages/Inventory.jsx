import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, money, fmtDate } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Bits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  Plus, ArrowsDownUp, TrendUp, TrendDown, WhatsappLogo, Warning, CurrencyInr, Broadcast, Sparkle, Fire
} from "@phosphor-icons/react";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [stockHealth, setStockHealth] = useState(null);
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'critical' | 'dead'
  const [open, setOpen] = useState(false);

  // Stock Adjustment State
  const [f, setF] = useState({ product_id: "", quantity: 0, movement_type: "adjustment", warehouse: "Main", notes: "" });
  const upd = (k) => (v) => setF((s) => ({ ...s, [k]: v?.target ? (k === "quantity" ? Number(v.target.value) : v.target.value) : v }));

  // WhatsApp Clearance Modal State
  const [clearanceModalOpen, setClearanceModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discountPct, setDiscountPct] = useState(25);
  const [customMsg, setCustomMsg] = useState("");
  const [sendingClearance, setSendingClearance] = useState(false);

  const load = async () => {
    try {
      const [p, m, h] = await Promise.all([
        api.get("/products"),
        api.get("/inventory/movements"),
        api.get("/inventory/stock-health")
      ]);
      setProducts(p.data || []);
      setMovements(m.data || []);
      setStockHealth(h.data || null);
    } catch (err) {
      console.warn("Failed to load inventory data:", err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitAdjustment = async () => {
    if (!f.product_id) return toast.error("Pick product");
    try {
      await api.post("/inventory/adjust", f);
      toast.success("Stock updated");
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed");
    }
  };

  const openClearanceModal = (prod) => {
    setSelectedProduct(prod);
    setDiscountPct(25);
    const offerPrice = Math.round(prod.selling_price * 0.75 * 100) / 100;
    setCustomMsg(
      `🔥 Special Stock Clearance Offer from Vegnar!\n\n` +
      `Product: ${prod.name} (SKU: ${prod.sku})\n` +
      `Original Price: ₹${prod.selling_price}\n` +
      `Clearance Deal: ₹${offerPrice} (25% OFF!)\n` +
      `Available Stock: ${prod.current_stock.toLocaleString("en-IN")} units\n\n` +
      `Reply YES or call us now to secure this limited clearance stock before it runs out!`
    );
    setClearanceModalOpen(true);
  };

  const handleDiscountChange = (newPct) => {
    setDiscountPct(newPct);
    if (selectedProduct) {
      const offerPrice = Math.round(selectedProduct.selling_price * (1 - newPct / 100) * 100) / 100;
      setCustomMsg(
        `🔥 Special Stock Clearance Offer from Vegnar!\n\n` +
        `Product: ${selectedProduct.name} (SKU: ${selectedProduct.sku})\n` +
        `Original Price: ₹${selectedProduct.selling_price}\n` +
        `Clearance Deal: ₹${offerPrice} (${newPct}% OFF!)\n` +
        `Available Stock: ${selectedProduct.current_stock.toLocaleString("en-IN")} units\n\n` +
        `Reply YES or call us now to secure this limited clearance stock before it runs out!`
      );
    }
  };

  const handleSendClearanceBroadcast = async () => {
    if (!selectedProduct) return;
    setSendingClearance(true);
    try {
      const { data } = await api.post("/inventory/clearance-offer", {
        product_id: selectedProduct.id,
        discount_pct: discountPct,
        custom_message: customMsg
      });

      toast.success(
        `Clearance offer broadcasted to ${data.sent_count} buyers via WhatsApp! (Released: ${money(data.potential_cash_released)})`
      );
      setClearanceModalOpen(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to broadcast clearance offer");
    } finally {
      setSendingClearance(false);
    }
  };

  // Filtered Products based on health tab
  const displayedProducts = products.filter((p) => {
    const isCritical = p.current_stock <= p.min_stock;
    const isDead = stockHealth?.dead_stock_items?.some((d) => d.id === p.id);
    if (filterMode === "critical") return isCritical;
    if (filterMode === "dead") return isDead;
    return true;
  });

  return (
    <div className="space-y-5" data-testid="inventory-page">
      <PageHeader
        title="Inventory & Stock Health"
        subtitle="Real-time stock valuation, critical stock alerts, and WhatsApp dead-stock clearance engine."
        actions={
          <div className="flex gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="h-8" data-testid="new-adjust-btn">
                  <Plus size={14} className="mr-1" />
                  Stock Adjustment
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Stock Adjustment</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <Label className="text-xs">Product</Label>
                    <Select value={f.product_id} onValueChange={upd("product_id")}>
                      <SelectTrigger data-testid="adjust-product-select">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} · Stock {p.current_stock}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Movement</Label>
                    <Select value={f.movement_type} onValueChange={upd("movement_type")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["adjustment", "inward", "outward"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      value={f.quantity}
                      onChange={upd("quantity")}
                      data-testid="adjust-qty-input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Notes</Label>
                    <Input value={f.notes} onChange={upd("notes")} />
                  </div>
                  <Button className="w-full h-9" onClick={submitAdjustment} data-testid="save-adjust-btn">
                    Record
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        }
      />

      {/* Stock Health KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card className="bg-card shadow-sm border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Catalog Products</span>
            <p className="text-xl font-display font-semibold tabular">{products.length}</p>
            <span className="text-[11px] text-muted-foreground">Active SKUs tracked</span>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-rose-500/20 bg-rose-500/[0.02]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-rose-700 dark:text-rose-400">Critical Stock Items</span>
              <Warning size={16} className="text-rose-600" />
            </div>
            <p className="text-xl font-display font-semibold tabular text-rose-600 dark:text-rose-400">
              {stockHealth?.critical_count || 0}
            </p>
            <span className="text-[11px] text-rose-600">Stock &lt;= Minimum Threshold</span>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-amber-500/20 bg-amber-500/[0.02]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">Dead Stock (Slow Moving)</span>
              <Fire size={16} className="text-amber-600" />
            </div>
            <p className="text-xl font-display font-semibold tabular text-amber-600 dark:text-amber-400">
              {stockHealth?.dead_stock_count || 0}
            </p>
            <span className="text-[11px] text-amber-600">Zero movement in 60+ days</span>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-blue-500/20 bg-blue-500/[0.02]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-blue-700 dark:text-blue-400">Locked Working Capital</span>
              <CurrencyInr size={16} className="text-blue-600" />
            </div>
            <p className="text-xl font-display font-semibold tabular text-blue-600 dark:text-blue-400">
              {money(stockHealth?.total_locked_capital || 0)}
            </p>
            <span className="text-[11px] text-blue-600">Cash tied up in dead stock</span>
          </CardContent>
        </Card>
      </div>

      {/* Dead Stock Cash Release Callout Banner */}
      {(stockHealth?.dead_stock_count || 0) > 0 && (
        <div className="p-4 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-sm">
              <Sparkle size={16} className="text-amber-600" />
              <span>Unlock Cash Flow: Clear Dead Stock via WhatsApp</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              You have <strong>{money(stockHealth?.total_locked_capital || 0)}</strong> tied up in dead stock across {stockHealth?.dead_stock_count} SKUs. Send discounted clearance deals to all active buyers in 1-click!
            </p>
          </div>
          {stockHealth?.dead_stock_items?.[0] && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs whitespace-nowrap shadow-sm"
              onClick={() => openClearanceModal(stockHealth.dead_stock_items[0])}
            >
              <WhatsappLogo size={14} className="mr-1.5" />
              Clear Top Dead SKU (WhatsApp)
            </Button>
          )}
        </div>
      )}

      {/* Filter Tabs & Live Stock Table */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={filterMode === "all" ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setFilterMode("all")}
            >
              All Inventory ({products.length})
            </Button>
            <Button
              size="sm"
              variant={filterMode === "critical" ? "default" : "outline"}
              className={`h-7 text-xs ${filterMode === "critical" ? "bg-rose-600 hover:bg-rose-700 text-white" : "text-rose-700"}`}
              onClick={() => setFilterMode("critical")}
            >
              Critical Stock ({stockHealth?.critical_count || 0})
            </Button>
            <Button
              size="sm"
              variant={filterMode === "dead" ? "default" : "outline"}
              className={`h-7 text-xs ${filterMode === "dead" ? "bg-amber-600 hover:bg-amber-700 text-white" : "text-amber-700"}`}
              onClick={() => setFilterMode("dead")}
            >
              Dead Stock ({stockHealth?.dead_stock_count || 0})
            </Button>
          </div>
        </div>

        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Product</TableHead>
                <TableHead className="text-xs">SKU / Category</TableHead>
                <TableHead className="text-xs text-right">Current Stock</TableHead>
                <TableHead className="text-xs text-right">Min Stock</TableHead>
                <TableHead className="text-xs text-right">Cost Price</TableHead>
                <TableHead className="text-xs text-right">Valuation</TableHead>
                <TableHead className="text-xs text-center">Health Status</TableHead>
                <TableHead className="text-xs text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-sm text-muted-foreground">
                    No products found for selected filter.
                  </TableCell>
                </TableRow>
              ) : (
                displayedProducts.map((p) => {
                  const isCritical = p.current_stock <= p.min_stock;
                  const isDead = stockHealth?.dead_stock_items?.some((d) => d.id === p.id);
                  const valuation = (p.current_stock || 0) * (p.purchase_price || 0);

                  return (
                    <TableRow key={p.id} className="tbl-row hover:bg-muted/40">
                      <TableCell className="py-2 px-3 font-medium text-xs">{p.name}</TableCell>
                      <TableCell className="py-2 px-3 text-xs text-muted-foreground">
                        <span className="font-mono">{p.sku}</span> · {p.category}
                      </TableCell>
                      <TableCell className="py-2 px-3 text-right tabular text-xs font-semibold">
                        {Number(p.current_stock || 0).toLocaleString("en-IN")} {p.unit}
                      </TableCell>
                      <TableCell className="py-2 px-3 text-right tabular text-xs text-muted-foreground">
                        {p.min_stock}
                      </TableCell>
                      <TableCell className="py-2 px-3 text-right tabular text-xs text-muted-foreground">
                        ₹{(p.purchase_price || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="py-2 px-3 text-right tabular text-xs font-medium">
                        {money(valuation)}
                      </TableCell>
                      <TableCell className="py-2 px-3 text-center">
                        {isCritical ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            CRITICAL (LOW)
                          </span>
                        ) : isDead ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            DEAD STOCK
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            HEALTHY
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-2 px-3 text-right">
                        {isDead || isCritical ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-300"
                            onClick={() => openClearanceModal(p)}
                          >
                            <WhatsappLogo size={13} className="mr-1 text-emerald-600" />
                            Clear Stock
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Movement Ledger */}
      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Immutable Movement Ledger</p>
        {movements.length === 0 ? (
          <EmptyState title="No movements yet" hint="Movements appear when GRN/Dispatch/Adjustments happen." />
        ) : (
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Product</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs text-right">Qty</TableHead>
                  <TableHead className="text-xs">Warehouse</TableHead>
                  <TableHead className="text-xs">Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id} className="tbl-row hover:bg-muted/40">
                    <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{fmtDate(m.created_at)}</TableCell>
                    <TableCell className="py-1.5 px-3 font-medium text-xs">{m.product_name}</TableCell>
                    <TableCell className="py-1.5 px-3 text-xs">
                      <span className="inline-flex items-center gap-1">
                        {m.quantity > 0 ? (
                          <TrendUp size={12} className="text-emerald-600" />
                        ) : (
                          <TrendDown size={12} className="text-rose-600" />
                        )}
                        <span className="capitalize">{m.movement_type}</span>
                      </span>
                    </TableCell>
                    <TableCell className={`py-1.5 px-3 text-right tabular text-xs font-semibold ${m.quantity > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {m.quantity > 0 ? "+" : ""}{m.quantity}
                    </TableCell>
                    <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{m.warehouse}</TableCell>
                    <TableCell className="py-1.5 px-3 text-xs font-mono text-muted-foreground">
                      {m.reference_number || m.reference_type}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* WhatsApp Stock Clearance Broadcast Modal */}
      <Dialog open={clearanceModalOpen} onOpenChange={setClearanceModalOpen}>
        <DialogContent className="w-full sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <WhatsappLogo size={20} className="text-emerald-600" />
              Clear Stock & Release Cash via WhatsApp
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4 text-xs pt-1">
              <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-semibold text-sm text-foreground">{selectedProduct.name}</span>
                  <span className="font-mono text-muted-foreground">{selectedProduct.sku}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block">Available Stock</span>
                    <strong className="text-foreground">{selectedProduct.current_stock.toLocaleString("en-IN")} units</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Purchase Cost</span>
                    <span className="tabular font-medium">₹{selectedProduct.purchase_price}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Locked Working Capital</span>
                    <strong className="text-rose-600">{money(selectedProduct.current_stock * selectedProduct.purchase_price)}</strong>
                  </div>
                </div>
              </div>

              {/* Discount Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Clearance Discount Offer</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 25, 35, 50].map((pct) => (
                    <Button
                      key={pct}
                      type="button"
                      variant={discountPct === pct ? "default" : "outline"}
                      className={`h-8 text-xs font-semibold ${discountPct === pct ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                      onClick={() => handleDiscountChange(pct)}
                    >
                      {pct}% OFF
                    </Button>
                  ))}
                </div>
              </div>

              {/* Projected Cash Release */}
              <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground text-[10px] block">Clearance Unit Price</span>
                  <strong className="text-sm font-display text-emerald-700 dark:text-emerald-300">
                    ₹{(selectedProduct.selling_price * (1 - discountPct / 100)).toFixed(2)}
                  </strong>
                  <span className="text-[10px] line-through text-muted-foreground ml-1">₹{selectedProduct.selling_price}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Potential Liquid Cash Released</span>
                  <strong className="text-sm font-display text-emerald-700 dark:text-emerald-300">
                    {money(selectedProduct.current_stock * (selectedProduct.selling_price * (1 - discountPct / 100)))}
                  </strong>
                </div>
              </div>

              {/* WhatsApp Message Preview */}
              <div className="space-y-1">
                <Label className="text-xs font-medium">WhatsApp Broadcast Message (Sent to All Buyers)</Label>
                <Textarea
                  rows={6}
                  className="font-mono text-xs leading-relaxed"
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <Button
                  className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  onClick={handleSendClearanceBroadcast}
                  disabled={sendingClearance}
                >
                  <WhatsappLogo size={16} className="mr-1.5" />
                  {sendingClearance ? "Sending WhatsApp Broadcast..." : "Broadcast Offer to All Existing Buyers"}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-1.5">
                  Sends personalized WhatsApp messages via Saasyto Live API instance 6AA99DB2A1F44
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
