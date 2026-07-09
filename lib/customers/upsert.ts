import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

export type CustomerContact = {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
};

export type AppointmentCustomerSource = {
  id: string;
  customer_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  customer_address?: string | null;
};

export async function upsertCustomerFromContact(
  admin: AdminClient,
  contact: CustomerContact,
): Promise<{ customerId: string | null; error?: string }> {
  const name = contact.name.trim();
  const email = contact.email.trim();
  const phone = contact.phone?.trim() || null;
  const address = contact.address?.trim() || null;

  if (!name || !email) {
    return { customerId: null, error: "Name and email are required." };
  }

  const { data: customerId, error: rpcErr } = await admin.rpc("upsert_booking_customer", {
    p_name: name,
    p_email: email,
    p_phone: phone,
    p_address: address,
  });

  if (!rpcErr && customerId) {
    return { customerId: customerId as string };
  }

  if (rpcErr) {
    console.error("[customers] upsert rpc", rpcErr.message);
  }

  const { data: byEmail } = await admin
    .from("customers")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (byEmail?.id) {
    await admin
      .from("customers")
      .update({ name, phone, address: address ?? undefined })
      .eq("id", byEmail.id);
    return { customerId: byEmail.id };
  }

  if (phone) {
    const { data: byPhone } = await admin
      .from("customers")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (byPhone?.id) {
      await admin.from("customers").update({ name, email, address: address ?? undefined }).eq("id", byPhone.id);
      return { customerId: byPhone.id };
    }
  }

  const { data: created, error: insertErr } = await admin
    .from("customers")
    .insert({ name, email, phone, address })
    .select("id")
    .single();

  if (insertErr || !created) {
    return {
      customerId: null,
      error: insertErr?.message ?? "Could not save customer record.",
    };
  }

  return { customerId: created.id };
}

/** Upsert a customer from appointment contact fields and link the appointment when needed. */
export async function ensureAppointmentCustomer(
  admin: AdminClient,
  appointment: AppointmentCustomerSource,
): Promise<{ customerId: string | null; error?: string }> {
  const { customerId, error } = await upsertCustomerFromContact(admin, {
    name: appointment.customer_name,
    email: appointment.customer_email,
    phone: appointment.customer_phone,
    address: appointment.customer_address,
  });

  if (error || !customerId) {
    return { customerId: null, error };
  }

  if (appointment.customer_id !== customerId) {
    const { error: linkErr } = await admin
      .from("appointments")
      .update({ customer_id: customerId })
      .eq("id", appointment.id);

    if (linkErr) {
      console.error("[customers] link appointment", linkErr.message);
      return { customerId, error: linkErr.message };
    }
  }

  return { customerId };
}
