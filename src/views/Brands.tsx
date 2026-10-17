"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/Bits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "@phosphor-icons/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBrands, createBrand as createBrandAction } from "@/slices/brandSlice";

const INITIAL_BRAND = {
  name: "",
  invoice_prefix: "INV",
  quotation_prefix: "QT",
  sales_order_prefix: "SO",
  color: "#0A0A0A",
  email: "",
  phone: "",
  gstin: "",
};

export default function Brands() {
  const dispatch = useAppDispatch();
  const { brands: rows = [], loading: isLoading } = useAppSelector((state) => state.brands);

  const [open, setOpen] = useState(false);
  const [f, setF] = useState(INITIAL_BRAND);
  const [isCreating, setIsCreating] = useState(false);

  const load = () => {
    dispatch(fetchBrands());
  };

  useEffect(() => {
    load();
  }, [dispatch]);

  const upd = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async () => {
    if (!f.name || !f.name.trim()) return toast.error("Brand name is required");
    setIsCreating(true);
    try {
      await dispatch(createBrandAction({ ...f, name: f.name.trim() })).unwrap();
      toast.success("Brand created successfully");
      setOpen(false);
      setF(INITIAL_BRAND);
      load();
    } catch (e: any) {
      toast.error(e?.message || e || "Failed to create brand");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="brands-page">
      <PageHeader
        title="Brands"
        subtitle="Multiple brands under one organization with their own numbering and identity."
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="h-8" data-testid="new-brand-btn">
                <Plus size={14} className="mr-1" />
                New brand
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>New brand</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <Label htmlFor="brands-name" className="text-xs">
                    Name
                  </Label>
                  <Input
                    name="name"
                    id="brands-name"
                    value={f.name}
                    onChange={upd("name")}
                    data-testid="brand-name-input"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="brands-invoice_prefix" className="text-xs">
                      Invoice prefix
                    </Label>
                    <Input
                      name="invoice_prefix"
                      id="brands-invoice_prefix"
                      value={f.invoice_prefix}
                      onChange={upd("invoice_prefix")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="brands-quotation_prefix" className="text-xs">
                      Quote prefix
                    </Label>
                    <Input
                      name="quotation_prefix"
                      id="brands-quotation_prefix"
                      value={f.quotation_prefix}
                      onChange={upd("quotation_prefix")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="brands-sales_order_prefix" className="text-xs">
                      SO prefix
                    </Label>
                    <Input
                      name="sales_order_prefix"
                      id="brands-sales_order_prefix"
                      value={f.sales_order_prefix}
                      onChange={upd("sales_order_prefix")}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="brands-email" className="text-xs">
                      Email
                    </Label>
                    <Input
                      name="email"
                      id="brands-email"
                      value={f.email}
                      onChange={upd("email")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="brands-phone" className="text-xs">
                      Phone
                    </Label>
                    <Input
                      name="phone"
                      id="brands-phone"
                      value={f.phone}
                      onChange={upd("phone")}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="brands-color" className="text-xs">
                    Color
                  </Label>
                  <Input
                    name="color"
                    id="brands-color"
                    type="color"
                    value={f.color}
                    onChange={upd("color")}
                    className="h-9 w-20"
                  />
                </div>
                <Button
                  className="w-full h-9"
                  onClick={submit}
                  disabled={isCreating}
                  data-testid="save-brand-btn"
                >
                  {isCreating ? "Saving brand..." : "Save brand"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        }
      />
      {isLoading ? (
        <div className="py-8 text-center text-xs text-muted-foreground">
          Loading brands...
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="No brands yet" />
      ) : (
        <div className="grid md:grid-cols-3 gap-3">
          {rows.map((b) => (
            <Card
              key={b.id}
              className="card-hover"
              data-testid={`brand-card-${b.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center text-white font-display font-semibold"
                    style={{ background: b.color || "#0A0A0A" }}
                  >
                    {b.name?.[0] || "B"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{b.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {b.email || "—"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                  <div>
                    <span className="block text-foreground/70 text-[10px] uppercase tracking-wider">
                      INV
                    </span>
                    {b.invoice_prefix}
                  </div>
                  <div>
                    <span className="block text-foreground/70 text-[10px] uppercase tracking-wider">
                      QT
                    </span>
                    {b.quotation_prefix}
                  </div>
                  <div>
                    <span className="block text-foreground/70 text-[10px] uppercase tracking-wider">
                      SO
                    </span>
                    {b.sales_order_prefix}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
