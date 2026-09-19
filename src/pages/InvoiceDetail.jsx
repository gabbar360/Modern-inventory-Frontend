import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { api, money, fmtDate } from "@/lib/api";
import { PageHeader, StatusPill } from "@/components/Bits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FilePdf, CurrencyInr, WhatsappLogo, EnvelopeSimple, Bell, Truck, XCircle, ArrowClockwise } from "@phosphor-icons/react";
const BACKEND = process.env.REACT_APP_BACKEND_URL;

export default function InvoiceDetail() {
  const { id } = useParams();
  const [inv, setInv] = useState(null);
  const [payOpen, setPayOpen] = useState(false);
  const [amt, setAmt] = useState(0);
  const [mode, setMode] = useState("Bank Transfer");
  const [ref, setRef] = useState("");

  // e-Way Bill states
  const [ewbOpen, setEwbOpen] = useState(false);
  const [updateVehOpen, setUpdateVehOpen] = useState(false);
  const [cancelEwbOpen, setCancelEwbOpen] = useState(false);
  const [loadingEwb, setLoadingEwb] = useState(false);
  const [ewbForm, setEwbForm] = useState({
    vehicle_no: "MH04AB1234",
    vehicle_type: "R",
    transport_mode: "1",
    transporter_name: "Delhivery Express Logistics",
    transporter_id: "",
    distance_km: 45
  });
  const [vehForm, setVehForm] = useState({
    vehicle_no: "",
    reason_code: "1",
    reason_remark: "",
    from_place: ""
  });
  const [cancelForm, setCancelForm] = useState({
    reason_code: "2",
    remarks: "Order cancelled by buyer / seller"
  });

  const load = async () => { const { data } = await api.get(`/invoices/${id}`); setInv(data); setAmt(data.balance_due || 0); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (ewbOpen && inv?.customer_id) {
      api.get(`/customers/${inv.customer_id}`).then(c => {
        const custPin = c.data?.customer?.shipping_address?.pin || c.data?.customer?.pin || '400001';
        api.get(`/gst/pincode-distance/421302/${custPin}`).then(d => {
          if (d.data?.distance_km) {
            setEwbForm(s => ({ ...s, distance_km: d.data.distance_km }));
          }
        }).catch(() => {});
      }).catch(() => {});
    }
  }, [ewbOpen, inv]);

  if (!inv) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const handleGenerateEwayBill = async () => {
    setLoadingEwb(true);
    try {
      const { data } = await api.post(`/invoices/${id}/eway-bill/generate`, ewbForm);
      toast.success(`e-Way Bill ${data.eway_bill_number} generated successfully!`);
      setEwbOpen(false);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "e-Way Bill generation failed");
    } finally {
      setLoadingEwb(false);
    }
  };

  const handleUpdateVehicle = async () => {
    try {
      const { data } = await api.post(`/invoices/${id}/eway-bill/update-vehicle`, vehForm);
      toast.success(`Part-B updated! Vehicle: ${data.vehicle_no}`);
      setUpdateVehOpen(false);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Vehicle update failed");
    }
  };

  const handleCancelEwayBill = async () => {
    try {
      const { data } = await api.post(`/invoices/${id}/eway-bill/cancel`, cancelForm);
      toast.success(`e-Way Bill ${data.eway_bill_number} cancelled.`);
      setCancelEwbOpen(false);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Cancellation failed");
    }
  };

  const sendWA = async () => {
    try {
      const { data: cust } = await api.get(`/customers/${inv.customer_id}`);
      const to = cust.customer?.mobile;
      if (!to) return toast.error("Customer has no mobile number");
      const msg = `Hi, sharing invoice ${inv.number} for ₹${(inv.grand_total||0).toLocaleString("en-IN")}. Balance: ₹${(inv.balance_due||0).toLocaleString("en-IN")}. PDF: ${BACKEND}/api/invoices/${id}/pdf`;
      await api.post("/whatsapp/send", { to, message: msg });
      toast.success("WhatsApp sent");
    } catch (e) {
      const detail = e?.response?.data?.detail || "Failed";
      if (String(detail).includes("not configured")) {
        window.open(`https://wa.me/?text=${encodeURIComponent(`Hi, sharing invoice ${inv.number} for ₹${(inv.grand_total||0).toLocaleString("en-IN")}. PDF: ${BACKEND}/api/invoices/${id}/pdf`)}`, "_blank");
      } else { toast.error(String(detail)); }
    }
  };
  const sendEmail = async () => {
    try { const { data } = await api.post(`/invoices/${id}/send-email`); toast.success(`Email sent to ${data.to}`); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };
  const sendReminder = async () => {
    try { const { data } = await api.post(`/invoices/${id}/send-reminder`); toast.success(`Reminder sent to ${data.to}`); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };
  const receive = async () => {
    try {
      await api.post("/payments", {
        customer_id: inv.customer_id, amount: Number(amt), mode, reference: ref,
        allocations: [{ invoice_id: inv.id, amount: Number(amt) }],
      });
      toast.success("Payment recorded");
      setPayOpen(false); load();
    } catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };

  return (
    <div className="space-y-4" data-testid="invoice-detail">
      <PageHeader title={`Invoice ${inv.number}`} subtitle={`${inv.customer_name} · ${fmtDate(inv.invoice_date)} · Due ${fmtDate(inv.due_date)}`} actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8" asChild data-testid="download-invoice-pdf">
            <a href={`${BACKEND}/api/invoices/${id}/pdf`} target="_blank" rel="noreferrer"><FilePdf size={14} className="mr-1"/>PDF</a>
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={sendWA} data-testid="whatsapp-invoice-btn"><WhatsappLogo size={14} className="mr-1"/>WhatsApp</Button>
          <Button variant="outline" size="sm" className="h-8" onClick={sendEmail} data-testid="email-invoice-btn"><EnvelopeSimple size={14} className="mr-1"/>Email</Button>
          {/* E-Way Bill Generation Modal */}
          {(!inv.eway_bill_number || inv.eway_bill_status === 'cancelled') && (
            <Dialog open={ewbOpen} onOpenChange={setEwbOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100/60" data-testid="generate-eway-bill-btn">
                  <Truck size={14} className="mr-1.5 text-blue-600" />Generate e-Way Bill
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Truck size={18} className="text-blue-600" />
                    Quick e-Way Bill Generator
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded bg-blue-50/70 border border-blue-100 text-blue-900 flex justify-between">
                    <div>
                      <strong>Invoice:</strong> {inv.number} · <strong>Amount:</strong> {money(inv.grand_total)}
                    </div>
                    <div className="font-medium text-[11px]">
                      Part A (Auto-populated)
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <Label className="text-xs">Transport Mode</Label>
                      <Select value={ewbForm.transport_mode} onValueChange={v => setEwbForm(s => ({ ...s, transport_mode: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Mode" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Road</SelectItem>
                          <SelectItem value="2">2 - Rail</SelectItem>
                          <SelectItem value="3">3 - Air</SelectItem>
                          <SelectItem value="4">4 - Ship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Vehicle Number</Label>
                      <Input className="h-8 text-xs uppercase font-mono" placeholder="MH04AB1234" value={ewbForm.vehicle_no} onChange={e => setEwbForm(s => ({ ...s, vehicle_no: e.target.value }))} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <Label className="text-xs">Vehicle Type</Label>
                      <Select value={ewbForm.vehicle_type} onValueChange={v => setEwbForm(s => ({ ...s, vehicle_type: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="R">Regular Cargo (200 km/day)</SelectItem>
                          <SelectItem value="O">Over Dimensional Cargo (20 km/day)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Approx Distance (KM)</Label>
                      <Input className="h-8 text-xs" type="number" value={ewbForm.distance_km} onChange={e => setEwbForm(s => ({ ...s, distance_km: Number(e.target.value) }))} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <Label className="text-xs">Transporter Name</Label>
                      <Input className="h-8 text-xs" value={ewbForm.transporter_name} onChange={e => setEwbForm(s => ({ ...s, transporter_name: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">Transporter ID / GSTIN</Label>
                      <Input className="h-8 text-xs uppercase font-mono" placeholder="Optional" value={ewbForm.transporter_id} onChange={e => setEwbForm(s => ({ ...s, transporter_id: e.target.value }))} />
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground pt-1">
                    Rule 138 compliant: Part A goods breakdown and Part B movement authentication will be generated instantaneously.
                  </p>

                  <Button className="w-full h-9 mt-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleGenerateEwayBill} disabled={loadingEwb}>
                    {loadingEwb ? "Generating e-Way Bill..." : "Generate & Authorize e-Way Bill"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {inv.balance_due > 0 && <Button variant="outline" size="sm" className="h-8" onClick={sendReminder} data-testid="reminder-invoice-btn"><Bell size={14} className="mr-1"/>Reminder</Button>}
          {inv.balance_due > 0 && (
            <Dialog open={payOpen} onOpenChange={setPayOpen}>
              <DialogTrigger asChild><Button size="sm" className="h-8" data-testid="receive-payment-btn"><CurrencyInr size={14} className="mr-1"/>Receive Payment</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Receive Payment</DialogTitle></DialogHeader>
                <div className="space-y-3 text-sm">
                  <div><Label className="text-xs">Amount</Label><Input type="number" value={amt} onChange={(e)=>setAmt(e.target.value)} data-testid="pay-amount-input" /></div>
                  <div><Label className="text-xs">Mode</Label><Input value={mode} onChange={(e)=>setMode(e.target.value)} /></div>
                  <div><Label className="text-xs">Reference / UTR</Label><Input value={ref} onChange={(e)=>setRef(e.target.value)} /></div>
                  <Button className="w-full h-9" onClick={receive} data-testid="confirm-payment-btn">Record payment</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      } />

      {/* E-Way Bill Active Status Banner */}
      {inv.eway_bill_number && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-card text-xs gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-md ${inv.eway_bill_status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <Truck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">e-Way Bill:</span>
                <code className="font-mono font-bold text-sm bg-muted px-1.5 py-0.5 rounded">{inv.eway_bill_number}</code>
                {inv.eway_bill_status === 'cancelled' ? (
                  <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-bold">CANCELLED</span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">ACTIVE · VALID</span>
                )}
              </div>
              <div className="text-muted-foreground text-[11px] mt-1 flex flex-wrap gap-x-3 gap-y-1">
                <span>Vehicle: <strong className="text-foreground uppercase font-mono">{inv.eway_bill_vehicle_no || 'MH04AB1234'}</strong></span>
                <span>Valid Until: <strong className="text-foreground">{inv.eway_bill_details?.formatted_valid_until || fmtDate(inv.eway_bill_valid_until)}</strong></span>
                <span>Distance: <strong className="text-foreground">{inv.eway_bill_distance || 45} km</strong></span>
                <span>Transporter: <strong className="text-foreground">{inv.eway_bill_transporter_name || 'Delhivery Express'}</strong></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="h-7 text-xs border-slate-300" asChild>
              <a href={`${BACKEND}/api/invoices/${id}/eway-bill/slip`} target="_blank" rel="noreferrer">
                <FilePdf size={13} className="mr-1 text-red-600" />Print Slip
              </a>
            </Button>
            {inv.eway_bill_status !== 'cancelled' && (
              <>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setVehForm({ vehicle_no: inv.eway_bill_vehicle_no || '', reason_code: '1', reason_remark: '', from_place: 'Mumbai DC' }); setUpdateVehOpen(true); }}>
                  Update Vehicle
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setCancelEwbOpen(true)}>
                  Cancel EWB
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Part-B Update Vehicle Modal */}
      <Dialog open={updateVehOpen} onOpenChange={setUpdateVehOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck size={18} className="text-blue-600" />
              Update Part-B Vehicle (e-Way Bill {inv.eway_bill_number})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div>
              <Label className="text-xs">New Vehicle Number</Label>
              <Input className="h-8 text-xs uppercase font-mono" placeholder="MH04CD5678" value={vehForm.vehicle_no} onChange={e => setVehForm(s => ({ ...s, vehicle_no: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">From Place / Transit Location</Label>
              <Input className="h-8 text-xs" placeholder="e.g. Pune Hub / Bhiwandi DC" value={vehForm.from_place} onChange={e => setVehForm(s => ({ ...s, from_place: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Reason for Update</Label>
              <Select value={vehForm.reason_code} onValueChange={v => setVehForm(s => ({ ...s, reason_code: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Due to Transshipment</SelectItem>
                  <SelectItem value="2">2 - Due to Breakdown</SelectItem>
                  <SelectItem value="3">3 - Change of Vehicle in Transit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Remarks / Notes</Label>
              <Input className="h-8 text-xs" placeholder="Optional notes" value={vehForm.reason_remark} onChange={e => setVehForm(s => ({ ...s, reason_remark: e.target.value }))} />
            </div>
            <Button className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleUpdateVehicle}>
              Save Part-B Vehicle Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel E-Way Bill Modal */}
      <Dialog open={cancelEwbOpen} onOpenChange={setCancelEwbOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle size={18} />
              Cancel e-Way Bill ({inv.eway_bill_number})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <p className="text-muted-foreground text-xs">
              As per GST regulations, an e-Way Bill can only be cancelled within 24 hours of generation if the consignment has not yet started transit.
            </p>
            <div>
              <Label className="text-xs">Cancellation Reason Code</Label>
              <Select value={cancelForm.reason_code} onValueChange={v => setCancelForm(s => ({ ...s, reason_code: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Duplicate e-Way Bill</SelectItem>
                  <SelectItem value="2">2 - Order Cancelled</SelectItem>
                  <SelectItem value="3">3 - Data Entry Mistake</SelectItem>
                  <SelectItem value="4">4 - Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Remarks</Label>
              <Input className="h-8 text-xs" value={cancelForm.remarks} onChange={e => setCancelForm(s => ({ ...s, remarks: e.target.value }))} />
            </div>
            <Button variant="destructive" className="w-full h-9" onClick={handleCancelEwayBill}>
              Confirm Cancellation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex items-center gap-3 text-xs">
        <StatusPill status={inv.status} />
        <span className="text-muted-foreground">Paid: <span className="tabular text-foreground">{money(inv.amount_paid)}</span></span>
        <span className="text-muted-foreground">Balance: <span className="tabular text-foreground">{money(inv.balance_due)}</span></span>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="text-xs">Item</TableHead><TableHead className="text-xs">HSN</TableHead>
            <TableHead className="text-xs text-right">Qty</TableHead><TableHead className="text-xs text-right">Rate</TableHead>
            <TableHead className="text-xs text-right">Taxable</TableHead><TableHead className="text-xs text-right">GST</TableHead>
            <TableHead className="text-xs text-right">Total</TableHead>
          </TableRow></TableHeader>
          <TableBody>{inv.items.map((it, i)=>(
            <TableRow key={i} className="tbl-row"><TableCell className="py-1.5 px-3">{it.name}</TableCell>
            <TableCell className="py-1.5 px-3 text-xs font-mono">{it.hsn}</TableCell>
            <TableCell className="py-1.5 px-3 text-right tabular">{it.quantity} {it.unit}</TableCell>
            <TableCell className="py-1.5 px-3 text-right tabular">{money(it.rate)}</TableCell>
            <TableCell className="py-1.5 px-3 text-right tabular">{money(it.taxable_amount)}</TableCell>
            <TableCell className="py-1.5 px-3 text-right tabular text-xs">{it.gst_rate}%</TableCell>
            <TableCell className="py-1.5 px-3 text-right tabular font-medium">{money(it.amount)}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
      <div className="grid md:grid-cols-2 gap-4 items-start">
        {/* Internal Profitability Breakdown */}
        <Card className="border-border bg-muted/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Internal Profitability & Margin (P&L)
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold tabular ${
                (inv.gross_margin_pct || 0) >= 20 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" :
                (inv.gross_margin_pct || 0) >= 10 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" :
                "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
              }`}>
                {(inv.gross_margin_pct || 0).toFixed(1)}% Margin
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground block">Revenue (Subtotal)</span>
                <span className="font-medium tabular">{money(inv.subtotal)}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">COGS (Product Cost)</span>
                <span className="font-medium tabular text-slate-600 dark:text-slate-400">{money(inv.total_cost || 0)}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Gross Profit</span>
                <span className="font-bold tabular text-emerald-600 dark:text-emerald-400">
                  {money(inv.gross_profit || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular">{money(inv.subtotal)}</span></div>
            {inv.same_state ? (<>
              <div className="flex justify-between"><span className="text-muted-foreground">CGST</span><span className="tabular">{money(inv.cgst)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SGST</span><span className="tabular">{money(inv.sgst)}</span></div>
            </>) : (
              <div className="flex justify-between"><span className="text-muted-foreground">IGST</span><span className="tabular">{money(inv.igst)}</span></div>
            )}
            <div className="flex justify-between border-t border-border pt-1.5 font-display font-semibold text-base"><span>Grand Total</span><span className="tabular">{money(inv.grand_total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
