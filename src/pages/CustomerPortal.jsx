import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { money, fmtDate } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FilePdf, User, MapPin, Envelope, Phone, IdentificationCard, ShieldCheck } from "@phosphor-icons/react";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

export default function CustomerPortal() {
  const { token } = useParams();
  const [d, setD] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => {
    axios.get(`${BACKEND}/api/portal/${token}`)
      .then(r => setD(r.data)).catch(e => setErr(e?.response?.data?.detail || "Link invalid"));
  }, [token]);
  if (err) return <div className="min-h-screen flex items-center justify-center text-sm text-rose-600">{err}</div>;
  if (!d) return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;

  const cust = d.customer || {};

  return (
    <div className="min-h-screen bg-background" data-testid="customer-portal">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Customer Self-Service Portal</span>
              <span className="pill pill-emerald inline-flex items-center gap-1 text-[11px]"><ShieldCheck size={12}/>Verified Link</span>
            </div>
            <h1 className="text-2xl font-display font-semibold tracking-tight mt-0.5">{d.organization.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            {cust.id && (
              <a
                href={`${BACKEND}/api/customers/${cust.id}/statement.pdf`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors"
                data-testid="portal-download-statement-btn"
              >
                <FilePdf size={15} /> Download Statement (PDF)
              </a>
            )}
            <div className="text-right text-xs text-muted-foreground hidden sm:block">
              <p className="font-medium text-foreground">{cust.company_name}</p>
              <p>{cust.contact_person}</p>
            </div>
          </div>
        </div>

        {/* Customer Account Profile Card */}
        <Card className="border-border bg-card shadow-sm" data-testid="portal-customer-profile">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <IdentificationCard size={17} className="text-blue-600" />
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Customer Profile & Details</p>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">ID: {cust.id || "—"}</span>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block mb-0.5">Company Name</span>
                <p className="font-semibold text-foreground">{cust.company_name || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Contact Person</span>
                <p className="font-medium text-foreground">{cust.contact_person || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">GSTIN / Tax ID</span>
                <p className="font-mono text-foreground font-medium">{cust.gstin || "Unregistered"}</p>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Email & Mobile</span>
                <p className="text-foreground">{cust.email || "—"}</p>
                {cust.mobile && <p className="text-muted-foreground">{cust.mobile}</p>}
              </div>
              {cust.billing_address && (
                <div className="sm:col-span-2 md:col-span-4 pt-1 border-t border-border/50">
                  <span className="text-muted-foreground block mb-0.5">Registered Billing Address</span>
                  <p className="text-foreground">{cust.billing_address} {cust.state ? `(${cust.state})` : ""}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-3">
          <Card><CardContent className="p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Outstanding Balance</p>
            <p className={`text-2xl font-display font-semibold tabular mt-1 ${d.outstanding > 0 ? "text-rose-600" : "text-emerald-600"}`}>{money(d.outstanding)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Invoices</p>
            <p className="text-2xl font-display font-semibold tabular mt-1">{d.invoices.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Payments Recorded</p>
            <p className="text-2xl font-display font-semibold tabular mt-1">{d.payments.length}</p>
          </CardContent></Card>
        </div>

        {d.outstanding > 0 && d.upi_pay_url && (
          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20"><CardContent className="p-5">
            <p className="font-medium text-sm text-foreground">Pay {money(d.outstanding)} instantly via UPI</p>
            <p className="text-xs text-muted-foreground mt-1">Tap the link on your mobile to pay with any UPI app (Google Pay, PhonePe, Paytm, BHIM).</p>
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <a href={d.upi_pay_url} className="inline-flex items-center h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium" data-testid="upi-pay-btn">Pay via UPI</a>
              <span className="text-xs text-muted-foreground">UPI ID: <span className="font-mono font-medium text-foreground">{d.organization.upi_id}</span></span>
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground border-t border-border pt-2">
              Or direct bank transfer to: <span className="font-mono text-foreground font-medium">{d.organization.bank_name} &bull; A/C {d.organization.account_number} &bull; IFSC {d.organization.ifsc}</span>
            </div>
          </CardContent></Card>
        )}

        {/* Quotations & Proposals Section */}
        {d.quotations && d.quotations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Quotations & Proposals</p>
              <span className="text-xs text-muted-foreground">{d.quotations.length} total</span>
            </div>
            <div className="border border-border rounded-lg bg-card shadow-sm overflow-hidden">
              <Table><TableHeader><TableRow>
                <TableHead className="text-xs">Quote #</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Terms</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
                <TableHead className="text-xs text-center">Action</TableHead>
              </TableRow></TableHeader><TableBody>
              {d.quotations.map(q => (
                <TableRow key={q.id} className="tbl-row" data-testid={`portal-quote-${q.id}`}>
                  <TableCell className="py-2 px-3 font-mono text-xs font-medium text-foreground">{q.number}</TableCell>
                  <TableCell className="py-2 px-3 text-xs text-muted-foreground">{fmtDate(q.quote_date)}</TableCell>
                  <TableCell className="py-2 px-3 text-xs">{q.payment_terms || "Net 30"}</TableCell>
                  <TableCell className="py-2 px-3 text-xs">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                      q.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>{q.status}</span>
                  </TableCell>
                  <TableCell className="py-2 px-3 text-right tabular font-medium">{money(q.grand_total)}</TableCell>
                  <TableCell className="py-2 px-3 text-center">
                    <a
                      href={`${BACKEND}/api/quotations/${q.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      <FilePdf size={13}/> Download PDF
                    </a>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody></Table>
            </div>
          </div>
        )}

        {/* Invoices Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Invoices</p>
            <span className="text-xs text-muted-foreground">{d.invoices.length} total</span>
          </div>
          <div className="border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <Table><TableHeader><TableRow>
              <TableHead className="text-xs">Invoice #</TableHead><TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Due</TableHead><TableHead className="text-xs text-right">Total</TableHead>
              <TableHead className="text-xs text-right">Balance</TableHead><TableHead className="text-xs text-center">Action</TableHead>
            </TableRow></TableHeader><TableBody>
            {d.invoices.map(i => (
              <TableRow key={i.id} className="tbl-row" data-testid={`portal-inv-${i.id}`}>
                <TableCell className="py-2 px-3 font-mono text-xs font-medium text-foreground">{i.number}</TableCell>
                <TableCell className="py-2 px-3 text-xs text-muted-foreground">{fmtDate(i.invoice_date)}</TableCell>
                <TableCell className="py-2 px-3 text-xs">{fmtDate(i.due_date)}</TableCell>
                <TableCell className="py-2 px-3 text-right tabular font-medium">{money(i.grand_total)}</TableCell>
                <TableCell className={`py-2 px-3 text-right tabular font-semibold ${(i.balance_due || 0) > 0 ? "text-rose-600" : "text-emerald-600"}`}>{money(i.balance_due)}</TableCell>
                <TableCell className="py-2 px-3 text-center">
                  <a
                    href={`${BACKEND}/api/invoices/${i.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    <FilePdf size={13}/> Download PDF
                  </a>
                </TableCell>
              </TableRow>
            ))}
            </TableBody></Table>
          </div>
        </div>

        {/* Payments Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Payments Recorded</p>
            <span className="text-xs text-muted-foreground">{d.payments.length} total</span>
          </div>
          <div className="border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <Table><TableHeader><TableRow>
              <TableHead className="text-xs">Receipt #</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Mode</TableHead>
              <TableHead className="text-xs text-right">Amount</TableHead>
            </TableRow></TableHeader><TableBody>
            {d.payments.map(p => (
              <TableRow key={p.id} className="tbl-row">
                <TableCell className="py-2 px-3 font-mono text-xs font-medium text-foreground">{p.number}</TableCell>
                <TableCell className="py-2 px-3 text-xs text-muted-foreground">{fmtDate(p.payment_date)}</TableCell>
                <TableCell className="py-2 px-3 text-xs">{p.mode}</TableCell>
                <TableCell className="py-2 px-3 text-right tabular font-semibold text-emerald-600">{money(p.amount)}</TableCell>
              </TableRow>
            ))}
            </TableBody></Table>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground pt-4">Powered by Vegnar ERP &bull; Official Customer Portal</p>
      </div>
    </div>
  );
}

