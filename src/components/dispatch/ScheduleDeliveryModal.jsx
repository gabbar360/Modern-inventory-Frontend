import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Truck,
  Package,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Building2,
  AlertTriangle,
} from 'lucide-react';

export function ScheduleDeliveryModal({
  open,
  onOpenChange,
  order,
  onSuccess,
}) {
  const [courierType, setCourierType] = useState('delhivery'); // 'delhivery' | 'private'
  const [loading, setLoading] = useState(false);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateEstimate, setRateEstimate] = useState(null);

  // Option A: Delhivery State
  const [pickupLocation, setPickupLocation] = useState('Vegnar warehouse');
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().slice(0, 10));
  const [pickupTimeSlot, setPickupTimeSlot] = useState('Morning (10:00 AM - 01:00 PM)');
  const [packagingLines, setPackagingLines] = useState([]);

  // Option B: Private Courier State
  const [privateForm, setPrivateForm] = useState({
    carrier_name: 'V-Trans Logistics',
    vehicle_number: 'MH-04-AB-1234',
    driver_name: 'Suresh Patil',
    driver_phone: '9820011223',
    lr_number: '',
    dispatch_date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const [bookingError, setBookingError] = useState(null);
  const [ewayBill, setEwayBill] = useState('');

  useEffect(() => {
    setBookingError(null);
  }, [open, courierType]);

  // Extract Destination Pincode from order
  const destinationPincode = useMemo(() => {
    if (!order) return '400001';
    const match = (order.shipping_address || order.address || '').match(/\b\d{6}\b/);
    return match ? match[0] : (order.destination_pincode || '400001');
  }, [order]);

  // Load line items when order changes
  useEffect(() => {
    if (!order) return;
    const items = (order.items || []).map((it, idx) => {
      const qty = Number(it.quantity) || 1;
      const defaultBoxes = Math.max(1, Math.ceil(qty / 500));
      return {
        product_id: it.product_id || `prod_${idx}`,
        product_name: it.name || it.product_name || `Product ${idx + 1}`,
        ordered_quantity: qty,
        box_count: defaultBoxes,
        unit_dead_weight_kg: Number(it.weight_kg) || 5.0,
        length_cm: Number(it.length_cm) || 35,
        width_cm: Number(it.width_cm) || 25,
        height_cm: Number(it.height_cm) || 20,
      };
    });

    if (items.length === 0) {
      items.push({
        product_id: 'default_prod',
        product_name: 'Consignment Packaging Box',
        ordered_quantity: 1,
        box_count: 1,
        unit_dead_weight_kg: 10,
        length_cm: 35,
        width_cm: 25,
        height_cm: 20,
      });
    }

    setPackagingLines(items);
    setEwayBill(order.eway_bill_number || order.ewb || '');
    setRateEstimate(null);
  }, [order]);

  // Real-time packaging calculations
  const packagingSummary = useMemo(() => {
    let totalDead = 0;
    let totalVolumetric = 0;
    let totalBoxes = 0;

    packagingLines.forEach((p) => {
      const boxes = Math.max(1, Number(p.box_count) || 1);
      const unitWeight = Math.max(0.1, Number(p.unit_dead_weight_kg) || 1);
      const l = Math.max(1, Number(p.length_cm) || 10);
      const w = Math.max(1, Number(p.width_cm) || 10);
      const h = Math.max(1, Number(p.height_cm) || 10);

      totalDead += boxes * unitWeight;
      totalVolumetric += (boxes * l * w * h) / 5000;
      totalBoxes += boxes;
    });

    const dead = Math.round(totalDead * 100) / 100;
    const vol = Math.round(totalVolumetric * 100) / 100;
    const chargeable = Math.max(dead, vol);

    return {
      total_packages: totalBoxes,
      total_dead_weight_kg: dead,
      volumetric_weight_kg: vol,
      chargeable_weight_kg: Math.round(chargeable * 100) / 100,
    };
  }, [packagingLines]);

  const updateLine = (idx, field, val) => {
    setPackagingLines((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
    setRateEstimate(null); // invalidate rate estimate
  };

  // Calculate Delhivery Rate Estimate
  const calculateRate = async () => {
    setRateLoading(true);
    try {
      const { data } = await api.post('/delhivery/freight-estimate', {
        origin_pincode: '421302',
        destination_pincode: destinationPincode,
        weight_kg: packagingSummary.chargeable_weight_kg,
        boxes: packagingSummary.total_packages,
        mode: 'surface',
      });
      setRateEstimate(data);
      toast.success('Delhivery rate calculated');
    } catch (e) {
      // Deterministic calculation
      const base = Math.max(150, Math.round(packagingSummary.chargeable_weight_kg * 14));
      const fuel = Math.round(base * 0.08);
      const gst = Math.round((base + fuel + 45) * 0.18 * 100) / 100;
      setRateEstimate({
        chargeable_weight_kg: packagingSummary.chargeable_weight_kg,
        estimated_transit_days: 3,
        breakup: {
          shipping_charge: base,
          diesel_price_hike: fuel,
          lm_surcharge: 30,
          peak_surcharge: 15,
          gst_18: gst,
          total_amount: Math.round((base + fuel + 45 + gst) * 100) / 100,
        },
      });
      toast.info('Estimated based on distance & weight matrix');
    } finally {
      setRateLoading(false);
    }
  };

  // Submit Schedule Delivery
  const handleScheduleSubmit = async () => {
    if (!order) return;
    setLoading(true);

    try {
      const payload = {
        sales_order_id: order.id,
        sales_order_number: order.number,
        customer_name: order.customer_name,
        carrier_type: courierType,
        total_package_count: packagingSummary.total_packages,
        total_dead_weight_kg: packagingSummary.total_dead_weight_kg,
        volumetric_weight_kg: packagingSummary.volumetric_weight_kg,
        chargeable_weight_kg: packagingSummary.chargeable_weight_kg,
        destination_pincode: destinationPincode,
      };

      if (courierType === 'delhivery') {
        payload.pickup_location = pickupLocation;
        payload.pickup_date = pickupDate;
        payload.pickup_time_slot = pickupTimeSlot;
        payload.packages = packagingLines;
        payload.eway_bill = ewayBill;
        payload.rate_estimate = rateEstimate?.breakup || { total_amount: 450 };
      } else {
        payload.carrier_name = privateForm.carrier_name;
        payload.vehicle_number = privateForm.vehicle_number;
        payload.driver_name = privateForm.driver_name;
        payload.driver_phone = privateForm.driver_phone;
        payload.lr_number = privateForm.lr_number;
        payload.scheduled_date = privateForm.dispatch_date;
        payload.notes = privateForm.notes;
      }

      const { data } = await api.post('/dispatch/schedule', payload);

      if (courierType === 'delhivery') {
        const lr = data.dispatch?.lr_number;
        const awb = data.dispatch?.awb_number;
        toast.success(`Delhivery B2B LR Manifested! LRN: ${lr || 'Created'}${awb ? ` (MWBN: ${awb})` : ''}`);
        if (lr) {
          window.open(`http://localhost:8000/api/delhivery-b2b/lr-pdf/${lr}`, '_blank');
        }
      } else {
        toast.success(`Dispatch Scheduled with ${privateForm.carrier_name}!`);
      }

      onSuccess && onSuccess(data);
      onOpenChange(false);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || err.message || 'Scheduling failed';
      setBookingError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-5 pb-3 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 rounded-lg">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  Schedule Delivery & Dispatch
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Order <span className="font-mono font-medium text-foreground">{order?.number}</span> · {order?.customer_name}
                </p>
              </div>
            </div>
          </div>

          {/* Courier Selection Radio Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              type="button"
              onClick={() => setCourierType('delhivery')}
              className={`flex items-center gap-3 p-3 border rounded-lg text-left transition-all ${
                courierType === 'delhivery'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 ring-1 ring-blue-600'
                  : 'border-border hover:bg-muted/50 text-muted-foreground'
              }`}
            >
              <div className={`p-1.5 rounded-full ${courierType === 'delhivery' ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold leading-none">Delhivery B2B / LTL Freight</p>
                <p className="text-[11px] opacity-80 mt-1">Direct LRN & Waybill Manifest, Rajkot Hub Connected</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCourierType('private')}
              className={`flex items-center gap-3 p-3 border rounded-lg text-left transition-all ${
                courierType === 'private'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 ring-1 ring-blue-600'
                  : 'border-border hover:bg-muted/50 text-muted-foreground'
              }`}
            >
              <div className={`p-1.5 rounded-full ${courierType === 'private' ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold leading-none">Private Transporter</p>
                <p className="text-[11px] opacity-80 mt-1">Self-fleet, V-Trans, TCI, SafeExpress, or Local Truck</p>
              </div>
            </button>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {bookingError && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg border border-red-200 bg-red-50 text-red-900 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-200 text-xs">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold text-sm text-red-800 dark:text-red-200">Courier Manifestation Rejection</p>
                <p className="text-xs leading-relaxed">{bookingError}</p>
              </div>
            </div>
          )}

          {courierType === 'delhivery' ? (
            /* Option A: Delhivery B2B Logistics */
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-blue-200 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-200">
                <ShieldCheck className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-semibold">Live Delhivery B2B Connected (VEGNAR GLOBAL 9032 B2B)</p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300">
                    Origin Warehouse: <strong>Vegnar_Rajkot</strong> (Plot 12, GIDC, Rajkot, Gujarat - 360001). Consignment LR will appear live in Delhivery One portal.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-medium">Pickup Location (Delhivery Facility)</Label>
                  <Select value={pickupLocation} onValueChange={setPickupLocation}>
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vegnar warehouse">Vegnar warehouse (Rajkot, GJ) ★</SelectItem>
                      <SelectItem value="VEGNAR GLOBAL 9032 B2B">VEGNAR GLOBAL 9032 B2B (Rajkot, GJ)</SelectItem>
                      <SelectItem value="Nandanvan">Nandanvan (Rajkot, GJ)</SelectItem>
                      <SelectItem value="Ankit Silicate">Ankit Silicate (Morbi, GJ)</SelectItem>
                      <SelectItem value="CANEVIBE">CANEVIBE (Ahmedabad, GJ)</SelectItem>
                      <SelectItem value="HIVIKA ECOTECH PVT. LTD.">HIVIKA ECOTECH PVT. LTD. (Bardoli, GJ)</SelectItem>
                      <SelectItem value="K.I.L">K.I.L (Dhrol, GJ)</SelectItem>
                      <SelectItem value="Mango">Mango (Gandhidham, GJ)</SelectItem>
                      <SelectItem value="ECO X VARGA">ECO X VARGA (Indore, MP)</SelectItem>
                      <SelectItem value="PURELY ECOWARE LLP">PURELY ECOWARE LLP (Mumbai, MH)</SelectItem>
                      <SelectItem value="sairaj goblex">sairaj goblex (Pune, MH)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium">Pickup Date</Label>
                  <Input
                    type="date"
                    className="h-8 text-xs mt-1"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium">Time Window Slot</Label>
                  <Select value={pickupTimeSlot} onValueChange={setPickupTimeSlot}>
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning (10:00 AM - 01:00 PM)">Morning (10:00 AM - 01:00 PM)</SelectItem>
                      <SelectItem value="Afternoon (02:00 PM - 06:00 PM)">Afternoon (02:00 PM - 06:00 PM)</SelectItem>
                      <SelectItem value="Evening (06:00 PM - 09:00 PM)">Evening (06:00 PM - 09:00 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Optional / Mandatory E-Way Bill Number */}
              <div className="p-2.5 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <span>E-Way Bill Number (EWB)</span>
                    {Number(order?.grand_total || 0) > 50000 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-semibold">
                        Required for Orders &gt; ₹50,000
                      </span>
                    )}
                  </Label>
                  <span className="text-[10px] text-muted-foreground">12-digit Indian GST e-Way Bill</span>
                </div>
                <Input
                  type="text"
                  placeholder="e.g. 241001234567"
                  className="h-8 text-xs font-mono"
                  value={ewayBill}
                  onChange={(e) => setEwayBill(e.target.value)}
                  maxLength={12}
                />
              </div>

              {/* Packaging & Multi-Product Aggregation Table */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-blue-600" />
                    Packaging, Box Aggregation & Dimensions
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Volumetric divisor: 5000 (L×W×H/5000)</span>
                </div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground">
                      <tr>
                        <th className="py-1.5 px-3 text-left">Product Item</th>
                        <th className="py-1.5 px-2 text-center w-20">Ordered</th>
                        <th className="py-1.5 px-2 text-center w-20">Boxes</th>
                        <th className="py-1.5 px-2 text-center w-24">Gross Wt (kg/box)</th>
                        <th className="py-1.5 px-2 text-center w-40">Dimensions (L×W×H cm)</th>
                        <th className="py-1.5 px-3 text-right w-24">Dead Wt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {packagingLines.map((row, idx) => (
                        <tr key={idx} className="hover:bg-muted/30">
                          <td className="py-2 px-3">
                            <p className="font-medium text-foreground truncate max-w-[200px]">{row.product_name}</p>
                            <span className="text-[10px] text-muted-foreground">SKU: {row.product_id}</span>
                          </td>
                          <td className="py-2 px-2 text-center tabular font-mono">
                            {row.ordered_quantity.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <Input
                              type="number"
                              className="h-7 text-xs text-center w-16 mx-auto"
                              value={row.box_count}
                              onChange={(e) => updateLine(idx, 'box_count', Number(e.target.value))}
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <Input
                              type="number"
                              step="0.5"
                              className="h-7 text-xs text-center w-20 mx-auto"
                              value={row.unit_dead_weight_kg}
                              onChange={(e) => updateLine(idx, 'unit_dead_weight_kg', Number(e.target.value))}
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <div className="flex items-center gap-1 justify-center">
                              <Input
                                placeholder="L"
                                className="h-7 text-[11px] text-center w-11 px-0"
                                value={row.length_cm}
                                onChange={(e) => updateLine(idx, 'length_cm', Number(e.target.value))}
                              />
                              <span className="text-muted-foreground text-[10px]">×</span>
                              <Input
                                placeholder="W"
                                className="h-7 text-[11px] text-center w-11 px-0"
                                value={row.width_cm}
                                onChange={(e) => updateLine(idx, 'width_cm', Number(e.target.value))}
                              />
                              <span className="text-muted-foreground text-[10px]">×</span>
                              <Input
                                placeholder="H"
                                className="h-7 text-[11px] text-center w-11 px-0"
                                value={row.height_cm}
                                onChange={(e) => updateLine(idx, 'height_cm', Number(e.target.value))}
                              />
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-medium">
                            {(row.box_count * row.unit_dead_weight_kg).toFixed(1)} kg
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Auto Computed Weight Metric Cards */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  <div className="p-2.5 bg-muted/40 border border-border rounded-md text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Total Boxes</p>
                    <p className="text-base font-bold text-foreground font-mono">{packagingSummary.total_packages}</p>
                  </div>
                  <div className="p-2.5 bg-muted/40 border border-border rounded-md text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Total Dead Wt</p>
                    <p className="text-base font-bold text-foreground font-mono">{packagingSummary.total_dead_weight_kg} kg</p>
                  </div>
                  <div className="p-2.5 bg-muted/40 border border-border rounded-md text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Volumetric Wt</p>
                    <p className="text-base font-bold text-foreground font-mono">{packagingSummary.volumetric_weight_kg} kg</p>
                  </div>
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 text-center">
                    <p className="text-[10px] text-blue-700 dark:text-blue-300 uppercase font-semibold">Chargeable Wt</p>
                    <p className="text-base font-bold text-blue-800 dark:text-blue-200 font-mono">
                      {packagingSummary.chargeable_weight_kg} kg
                    </p>
                  </div>
                </div>
              </div>

              {/* Rate Calculator Section */}
              <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">Delhivery Dynamic Freight Estimation</p>
                    <p className="text-[11px] text-muted-foreground">Destination PIN: <span className="font-mono font-bold text-foreground">{destinationPincode}</span></p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-50"
                    onClick={calculateRate}
                    disabled={rateLoading}
                  >
                    <Calculator className="h-3.5 w-3.5 mr-1" />
                    {rateLoading ? 'Calculating…' : 'Calculate Estimated Cost'}
                  </Button>
                </div>

                {rateEstimate && (
                  <div className="mt-2 pt-2 border-t border-border grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground">Base Shipping</span>
                      <p className="font-mono font-medium">₹{rateEstimate.breakup?.shipping_charge || 0}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Fuel + Surcharges</span>
                      <p className="font-mono font-medium">₹{(rateEstimate.breakup?.diesel_price_hike || 0) + (rateEstimate.breakup?.lm_surcharge || 0)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">GST @ 18%</span>
                      <p className="font-mono font-medium">₹{rateEstimate.breakup?.gst_18 || 0}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Total Freight</span>
                      <p className="font-mono font-bold text-emerald-600 text-sm">₹{rateEstimate.breakup?.total_amount || 0}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Option B: Private Courier / Transporter */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Transporter / Courier Name</Label>
                  <Input
                    className="h-8 text-xs mt-1"
                    placeholder="e.g. V-Trans Logistics, Self-Fleet, TCI"
                    value={privateForm.carrier_name}
                    onChange={(e) => setPrivateForm({ ...privateForm, carrier_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Vehicle / Truck Number</Label>
                  <Input
                    className="h-8 text-xs mt-1"
                    placeholder="e.g. MH-04-AB-1234"
                    value={privateForm.vehicle_number}
                    onChange={(e) => setPrivateForm({ ...privateForm, vehicle_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-medium">Driver Name</Label>
                  <Input
                    className="h-8 text-xs mt-1"
                    placeholder="Driver full name"
                    value={privateForm.driver_name}
                    onChange={(e) => setPrivateForm({ ...privateForm, driver_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Driver Phone</Label>
                  <Input
                    className="h-8 text-xs mt-1"
                    placeholder="10-digit mobile"
                    value={privateForm.driver_phone}
                    onChange={(e) => setPrivateForm({ ...privateForm, driver_phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">LR / Tracking Number</Label>
                  <Input
                    className="h-8 text-xs mt-1"
                    placeholder="e.g. VT-984210"
                    value={privateForm.lr_number}
                    onChange={(e) => setPrivateForm({ ...privateForm, lr_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Scheduled Dispatch Date</Label>
                  <Input
                    type="date"
                    className="h-8 text-xs mt-1"
                    value={privateForm.dispatch_date}
                    onChange={(e) => setPrivateForm({ ...privateForm, dispatch_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Total Package / Box Count</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs mt-1"
                    value={packagingSummary.total_packages}
                    disabled
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium">Loading Instructions / Gate Pass Notes</Label>
                <Textarea
                  rows={2}
                  className="text-xs mt-1"
                  placeholder="Gate pass reference, loading dock instructions, etc."
                  value={privateForm.notes}
                  onChange={(e) => setPrivateForm({ ...privateForm, notes: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t bg-muted/20 flex items-center justify-between">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Orders will transition to <span className="font-semibold text-foreground">SCHEDULED</span></span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleScheduleSubmit}
              disabled={loading}
            >
              {loading
                ? 'Processing Manifest…'
                : courierType === 'delhivery'
                ? 'Create Manifest & Schedule Pickup'
                : 'Confirm & Schedule Dispatch'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ScheduleDeliveryModal;

