import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { linkPortalCustomer, signOutPortal } from "@/app/actions/portal";

import { formatMoney } from "@/lib/booking/pricing";

import { Button } from "@/components/ui/Button";



export default async function PortalPage() {

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/portal/login");



  const linkResult = await linkPortalCustomer();

  if (process.env.NODE_ENV === "development" && "error" in linkResult && linkResult.error) {

    console.error("[portal] link customer:", linkResult.error);

  }



  const { data: appointments, error: appointmentsError } = await supabase

    .from("appointments")

    .select("*")

    .order("appointment_date", { ascending: false });



  const { data: quotes, error: quotesError } = await supabase

    .from("quote_requests")

    .select("*")

    .order("created_at", { ascending: false });



  const loadError = appointmentsError?.message ?? quotesError?.message;



  return (

    <div className="mx-auto max-w-3xl px-4 py-16">

      <div className="flex items-center justify-between gap-4">

        <div>

          <h1 className="font-display text-2xl font-bold text-white">My account</h1>

          <p className="text-sm text-mist">{user.email}</p>

        </div>

        <form action={signOutPortal}><Button variant="subtle" size="sm">Sign out</Button></form>

      </div>



      {loadError && (

        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">

          We couldn&apos;t load all account data right now. If this persists, contact the shop or try signing in again.

          {process.env.NODE_ENV === "development" && (

            <span className="mt-1 block text-xs text-amber-200/80">{loadError}</span>

          )}

        </div>

      )}



      <section className="mt-10">

        <h2 className="font-display text-lg font-semibold text-white">Appointments</h2>

        <div className="mt-4 space-y-3">

          {(appointments ?? []).length === 0 ? (

            <p className="text-sm text-mist">No appointments yet. <a href="/booking" className="text-gold">Book now</a></p>

          ) : (

            appointments!.map((a) => (

              <div key={a.id} className="rounded-2xl border border-line bg-surface/70 p-4">

                <div className="flex flex-wrap items-start justify-between gap-2">

                  <div>

                    <p className="font-semibold text-white">{a.service_title}</p>

                    <p className="text-sm text-mist">{a.appointment_date} · {a.appointment_time}</p>

                    {a.appointment_number && <p className="mt-1 font-mono text-xs text-gold">#{a.appointment_number}</p>}

                  </div>

                  <span className="rounded-full border border-line px-2 py-0.5 text-xs capitalize text-mist">{a.status.replace("_", " ")}</span>

                </div>

                {a.total_cents && (

                  <p className="mt-2 text-sm text-snow/80">Total: {formatMoney(a.total_cents)} · Paid: {formatMoney(a.amount_paid_cents ?? 0)}</p>

                )}

              </div>

            ))

          )}

        </div>

      </section>



      <section className="mt-10">

        <h2 className="font-display text-lg font-semibold text-white">Quote requests</h2>

        <div className="mt-4 space-y-3">

          {(quotes ?? []).length === 0 ? (

            <p className="text-sm text-mist">No quotes yet. <a href="/quote" className="text-gold">Request a quote</a></p>

          ) : (

            quotes!.map((q) => (

              <div key={q.id} className="rounded-2xl border border-line bg-surface/70 p-4">

                <p className="font-semibold text-white">{q.service_type}</p>

                <p className="text-sm text-mist capitalize">{q.status.replace("_", " ")}</p>

                {q.quoted_amount_cents && <p className="mt-1 text-sm text-gold">{formatMoney(q.quoted_amount_cents)}</p>}

              </div>

            ))

          )}

        </div>

      </section>

    </div>

  );

}

