import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, money, fmtDate } from "@/lib/api";
import { PageHeader, StatusPill, EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocForm } from "./DocList";
import ScheduleDeliveryModal from "@/components/dispatch/ScheduleDeliveryModal";
import { Plus, Truck, Package, CheckCircle, ArrowRight, Clock, MapPin, MagnifyingGlass } from "@phosphor-icons/react";

const STAGES = [
  { key: "ALL", label: "All Orders" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "READY_TO_DISPATCH", label: "Ready to Dispatch" },
  { key: "SCHEDULED", label: "Scheduled" },
  { key: "DISPATCHED", label: "Dispatched" },
  { key: "DELIVERED", label: "Delivered" },
];

export default function SalesOrders() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await api.get("/sales-orders");
      setRows(data || []);
    } catch (e) {
      toast.error("Failed to load sales orders");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openScheduleModal = (order) => {
    setSelectedOrder(order);
    setDeliveryModalOpen(true);
  };

  const handleStatusChange = async (order, newStatus) => {
    try {
      await api.post(`/sales-orders/${order.id}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      load();

      // If user sets to READY_TO_DISPATCH, prompt Schedule Delivery modal directly
      if (newStatus === "READY_TO_DISPATCH") {
        openScheduleModal(order);
      }
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to update status");
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const st = (r.status || "confirmed").toUpperCase();
      const matchFilter =
        filter === "ALL"
          ? true
          : filter === "CONFIRMED"
          ? st === "CONFIRMED"
          : filter === "READY_TO_DISPATCH"
          ? st === "READY_TO_DISPATCH"
          : filter === "SCHEDULED"
          ? st === "SCHEDULED"
          : filter === "DISPATCHED"
          ? st === "DISPATCHED"
          : filter === "DELIVERED"
          ? st === "DELIVERED"
          : true;

      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.number?.toLowerCase().includes(q) ||
        r.customer_name?.toLowerCase().includes(q) ||
        (r.awb_number && r.awb_number.toLowerCase().includes(q));

      return matchFilter && matchSearch;
    });
  }, [rows, filter, search]);

  return (
    <div className="space-y-4" data-testid="sales-orders-page">
      <PageHeader
        title="Sales Orders"
        subtitle="Manage confirmed orders, package aggregation, and schedule carrier deliveries."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs text-blue-700 bg-blue-50/50 hover:bg-blue-50 border-blue-200"
              onClick={() => navigate("/dispatch")}
            >
              <Truck size={14} className="mr-1.5" />
              Go to Dispatch Kanban
            </Button>
            <DocForm
              kind="sales-order"
              endpoint="/sales-orders"
              onCreated={load}
              trigger={
                <Button size="sm" className="h-8 text-xs" data-testid="new-sales-order-btn">
                  <Plus size={14} className="mr-1" />
                  New Sales Order
                </Button>
              }
            />
          </div>
        }
      />

      {/* Stage Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {STAGES.map((s) => {
            const count =
              s.key === "ALL"
                ? rows.length
                : rows.filter((r) => (r.status || "confirmed").toUpperCase() === s.key).length;

            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setFilter(s.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  filter === s.key
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{s.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    filter === s.key ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <MagnifyingGlass size={13} className="absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search SO#, Customer, AWB…"
            className="h-8 pl-8 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <EmptyState
          title="No sales orders found"
          hint={
            filter !== "ALL"
              ? `No orders matching filter "${filter}".`
              : "Create a sales order or generate one from an accepted quotation."
          }
        />
      ) : (
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-xs w-28">Order #</TableHead>
                <TableHead className="text-xs">Customer</TableHead>
                <TableHead className="text-xs w-24">Date</TableHead>
                <TableHead className="text-xs text-center w-24">Line Items</TableHead>
                <TableHead className="text-xs text-right w-28">Total Amount</TableHead>
                <TableHead className="text-xs text-center w-36">Status</TableHead>
                <TableHead className="text-xs text-right w-44">Dispatch Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((r) => {
                const normStatus = (r.status || "confirmed").toUpperCase();
                const totalUnits = (r.items || []).reduce(
                  (acc, it) => acc + (Number(it.quantity) || 0),
                  0
                );

                return (
                  <TableRow
                    key={r.id}
                    className="tbl-row hover:bg-muted/40 cursor-pointer"
                    data-testid={`sales-order-row-${r.id}`}
                  >
                    {/* Order # */}
                    <TableCell
                      className="py-2.5 px-3 font-mono text-xs font-semibold text-blue-600 hover:underline"
                      onClick={() => openScheduleModal(r)}
                    >
                      {r.number}
                    </TableCell>

                    {/* Customer */}
                    <TableCell className="py-2.5 px-3" onClick={() => openScheduleModal(r)}>
                      <p className="font-medium text-xs leading-tight">{r.customer_name}</p>
                      {r.shipping_address && (
                        <p className="text-[11px] text-muted-foreground truncate max-w-xs flex items-center gap-1 mt-0.5">
                          <MapPin size={10} />
                          {r.shipping_address}
                        </p>
                      )}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">
                      {fmtDate(r.order_date || r.created_at)}
                    </TableCell>

                    {/* Line Items */}
                    <TableCell className="py-2.5 px-3 text-center">
                      <span className="text-[11px] font-mono bg-muted/60 px-2 py-0.5 rounded border border-border">
                        {r.items?.length || 0} ({totalUnits.toLocaleString()})
                      </span>
                    </TableCell>

                    {/* Total Amount */}
                    <TableCell className="py-2.5 px-3 text-right tabular font-mono font-medium">
                      {money(r.grand_total)}
                    </TableCell>

                    {/* Lifecycle Status Pill & Quick Transition */}
                    <TableCell className="py-2.5 px-3 text-center">
                      <Select
                        value={normStatus}
                        onValueChange={(val) => handleStatusChange(r, val)}
                      >
                        <SelectTrigger className="h-6 text-[11px] font-medium border-0 bg-transparent p-0 justify-center">
                          <StatusPill status={normStatus} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                          <SelectItem value="READY_TO_DISPATCH">READY TO DISPATCH</SelectItem>
                          <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                          <SelectItem value="DISPATCHED">DISPATCHED</SelectItem>
                          <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Action Column */}
                    <TableCell className="py-2.5 px-3 text-right">
                      {normStatus === "CONFIRMED" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] text-blue-700 bg-blue-50/60 hover:bg-blue-50 border-blue-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              openScheduleModal(r);
                            }}
                          >
                            <Truck size={12} className="mr-1" />
                            Schedule Delivery
                          </Button>
                        </div>
                      )}

                      {normStatus === "READY_TO_DISPATCH" && (
                        <Button
                          size="sm"
                          className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            openScheduleModal(r);
                          }}
                        >
                          <Truck size={12} className="mr-1" />
                          Book Carrier
                        </Button>
                      )}

                      {normStatus === "SCHEDULED" && (
                        <div className="flex items-center justify-end gap-1.5">
                          {r.lr_number ? (
                            <a
                              href={`http://localhost:8000/api/delhivery-b2b/lr-pdf/${r.lr_number}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded font-mono flex items-center gap-1 transition-colors"
                              title="Click to view official Delhivery B2B LR Copy PDF"
                            >
                              <span>LRN: {r.lr_number}</span>
                            </a>
                          ) : (r.awb_number && !r.awb_number.startsWith("DELH")) ? (
                            <span className="text-[10px] text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded font-mono">
                              MWB: {r.awb_number}
                            </span>
                          ) : (
                            <span className="text-[10px] text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded font-medium">
                              Scheduled
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/dispatch");
                            }}
                          >
                            Board <ArrowRight size={10} className="ml-1" />
                          </Button>
                        </div>
                      )}

                      {normStatus === "DISPATCHED" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-[10px] text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded font-medium">
                            🚚 In Transit
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/dispatch");
                            }}
                          >
                            Track <ArrowRight size={10} className="ml-1" />
                          </Button>
                        </div>
                      )}

                      {normStatus === "DELIVERED" && (
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium inline-flex items-center gap-1">
                          <CheckCircle size={12} className="text-emerald-600" />
                          Delivered
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Schedule Delivery Modal */}
      <ScheduleDeliveryModal
        open={deliveryModalOpen}
        onOpenChange={setDeliveryModalOpen}
        order={selectedOrder}
        onSuccess={() => {
          load();
        }}
      />
    </div>
  );
}
