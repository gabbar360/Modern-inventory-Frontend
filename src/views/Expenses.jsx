import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, money, fmtDate } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Bits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Trash, CreditCard, Truck, Receipt, Lightning, Buildings, Megaphone, Suitcase } from "@phosphor-icons/react";

const CATEGORIES = [
  { id: "OPEX", label: "Operating Expenses (OPEX)", icon: Lightning, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
  { id: "FIXED", label: "Fixed Expenses (Rent & Payroll)", icon: Buildings, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800" },
  { id: "TRANSPORTATION", label: "Transportation & Freight", icon: Truck, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800" },
  { id: "SALES_MARKETING", label: "Sales & Marketing", icon: Megaphone, color: "text-pink-600 bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800" },
  { id: "ADMIN", label: "Administrative & Professional", icon: Suitcase, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" },
  { id: "COGS", label: "Direct Production / COGS", icon: Receipt, color: "text-slate-600 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" },
  { id: "OTHER", label: "Other Expenses", icon: CreditCard, color: "text-zinc-600 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" }
];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "OPEX",
    subcategory: "",
    amount: "",
    tax_amount: "",
    date: new Date().toISOString().slice(0, 10),
    vendor_name: "",
    payment_mode: "Bank Transfer",
    reference_no: "",
    notes: ""
  });

  const load = async () => {
    try {
      const [expRes, sumRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/expenses/summary")
      ]);
      setExpenses(expRes.data || []);
      setSummary(sumRes.data || null);
    } catch (err) {
      console.error("Failed to load expenses:", err);
      toast.error("Failed to load expense records");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) {
      return toast.error("Please provide expense title and amount");
    }

    try {
      await api.post("/expenses", {
        ...form,
        amount: parseFloat(form.amount),
        tax_amount: parseFloat(form.tax_amount || 0)
      });
      toast.success("Expense recorded successfully");
      setOpen(false);
      setForm({
        title: "",
        category: "OPEX",
        subcategory: "",
        amount: "",
        tax_amount: "",
        date: new Date().toISOString().slice(0, 10),
        vendor_name: "",
        payment_mode: "Bank Transfer",
        reference_no: "",
        notes: ""
      });
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to record expense");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Expense deleted");
      load();
    } catch (err) {
      toast.error("Failed to delete expense");
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    if (activeCategory !== "ALL" && e.category !== activeCategory) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (e.title && e.title.toLowerCase().includes(q)) ||
      (e.vendor_name && e.vendor_name.toLowerCase().includes(q)) ||
      (e.number && e.number.toLowerCase().includes(q)) ||
      (e.reference_no && e.reference_no.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5" data-testid="expenses-page">
      <PageHeader
        title="Expense Accounting"
        subtitle="Record and categorize all enterprise operating, fixed, freight, and administrative expenses."
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white" data-testid="record-expense-btn">
                <Plus size={14} className="mr-1.5" />
                Record Expense
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Record Business Expense</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleCreate} className="mt-4 space-y-3.5 text-sm">
                <div>
                  <Label htmlFor="expenses-expense-title-description" className="text-xs font-medium">Expense Title / Description *</Label>
                  <Input name="expense-title-description" id="expenses-expense-title-description"
                    required
                    placeholder="e.g. Bhiwandi Warehouse Monthly Electricity Bill"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="h-8 text-xs mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expenses-subcategory" className="text-xs font-medium">Expense Category *</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger name="subcategory" id="expenses-subcategory" className="h-8 text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expenses-subcategory" className="text-xs font-medium">Subcategory</Label>
                    <Input name="subcategory" id="expenses-subcategory"
                      placeholder="e.g. Utilities / Rent / Fuel"
                      value={form.subcategory}
                      onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expenses-base-amount" className="text-xs font-medium">Base Amount (₹) *</Label>
                    <Input name="base-amount" id="expenses-base-amount"
                      required
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="h-8 text-xs mt-1 tabular"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expenses-gst-tax-amount" className="text-xs font-medium">GST / Tax Amount (₹)</Label>
                    <Input name="gst-tax-amount" id="expenses-gst-tax-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.tax_amount}
                      onChange={(e) => setForm({ ...form, tax_amount: e.target.value })}
                      className="h-8 text-xs mt-1 tabular"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expenses-expense-date" className="text-xs font-medium">Expense Date *</Label>
                    <Input name="expense-date" id="expenses-expense-date"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expenses-vendor_name" className="text-xs font-medium">Payment Mode</Label>
                    <Select value={form.payment_mode} onValueChange={(v) => setForm({ ...form, payment_mode: v })}>
                      <SelectTrigger name="vendor_name" id="expenses-vendor_name" className="h-8 text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Bank Transfer", "NEFT / RTGS", "Cheque", "UPI", "Credit Card", "Cash"].map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expenses-vendor_name" className="text-xs font-medium">Vendor / Payee</Label>
                    <Input name="vendor_name" id="expenses-vendor_name"
                      placeholder="e.g. MSEDCL or Landlord"
                      value={form.vendor_name}
                      onChange={(e) => setForm({ ...form, vendor_name: e.target.value })}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expenses-reference-bill-utr" className="text-xs font-medium">Reference / Bill # / UTR</Label>
                    <Input name="reference-bill-utr" id="expenses-reference-bill-utr"
                      placeholder="e.g. UTR1238910 or Inv #441"
                      value={form.reference_no}
                      onChange={(e) => setForm({ ...form, reference_no: e.target.value })}
                      className="h-8 text-xs mt-1 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="expenses-notes" className="text-xs font-medium">Notes</Label>
                  <Textarea name="notes" id="expenses-notes"
                    rows={2}
                    placeholder="Internal accounting remarks..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="text-xs mt-1"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white">
                    Save Expense & Create Journal Entry
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        }
      />

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="bg-card shadow-sm border-border md:col-span-1">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Expenses</span>
            <p className="text-lg font-display font-semibold tabular text-rose-600 dark:text-rose-400">
              {money(summary?.total_expenses || 0)}
            </p>
            <span className="text-[11px] text-muted-foreground">{summary?.count || expenses.length} records</span>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-amber-600">OPEX</span>
            <p className="text-lg font-display font-semibold tabular">
              {money(summary?.by_category?.OPEX || 0)}
            </p>
            <span className="text-[11px] text-muted-foreground">Utilities & Supplies</span>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-purple-600">Fixed Costs</span>
            <p className="text-lg font-display font-semibold tabular">
              {money(summary?.by_category?.FIXED || 0)}
            </p>
            <span className="text-[11px] text-muted-foreground">Rent & Payroll</span>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-blue-600">Transportation</span>
            <p className="text-lg font-display font-semibold tabular">
              {money(summary?.by_category?.TRANSPORTATION || 0)}
            </p>
            <span className="text-[11px] text-muted-foreground">Freight & Logistics</span>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-pink-600">Marketing</span>
            <p className="text-lg font-display font-semibold tabular">
              {money(summary?.by_category?.SALES_MARKETING || 0)}
            </p>
            <span className="text-[11px] text-muted-foreground">Ads & Expos</span>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-600">Admin</span>
            <p className="text-lg font-display font-semibold tabular">
              {money(summary?.by_category?.ADMIN || 0)}
            </p>
            <span className="text-[11px] text-muted-foreground">Legal & Audit</span>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Button
            size="sm"
            variant={activeCategory === "ALL" ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setActiveCategory("ALL")}
          >
            All Categories
          </Button>
          {CATEGORIES.slice(0, 5).map((c) => (
            <Button
              key={c.id}
              size="sm"
              variant={activeCategory === c.id ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setActiveCategory(c.id)}
            >
              {c.id}
            </Button>
          ))}
        </div>

        <Input name="search-by-title-vendor-reference" id="expenses-search-by-title-vendor-reference"
          placeholder="Search by title, vendor, reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-xs w-full sm:w-64"
        />
      </div>

      {/* Expenses Ledger Table */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          title="No expenses found"
          hint="Click 'Record Expense' to log new operational, fixed, or logistics costs."
        />
      ) : (
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Expense #</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Title</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Vendor / Payee</TableHead>
                <TableHead className="text-xs">Payment Mode</TableHead>
                <TableHead className="text-xs text-right">Tax (₹)</TableHead>
                <TableHead className="text-xs text-right font-semibold">Total (₹)</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((e) => {
                const catMeta = CATEGORIES.find((c) => c.id === e.category) || CATEGORIES[0];
                return (
                  <TableRow key={e.id} className="tbl-row hover:bg-muted/40">
                    <TableCell className="py-2 px-3 font-mono text-xs font-medium">{e.number}</TableCell>
                    <TableCell className="py-2 px-3 text-xs text-muted-foreground">{fmtDate(e.date)}</TableCell>
                    <TableCell className="py-2 px-3 text-xs font-medium">
                      {e.title}
                      {e.subcategory && (
                        <span className="text-[10px] text-muted-foreground block">{e.subcategory}</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${catMeta.color}`}>
                        {e.category}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 px-3 text-xs text-muted-foreground">
                      {e.vendor_name || "—"}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-xs">
                      {e.payment_mode}
                      {e.reference_no && (
                        <span className="font-mono text-[10px] text-muted-foreground block">{e.reference_no}</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-right tabular text-xs text-muted-foreground">
                      {money(e.tax_amount || 0)}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-right tabular text-xs font-bold text-foreground">
                      {money(e.total_amount || e.amount)}
                    </TableCell>
                    <TableCell className="py-2 px-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-rose-600"
                        onClick={() => handleDelete(e.id)}
                      >
                        <Trash size={13} />
                      </Button>
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

