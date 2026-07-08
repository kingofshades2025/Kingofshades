import {
  CalendarDays,
  Clock,
  CreditCard,
  Quote,
  Users,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppointmentStatus as DbAppointmentStatus } from "@/lib/types/database";
import type { Invoice } from "@/lib/data";
import { Badge } from "@/components/ui/Badge";

export function AdminPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-mist">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const statIcons: Record<string, LucideIcon> = {
  calendar: CalendarDays,
  clock: Clock,
  card: CreditCard,
  quote: Quote,
  users: Users,
};

export function StatCard({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: string;
}) {
  const Icon = statIcons[icon] ?? TrendingUp;
  return (
    <div className="rounded-2xl border border-line bg-surface/70 p-5 transition-colors hover:border-gold/30">
      <div className="flex items-start justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
          <Icon className="h-5 w-5" />
        </span>
        {delta && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            {delta}
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-mist">{label}</p>
    </div>
  );
}

const appointmentStatusLabels: Record<DbAppointmentStatus, string> = {
  requested: "Requested",
  quote_sent: "Quote sent",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function AppointmentStatusBadge({ status }: { status: DbAppointmentStatus | string }) {
  const normalized = (typeof status === "string" ? status.toLowerCase().replace(" ", "_") : status) as DbAppointmentStatus;
  const tone =
    normalized === "confirmed"
      ? "green"
      : normalized === "requested"
        ? "amber"
        : normalized === "quote_sent"
          ? "gold"
          : normalized === "in_progress"
            ? "blue"
            : normalized === "completed"
              ? "blue"
              : "red";
  return <Badge tone={tone}>{appointmentStatusLabels[normalized] ?? status}</Badge>;
}

export function InvoiceStatusBadge({ status }: { status: Invoice["status"] }) {
  const tone = status === "Paid" ? "green" : status === "Pending" ? "amber" : "red";
  return <Badge tone={tone}>{status}</Badge>;
}

export function Panel({
  title,
  action,
  className,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border border-line bg-surface/70", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-base font-semibold text-white">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
