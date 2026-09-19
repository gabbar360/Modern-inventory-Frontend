import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api, fmtDate, money } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  Plus, 
  PencilSimple, 
  Trash, 
  MapPin, 
  Buildings, 
  CircleNotch, 
  Sparkle,
  CheckCircle,
  Truck
} from "@phosphor-icons/react";

const GST_STATE_CODE_MAP = {
  "01": "Jammu and Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan",
  "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
  "13": "Nagaland", "14": "Manipur", "15": "Mizoram", "16": "Tripura",
  "17": "Meghalaya", "18": "Assam", "19": "West Bengal", "20": "Jharkhand",
  "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "26": "Dadra and Nagar Haveli and Daman and Diu", "27": "Maharashtra",
  "29": "Karnataka", "30": "Goa", "31": "Lakshadweep", "32": "Kerala",
  "33": "Tamil Nadu", "34": "Puducherry", "35": "Andaman and Nicobar Islands",
  "36": "Telangana", "38": "Ladakh"
};

export default function Customers() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [fetchingBillingPin, setFetchingBillingPin] = useState(false);
  const [fetchingShippingPin, setFetchingShippingPin] = useState(false);

  const initialForm = {
    company_name: "",
    contact_person: "",
    mobile: "",
    email: "",
    gstin: "",
    state: "",
    state_code: "",
    city: "",
    pincode: "",
    billing_address_line: "",
    billing_city: "",
    billing_state: "",
    billing_pincode: "",
    billing_address: "",
    shipping_same_as_billing: true,
    shipping_address_line: "",
    shipping_city: "",
    shipping_state: "",
    shipping_pincode: "",
    shipping_address: "",
    credit_limit: 0,
    payment_terms: "Net 30"
  };

  const [f, setF] = useState(initialForm);

  const upd = (k) => (e) => setF((s) => ({ ...s, [k]: e?.target ? e.target.value : e }));

  const load = async () => {
    try {
      const { data } = await api.get("/customers");
      setRows(data || []);
    } catch (e) {
      console.error("Failed to load customers:", e);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditingId(null);
    setF(initialForm);
    setOpen(true);
  };

  const openEdit = (cust, e) => {
    if (e) e.stopPropagation();
    setEditingId(cust.id);

    const billPin = cust.billing_pincode || cust.pincode || (cust.billing_address && cust.billing_address.match(/\b\d{6}\b/)?.[0]) || "";
    const shipPin = cust.shipping_pincode || (cust.shipping_address && cust.shipping_address.match(/\b\d{6}\b/)?.[0]) || billPin;
    const billCity = cust.billing_city || cust.city || "";
    const billState = cust.billing_state || cust.state || "";
    const isSame = !cust.shipping_address || cust.shipping_address === cust.billing_address || (
      cust.shipping_address_line === cust.billing_address_line &&
      cust.shipping_pincode === cust.billing_pincode
    );

    setF({
      company_name: cust.company_name || "",
      contact_person: cust.contact_person || "",
      mobile: cust.mobile || "",
      email: cust.email || "",
      gstin: cust.gstin || "",
      state: billState,
      state_code: cust.state_code || "",
      city: billCity,
      pincode: billPin,
      billing_address_line: cust.billing_address_line || cust.billing_address || "",
      billing_city: billCity,
      billing_state: billState,
      billing_pincode: billPin,
      billing_address: cust.billing_address || "",
      shipping_same_as_billing: isSame,
      shipping_address_line: isSame ? (cust.billing_address_line || cust.billing_address || "") : (cust.shipping_address_line || cust.shipping_address || ""),
      shipping_city: isSame ? billCity : (cust.shipping_city || ""),
      shipping_state: isSame ? billState : (cust.shipping_state || ""),
      shipping_pincode: isSame ? billPin : shipPin,
      shipping_address: cust.shipping_address || "",
      credit_limit: cust.credit_limit || 0,
      payment_terms: cust.payment_terms || "Net 30"
    });
    setOpen(true);
  };

  // Handle GSTIN Change and auto-detect State
  const handleGstinChange = (e) => {
    const rawVal = e.target.value;
    const gstinVal = rawVal.toUpperCase();
    setF(prev => {
      const next = { ...prev, gstin: gstinVal };
      if (gstinVal.length >= 2) {
        const code = gstinVal.slice(0, 2);
        if (GST_STATE_CODE_MAP[code]) {
          const detectedState = GST_STATE_CODE_MAP[code];
          next.state_code = code;
          if (!next.billing_state || !next.state) {
            next.state = detectedState;
            next.billing_state = detectedState;
            if (next.shipping_same_as_billing) {
              next.shipping_state = detectedState;
            }
          }
        }
      }
      return next;
    });
  };

  // Auto-fetch City and State by 6-digit Pincode (Billing)
  const handleBillingPinChange = async (e) => {
    const raw = e.target.value;
    const cleanPin = raw.replace(/\D/g, "").slice(0, 6);
    
    setF(prev => {
      const next = {
        ...prev,
        billing_pincode: cleanPin,
        pincode: cleanPin
      };
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
          setF(prev => {
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
        console.warn("Billing pincode lookup notice:", err.message);
      } finally {
        setFetchingBillingPin(false);
      }
    }
  };

  // Auto-fetch City and State by 6-digit Pincode (Shipping)
  const handleShippingPinChange = async (e) => {
    const raw = e.target.value;
    const cleanPin = raw.replace(/\D/g, "").slice(0, 6);

    setF(prev => ({
      ...prev,
      shipping_pincode: cleanPin
    }));

    if (cleanPin.length === 6) {
      setFetchingShippingPin(true);
      try {
        const { data } = await api.get(`/utils/pincode/${cleanPin}`);
        if (data && data.success) {
          setF(prev => ({
            ...prev,
            shipping_city: data.city || prev.shipping_city,
            shipping_state: data.state || prev.shipping_state
          }));
          toast.success(`Shipping location: ${data.city}, ${data.state}`, {
            icon: <Truck className="text-blue-500" size={16} />
          });
        }
      } catch (err) {
        console.warn("Shipping pincode lookup notice:", err.message);
      } finally {
        setFetchingShippingPin(false);
      }
    }
  };

  const handleBillingLineChange = (e) => {
    const val = e.target.value;
    setF(prev => {
      const next = { ...prev, billing_address_line: val };
      if (prev.shipping_same_as_billing) {
        next.shipping_address_line = val;
      }
      return next;
    });
  };

  const handleToggleSameAddress = (checked) => {
    setF(prev => {
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
      return {
        ...prev,
        shipping_same_as_billing: false
      };
    });
  };

  const submit = async () => {
    if (!f.company_name.trim()) return toast.error("Company name is required");
    setBusy(true);

    const billingParts = [f.billing_address_line, f.billing_city, f.billing_state].filter(Boolean);
    const billingCombined = billingParts.join(", ") + (f.billing_pincode ? ` - ${f.billing_pincode}` : "");

    const shipLine = f.shipping_same_as_billing ? f.billing_address_line : f.shipping_address_line;
    const shipCity = f.shipping_same_as_billing ? f.billing_city : f.shipping_city;
    const shipState = f.shipping_same_as_billing ? f.billing_state : f.shipping_state;
    const shipPin = f.shipping_same_as_billing ? f.billing_pincode : f.shipping_pincode;

    const shippingParts = [shipLine, shipCity, shipState].filter(Boolean);
    const shippingCombined = shippingParts.join(", ") + (shipPin ? ` - ${shipPin}` : "");

    const payload = {
      ...f,
      billing_address_line: f.billing_address_line,
      billing_city: f.billing_city,
      billing_state: f.billing_state,
      billing_pincode: f.billing_pincode,
      billing_address: billingCombined,
      shipping_address_line: shipLine,
      shipping_city: shipCity,
      shipping_state: shipState,
      shipping_pincode: shipPin,
      shipping_address: shippingCombined,
      city: f.billing_city || f.city,
      pincode: f.billing_pincode || f.pincode,
      state: f.billing_state || f.state
    };

    try {
      if (editingId) {
        await api.patch(`/customers/${editingId}`, payload);
        toast.success("Customer updated successfully");
      } else {
        await api.post("/customers", payload);
        toast.success("Customer created successfully");
      }
      setOpen(false);
      setEditingId(null);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Operation failed");
    } finally {
      setBusy(false);
    }
  };

  const deleteCustomer = async (cust, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${cust.company_name}"?`)) return;
    try {
      await api.delete(`/customers/${cust.id}`);
      toast.success(`Customer "${cust.company_name}" deleted`);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to delete customer");
    }
  };

  const filtered = q
    ? rows.filter((r) => {
        const term = q.toLowerCase();
        return (
          (r.company_name && r.company_name.toLowerCase().includes(term)) ||
          (r.contact_person && r.contact_person.toLowerCase().includes(term)) ||
          (r.mobile && r.mobile.includes(term)) ||
          (r.gstin && r.gstin.toLowerCase().includes(term)) ||
          (r.city && r.city.toLowerCase().includes(term)) ||
          (r.billing_city && r.billing_city.toLowerCase().includes(term)) ||
          (r.state && r.state.toLowerCase().includes(term)) ||
          (r.pincode && r.pincode.includes(term)) ||
          (r.billing_pincode && r.billing_pincode.includes(term))
        );
      })
    : rows;

  return (
    <div className="space-y-4" data-testid="customers-page">
      <PageHeader
        title="Customers"
        subtitle="B2B customers with GST, credit terms, verified PIN codes and shipping addresses."
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <Button size="sm" className="h-8" onClick={openNew} data-testid="new-customer-btn">
              <Plus size={14} className="mr-1" />New customer
            </Button>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
              <SheetHeader className="pb-3 border-b border-border">
                <SheetTitle className="text-base flex items-center gap-2">
                  <Buildings size={18} className="text-primary" />
                  {editingId ? "Edit Customer" : "New Customer"}
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-4 space-y-4 text-sm pb-6">
                {/* 1. Basic Company Information */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold">Company Name *</Label>
                    <Input 
                      value={f.company_name} 
                      onChange={upd("company_name")} 
                      placeholder="e.g. AMISOL GLOBAL ECO WARE LLP." 
                      className="mt-1"
                      data-testid="cust-company-input" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Contact Person</Label>
                      <Input 
                        value={f.contact_person} 
                        onChange={upd("contact_person")} 
                        placeholder="e.g. Ashish Chauhan" 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Mobile</Label>
                      <Input 
                        value={f.mobile} 
                        onChange={upd("mobile")} 
                        placeholder="9979583428" 
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Email</Label>
                      <Input 
                        type="email" 
                        value={f.email} 
                        onChange={upd("email")} 
                        placeholder="billing@customer.com" 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">GSTIN</Label>
                      <Input 
                        value={f.gstin} 
                        onChange={handleGstinChange} 
                        placeholder="29ABQFA3483J1ZU" 
                        maxLength={15}
                        className="mt-1 font-mono uppercase"
                      />
                      {f.state_code && (
                        <span className="text-[10px] text-muted-foreground mt-0.5 block">
                          State Code: {f.state_code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Billing Address with Auto-fetch */}
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
                    <Label className="text-xs text-muted-foreground">Address Line (Street, Flat, Landmark)</Label>
                    <Input 
                      value={f.billing_address_line} 
                      onChange={handleBillingLineChange} 
                      placeholder="e.g. Plot No. 12, GIDC Phase II, Industrial Area" 
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">PIN Code *</Label>
                      <div className="relative mt-1">
                        <Input 
                          value={f.billing_pincode} 
                          onChange={handleBillingPinChange} 
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
                        value={f.billing_city} 
                        onChange={upd("billing_city")} 
                        placeholder="Rajkot" 
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">State</Label>
                      <Input 
                        value={f.billing_state} 
                        onChange={upd("billing_state")} 
                        placeholder="Gujarat" 
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Shipping Address Same as Billing Toggle */}
                <div className="flex items-center space-x-2 py-1">
                  <Checkbox 
                    id="same-address" 
                    checked={f.shipping_same_as_billing}
                    onCheckedChange={handleToggleSameAddress}
                  />
                  <label 
                    htmlFor="same-address" 
                    className="text-xs font-medium cursor-pointer select-none text-foreground flex items-center gap-1"
                  >
                    Shipping address is same as billing address
                  </label>
                </div>

                {/* 4. Shipping Address (when different) */}
                {!f.shipping_same_as_billing && (
                  <div className="p-3.5 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Truck size={14} className="text-blue-600" />
                        <span>Shipping / Delivery Address</span>
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
                        value={f.shipping_address_line} 
                        onChange={upd("shipping_address_line")} 
                        placeholder="e.g. Warehouse Gate #2, Consignee Site" 
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Shipping PIN</Label>
                        <Input 
                          value={f.shipping_pincode} 
                          onChange={handleShippingPinChange} 
                          placeholder="577222" 
                          maxLength={6}
                          className="mt-1 font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">City</Label>
                        <Input 
                          value={f.shipping_city} 
                          onChange={upd("shipping_city")} 
                          placeholder="Shivamogga" 
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">State</Label>
                        <Input 
                          value={f.shipping_state} 
                          onChange={upd("shipping_state")} 
                          placeholder="Karnataka" 
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Financial Terms */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <Label className="text-xs">Credit Limit (₹)</Label>
                    <Input 
                      type="number" 
                      value={f.credit_limit} 
                      onChange={upd("credit_limit")} 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Payment Terms</Label>
                    <Input 
                      value={f.payment_terms} 
                      onChange={upd("payment_terms")} 
                      placeholder="Net 30" 
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button 
                  className="w-full h-9 mt-4 font-medium" 
                  onClick={submit} 
                  disabled={busy} 
                  data-testid="save-customer-btn"
                >
                  {busy ? "Saving…" : (editingId ? "Update Customer" : "Create Customer")}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        }
      />

      <Input 
        placeholder="Search customers by company, phone, GSTIN, city, PIN code…" 
        value={q} 
        onChange={(e) => setQ(e.target.value)} 
        className="h-8 max-w-md" 
        data-testid="customer-search" 
      />

      {filtered.length === 0 ? (
        <EmptyState title="No customers yet" subtitle="Add your first customer to generate quotes, orders and shipments." />
      ) : (
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Company</TableHead>
                <TableHead className="text-xs">Contact</TableHead>
                <TableHead className="text-xs">GSTIN</TableHead>
                <TableHead className="text-xs">City & State</TableHead>
                <TableHead className="text-xs">PIN Code</TableHead>
                <TableHead className="text-xs text-right">Credit</TableHead>
                <TableHead className="text-xs">Terms</TableHead>
                <TableHead className="text-xs text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const displayCity = r.billing_city || r.city || "";
                const displayState = r.billing_state || r.state || "";
                const displayPin = r.billing_pincode || r.pincode || (r.billing_address && r.billing_address.match(/\b\d{6}\b/)?.[0]) || "—";

                return (
                  <TableRow 
                    key={r.id} 
                    className="tbl-row hover:bg-muted/40 cursor-pointer" 
                    data-testid={`customer-row-${r.id}`}
                  >
                    <TableCell className="py-2.5 px-3">
                      <Link to={`/customers/${r.id}`} className="font-medium hover:underline text-foreground block">
                        {r.company_name}
                      </Link>
                      {r.billing_address_line && (
                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                          {r.billing_address_line}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{r.contact_person || "—"}</span>
                      <br/>
                      <span>{r.mobile || "—"}</span>
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-xs font-mono">
                      {r.gstin || "—"}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-xs">
                      {displayCity && displayState ? (
                        <span>{displayCity}, <span className="text-muted-foreground">{displayState}</span></span>
                      ) : (
                        displayState || displayCity || "—"
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-xs font-mono font-medium">
                      {displayPin !== "—" ? (
                        <span className="px-1.5 py-0.5 rounded bg-muted text-foreground border border-border text-[11px]">
                          {displayPin}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-right tabular text-xs font-medium">
                      {money(r.credit_limit)}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-xs">
                      {r.payment_terms}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Edit customer"
                          onClick={(e) => openEdit(r, e)}
                          data-testid={`edit-customer-${r.id}`}
                        >
                          <PencilSimple size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          title="Delete customer"
                          onClick={(e) => deleteCustomer(r, e)}
                          data-testid={`delete-customer-${r.id}`}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
