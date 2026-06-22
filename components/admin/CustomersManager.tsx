"use client";

import { useMemo, useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Customer } from "@/lib/types/database";
import { deleteCustomer, upsertCustomer } from "@/app/actions/admin";
import { AdminFeedback, useAdminAction } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";

export function CustomersManager({
  customers,
  appointmentCounts,
  loadError,
}: {
  customers: Customer[];
  appointmentCounts: Record<string, number>;
  loadError?: string | null;
}) {
  const [editing, setEditing] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDelete] = useTransition();

  const { run, isPending, message, error, clearFeedback } = useAdminAction(upsertCustomer, {
    successMessage: editing?.id ? "Customer updated." : "Customer added.",
    onSuccess: () => setEditing(null),
  });

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone?.toLowerCase().includes(q) ?? false) ||
        (c.address?.toLowerCase().includes(q) ?? false),
    );
  }, [customers, search]);

  const startAdd = () => {
    clearFeedback();
    setDeleteError(null);
    setEditing({} as Customer);
  };

  const startEdit = (customer: Customer) => {
    clearFeedback();
    setDeleteError(null);
    setEditing(customer);
  };

  const handleDelete = (customer: Customer) => {
    const apptCount = appointmentCounts[customer.id] ?? 0;
    const message =
      apptCount > 0
        ? `Delete ${customer.name}? They have ${apptCount} linked appointment${apptCount === 1 ? "" : "s"} — those records will be kept but unlinked from this customer.`
        : `Delete ${customer.name}? This cannot be undone.`;
    if (!confirm(message)) return;

    setDeleteError(null);
    startDelete(() => {
      void (async () => {
        const result = await deleteCustomer(customer.id);
        if (result.success) {
          if (editing?.id === customer.id) setEditing(null);
        } else {
          setDeleteError(result.error);
        }
      })();
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Customers"
        subtitle="Manage customer records from bookings and contact forms."
        actions={
          <Button size="sm" onClick={startAdd}>
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        }
      />

      {loadError && <AdminFeedback error={loadError} className="mb-4" />}
      <AdminFeedback message={message} error={error ?? deleteError} className="mb-4" />

      <div className="mb-6">
        <Field className="max-w-md">
          <Input
            placeholder="Search by name, email, phone, or address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Field>
      </div>

      {editing && (
        <form
          action={run}
          key={editing.id ?? "new"}
          className="mb-6 rounded-2xl border border-gold/30 bg-surface/70 p-6"
        >
          {editing.id && <input type="hidden" name="id" value={editing.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input name="name" defaultValue={editing.name ?? ""} required />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" defaultValue={editing.email ?? ""} required />
            </Field>
            <Field label="Phone">
              <Input name="phone" type="tel" defaultValue={editing.phone ?? ""} />
            </Field>
            <Field label="Address">
              <Input name="address" defaultValue={editing.address ?? ""} />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <Textarea name="notes" rows={3} defaultValue={editing.notes ?? ""} />
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={isPending}>
              {editing.id ? "Save changes" : "Add customer"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-charcoal-light text-mist">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">Since</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((c) => (
              <tr key={c.id} className="bg-surface/40">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{c.name}</p>
                  {c.notes && <p className="mt-0.5 line-clamp-1 text-xs text-mist">{c.notes}</p>}
                </td>
                <td className="px-4 py-3 text-mist">{c.email}</td>
                <td className="px-4 py-3 text-mist">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-mist">{c.address ?? "—"}</td>
                <td className="px-4 py-3 text-mist">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:text-gold"
                      aria-label={`Edit ${c.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={deletePending}
                      onClick={() => handleDelete(c)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:text-red-400"
                      aria-label={`Delete ${c.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <p className="px-4 py-8 text-center text-sm text-mist">
            {search ? "No customers match your search." : "No customers yet."}
          </p>
        )}
      </div>
    </>
  );
}
