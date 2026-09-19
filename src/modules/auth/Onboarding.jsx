import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react";

const STEPS = ["Company", "Tax & Bank", "Brand", "Warehouse", "Finish"];

export default function Onboarding() {
  const { org, refresh } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [comp, setComp] = useState({ name: org?.name || "", address: org?.address || "", city: "", state: org?.state || "", state_code: org?.state_code || "", pin: "", phone: org?.phone || "", email: org?.email || "", website: "" });
  const [tax, setTax] = useState({ gstin: org?.gstin || "", pan: org?.pan || "", bank_name: "", account_number: "", ifsc: "", upi_id: "" });
  const [brand, setBrand] = useState({ name: "", invoice_prefix: "INV", quotation_prefix: "QT", sales_order_prefix: "SO", color: "#0A0A0A" });
  const [wh, setWh] = useState({ name: "Main Warehouse", code: "MAIN", address: "" });

  const saveStep = async () => {
    try {
      if (step === 0) { await api.patch("/organization", comp); }
      if (step === 1) { await api.patch("/organization", tax); }
      if (step === 2 && brand.name) { await api.post("/brands", brand); }
      if (step === 3 && wh.name) { await api.post("/warehouses", wh); }
      if (step === 4) { await api.patch("/organization", { onboarding_complete: true }); await refresh(); toast.success("Setup complete"); nav("/"); return; }
      setStep(step + 1);
    } catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6" data-testid="onboarding-page">
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight">Set up your workspace</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Takes about 2 minutes.</p>
      </div>
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-medium ${i <= step ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>{i < step ? <CheckCircle size={12}/> : i+1}</div>
            <span className={`text-xs ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            {i < STEPS.length-1 && <div className={`flex-1 h-px ${i < step ? "bg-foreground" : "bg-border"}`} />}
          </div>
        ))}
      </div>
      <Card><CardContent className="p-6 space-y-3 text-sm">
        {step === 0 && (<>
          <div><Label className="text-xs">Company name</Label><Input value={comp.name} onChange={(e)=>setComp({...comp, name:e.target.value})} data-testid="ob-name-input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Phone</Label><Input value={comp.phone} onChange={(e)=>setComp({...comp, phone:e.target.value})} /></div>
            <div><Label className="text-xs">Email</Label><Input value={comp.email} onChange={(e)=>setComp({...comp, email:e.target.value})} /></div>
          </div>
          <div><Label className="text-xs">Address</Label><Input value={comp.address} onChange={(e)=>setComp({...comp, address:e.target.value})} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">City</Label><Input value={comp.city} onChange={(e)=>setComp({...comp, city:e.target.value})} /></div>
            <div><Label className="text-xs">State</Label><Input value={comp.state} onChange={(e)=>setComp({...comp, state:e.target.value})} /></div>
            <div><Label className="text-xs">State code</Label><Input value={comp.state_code} onChange={(e)=>setComp({...comp, state_code:e.target.value})} /></div>
          </div>
        </>)}
        {step === 1 && (<>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">GSTIN</Label><Input value={tax.gstin} onChange={(e)=>setTax({...tax, gstin:e.target.value})} data-testid="ob-gstin-input" /></div>
            <div><Label className="text-xs">PAN</Label><Input value={tax.pan} onChange={(e)=>setTax({...tax, pan:e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Bank name</Label><Input value={tax.bank_name} onChange={(e)=>setTax({...tax, bank_name:e.target.value})} /></div>
            <div><Label className="text-xs">Account number</Label><Input value={tax.account_number} onChange={(e)=>setTax({...tax, account_number:e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">IFSC</Label><Input value={tax.ifsc} onChange={(e)=>setTax({...tax, ifsc:e.target.value})} /></div>
            <div><Label className="text-xs">UPI ID</Label><Input value={tax.upi_id} onChange={(e)=>setTax({...tax, upi_id:e.target.value})} /></div>
          </div>
        </>)}
        {step === 2 && (<>
          <p className="text-xs text-muted-foreground">Add your first brand. You can add more later.</p>
          <div><Label className="text-xs">Brand name</Label><Input value={brand.name} onChange={(e)=>setBrand({...brand, name:e.target.value})} data-testid="ob-brand-input" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">Invoice prefix</Label><Input value={brand.invoice_prefix} onChange={(e)=>setBrand({...brand, invoice_prefix:e.target.value})} /></div>
            <div><Label className="text-xs">Quote prefix</Label><Input value={brand.quotation_prefix} onChange={(e)=>setBrand({...brand, quotation_prefix:e.target.value})} /></div>
            <div><Label className="text-xs">Color</Label><Input type="color" value={brand.color} onChange={(e)=>setBrand({...brand, color:e.target.value})} /></div>
          </div>
        </>)}
        {step === 3 && (<>
          <div><Label className="text-xs">Warehouse name</Label><Input value={wh.name} onChange={(e)=>setWh({...wh, name:e.target.value})} data-testid="ob-wh-input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Code</Label><Input value={wh.code} onChange={(e)=>setWh({...wh, code:e.target.value})} /></div>
            <div><Label className="text-xs">Address</Label><Input value={wh.address} onChange={(e)=>setWh({...wh, address:e.target.value})} /></div>
          </div>
        </>)}
        {step === 4 && (<div className="text-center py-4">
          <CheckCircle size={40} className="mx-auto text-emerald-600" />
          <p className="font-medium mt-2">You're all set!</p>
          <p className="text-xs text-muted-foreground mt-1">Add customers, products and start creating quotations.</p>
        </div>)}
      </CardContent></Card>
      <div className="flex justify-between">
        <Button variant="outline" size="sm" className="h-9" onClick={()=>setStep(Math.max(0, step-1))} disabled={step===0}>Back</Button>
        <Button size="sm" className="h-9" onClick={saveStep} data-testid="ob-next-btn">{step === 4 ? "Go to dashboard" : "Next"}<ArrowRight size={12} className="ml-1"/></Button>
      </div>
    </div>
  );
}
