import { Link } from "react-router-dom";

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-display font-semibold tracking-tight" data-testid="page-title">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

const STATUS_MAP = {
  new: "pill-slate", contacted: "pill-sky", qualified: "pill-violet",
  quotation_sent: "pill-amber", negotiation: "pill-amber",
  won: "pill-emerald", lost: "pill-rose",
  draft: "pill-slate", sent: "pill-sky", accepted: "pill-emerald", rejected: "pill-rose",
  confirmed: "pill-sky", CONFIRMED: "pill-sky",
  ready_to_dispatch: "pill-amber", READY_TO_DISPATCH: "pill-amber",
  scheduled: "pill-violet", SCHEDULED: "pill-violet",
  dispatched: "pill-sky", DISPATCHED: "pill-sky",
  delivered: "pill-emerald", DELIVERED: "pill-emerald",
  completed: "pill-emerald", cancelled: "pill-rose",
  unpaid: "pill-rose", partial: "pill-amber", paid: "pill-emerald", overdue: "pill-rose",
  high: "pill-rose", medium: "pill-amber", low: "pill-slate",
};
export function StatusPill({ status }) {
  const cls = STATUS_MAP[status] || "pill-slate";
  return <span className={`pill ${cls}`} data-testid={`status-${status}`}>{(status || "").replace(/_/g, " ")}</span>;
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="border border-dashed border-border rounded-lg p-10 text-center">
      <p className="font-medium text-sm">{title}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
