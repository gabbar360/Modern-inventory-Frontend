import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, fmtDate, money } from "@/lib/api";
import { PageHeader, StatusPill, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ScheduleDeliveryModal from "@/components/dispatch/ScheduleDeliveryModal";
import {
  Plus,
  Truck,
  Calculator,
  Printer,
  MapPin,
  CheckCircle,
  Package,
  Clock,
  Trash,
  Receipt,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from "@phosphor-icons/react";

const KANBAN_STAGES = [
  { key: "READY_TO_DISPATCH", label: "Ready to Dispatch", color: "border-amber-400 bg-amber-50/20" },
  { key: "SCHEDULED", label: "Scheduled", color: "border-violet-400 bg-violet-50/20" },
  { key: "DISPATCHED", label: "In Transit / Dispatched", color: "border-sky-400 bg-sky-50/20" },
  { key: "DELIVERED", label: "Delivered", color: "border-emerald-400 bg-emerald-50/20" },
];

export default function Dispatch() {
  const [rows, setRows] = useState([]);
  const [orders, setOrders] = useState([]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null);
  const backend = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  // Proof of Delivery (POD) Dialog State
  const [podDialog, setPodDialog] = useState({
    open: false,
    dispatchId: null,
    receiver_name: "",
    receiver_phone: "",
    notes: "Goods received in good condition, seal intact.",
    submitting: false
  });

  // Delhivery Freight Estimator State
  const moneyExact = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const [freightOpen, setFreightOpen] = useState(false);
  const [freight, setFreight] = useState({
    origin_pincode: "360001",
    destination_pincode: "560001",
    weight_kg: 25,
    boxes: 1,
    length: 35,
    width: 25,
    height: 20,
    mode: "surface",
    cod_amount: 1000,
    loading: false,
    result: null
  });

  // Delhivery Tracking Modal State
  const [trackModal, setTrackModal] = useState({ open: false, loading: false, data: null });

  const load = async () => {
    try {
      const [d, o] = await Promise.all([api.get("/dispatches"), api.get("/sales-orders")]);
      setRows(d.data || []);
      setOrders(o.data || []);
    } catch (e) {
      toast.error("Failed to load dispatch data");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const normalizeStatus = (s) => {
    const u = (s || "").toUpperCase();
    if (u === "SCHEDULED" || u === "LOADING") return "SCHEDULED";
    if (u === "DISPATCHED") return "DISPATCHED";
    if (u === "DELIVERED") return "DELIVERED";
    if (u === "READY_TO_DISPATCH") return "READY_TO_DISPATCH";
    return "SCHEDULED";
  };

  const setStatus = async (id, s, podData = null) => { 
    try {
      const payload = { status: s };
      if (podData) {
        payload.pod_receiver_name = podData.receiver_name;
        payload.pod_phone = podData.receiver_phone;
        payload.pod_notes = podData.notes;
        payload.delivered_at = new Date().toISOString();
      }
      await api.post(`/dispatches/${id}/status`, payload); 
      toast.success(`Moved to ${s.replace(/_/g, ' ')}`); 
      load(); 
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to update status");
    }
  };

  // Stage Advancement: SCHEDULED -> DISPATCHED
  const advanceToDispatched = async (dispatchId) => {
    try {
      await api.post(`/dispatches/${dispatchId}/status`, {
        status: "DISPATCHED",
        dispatched_at: new Date().toISOString()
      });
      toast.success("Consignment marked as DISPATCHED / In-Transit");
      load();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  // Stage Advancement: DISPATCHED -> DELIVERED (Opens POD prompt)
  const promptForPod = (dispatchId) => {
    setPodDialog({
      open: true,
      dispatchId,
      receiver_name: "",
      receiver_phone: "",
      notes: "Goods received in good condition, seal intact.",
      submitting: false
    });
  };

  const submitPodDelivery = async () => {
    if (!podDialog.receiver_name.trim()) {
      return toast.error("Please enter receiver / signatory name");
    }
    setPodDialog(s => ({ ...s, submitting: true }));
    try {
      await setStatus(podDialog.dispatchId, "DELIVERED", {
        receiver_name: podDialog.receiver_name,
        receiver_phone: podDialog.receiver_phone,
        notes: podDialog.notes
      });
      setPodDialog(s => ({ ...s, open: false, submitting: false }));
      toast.success("Delivery completed & Proof of Delivery recorded!");
    } catch (e) {
      setPodDialog(s => ({ ...s, submitting: false }));
    }
  };
  
  const createChallan = async (id) => {
    try { 
      const { data } = await api.post(`/dispatches/${id}/create-challan`); 
      toast.success(`Challan ${data.number} created — stock reduced`); 
      load(); 
    } catch(e){ 
      toast.error(e?.response?.data?.detail || "Failed to create challan"); 
    }
  };

  const deleteDispatch = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dispatch record?")) return;
    try {
      await api.delete(`/dispatches/${id}`);
      toast.success("Dispatch removed");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to delete dispatch");
    }
  };

  const pushToDelhivery = async (id) => {
    try {
      const { data } = await api.post(`/dispatches/${id}/push-to-courier`);
      toast.success(`Manifested with ${data.courier_name}! LR: ${data.lr_number}`);
      load();
    } catch(e) {
      toast.error(e?.response?.data?.detail || "Courier booking failed");
    }
  };

  const trackShipment = async (id) => {
    setTrackModal({ open: true, loading: true, data: null });
    try {
      const { data } = await api.get(`/dispatches/${id}/track`);
      setTrackModal({ open: true, loading: false, data });
    } catch(e) {
      toast.error(e?.response?.data?.detail || "Tracking unavailable");
      setTrackModal({ open: false, loading: false, data: null });
    }
  };

  const bookPickup = async (id) => {
    try {
      const { data } = await api.post(`/dispatches/${id}/pickup-request`, {});
      toast.success(`Delhivery Pickup Scheduled! Token: ${data.pickup_token}`);
      load();
    } catch(e) {
      toast.error("Pickup booking failed");
    }
  };

  const calculateEstimate = async () => {
    setFreight(s => ({ ...s, loading: true }));
    try {
      const { data } = await api.post("/delhivery/freight-estimate", freight);
      setFreight(s => ({ ...s, loading: false, result: data }));
    } catch(e) {
      toast.error("Freight calculation failed");
      setFreight(s => ({ ...s, loading: false }));
    }
  };

  // Orders that are ready to dispatch (status === 'READY_TO_DISPATCH')
  const readyOrders = orders.filter(
    (o) => (o.status || "").toUpperCase() === "READY_TO_DISPATCH" && !o.dispatch_id
  );

  return (
    <div className="space-y-4" data-testid="dispatch-page">
      <PageHeader 
        title="Dispatch Schedule & Logistics" 
        subtitle="Standardized 4-stage fulfillment lifecycle with Delhivery API integration, Challans, and Proof of Delivery." 
        actions={
          <div className="flex items-center gap-2">
            <Sheet open={freightOpen} onOpenChange={setFreightOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-50 text-xs">
                  <Calculator size={14} className="mr-1.5" />Delhivery Rate Calculator
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-base">
                    <Truck size={18} className="text-blue-600" />Delhivery Rate Calculator
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3 text-sm">
                  <p className="text-xs text-muted-foreground">Calculate shipping charges and view real-time rate breakups between any two locations.</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Pickup Pincode</Label>
                      <Input value={freight.origin_pincode} onChange={e => setFreight(s => ({ ...s, origin_pincode: e.target.value }))} placeholder="360001 (Rajkot, GJ)" />
                    </div>
                    <div>
                      <Label className="text-xs">Delivery Pincode</Label>
                      <Input value={freight.destination_pincode} onChange={e => setFreight(s => ({ ...s, destination_pincode: e.target.value }))} placeholder="560001 (Bangalore, KA)" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Shipment Weight (kg)</Label>
                      <Input type="number" value={freight.weight_kg} onChange={e => setFreight(s => ({ ...s, weight_kg: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">COD Amount in ₹</Label>
                      <Input type="number" value={freight.cod_amount} onChange={e => setFreight(s => ({ ...s, cod_amount: e.target.value }))} placeholder="1000" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Number of Boxes</Label>
                      <Input type="number" value={freight.boxes} onChange={e => setFreight(s => ({ ...s, boxes: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">Mode</Label>
                      <Select value={freight.mode} onValueChange={v => setFreight(s => ({ ...s, mode: v }))}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="surface">Surface Shipping</SelectItem>
                          <SelectItem value="express">Express Shipping</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Box Dimensions (L × W × H in cm)</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <Input placeholder="L" type="number" value={freight.length} onChange={e => setFreight(s => ({ ...s, length: e.target.value }))} />
                      <Input placeholder="W" type="number" value={freight.width} onChange={e => setFreight(s => ({ ...s, width: e.target.value }))} />
                      <Input placeholder="H" type="number" value={freight.height} onChange={e => setFreight(s => ({ ...s, height: e.target.value }))} />
                    </div>
                  </div>

                  <Button className="w-full h-9 mt-2 text-xs" onClick={calculateEstimate} disabled={freight.loading}>
                    {freight.loading ? "Calculating…" : "Calculate Shipping Charges"}
                  </Button>

                  {freight.result && (
                    <div className="mt-4 p-3.5 bg-muted/40 border border-border rounded-lg space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <div>
                          <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                            <Truck size={14} className="text-blue-600"/>
                            {freight.result.mode === 'EXPRESS' ? 'Express' : 'Surface'}
                          </p>
                          <p className="text-[11px] text-muted-foreground">Transit: {freight.result.estimated_transit_days} days</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">Chargeable</p>
                          <p className="font-bold text-foreground">{Number(freight.result.chargeable_weight_kg || 0).toFixed(2)} kg</p>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-0.5">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Base freight</span>
                          <span className="font-mono text-foreground font-medium">{moneyExact(freight.result.breakup.shipping_charge)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Fuel & surcharges</span>
                          <span className="font-mono text-foreground font-medium">{moneyExact((freight.result.breakup.diesel_price_hike || 0) + (freight.result.breakup.lm_surcharge || 0))}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>GST @ 18%</span>
                          <span className="font-mono text-foreground font-medium">{moneyExact(freight.result.breakup.gst_18)}</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2 font-bold text-sm text-foreground">
                          <span>Total Freight</span>
                          <span className="text-emerald-600 font-mono text-base">{moneyExact(freight.result.breakup.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Button
              size="sm"
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setSelectedOrderForDelivery(null);
                setScheduleModalOpen(true);
              }}
              data-testid="new-dispatch-btn"
            >
              <Plus size={14} className="mr-1" />
              Schedule Delivery
            </Button>
          </div>
        } 
      />

      {/* Standardized 4-Stage Kanban Board */}
      <div className="grid gap-3 md:grid-cols-4">
        {KANBAN_STAGES.map((stage) => {
          const isReadyColumn = stage.key === "READY_TO_DISPATCH";
          const columnDispatches = rows.filter((r) => normalizeStatus(r.status) === stage.key);
          const totalCards = isReadyColumn ? (columnDispatches.length + readyOrders.length) : columnDispatches.length;

          return (
            <div
              key={stage.key}
              className={`rounded-lg p-2.5 border-t-2 ${stage.color} bg-muted/30 flex flex-col min-h-[500px]`}
              data-testid={`dispatch-col-${stage.key.toLowerCase()}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 py-1 mb-2">
                <span className="text-xs font-semibold text-foreground tracking-tight">{stage.label}</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {totalCards}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-2.5 flex-1">
                {/* 1. If Ready column, show Ready-to-Dispatch Sales Orders */}
                {isReadyColumn && readyOrders.map((so) => (
                  <div
                    key={`so-${so.id}`}
                    className="bg-card border border-amber-200/80 rounded-md p-2.5 text-xs shadow-sm space-y-2 hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                        ORDER {so.number}
                      </span>
                      <span className="text-[10px] text-amber-700 font-medium">Ready</span>
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-foreground leading-snug">{so.customer_name}</p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">Value: {money(so.grand_total)}</p>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      📦 {so.items?.length || 1} product types ready for booking
                    </div>
                    <Button
                      size="sm"
                      className="w-full h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium"
                      onClick={() => {
                        setSelectedOrderForDelivery(so);
                        setScheduleModalOpen(true);
                      }}
                    >
                      <Truck size={12} className="mr-1.5" />
                      Book Carrier & Dispatch
                    </Button>
                  </div>
                ))}

                {/* 2. Dispatch Records for this Stage */}
                {columnDispatches.map((r) => (
                  <div
                    key={r.id}
                    className="bg-card border border-border rounded-md p-3 text-xs shadow-sm card-hover space-y-2.5"
                    data-testid={`dispatch-card-${r.id}`}
                  >
                    {/* Card Top: Number & Delete Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-foreground">
                        <Truck size={13} className="text-blue-600" />
                        <span>{r.number}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusPill status={r.priority || 'medium'} />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteDispatch(r.id)}
                          title="Delete dispatch"
                        >
                          <Trash size={12} />
                        </Button>
                      </div>
                    </div>

                    {/* Customer & Order Reference */}
                    <div>
                      <p className="font-semibold text-xs leading-tight text-foreground">{r.customer_name}</p>
                      <p className="text-muted-foreground text-[11px] font-mono mt-0.5">{r.sales_order_number}</p>
                    </div>

                    {/* Weight & Packaging Specs */}
                    <div className="grid grid-cols-2 gap-1 text-[10px] bg-muted/40 p-1.5 rounded border border-border">
                      <div>
                        <span className="text-muted-foreground">Boxes: </span>
                        <span className="font-mono font-medium text-foreground">{r.package_count || r.scheduled_quantity || 1}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Chargeable: </span>
                        <span className="font-mono font-medium text-foreground">{r.chargeable_weight_kg ? `${r.chargeable_weight_kg} kg` : '—'}</span>
                      </div>
                    </div>

                    {/* Carrier Badge */}
                    <div className="text-[10px] rounded px-2 py-1 bg-muted/50 border border-border flex items-center justify-between">
                      <span className="font-medium text-foreground truncate max-w-[120px]">
                        {r.courier_name || 'Carrier Assigned'}
                      </span>
                      <span className="font-mono text-blue-700 font-semibold">
                        {r.awb_number || r.lr_number || r.vehicle || 'Pending LR'}
                      </span>
                    </div>

                    {/* Stage Specific Actions */}

                    {/* STAGE 2: SCHEDULED */}
                    {stage.key === "SCHEDULED" && (
                      <div className="space-y-1.5 pt-1 border-t border-border">
                        <Button
                          size="sm"
                          className="w-full h-7 text-xs bg-sky-600 hover:bg-sky-700 text-white font-medium"
                          onClick={() => advanceToDispatched(r.id)}
                        >
                          🚚 Mark Dispatched (Departed)
                        </Button>

                        {!r.lr_number && !r.awb_number && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-6 text-[11px] text-blue-600 border-blue-200"
                            onClick={() => pushToDelhivery(r.id)}
                          >
                            🚀 Manifest Delhivery
                          </Button>
                        )}
                      </div>
                    )}

                    {/* STAGE 3: DISPATCHED / IN TRANSIT */}
                    {stage.key === "DISPATCHED" && (
                      <div className="space-y-2 pt-1 border-t border-border">
                        {/* Delivery Challan Status */}
                        {!r.challan_id ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-full text-[11px] border-amber-200 text-amber-800 bg-amber-50/50 hover:bg-amber-100/50"
                            onClick={() => createChallan(r.id)}
                            data-testid={`create-challan-${r.id}`}
                          >
                            <Receipt size={12} className="mr-1" />
                            Generate Delivery Challan
                          </Button>
                        ) : (
                          <div className="flex items-center justify-between text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-2 py-0.5">
                            <span className="flex items-center gap-1 font-medium">
                              <CheckCircle size={11} className="text-emerald-600" />
                              Challan Generated
                            </span>
                            <span className="font-mono font-semibold">{r.challan_number || 'CH'}</span>
                          </div>
                        )}

                        {/* Track & Print Buttons */}
                        <div className="grid grid-cols-2 gap-1 text-[10px]">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] px-1"
                            onClick={() => trackShipment(r.id)}
                          >
                            <MapPin size={10} className="mr-1 text-blue-600" />
                            Track
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] px-1"
                            onClick={() => {
                              if (r.lr_number && (r.carrier_type?.includes('delhivery') || !r.carrier_type?.includes('private'))) {
                                window.open(`${backend}/api/delhivery-b2b/lr-pdf/${r.lr_number}`, "_blank");
                              } else {
                                window.open(
                                  `${backend}/api/dispatches/${r.id}/shipping-label?token=${
                                    localStorage.getItem("access_token") || ""
                                  }`,
                                  "_blank"
                                );
                              }
                            }}
                          >
                            <Printer size={10} className="mr-1 text-emerald-600" />
                            Official LR PDF
                          </Button>
                        </div>

                        {/* Complete Delivery Button */}
                        <Button
                          size="sm"
                          className="w-full h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                          onClick={() => promptForPod(r.id)}
                        >
                          <UserCheck size={13} className="mr-1" />
                          Mark Delivered (Capture POD)
                        </Button>
                      </div>
                    )}

                    {/* STAGE 4: DELIVERED */}
                    {stage.key === "DELIVERED" && (
                      <div className="space-y-1.5 pt-1 border-t border-border text-[10px]">
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded space-y-0.5">
                          <p className="font-semibold flex items-center gap-1">
                            <CheckCircle size={11} className="text-emerald-600" />
                            Delivered to Consignee
                          </p>
                          {r.pod_receiver_name && (
                            <p className="text-[10px] text-emerald-900">
                              👤 Receiver: <span className="font-semibold">{r.pod_receiver_name}</span>
                            </p>
                          )}
                          {r.delivered_at && (
                            <p className="text-[9px] text-muted-foreground">
                              📅 {fmtDate(r.delivered_at)}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] flex-1"
                            onClick={() =>
                              window.open(
                                `${backend}/api/dispatches/${r.id}/shipping-label?token=${
                                  localStorage.getItem("access_token") || ""
                                }`,
                                "_blank"
                              )
                            }
                          >
                            <Printer size={10} className="mr-1 text-emerald-600" />
                            Print Slip
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Quick Stage Dropdown */}
                    <div className="pt-1 border-t border-border">
                      <Select
                        value={normalizeStatus(r.status)}
                        onValueChange={(val) => {
                          if (val === "DELIVERED") promptForPod(r.id);
                          else setStatus(r.id, val);
                        }}
                      >
                        <SelectTrigger className="h-6 text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="READY_TO_DISPATCH">Ready to Dispatch</SelectItem>
                          <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                          <SelectItem value="DISPATCHED">Dispatched / In-Transit</SelectItem>
                          <SelectItem value="DELIVERED">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Delhivery Tracking Dialog */}
      <Dialog open={trackModal.open} onOpenChange={(o) => setTrackModal((s) => ({ ...s, open: o }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Truck size={18} className="text-blue-600" />
              Delhivery B2B Shipment Tracking
            </DialogTitle>
          </DialogHeader>
          {trackModal.loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Connecting to Delhivery tracking API…</div>
          ) : trackModal.data ? (
            <div className="space-y-3 text-xs mt-2">
              <div className="p-3 bg-muted/40 rounded-lg border border-border flex justify-between items-center">
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase">Waybill / LR Number</p>
                  <p className="font-mono font-bold text-sm text-foreground">{trackModal.data.lr_number}</p>
                  <p className="text-[11px] text-muted-foreground">Consignee: {trackModal.data.consignee}</p>
                </div>
                <div className="text-right">
                  <span className="pill pill-emerald">{trackModal.data.status}</span>
                  <p className="text-[10px] text-muted-foreground mt-1">Est. Delivery: {trackModal.data.expected_delivery}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-xs mb-2">Tracking History & Checkpoints:</p>
                <div className="border-l-2 border-blue-500 ml-2 pl-3 space-y-3">
                  {trackModal.data.scans?.map((sc, i) => (
                    <div key={i} className="relative">
                      <div
                        className={`absolute -left-[19px] top-0.5 h-2.5 w-2.5 rounded-full ${
                          sc.completed ? "bg-blue-600 ring-2 ring-blue-100" : "bg-muted-foreground/40"
                        }`}
                      />
                      <p className="font-medium text-foreground">{sc.activity}</p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                        <span>📍 {sc.location}</span>
                        <span>{sc.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Proof of Delivery (POD) Dialog */}
      <Dialog open={podDialog.open} onOpenChange={(o) => setPodDialog(s => ({ ...s, open: o }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <UserCheck size={18} className="text-emerald-600" />
              Proof of Delivery (POD) Confirmation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs mt-2">
            <p className="text-muted-foreground text-[11px]">
              Confirm that the goods have been safely delivered to the consignee destination and capture receiver signature/sign-off info.
            </p>
            <div>
              <Label className="text-xs font-medium">Receiver / Contact Person Name *</Label>
              <Input
                className="h-8 text-xs mt-1"
                placeholder="e.g. Rajesh Sharma (Warehouse Supervisor)"
                value={podDialog.receiver_name}
                onChange={(e) => setPodDialog(s => ({ ...s, receiver_name: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Receiver Mobile Number (Optional)</Label>
              <Input
                className="h-8 text-xs mt-1"
                placeholder="e.g. 9820011223"
                value={podDialog.receiver_phone}
                onChange={(e) => setPodDialog(s => ({ ...s, receiver_phone: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Delivery Verification Notes</Label>
              <Textarea
                rows={2}
                className="text-xs mt-1"
                value={podDialog.notes}
                onChange={(e) => setPodDialog(s => ({ ...s, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="mt-4 flex items-center justify-between">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setPodDialog(s => ({ ...s, open: false }))}>
              Cancel
            </Button>
            <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={submitPodDelivery} disabled={podDialog.submitting}>
              {podDialog.submitting ? "Saving POD…" : "Confirm Delivery"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Delivery Modal */}
      <ScheduleDeliveryModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        order={selectedOrderForDelivery}
        onSuccess={() => {
          load();
        }}
      />
    </div>
  );
}
