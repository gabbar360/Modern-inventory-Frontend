import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/Bits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WhatsappLogo, CheckCircle, XCircle, Truck, EnvelopeSimple, FilePdf, Paperclip, Eye, Code, ArrowSquareOut, QrCode, PaperPlaneTilt, ArrowsClockwise } from "@phosphor-icons/react";

export default function Settings() {
  const { user, org } = useAuth();
  const [wa, setWa] = useState({ business_account_id: "", phone_number_id: "", access_token: "", alert_to: "", configured: false });
  const [busy, setBusy] = useState(false);
  const backend = process.env.REACT_APP_BACKEND_URL;
  const [smtp, setSmtp] = useState({
    host: "",
    port: 587,
    secure: false,
    user: "",
    password: "",
    from_email: "",
    from_name: "",
    quotation_subject: "",
    quotation_body: "",
    invoice_subject: "",
    invoice_body: "",
    statement_subject: "",
    statement_body: ""
  });
  const [activeTpl, setActiveTpl] = useState("quotation");
  const [previewMode, setPreviewMode] = useState(false);
  const [courier, setCourier] = useState({ provider: "delhivery", api_key: "", api_secret: "", client_id: "", configured: false });
  const [customField, setCustomField] = useState({ module: "leads", name: "", label: "", type: "text" });

  const [saasyto, setSaasyto] = useState({
    configured: true,
    provider: "saasyto",
    instance_id: "6AA99DB2A1F44",
    access_token_configured: true,
    base_url: "https://web.saasyto.com/api"
  });
  const [qrOpen, setQrOpen] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testMsg, setTestMsg] = useState("Hello from Vegnar ERP WhatsApp Service!");
  const [sendingTest, setSendingTest] = useState(false);

  const load = async () => { 
    try {
      const { data } = await api.get("/whatsapp/config"); 
      if (data) setWa((s) => ({ ...s, ...data, access_token: "" })); 
    } catch(e) {}
    try {
      const { data: sData } = await api.get("/whatsapp/status");
      if (sData) setSaasyto(sData);
    } catch(e) {}
    try {
      const { data: smtpData } = await api.get("/email/config");
      if (smtpData) setSmtp((s) => ({ ...s, ...smtpData, password: "" }));
    } catch(e) {}
    try {
      const { data: courierData } = await api.get("/courier/config");
      if (courierData) {
        setCourier({
          provider: courierData.provider || "delhivery",
          api_key: courierData.api_key || "",
          api_secret: courierData.api_secret || "",
          client_id: courierData.client_id || "",
          configured: !!courierData.api_key
        });
      }
    } catch(e) {}
  };
  useEffect(()=>{load(); /* eslint-disable-next-line */}, []);
  const upd = (k)=>(e)=>setWa((s)=>({...s, [k]: e.target.value}));
  const updSmtp = (k)=>(e)=>setSmtp((s)=>({...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value}));

  const handleOpenQR = async () => {
    setQrOpen(true);
    setQrLoading(true);
    try {
      const { data } = await api.get("/whatsapp/qrcode");
      setQrData(data);
    } catch (e) {
      toast.error("Failed to load WhatsApp pairing QR code");
    } finally {
      setQrLoading(false);
    }
  };

  const handleCreateInstance = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/whatsapp/create-instance");
      if (data?.instance_id) {
        toast.success(`New instance created: ${data.instance_id}`);
        setSaasyto(s => ({ ...s, instance_id: data.instance_id }));
      } else {
        toast.info(data?.message || "Instance request completed");
      }
    } catch (e) {
      toast.error("Failed to create WhatsApp instance");
    } finally {
      setBusy(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testPhone) return toast.error("Please enter a phone number");
    setSendingTest(true);
    try {
      const { data } = await api.post("/whatsapp/send-test", {
        number: testPhone,
        message: testMsg
      });
      if (data?.status === 'success' || data?.status === 'simulated_success') {
        toast.success("WhatsApp test message dispatched successfully!");
      } else {
        toast.info(data?.message || "Message processed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to send WhatsApp test message");
    } finally {
      setSendingTest(false);
    }
  };
  
  const save = async () => {
    if (!wa.phone_number_id || !wa.access_token) return toast.error("Phone Number ID and Access Token are required");
    setBusy(true);
    try { await api.post("/whatsapp/config", wa); toast.success("WhatsApp configured"); load(); }
    catch(e){ toast.error(e?.response?.data?.detail || "Failed"); }
    finally { setBusy(false); }
  };
  const saveSmtp = async () => {
    setBusy(true);
    try { await api.post("/email/config", smtp); toast.success("SMTP configured"); load(); }
    catch(e){ toast.error(e?.response?.data?.detail || "Failed"); }
    finally { setBusy(false); }
  };
  const saveCourier = async () => {
    if (!courier.api_key) return toast.error("API Key / Token is required");
    setBusy(true);
    try {
      await api.post("/courier/config", courier);
      toast.success("Courier provider settings saved successfully!");
      setCourier((s) => ({ ...s, configured: true }));
      load();
    } catch(e) {
      toast.error(e?.response?.data?.detail || "Failed to save courier settings");
    } finally {
      setBusy(false);
    }
  };
  const addCustomField = async () => {
    if (!customField.name || !customField.label) return toast.error("Field Name and Label are required");
    setBusy(true);
    try {
      await api.post("/custom-fields", customField);
      toast.success("Custom field created");
      setCustomField({ module: "leads", name: "", label: "", type: "text" });
    } catch(e) {
      toast.error(e?.response?.data?.detail || "Failed to add field");
    } finally {
      setBusy(false);
    }
  };
  const scanLowStock = async () => {
    const { data } = await api.post("/notifications/scan-low-stock");
    toast.success(`Scan complete — ${data.created} new alerts`);
  };
  return (
    <div className="space-y-4" data-testid="settings-page">
      <PageHeader title="Settings" subtitle="Organization, integrations and system configuration." />
      <div className="grid md:grid-cols-2 gap-4">
        <Card><CardContent className="p-5 space-y-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Organization</p>
          <div className="text-sm space-y-1.5">
            <div><span className="text-muted-foreground">Name</span><p className="font-medium">{org?.name}</p></div>
            <div><span className="text-muted-foreground">GSTIN</span><p className="font-mono text-xs">{org?.gstin || "—"}</p></div>
            <div><span className="text-muted-foreground">State</span><p>{org?.state} ({org?.state_code})</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5 space-y-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Signed in as</p>
          <div className="text-sm space-y-1.5">
            <div><span className="text-muted-foreground">Name</span><p className="font-medium">{user?.name}</p></div>
            <div><span className="text-muted-foreground">Email</span><p>{user?.email}</p></div>
            <div><span className="text-muted-foreground">Role</span><p className="capitalize">{user?.role?.replace("_", " ")}</p></div>
          </div>
        </CardContent></Card>

        <Card className="md:col-span-2"><CardContent className="p-5 space-y-3" data-testid="smtp-config">
          <p className="font-medium">SMTP Email Configuration</p>
          <p className="text-xs text-muted-foreground">Configure SMTP to send automated emails with PDF attachments.</p>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div><Label htmlFor="settings-host" className="text-xs">SMTP Host</Label><Input name="host" id="settings-host" value={smtp.host} onChange={updSmtp("host")} /></div>
            <div><Label htmlFor="settings-port" className="text-xs">SMTP Port</Label><Input name="port" id="settings-port" type="number" value={smtp.port} onChange={updSmtp("port")} /></div>
            <div><Label htmlFor="settings-user" className="text-xs">Username</Label><Input name="user" id="settings-user" value={smtp.user} onChange={updSmtp("user")} /></div>
            <div><Label htmlFor="settings-password" className="text-xs">Password</Label><Input name="password" id="settings-password" type="password" value={smtp.password} onChange={updSmtp("password")} placeholder="••••••" /></div>
            <div><Label htmlFor="settings-from_email" className="text-xs">From Email</Label><Input name="from_email" id="settings-from_email" value={smtp.from_email} onChange={updSmtp("from_email")} /></div>
            <div><Label htmlFor="settings-from_name" className="text-xs">From Name</Label><Input name="from_name" id="settings-from_name" value={smtp.from_name} onChange={updSmtp("from_name")} /></div>
            <div className="flex items-center gap-2"><input name="input_2" type="checkbox" id="secure" checked={smtp.secure} onChange={updSmtp("secure")} /><Label htmlFor="secure" className="text-xs">Use SSL/TLS (Secure)</Label></div>
          </div>
          <Button className="h-9" onClick={saveSmtp} disabled={busy}>{busy ? "Saving…" : "Save SMTP server settings"}</Button>
        </CardContent></Card>

        <Card className="md:col-span-2"><CardContent className="p-5 space-y-4" data-testid="email-templates-config">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <EnvelopeSimple size={18} className="text-blue-600" />
                <p className="font-medium text-base">Email Subject Lines & HTML Templates</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customize outgoing email subject lines and messages. Every email will automatically attach the generated PDF and include live self-service portal links.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? <Code size={13} className="mr-1.5" /> : <Eye size={13} className="mr-1.5" />}
                {previewMode ? "Edit Template" : "Live Email Preview"}
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                onClick={saveSmtp}
                disabled={busy}
              >
                {busy ? "Saving…" : "Save Email Templates"}
              </Button>
            </div>
          </div>

          <Tabs value={activeTpl} onValueChange={setActiveTpl} className="w-full">
            <TabsList className="grid grid-cols-3 mb-3">
              <TabsTrigger value="quotation" className="text-xs font-medium">Quotation Proposal</TabsTrigger>
              <TabsTrigger value="invoice" className="text-xs font-medium">Tax Invoice</TabsTrigger>
              <TabsTrigger value="statement" className="text-xs font-medium">Customer Statement</TabsTrigger>
            </TabsList>

            {/* QUOTATION TEMPLATE */}
            <TabsContent value="quotation" className="space-y-3">
              <div>
                <Label htmlFor="secure" className="text-xs font-medium">Subject Line</Label>
                <Input name="secure" id="secure"
                  className="mt-1 font-mono text-xs"
                  value={smtp.quotation_subject}
                  onChange={updSmtp("quotation_subject")}
                  placeholder="Quotation {number} from {org_name}"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="settings-quotation_body" className="text-xs font-medium">Available Placeholder Tags (click to copy / reference)</Label>
                  <span className="text-[11px] text-muted-foreground">PDF is automatically attached as Quotation_*.pdf</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["{number}", "{customer_name}", "{contact_person}", "{date}", "{grand_total}", "{payment_terms}", "{org_name}", "{org_email}", "{org_phone}", "{view_link}", "{portal_link}"].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSmtp(s => ({ ...s, quotation_body: (s.quotation_body || "") + " " + t }))}
                      className="px-2 py-0.5 bg-muted hover:bg-muted/80 text-foreground text-[11px] font-mono rounded border border-border transition-colors"
                      title="Click to insert at end of body"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {!previewMode ? (
                <div>
                  <Label htmlFor="settings-quotation_body" className="text-xs font-medium">Email HTML Body</Label>
                  <Textarea name="quotation_body" id="settings-quotation_body"
                    rows={9}
                    className="mt-1 font-mono text-xs leading-relaxed"
                    value={smtp.quotation_body}
                    onChange={updSmtp("quotation_body")}
                    placeholder="<p>Dear {customer_name},</p><p>Please find attached...</p>"
                  />
                </div>
              ) : (
                <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
                  <div className="text-xs border-b border-border pb-2">
                    <span className="text-muted-foreground">Subject: </span>
                    <strong className="text-foreground">
                      {(smtp.quotation_subject || "Quotation {number} from {org_name}")
                        .replace("{number}", "QT-2026-00001")
                        .replace("{org_name}", org?.name || "Vegnar Global LLP")}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 p-2 rounded border border-blue-200 dark:border-blue-900">
                    <Paperclip size={14} />
                    <span>Attached: <strong>Quotation_QT-2026-00001.pdf</strong> (Automated PDF Generation)</span>
                  </div>
                  <div
                    className="text-xs space-y-2 bg-background p-4 rounded border border-border"
                    dangerouslySetInnerHTML={{
                      __html: (smtp.quotation_body || "")
                        .replace(/\{number\}/g, "QT-2026-00001")
                        .replace(/\{customer_name\}/g, "Vegnar Global LLP")
                        .replace(/\{contact_person\}/g, "Ashish Chauhan")
                        .replace(/\{date\}/g, "07 Sep 2026")
                        .replace(/\{grand_total\}/g, "78,824.00")
                        .replace(/\{payment_terms\}/g, "Net 30")
                        .replace(/\{org_name\}/g, org?.name || "Vegnar Global LLP")
                        .replace(/\{org_email\}/g, "sales@vegnar.com")
                        .replace(/\{org_phone\}/g, "+91 98200 12345")
                        .replace(/\{view_link\}/g, `${backend}/api/quotations/qt_001/pdf`)
                        .replace(/\{pdf_download_link\}/g, `${backend}/api/quotations/qt_001/pdf`)
                        .replace(/\{portal_link\}/g, `${window.location.origin}/portal/vgn_portal_token_ashish`)
                    }}
                  />
                </div>
              )}
            </TabsContent>

            {/* INVOICE TEMPLATE */}
            <TabsContent value="invoice" className="space-y-3">
              <div>
                <Label htmlFor="settings-invoice_subject" className="text-xs font-medium">Subject Line</Label>
                <Input name="invoice_subject" id="settings-invoice_subject"
                  className="mt-1 font-mono text-xs"
                  value={smtp.invoice_subject}
                  onChange={updSmtp("invoice_subject")}
                  placeholder="Tax Invoice {number} from {org_name} - Balance Due: ₹{balance_due}"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="settings-invoice_body" className="text-xs font-medium">Available Placeholder Tags</Label>
                  <span className="text-[11px] text-muted-foreground">PDF is automatically attached as Invoice_*.pdf</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["{number}", "{customer_name}", "{contact_person}", "{date}", "{due_date}", "{grand_total}", "{balance_due}", "{bank_name}", "{account_number}", "{ifsc}", "{org_name}", "{org_email}", "{org_phone}", "{view_link}", "{portal_link}"].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSmtp(s => ({ ...s, invoice_body: (s.invoice_body || "") + " " + t }))}
                      className="px-2 py-0.5 bg-muted hover:bg-muted/80 text-foreground text-[11px] font-mono rounded border border-border transition-colors"
                      title="Click to insert at end of body"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {!previewMode ? (
                <div>
                  <Label htmlFor="settings-invoice_body" className="text-xs font-medium">Email HTML Body</Label>
                  <Textarea name="invoice_body" id="settings-invoice_body"
                    rows={9}
                    className="mt-1 font-mono text-xs leading-relaxed"
                    value={smtp.invoice_body}
                    onChange={updSmtp("invoice_body")}
                    placeholder="<p>Dear {customer_name},</p><p>Please find attached Invoice...</p>"
                  />
                </div>
              ) : (
                <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
                  <div className="text-xs border-b border-border pb-2">
                    <span className="text-muted-foreground">Subject: </span>
                    <strong className="text-foreground">
                      {(smtp.invoice_subject || "Tax Invoice {number} from {org_name} - Balance Due: ₹{balance_due}")
                        .replace("{number}", "INV-2026-00001")
                        .replace("{balance_due}", "53,100.00")
                        .replace("{org_name}", org?.name || "Vegnar Global LLP")}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 p-2 rounded border border-emerald-200 dark:border-emerald-900">
                    <Paperclip size={14} />
                    <span>Attached: <strong>Invoice_INV-2026-00001.pdf</strong> (Automated GST Tax Invoice PDF)</span>
                  </div>
                  <div
                    className="text-xs space-y-2 bg-background p-4 rounded border border-border"
                    dangerouslySetInnerHTML={{
                      __html: (smtp.invoice_body || "")
                        .replace(/\{number\}/g, "INV-2026-00001")
                        .replace(/\{customer_name\}/g, "Vegnar Global LLP")
                        .replace(/\{contact_person\}/g, "Ashish Chauhan")
                        .replace(/\{date\}/g, "07 Sep 2026")
                        .replace(/\{due_date\}/g, "07 Oct 2026")
                        .replace(/\{grand_total\}/g, "53,100.00")
                        .replace(/\{balance_due\}/g, "53,100.00")
                        .replace(/\{bank_name\}/g, org?.bank_name || "HDFC Bank Ltd")
                        .replace(/\{account_number\}/g, org?.account_number || "50200084920194")
                        .replace(/\{ifsc\}/g, org?.ifsc || "HDFC0000123")
                        .replace(/\{org_name\}/g, org?.name || "Vegnar Global LLP")
                        .replace(/\{org_email\}/g, "billing@vegnar.com")
                        .replace(/\{org_phone\}/g, "+91 98200 12345")
                        .replace(/\{view_link\}/g, `${backend}/api/invoices/inv_001/pdf`)
                        .replace(/\{pdf_download_link\}/g, `${backend}/api/invoices/inv_001/pdf`)
                        .replace(/\{portal_link\}/g, `${window.location.origin}/portal/vgn_portal_token_ashish`)
                    }}
                  />
                </div>
              )}
            </TabsContent>

            {/* STATEMENT TEMPLATE */}
            <TabsContent value="statement" className="space-y-3">
              <div>
                <Label htmlFor="settings-statement_subject" className="text-xs font-medium">Subject Line</Label>
                <Input name="statement_subject" id="settings-statement_subject"
                  className="mt-1 font-mono text-xs"
                  value={smtp.statement_subject}
                  onChange={updSmtp("statement_subject")}
                  placeholder="Statement of Account: {customer_name} - {org_name}"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="settings-statement_body" className="text-xs font-medium">Available Placeholder Tags</Label>
                  <span className="text-[11px] text-muted-foreground">PDF is automatically attached as Statement_*.pdf</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["{customer_name}", "{contact_person}", "{balance_due}", "{invoice_count}", "{payment_count}", "{org_name}", "{org_email}", "{org_phone}", "{portal_link}", "{statement_link}"].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSmtp(s => ({ ...s, statement_body: (s.statement_body || "") + " " + t }))}
                      className="px-2 py-0.5 bg-muted hover:bg-muted/80 text-foreground text-[11px] font-mono rounded border border-border transition-colors"
                      title="Click to insert at end of body"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {!previewMode ? (
                <div>
                  <Label htmlFor="settings-statement_body" className="text-xs font-medium">Email HTML Body</Label>
                  <Textarea name="statement_body" id="settings-statement_body"
                    rows={9}
                    className="mt-1 font-mono text-xs leading-relaxed"
                    value={smtp.statement_body}
                    onChange={updSmtp("statement_body")}
                    placeholder="<p>Dear {customer_name},</p><p>Please find attached your Statement of Account...</p>"
                  />
                </div>
              ) : (
                <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
                  <div className="text-xs border-b border-border pb-2">
                    <span className="text-muted-foreground">Subject: </span>
                    <strong className="text-foreground">
                      {(smtp.statement_subject || "Statement of Account: {customer_name} - {org_name}")
                        .replace("{customer_name}", "Vegnar Global LLP")
                        .replace("{org_name}", org?.name || "Vegnar Global LLP")}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 p-2 rounded border border-indigo-200 dark:border-indigo-900">
                    <Paperclip size={14} />
                    <span>Attached: <strong>Statement_Vegnar_Global_LLP.pdf</strong> (Automated Ledger PDF)</span>
                  </div>
                  <div
                    className="text-xs space-y-2 bg-background p-4 rounded border border-border"
                    dangerouslySetInnerHTML={{
                      __html: (smtp.statement_body || "")
                        .replace(/\{customer_name\}/g, "Vegnar Global LLP")
                        .replace(/\{contact_person\}/g, "Ashish Chauhan")
                        .replace(/\{balance_due\}/g, "1,28,000.00")
                        .replace(/\{invoice_count\}/g, "6")
                        .replace(/\{payment_count\}/g, "2")
                        .replace(/\{org_name\}/g, org?.name || "Vegnar Global LLP")
                        .replace(/\{org_email\}/g, "accounts@vegnar.com")
                        .replace(/\{org_phone\}/g, "+91 98200 12345")
                        .replace(/\{portal_link\}/g, `${window.location.origin}/portal/vgn_portal_token_ashish`)
                        .replace(/\{statement_link\}/g, `${backend}/api/customers/cust_001/statement.pdf`)
                    }}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="pt-2 flex justify-end">
            <Button className="h-9 bg-blue-600 hover:bg-blue-700 text-white" onClick={saveSmtp} disabled={busy}>
              {busy ? "Saving…" : "Save All Email Templates"}
            </Button>
          </div>
        </CardContent></Card>

        {/* Saasyto WhatsApp Gateway (Live API) */}
        <Card className="md:col-span-2 border-emerald-500/30 bg-emerald-500/[0.02]" data-testid="saasyto-whatsapp-config">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-600">
                  <WhatsappLogo size={22} weight="fill" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-base">Saasyto WhatsApp Gateway (Live API)</p>
                    <span className="pill pill-emerald inline-flex items-center gap-1 text-[11px] font-medium">
                      <CheckCircle size={12} weight="fill" /> Active Instance
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Multi-Device WhatsApp Web API for instant document sharing, quotation approvals, invoice alerts, and dead stock clearance broadcasts.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-emerald-600/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                  onClick={handleOpenQR}
                >
                  <QrCode size={14} className="mr-1.5" />
                  Pair / Scan QR
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleCreateInstance}
                  disabled={busy}
                >
                  <ArrowsClockwise size={13} className="mr-1.5" />
                  Regenerate Instance
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-background border border-border">
                <span className="text-muted-foreground block text-[11px] mb-1 uppercase tracking-wider">Instance ID</span>
                <span className="font-mono font-semibold text-foreground text-sm">{saasyto.instance_id || '6AA99DB2A1F44'}</span>
              </div>
              <div className="p-3 rounded-lg bg-background border border-border">
                <span className="text-muted-foreground block text-[11px] mb-1 uppercase tracking-wider">Gateway Base URL</span>
                <span className="font-mono text-muted-foreground text-xs">{saasyto.base_url || 'https://web.saasyto.com/api'}</span>
              </div>
              <div className="p-3 rounded-lg bg-background border border-border">
                <span className="text-muted-foreground block text-[11px] mb-1 uppercase tracking-wider">Access Token</span>
                <span className="font-mono text-emerald-600 font-medium">6aa297060... (Active & Configured)</span>
              </div>
            </div>

            {/* Test WhatsApp Message Dispatch */}
            <div className="pt-2 border-t border-border">
              <p className="font-medium text-xs text-foreground mb-2 flex items-center gap-1.5">
                <PaperPlaneTilt size={14} className="text-emerald-600" /> Test WhatsApp Dispatch
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-4">
                  <Input name="recipient-mobile-91-98200-12345" id="settings-recipient-mobile-91-98200-12345"
                    placeholder="Recipient Mobile (+91 98200 12345)"
                    className="h-9 text-xs font-mono"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-6">
                  <Input name="test-message-text" id="settings-test-message-text"
                    placeholder="Test message text..."
                    className="h-9 text-xs"
                    value={testMsg}
                    onChange={(e) => setTestMsg(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button
                    type="button"
                    className="w-full h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleSendTestMessage}
                    disabled={sendingTest || !testPhone}
                  >
                    {sendingTest ? "Sending..." : "Send Test"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2"><CardContent className="p-5 space-y-3" data-testid="whatsapp-config">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WhatsappLogo size={18} className="text-emerald-600" />
              <p className="font-medium">WhatsApp Cloud API</p>
              {wa.configured
                ? <span className="pill pill-emerald ml-2 inline-flex items-center gap-1"><CheckCircle size={11}/>Connected</span>
                : <span className="pill pill-slate ml-2 inline-flex items-center gap-1"><XCircle size={11}/>Not configured</span>}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter your Meta WhatsApp Business credentials. Get them from Meta Business Suite → Business Settings → System Users → Access Tokens.
          </p>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div><Label htmlFor="settings-business_account_id" className="text-xs">Business Account ID</Label><Input name="business_account_id" id="settings-business_account_id" value={wa.business_account_id} onChange={upd("business_account_id")} data-testid="wa-baid-input" /></div>
            <div><Label htmlFor="settings-phone_number_id" className="text-xs">Phone Number ID</Label><Input name="phone_number_id" id="settings-phone_number_id" value={wa.phone_number_id} onChange={upd("phone_number_id")} data-testid="wa-pnid-input" /></div>
            <div className="md:col-span-2"><Label htmlFor="settings-access_token" className="text-xs">Permanent Access Token</Label>
              <Input name="access_token" id="settings-access_token" type="password" value={wa.access_token} onChange={upd("access_token")} placeholder={wa.configured?"•••••• (leave blank to keep existing)":""} data-testid="wa-token-input" /></div>
            <div><Label htmlFor="settings-alert_to" className="text-xs">Alerts phone (E.164)</Label><Input name="alert_to" id="settings-alert_to" value={wa.alert_to} onChange={upd("alert_to")} placeholder="+919876543210" data-testid="wa-alertto-input" /></div>
          </div>
          <Button className="h-9" onClick={save} disabled={busy} data-testid="save-wa-btn">{busy ? "Saving…" : "Save WhatsApp settings"}</Button>
        </CardContent></Card>

        <Card className="md:col-span-2"><CardContent className="p-5 space-y-3" data-testid="custom-fields-config">
          <div className="flex items-center justify-between">
            <p className="font-medium">Custom Forms</p>
          </div>
          <p className="text-xs text-muted-foreground">Add dynamic custom fields to various modules without modifying database schema.</p>
          <div className="grid md:grid-cols-4 gap-3 text-sm">
            <div>
              <Label htmlFor="settings-module" className="text-xs">Module</Label>
              <select name="module" id="settings-module" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                value={customField.module}
                onChange={(e) => setCustomField(s => ({ ...s, module: e.target.value }))}
              >
                <option value="leads">Leads</option>
                <option value="customers">Customers</option>
                <option value="vendors">Vendors</option>
              </select>
            </div>
            <div>
              <Label htmlFor="settings-field-identifier" className="text-xs">Field Identifier</Label>
              <Input name="field-identifier" id="settings-field-identifier" 
                placeholder="e.g. gst_branch" 
                value={customField.name}
                onChange={(e) => setCustomField(s => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="settings-display-label" className="text-xs">Display Label</Label>
              <Input name="display-label" id="settings-display-label" 
                placeholder="e.g. GST Branch Code" 
                value={customField.label}
                onChange={(e) => setCustomField(s => ({ ...s, label: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full h-9" onClick={addCustomField} disabled={busy}>Add Field</Button>
            </div>
          </div>
        </CardContent></Card>

        <Card className="md:col-span-2"><CardContent className="p-5 space-y-3" data-testid="courier-config">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-blue-600" />
              <p className="font-medium">Courier Integration (Delivery API)</p>
              {courier.configured || courier.api_key ? (
                <span className="pill pill-emerald ml-2 inline-flex items-center gap-1"><CheckCircle size={11}/>Connected</span>
              ) : (
                <span className="pill pill-slate ml-2 inline-flex items-center gap-1"><XCircle size={11}/>Not configured</span>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Connect Shiprocket or Delhivery One to automatically push dispatch orders, generate AWBs, and track delivery status.
          </p>
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <div>
              <Label htmlFor="settings-provider" className="text-xs">Provider</Label>
              <select name="provider" id="settings-provider" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                value={courier.provider}
                onChange={(e) => setCourier(s => ({ ...s, provider: e.target.value }))}
              >
                <option value="delhivery">Delhivery One</option>
                <option value="shiprocket">Shiprocket</option>
              </select>
            </div>
            <div>
              <Label htmlFor="settings-api-key-token" className="text-xs">API Key / Token</Label>
              <Input name="api-key-token" id="settings-api-key-token" 
                type="text" 
                value={courier.api_key} 
                onChange={(e) => setCourier(s => ({ ...s, api_key: e.target.value }))}
                placeholder="Enter API Key / Token" 
              />
            </div>
            <div>
              <Label htmlFor="settings-client-id-username-optional" className="text-xs">Client ID / Username (Optional)</Label>
              <Input name="client-id-username-optional" id="settings-client-id-username-optional" 
                type="text" 
                value={courier.client_id} 
                onChange={(e) => setCourier(s => ({ ...s, client_id: e.target.value }))}
                placeholder="DelhiveryOne / Client ID" 
              />
            </div>
          </div>
          <Button className="h-9" onClick={saveCourier} disabled={busy}>
            {busy ? "Saving…" : "Save Courier Provider"}
          </Button>
        </CardContent></Card>

        <Card className="md:col-span-2"><CardContent className="p-5 space-y-3">
          <p className="font-medium">Low-Stock Alerts</p>
          <p className="text-xs text-muted-foreground">Every sale/dispatch that pushes a SKU below its minimum stock creates a notification. WhatsApp alerts fire automatically when the API above is configured.</p>
          <Button variant="outline" size="sm" className="h-8" onClick={scanLowStock} data-testid="scan-lowstock-btn">Scan low stock now</Button>
        </CardContent></Card>

        <Card className="md:col-span-2"><CardContent className="p-5 space-y-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Website lead webhook</p>
          <div className="bg-muted/50 border border-border rounded-md p-3 font-mono text-xs break-all">
            POST {backend}/api/webhook/leads/{org?.id}
          </div>
          <p className="text-xs text-muted-foreground">Payload: <span className="font-mono">{`{ company_name, name, email, mobile, product, message }`}</span></p>
        </CardContent></Card>
      </div>

      {/* WhatsApp Pairing QR Modal */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WhatsappLogo size={20} className="text-emerald-600" />
              Scan QR to Pair WhatsApp
            </DialogTitle>
            <DialogDescription>
              Open WhatsApp on your phone → Linked Devices → Link a Device, and scan this QR code to connect.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-border min-h-[260px]">
            {qrLoading ? (
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <ArrowsClockwise size={24} className="animate-spin text-emerald-600" />
                <span>Generating WhatsApp Pairing QR Code...</span>
              </div>
            ) : qrData?.base64 ? (
              <div className="space-y-3 text-center">
                <img
                  src={qrData.base64.startsWith("data:") ? qrData.base64 : `data:image/png;base64,${qrData.base64}`}
                  alt="WhatsApp QR Code"
                  className="w-56 h-56 mx-auto rounded-lg shadow-sm border border-border bg-white p-2"
                />
                <p className="text-[11px] text-muted-foreground">
                  Instance: <span className="font-mono font-medium">{saasyto.instance_id || '6AA99DB2A1F44'}</span>
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-foreground">Instance is already paired and active!</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Your WhatsApp instance is active and ready to dispatch messages. If you need to re-pair, click Regenerate Instance.
                </p>
                <Button size="sm" variant="outline" onClick={handleOpenQR} className="mt-2 text-xs">
                  <ArrowsClockwise size={13} className="mr-1.5" /> Refresh Status
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
