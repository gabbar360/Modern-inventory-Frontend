"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Warehouse as WhIcon } from "@phosphor-icons/react";
import { useGetWarehousesQuery, useCreateWarehouseMutation } from "@/store/api/warehousesApi";

const INITIAL_WAREHOUSE = {
  name: "",
  code: "",
  address: "",
  manager: "",
  contact: "",
  capacity: 0,
  status: "active",
};

export default function Warehouses() {
  const { data: rows = [], isLoading } = useGetWarehousesQuery();
  const [createWarehouse, { isLoading: isCreating }] = useCreateWarehouseMutation();

  const [open, setOpen] = useState(false);
  const [f, setF] = useState(INITIAL_WAREHOUSE);

  const upd = (k) => (e) =>
    setF((s) => ({
      ...s,
      [k]: k === "capacity" ? Number(e.target.value) : e.target.value,
    }));

  const submit = async () => {
    if (!f.name || !f.name.trim()) return toast.error("Warehouse name is required");
    try {
      await createWarehouse({ ...f, name: f.name.trim() }).unwrap();
      toast.success("Warehouse added successfully");
      setOpen(false);
      setF(INITIAL_WAREHOUSE);
    } catch (e) {
      toast.error(e?.data?.detail || e?.message || "Failed to add warehouse");
    }
  };

  return (
    <div className="space-y-4" data-testid="warehouses-page">
      <PageHeader
        title="Warehouses"
        subtitle="Multiple stock locations with capacity and manager assignment."
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="h-8" data-testid="new-wh-btn">
                <Plus size={14} className="mr-1" />
                New warehouse
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>New warehouse</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="warehouses-name" className="text-xs">
                      Name
                    </Label>
                    <Input
                      name="name"
                      id="warehouses-name"
                      value={f.name}
                      onChange={upd("name")}
                      data-testid="wh-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="warehouses-code" className="text-xs">
                      Code
                    </Label>
                    <Input
                      name="code"
                      id="warehouses-code"
                      value={f.code}
                      onChange={upd("code")}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="warehouses-address" className="text-xs">
                    Address
                  </Label>
                  <Input
                    name="address"
                    id="warehouses-address"
                    value={f.address}
                    onChange={upd("address")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="warehouses-manager" className="text-xs">
                      Manager
                    </Label>
                    <Input
                      name="manager"
                      id="warehouses-manager"
                      value={f.manager}
                      onChange={upd("manager")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="warehouses-contact" className="text-xs">
                      Contact
                    </Label>
                    <Input
                      name="contact"
                      id="warehouses-contact"
                      value={f.contact}
                      onChange={upd("contact")}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="warehouses-capacity" className="text-xs">
                    Capacity
                  </Label>
                  <Input
                    name="capacity"
                    id="warehouses-capacity"
                    type="number"
                    value={f.capacity}
                    onChange={upd("capacity")}
                  />
                </div>
                <Button
                  className="w-full h-9"
                  onClick={submit}
                  disabled={isCreating}
                  data-testid="save-wh-btn"
                >
                  {isCreating ? "Saving warehouse..." : "Save"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        }
      />
      {isLoading ? (
        <div className="py-8 text-center text-xs text-muted-foreground">
          Loading warehouses...
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No warehouses yet"
          hint="Add a warehouse to track stock per location."
        />
      ) : (
        <div className="grid md:grid-cols-3 gap-3">
          {rows.map((w) => (
            <div
              key={w.id}
              className="border border-border rounded-lg p-4 card-hover bg-card"
              data-testid={`wh-card-${w.id}`}
            >
              <div className="flex items-start gap-3">
                <WhIcon size={20} className="mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium text-sm">{w.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {w.code} · {w.status}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-3 space-y-0.5">
                <p>{w.address || "—"}</p>
                <p>Manager: {w.manager || "—"}</p>
                <p>Contact: {w.contact || "—"}</p>
                <p>
                  Capacity:{" "}
                  {w.capacity ? Number(w.capacity).toLocaleString("en-IN") : "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
