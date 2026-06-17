import { Plus, Pencil, Trash2, Car, Home, Building2, Sticker } from "lucide-react";
import { services } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AdminPageHeader } from "@/components/admin/AdminUI";

const icons = { automotive: Car, residential: Home, commercial: Building2, decals: Sticker };

export default function AdminServicesPage() {
  return (
    <>
      <AdminPageHeader
        title="Services"
        subtitle="Manage the services and packages customers can book."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {services.map((service) => {
          const Icon = icons[service.accent];
          return (
            <div
              key={service.slug}
              className="rounded-2xl border border-line bg-surface/70 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">
                      {service.title}
                    </h3>
                    <Badge tone="gold" className="mt-1">
                      From {service.startingAt}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    title="Edit service"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line text-snow/70 hover:border-gold/40 hover:text-gold"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Remove service"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line text-snow/70 hover:border-red-500/40 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mt-4 text-sm text-mist">{service.tagline}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {service.features.map((f) => (
                  <span
                    key={f.name}
                    className="rounded-lg border border-line bg-charcoal-light px-2.5 py-1 text-xs text-snow/80"
                  >
                    {f.name}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
                <span className="inline-flex items-center gap-2 text-mist">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Active &amp; bookable
                </span>
                <button className="text-xs font-medium text-gold hover:text-gold-light">
                  Manage pricing
                </button>
              </div>
            </div>
          );
        })}

        {/* Add new card */}
        <button
          type="button"
          className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line text-mist transition-colors hover:border-gold/40 hover:text-gold"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full border border-current">
            <Plus className="h-6 w-6" />
          </span>
          <span className="text-sm font-medium">Add a new service</span>
        </button>
      </div>
    </>
  );
}
