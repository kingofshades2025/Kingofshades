import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminAppointments, getDashboardStats } from "@/lib/queries/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/Button";
import {
  AdminPageHeader,
  StatCard,
  Panel,
  AppointmentStatusBadge,
} from "@/components/admin/AdminUI";

export default async function AdminDashboardPage() {
  await requireAdmin();

  let stats = {
    totalAppointments: 0,
    totalCustomers: 0,
    activeServices: 0,
    upcomingAppointments: 0,
  };
  let upcoming: Awaited<ReturnType<typeof getAdminAppointments>> = [];

  if (isSupabaseConfigured()) {
    try {
      [stats, upcoming] = await Promise.all([
        getDashboardStats(),
        getAdminAppointments({ status: "requested" }),
      ]);
    } catch {
      /* empty dashboard */
    }
  }

  const statCards = [
    { label: "Total Appointments", value: String(stats.totalAppointments), delta: "Live", icon: "calendar" as const },
    { label: "Upcoming", value: String(stats.upcomingAppointments), delta: "Requested + confirmed", icon: "clock" as const },
    { label: "Customers", value: String(stats.totalCustomers), delta: "All time", icon: "users" as const },
    { label: "Active Services", value: String(stats.activeServices), delta: "On website", icon: "tag" as const },
    { label: "Revenue", value: "—", delta: "Stripe coming in Phase 3", icon: "card" as const },
  ];

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Live overview from your Supabase database."
        actions={
          <Button size="sm" href="/admin/appointments">
            <Plus className="h-4 w-4" />
            View Appointments
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} icon={s.icon} />
        ))}
      </div>

      <Panel
        title="Recent appointments"
        className="mt-6"
        action={
          <Link href="/admin/appointments" className="inline-flex items-center gap-1 text-xs font-medium text-gold hover:text-gold-light">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        <div className="divide-y divide-line">
          {upcoming.slice(0, 8).map((a) => (
            <div key={a.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{a.customer_name}</p>
                <p className="truncate text-xs text-mist">{a.service_title}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm text-snow">{a.appointment_date}</p>
                <p className="text-xs text-mist">{a.appointment_time}</p>
              </div>
              <AppointmentStatusBadge
                status={(a.status.charAt(0).toUpperCase() + a.status.slice(1)) as "Pending" | "Confirmed" | "Completed" | "Cancelled"}
              />
            </div>
          ))}
          {!upcoming.length && (
            <p className="px-5 py-8 text-center text-sm text-mist">No appointments yet.</p>
          )}
        </div>
      </Panel>
    </>
  );
}
