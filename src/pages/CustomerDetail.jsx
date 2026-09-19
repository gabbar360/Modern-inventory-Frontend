import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, fmtDate, money } from "@/lib/api";
import { PageHeader, StatusPill } from "@/components/Bits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Share, 
  FileText, 
  Receipt, 
  CurrencyInr, 
  Plus, 
  CheckSquare, 
  FilePdf, 
  Clock, 
  ArrowUpRight, 
  EnvelopeSimple, 
  PencilSimple, 
  Trash,
  MapPin,
  CircleNotch,
  Sparkle,
  Truck
} from "@phosphor-icons/react";
import { DocForm } from "@/pages/DocList";

export default function CustomerDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [d, setD] = useState(null);
  const [feed, setFeed] = useState([]);
  const [payOpen, setPayOpen] = useState(false);
  const [payF, setPayF] = useState({ amount: 0, mode: "Bank Transfer", reference: "", bank: "", utr: "" });
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskF, setTaskF] = useState({ title: "", due_date: new Date().toISOString().slice(0,10), priority: "medium", notes: "" });
  const [editOpen, setEditOpen] = useState(false);
  const [editF, setEditF] = useState({});
  const [editBusy, setEditBusy] = useState(false);
  const [fetchingBillingPin, setFetchingBillingPin] = useState(false);
  const [fetchingShippingPin, setFetchingShippingPin] = useState(false);

  const load = async () => {
    const [r, f] = await Promise.all([api.get(`/customers/${id}`), api.get(`/customers/${id}/activity`)]);
    setD(r.data); setFeed(f.data);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);
  if (!d) return <div className="text-sm text-muted-foreground">Loading…</div>;
  const c = d.customer;
  const backend = process.env.REACT_APP_BACKEND_URL;

  const openEdit = () => {
    const billPin = c.billing_pincode || c.pincode || (c.billing_address && c.billing_address.match(/\b\d{6}\b/)?.[0]) || "";
    const shipPin = c.shipping_pincode || (c.shipping_address && c.shipping_address.match(/\b\d{6}\b/)?.[0]) || billPin;
    const billCity = c.billing_city || c.city || "";
    const billState = c.billing_state || c.state || "";
    const isSame = !c.shipping_address || c.shipping_address === c.billing_address || (
      c.shipping_address_line === c.billing_address_line &&
      c.shipping_pincode === c.billing_pincode
    );

    setEditF({
      company_name: c.company_name || "",
      contact_person: c.contact_person || "",
      mobile: c.mobile || "",
      email: c.email || "",
      gstin: c.gstin || "",
      state: billState,
      state_code: c.state_code || "",
      city: billCity,
      pincode: billPin,
      billing_address_line: c.billing_address_line || c.billing_address || "",
      billing_city: billCity,
      billing_state: billState,
      billing_pincode: billPin,
      billing_address: c.billing_address || "",
      shipping_same_as_billing: isSame,
      shipping_address_line: isSame ? (c.billing_address_line || c.billing_address || "") : (c.shipping_address_line || c.shipping_address || ""),
      shipping_city: isSame ? billCity : (c.shipping_city || ""),
      shipping_state: isSame ? billState : (c.shipping_state || ""),
      shipping_pincode: isSame ? billPin : shipPin,
      shipping_address: c.shipping_address || "",
      credit_limit: c.credit_limit || 0,
      payment_terms: c.payment_terms || "Net 30"
    });
    setEditOpen(true);
  };

  const handleEditBillingPinChange = async (e) => {
    const raw = e.target.value;
    const cleanPin = raw.replace(/\D/g, "").slice(0, 6);

    setEditF(prev => {
      const next = { ...prev, billing_pincode: cleanPin, pincode: cleanPin };
      if (prev.shipping_same_as_billing) {
        next.shipping_pincode = cleanPin;
      }
      return next;
    });

    if (cleanPin.length === 6) {
      setFetchingBillingPin(true);
      try {
        const { data } = await api.get(`/utils/pincode/${cleanPin}`);
        if (data && data.success) {
          setEditF(prev => {
            const next = {
              ...prev,
              billing_city: data.city || prev.billing_city,
              billing_state: data.state || prev.billing_state,
              city: data.city || prev.city,
              state: data.state || prev.state,
              state_code: data.state_code || prev.state_code
            };
            if (prev.shipping_same_as_billing) {
              next.shipping_city = data.city || prev.shipping_city;
              next.shipping_state = data.state || prev.shipping_state;
            }
            return next;
          });
          toast.success(`Location detected: ${data.city}, ${data.state}`, {
            icon: <Sparkle className="text-amber-500" size={16} />
          });
        }
      } catch (err) {
        console.warn("Pincode lookup error:", err);
      } finally {
        setFetchingBillingPin(false);
      }
    }
  };

  const handleEditShippingPinChange = async (e) => {
    const raw = e.target.value;
    const cleanPin = raw.replace(/\D/g, "").slice(0, 6);

    setEditF(prev => ({ ...prev, shipping_pincode: cleanPin }));

    if (cleanPin.length === 6) {
      setFetchingShippingPin(true);
      try {
        const { data } = await api.get(`/utils/pincode/${cleanPin}`);
        if (data && data.success) {
          setEditF(prev => ({
            ...prev,
            shipping_city: data.city || prev.shipping_city,
            shipping_state: data.state || prev.shipping_state
          }));
          toast.success(`Shipping location: ${data.city}, ${data.state}`, {
            icon: <Truck className="text-blue-500" size={16} />
          });
        }
      } catch (err) {
        console.warn("Shipping pincode lookup error:", err);
      } finally {
        setFetchingShippingPin(false);
      }
    }
  };

  const saveCustomer = async () => {
    if (!editF.company_name?.trim()) return toast.error("Company name is required");
    setEditBusy(true);

    const billingParts = [editF.billing_address_line, editF.billing_city, editF.billing_state].filter(Boolean);
    const billingCombined = billingParts.join(", ") + (editF.billing_pincode ? ` - ${editF.billing_pincode}` : "");

    const shipLine = editF.shipping_same_as_billing ? editF.billing_address_line : editF.shipping_address_line;
    const shipCity = editF.shipping_same_as_billing ? editF.billing_city : editF.shipping_city;
    const shipState = editF.shipping_same_as_billing ? editF.billing_state : editF.shipping_state;
    const shipPin = editF.shipping_same_as_billing ? editF.billing_pincode : editF.shipping_pincode;

    const shippingParts = [shipLine, shipCity, shipState].filter(Boolean);
    const shippingCombined = shippingParts.join(", ") + (shipPin ? ` - ${shipPin}` : "");

    const payload = {
      ...editF,
      billing_address_line: editF.billing_address_line,
      billing_city: editF.billing_city,
      billing_state: editF.billing_state,
      billing_pincode: editF.billing_pincode,
      billing_address: billingCombined,
      shipping_address_line: shipLine,
      shipping_city: shipCity,
      shipping_state: shipState,
      shipping_pincode: shipPin,
      shipping_address: shippingCombined,
      city: editF.billing_city || editF.city,
      pincode: editF.billing_pincode || editF.pincode,
      state: editF.billing_state || editF.state
    };

    try {
      await api.patch(`/customers/${id}`, payload);
      toast.success("Customer updated successfully");
      setEditOpen(false);
      load();
    } catch(e) {
      toast.error(e?.response?.data?.detail || "Update failed");
    } finally {
      setEditBusy(false);
    }
  };

  const deleteCustomer = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${c.company_name}"?`)) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success(`Customer "${c.company_name}" deleted`);
      nav("/customers");
    } catch(e) {
      toast.error(e?.response?.data?.detail || "Failed to delete customer");
    }
  };
  const genPortal = async () => {
    try { const { data } = await api.post(`/customers/${id}/portal-link`);
      const url = `${backend.replace('/api','')}${data.url_path}`;
      await navigator.clipboard.writeText(url);
      toast.success("Portal link copied to clipboard"); }
    catch(e){ toast.error(e?.response?.data?.detail || "Failed"); }
  };
  const receivePayment = async () => {
    if (!payF.amount) return toast.error("Enter amount");
    try {
      await api.post("/payments", { customer_id: id, amount: Number(payF.amount),
        mode: payF.mode, reference: payF.reference, bank: payF.bank, utr: payF.utr, allocations: [] });
      toast.success("Payment recorded");
      setPayOpen(false); setPayF({ amount: 0, mode: "Bank Transfer", reference: "", bank: "", utr: "" });
      load();
    } catch(e){ toast.error(e?.response?.data?.detail || "Failed"); }
  };
  const createTask = async () => {
    if (!taskF.title) return toast.error("Title required");
    try {
      await api.post("/tasks", { ...taskF, related_type: "customer", related_id: id });
      toast.success("Task scheduled");
      setTaskOpen(false); setTaskF({ title: "", due_date: new Date().toISOString().slice(0,10), priority: "medium", notes: "" });
      load();
    } catch(e){ toast.error(e?.response?.data?.detail || "Failed"); }
  };
  return (
    <div className="space-y-4" data-testid="customer-detail">
      <PageHeader title={c.company_name} subtitle={`${c.contact_person || ""} · ${c.mobile || ""} · ${c.email || ""}`} actions={
        <div className="flex flex-wrap items-center gap-2">
          <DocForm kind="quotation" endpoint="/quotations" onCreated={load} defaultCustomerId={id}
            trigger={<Button size="sm" className="h-8" data-testid="quick-new-quote-btn"><FileText size={14} className="mr-1"/>New quote</Button>} />
          <DocForm kind="invoice" endpoint="/invoices" onCreated={load} defaultCustomerId={id}
            trigger={<Button size="sm" variant="outline" className="h-8" data-testid="quick-new-invoice-btn"><Receipt size={14} className="mr-1"/>New invoice</Button>} />
          <Dialog open={payOpen} onOpenChange={setPayOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8" data-testid="quick-receive-payment-btn"><CurrencyInr size={14} className="mr-1"/>Receive payment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Receive Payment · {c.company_name}</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm">
                <div><Label className="text-xs">Amount</Label><Input type="number" value={payF.amount} onChange={(e)=>setPayF({...payF, amount:e.target.value})} data-testid="quick-pay-amount" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">Mode</Label><Input value={payF.mode} onChange={(e)=>setPayF({...payF, mode:e.target.value})} /></div>
                  <div><Label className="text-xs">Reference / UTR</Label><Input value={payF.reference} onChange={(e)=>setPayF({...payF, reference:e.target.value})} /></div>
                </div>
                <div><Label className="text-xs">Bank</Label><Input value={payF.bank} onChange={(e)=>setPayF({...payF, bank:e.target.value})} /></div>
                <Button className="w-full h-9" onClick={receivePayment} data-testid="quick-pay-save-btn">Record</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8" data-testid="quick-new-task-btn"><CheckSquare size={14} className="mr-1"/>New task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Schedule follow-up · {c.company_name}</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm">
                <div><Label className="text-xs">Title</Label><Input value={taskF.title} onChange={(e)=>setTaskF({...taskF, title:e.target.value})} placeholder="Call about pending order" data-testid="quick-task-title" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">Due date</Label><Input type="date" value={taskF.due_date} onChange={(e)=>setTaskF({...taskF, due_date:e.target.value})} /></div>
                  <div><Label className="text-xs">Priority</Label><Input value={taskF.priority} onChange={(e)=>setTaskF({...taskF, priority:e.target.value})} /></div>
                </div>
                <div><Label className="text-xs">Notes</Label><Textarea rows={2} value={taskF.notes} onChange={(e)=>setTaskF({...taskF, notes:e.target.value})} /></div>
                <Button className="w-full h-9" onClick={createTask} data-testid="quick-task-save-btn">Schedule</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" className="h-8 border-border hover:bg-muted" onClick={openEdit} data-testid="edit-customer-btn">
            <PencilSimple size={14} className="mr-1 text-blue-600"/>Edit customer
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-destructive border-destructive/20 hover:bg-destructive/10" onClick={deleteCustomer} data-testid="delete-customer-btn">
            <Trash size={14} className="mr-1"/>Delete
          </Button>
          <Button variant="outline" size="sm" className="h-8" asChild data-testid="statement-pdf-btn">
            <a href={`${backend}/api/customers/${id}/statement.pdf`} target="_blank" rel="noreferrer"><FilePdf size={14} className="mr-1"/>Statement</a>
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={async () => {
            try { const { data } = await api.post(`/customers/${id}/send-statement`); toast.success(`Statement emailed to ${data.to}`); }
            catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
          }} data-testid="email-statement-btn"><EnvelopeSimple size={14} className="mr-1"/>Email statement</Button>
          <Button variant="ghost" size="sm" className="h-8" onClick={genPortal} data-testid="portal-link-btn"><Share size={14} className="mr-1"/>Portal link</Button>
        </div>
      } />
      <div className="grid md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-[11px] uppercase text-muted-foreground tracking-wider">Outstanding</p><p className="text-xl font-display font-semibold tabular mt-1">{money(d.outstanding)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-[11px] uppercase text-muted-foreground tracking-wider">Invoices</p><p className="text-xl font-display font-semibold tabular mt-1">{d.invoices.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-[11px] uppercase text-muted-foreground tracking-wider">Orders</p><p className="text-xl font-display font-semibold tabular mt-1">{d.orders.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-[11px] uppercase text-muted-foreground tracking-wider">Payments</p><p className="text-xl font-display font-semibold tabular mt-1">{d.payments.length}</p></CardContent></Card>
      </div>
      {feed.length > 0 && (
        <Card data-testid="activity-feed"><CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-muted-foreground" />
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Recent activity</p>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {feed.slice(0, 12).map((e, i) => (
              <div key={`${e.source}-${e.id}-${i}`} className="flex items-start gap-3 text-xs border-l-2 border-border pl-3 py-1 hover:border-foreground/40">
                <div className="flex-1">
                  <p className="font-medium">{e.type}</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">{e.ref}{e.amount ? ` · ${money(e.amount)}` : ""}</p>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">{fmtDate(e.date)}</span>
                <ArrowUpRight size={12} className="text-muted-foreground shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </CardContent></Card>
      )}
      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="quotations">Quotations</TabsTrigger>
          <TabsTrigger value="orders">Sales Orders</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices" className="mt-3">
          <div className="border border-border rounded-lg bg-card"><Table><TableHeader><TableRow>
            <TableHead className="text-xs">#</TableHead><TableHead className="text-xs">Date</TableHead>
            <TableHead className="text-xs text-right">Total</TableHead><TableHead className="text-xs text-right">Balance</TableHead>
            <TableHead className="text-xs">Status</TableHead></TableRow></TableHeader>
            <TableBody>{d.invoices.map((i)=>(
              <TableRow key={i.id} className="tbl-row"><TableCell className="py-1.5 px-3"><Link to={`/invoices/${i.id}`} className="font-mono text-xs hover:underline">{i.number}</Link></TableCell>
              <TableCell className="py-1.5 px-3 text-xs">{fmtDate(i.invoice_date)}</TableCell>
              <TableCell className="py-1.5 px-3 text-right tabular">{money(i.grand_total)}</TableCell>
              <TableCell className="py-1.5 px-3 text-right tabular">{money(i.balance_due)}</TableCell>
              <TableCell className="py-1.5 px-3"><StatusPill status={i.status}/></TableCell></TableRow>
            ))}</TableBody></Table></div>
        </TabsContent>
        <TabsContent value="quotations" className="mt-3">
          <div className="border border-border rounded-lg bg-card"><Table><TableBody>
            {d.quotations.map((q)=>(<TableRow key={q.id} className="tbl-row"><TableCell className="py-1.5 px-3"><Link to={`/quotations/${q.id}`} className="font-mono text-xs hover:underline">{q.number}</Link></TableCell>
            <TableCell className="text-xs">{fmtDate(q.quote_date)}</TableCell><TableCell className="text-right tabular">{money(q.grand_total)}</TableCell>
            <TableCell><StatusPill status={q.status}/></TableCell></TableRow>))}
          </TableBody></Table></div>
        </TabsContent>
        <TabsContent value="orders" className="mt-3">
          <div className="border border-border rounded-lg bg-card"><Table><TableBody>
            {d.orders.map((q)=>(<TableRow key={q.id} className="tbl-row"><TableCell className="py-1.5 px-3 font-mono text-xs">{q.number}</TableCell>
            <TableCell className="text-xs">{fmtDate(q.order_date)}</TableCell><TableCell className="text-right tabular">{money(q.grand_total)}</TableCell>
            <TableCell><StatusPill status={q.status}/></TableCell></TableRow>))}
          </TableBody></Table></div>
        </TabsContent>
        <TabsContent value="payments" className="mt-3">
          <div className="border border-border rounded-lg bg-card"><Table><TableBody>
            {d.payments.map((p)=>(<TableRow key={p.id} className="tbl-row"><TableCell className="py-1.5 px-3 font-mono text-xs">{p.number}</TableCell>
            <TableCell className="text-xs">{fmtDate(p.payment_date)}</TableCell><TableCell className="text-right tabular">{money(p.amount)}</TableCell>
            <TableCell className="text-xs">{p.mode}</TableCell></TableRow>))}
          </TableBody></Table></div>
        </TabsContent>
        <TabsContent value="info" className="mt-3">
          <Card>
            <CardContent className="p-5 text-sm space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <p className="font-semibold text-foreground">Customer Master Details</p>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={openEdit}>
                  <PencilSimple size={12} className="mr-1 text-blue-600"/>Edit Details
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4 pt-1">
                <div><span className="text-muted-foreground text-xs">Company Name</span><p className="font-medium text-foreground">{c.company_name}</p></div>
                <div><span className="text-muted-foreground text-xs">Contact Person</span><p>{c.contact_person || "—"} ({c.mobile || "—"})</p></div>
                <div><span className="text-muted-foreground text-xs">Email</span><p>{c.email || "—"}</p></div>
                <div><span className="text-muted-foreground text-xs">GSTIN</span><p className="font-mono">{c.gstin || "—"}</p></div>
                <div><span className="text-muted-foreground text-xs">City & State</span><p>{c.city || c.billing_city || "—"}{c.state ? `, ${c.state}` : ""} {c.state_code ? `(${c.state_code})` : ""}</p></div>
                <div><span className="text-muted-foreground text-xs">Credit Limit & Terms</span><p className="tabular">{money(c.credit_limit)} · {c.payment_terms || "Net 30"}</p></div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-border">
                <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <MapPin size={13} className="text-blue-600" />
                    <span>Billing Address & PIN</span>
                  </div>
                  {c.billing_address_line && (
                    <p className="text-xs text-foreground font-medium">{c.billing_address_line}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {[c.billing_city || c.city, c.billing_state || c.state].filter(Boolean).join(", ")}
                    {(c.billing_pincode || c.pincode) ? ` - ${c.billing_pincode || c.pincode}` : ""}
                  </p>
                  {c.billing_address && !c.billing_address_line && (
                    <p className="text-[11px] text-muted-foreground mt-1">{c.billing_address}</p>
                  )}
                </div>

                <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Truck size={13} className="text-emerald-600" />
                    <span>Shipping / Consignee Address</span>
                  </div>
                  {c.shipping_address_line && (
                    <p className="text-xs text-foreground font-medium">{c.shipping_address_line}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {[c.shipping_city || c.billing_city || c.city, c.shipping_state || c.billing_state || c.state].filter(Boolean).join(", ")}
                    {(c.shipping_pincode || c.billing_pincode || c.pincode) ? ` - ${c.shipping_pincode || c.billing_pincode || c.pincode}` : ""}
                  </p>
                  {c.shipping_address && !c.shipping_address_line && (
                    <p className="text-[11px] text-muted-foreground mt-1">{c.shipping_address}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Customer Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-3 border-b border-border">
            <SheetTitle className="text-base flex items-center gap-2">
              <PencilSimple size={16} className="text-blue-600" />
              Edit Customer
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4 text-sm pb-6">
            <div>
              <Label className="text-xs font-semibold">Company Name *</Label>
              <Input 
                value={editF.company_name || ""} 
                onChange={(e) => setEditF({ ...editF, company_name: e.target.value })} 
                className="mt-1"
                data-testid="edit-company-input" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Contact Person</Label>
                <Input 
                  value={editF.contact_person || ""} 
                  onChange={(e) => setEditF({ ...editF, contact_person: e.target.value })} 
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Mobile</Label>
                <Input 
                  value={editF.mobile || ""} 
                  onChange={(e) => setEditF({ ...editF, mobile: e.target.value })} 
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Email</Label>
                <Input 
                  type="email" 
                  value={editF.email || ""} 
                  onChange={(e) => setEditF({ ...editF, email: e.target.value })} 
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">GSTIN</Label>
                <Input 
                  value={editF.gstin || ""} 
                  onChange={(e) => setEditF({ ...editF, gstin: e.target.value.toUpperCase() })} 
                  maxLength={15}
                  className="mt-1 font-mono uppercase"
                />
              </div>
            </div>

            {/* Billing Address with Auto-fetch */}
            <div className="p-3.5 bg-muted/30 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <MapPin size={14} className="text-blue-600" />
                  <span>Billing Address & PIN Code</span>
                </div>
                {fetchingBillingPin && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                    <CircleNotch size={12} className="animate-spin" /> Auto-fetching City…
                  </span>
                )}
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Address Line</Label>
                <Input 
                  value={editF.billing_address_line || ""} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditF(prev => {
                      const next = { ...prev, billing_address_line: val };
                      if (prev.shipping_same_as_billing) next.shipping_address_line = val;
                      return next;
                    });
                  }} 
                  placeholder="Plot/Flat, Street, Area" 
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">PIN Code *</Label>
                  <div className="relative mt-1">
                    <Input 
                      value={editF.billing_pincode || ""} 
                      onChange={handleEditBillingPinChange} 
                      placeholder="360001" 
                      maxLength={6}
                      className="font-mono pr-7"
                    />
                    {fetchingBillingPin && (
                      <div className="absolute right-2 top-2.5">
                        <CircleNotch size={14} className="animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Auto-detects City</span>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">City</Label>
                  <Input 
                    value={editF.billing_city || ""} 
                    onChange={(e) => setEditF({ ...editF, billing_city: e.target.value })} 
                    placeholder="City" 
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">State</Label>
                  <Input 
                    value={editF.billing_state || ""} 
                    onChange={(e) => setEditF({ ...editF, billing_state: e.target.value })} 
                    placeholder="State" 
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Same as Billing Checkbox */}
            <div className="flex items-center space-x-2 py-1">
              <Checkbox 
                id="edit-same-address" 
                checked={editF.shipping_same_as_billing}
                onCheckedChange={(checked) => {
                  setEditF(prev => {
                    if (checked) {
                      return {
                        ...prev,
                        shipping_same_as_billing: true,
                        shipping_address_line: prev.billing_address_line,
                        shipping_city: prev.billing_city,
                        shipping_state: prev.billing_state,
                        shipping_pincode: prev.billing_pincode
                      };
                    }
                    return { ...prev, shipping_same_as_billing: false };
                  });
                }}
              />
              <label 
                htmlFor="edit-same-address" 
                className="text-xs font-medium cursor-pointer select-none text-foreground"
              >
                Shipping address is same as billing address
              </label>
            </div>

            {/* Shipping Address (when different) */}
            {!editF.shipping_same_as_billing && (
              <div className="p-3.5 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Truck size={14} className="text-blue-600" />
                    <span>Shipping Address</span>
                  </div>
                  {fetchingShippingPin && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                      <CircleNotch size={12} className="animate-spin" /> Auto-fetching…
                    </span>
                  )}
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Shipping Address Line</Label>
                  <Input 
                    value={editF.shipping_address_line || ""} 
                    onChange={(e) => setEditF({ ...editF, shipping_address_line: e.target.value })} 
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Shipping PIN</Label>
                    <Input 
                      value={editF.shipping_pincode || ""} 
                      onChange={handleEditShippingPinChange} 
                      maxLength={6}
                      className="mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">City</Label>
                    <Input 
                      value={editF.shipping_city || ""} 
                      onChange={(e) => setEditF({ ...editF, shipping_city: e.target.value })} 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">State</Label>
                    <Input 
                      value={editF.shipping_state || ""} 
                      onChange={(e) => setEditF({ ...editF, shipping_state: e.target.value })} 
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <Label className="text-xs">Credit Limit (₹)</Label>
                <Input 
                  type="number" 
                  value={editF.credit_limit || 0} 
                  onChange={(e) => setEditF({ ...editF, credit_limit: e.target.value })} 
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Payment Terms</Label>
                <Input 
                  value={editF.payment_terms || "Net 30"} 
                  onChange={(e) => setEditF({ ...editF, payment_terms: e.target.value })} 
                  className="mt-1"
                />
              </div>
            </div>

            <Button 
              className="w-full h-9 mt-4 font-medium" 
              onClick={saveCustomer} 
              disabled={editBusy} 
              data-testid="save-edit-customer-btn"
            >
              {editBusy ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
