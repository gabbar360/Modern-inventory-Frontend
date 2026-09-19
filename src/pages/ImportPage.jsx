import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const TEMPLATES = {
  customers: "company_name,contact_person,mobile,email,gstin,state,billing_address,shipping_address,payment_terms,credit_limit\nAcme Foods,Rahul,+919820011111,rahul@acme.in,27AAAAA0000A1Z5,Maharashtra,Mumbai,Mumbai,Net 30,500000",
  products: "name,sku,category,hsn,gst_rate,unit,selling_price,purchase_price,opening_stock,min_stock\n8 Inch Plate,VG-BP-8,Tableware,39241090,18,PCS,7,4,10000,1000",
  leads: "company_name,contact_person,mobile,email,source,priority,product_interest,estimated_value\nGreenBites,Priya,+919111111111,priya@greenbites.in,website,high,7 Inch Plate,50000",
  vendors: "company_name,contact_person,mobile,email,gstin,state,payment_terms\nRaw Supplier,Suresh,+919222222222,s@raw.in,24AAA0000A1Z5,Gujarat,Net 30",
};

export default function ImportPage() {
  const [entity, setEntity] = useState("customers");
  const [csv, setCsv] = useState(TEMPLATES.customers);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const changeEntity = (v) => { setEntity(v); setCsv(TEMPLATES[v]); setResult(null); };
  const submit = async () => {
    if (!csv.trim()) return toast.error("CSV is empty");
    setBusy(true);
    try { const { data } = await api.post("/import", { entity, csv_data: csv }); setResult(data);
          toast.success(`${data.inserted} rows imported`); }
    catch(e){ toast.error(e?.response?.data?.detail || "Failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4" data-testid="import-page">
      <PageHeader title="Import Data" subtitle="Bulk upload customers, products, leads and vendors from CSV." />
      <Card><CardContent className="p-5 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label className="text-xs">Entity</Label>
            <Select value={entity} onValueChange={changeEntity}>
              <SelectTrigger data-testid="import-entity-select"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.keys(TEMPLATES).map(k=><SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
            </Select></div>
          <div className="flex items-end">
            <Button variant="outline" size="sm" className="h-9" onClick={()=>setCsv(TEMPLATES[entity])}>Reset template</Button>
          </div>
        </div>
        <div><Label className="text-xs">Paste CSV (first row = headers)</Label>
          <Textarea rows={10} className="font-mono text-xs" value={csv} onChange={(e)=>setCsv(e.target.value)} data-testid="import-csv-textarea" /></div>
        <Button className="h-9" onClick={submit} disabled={busy} data-testid="import-btn">{busy ? "Importing…" : "Import CSV"}</Button>
      </CardContent></Card>
      {result && (
        <Card><CardContent className="p-4 text-sm">
          <p><span className="font-medium text-emerald-600">{result.inserted}</span> inserted</p>
          {result.errors?.length > 0 && (
            <div className="mt-2 text-xs text-rose-600">
              {result.errors.length} errors: {result.errors.slice(0,3).map(e=>`row ${e.row}: ${e.error}`).join("; ")}
            </div>
          )}
        </CardContent></Card>
      )}
    </div>
  );
}
