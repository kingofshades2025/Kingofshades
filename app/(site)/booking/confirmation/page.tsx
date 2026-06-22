import { CheckCircle2 } from "lucide-react";
import { getAppointmentConfirmation } from "@/app/actions/confirmation";
import { PriceBreakdown } from "@/components/booking/PriceBreakdown";
import { Button } from "@/components/ui/Button";

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; paid?: string }>;
}) {
  const params = await searchParams;
  const appointment = params.id ? await getAppointmentConfirmation(params.id) : null;
  const paid = params.paid === "1";

  return (
    <section className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-gold/30 bg-gold/5 px-6 py-12 text-center sm:px-10">
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
        <h1 className="mt-6 font-display text-2xl font-bold text-white">
          {paid ? "Payment received!" : "Booking confirmed"}
        </h1>

        {appointment ? (
          <>
            {appointment.appointment_number && (
              <p className="mt-2 font-mono text-sm text-gold">#{appointment.appointment_number}</p>
            )}
            <p className="mt-4 text-sm text-mist">
              {appointment.service_title}
              <br />
              {appointment.appointment_date} at {appointment.appointment_time}
            </p>
            {paid && appointment.formattedPaid && (
              <p className="mt-2 text-sm text-snow">
                Paid: {appointment.formattedPaid}
                {appointment.formattedTotal ? ` of ${appointment.formattedTotal}` : ""}
              </p>
            )}
            {appointment.breakdown?.length ? (
              <div className="mt-6 rounded-2xl border border-line bg-charcoal-light p-5 text-left">
                <p className="mb-3 text-sm font-medium text-snow">Price breakdown</p>
                <PriceBreakdown lines={appointment.breakdown} />
              </div>
            ) : null}
            <p className="mt-2 text-xs capitalize text-mist">
              Status: {appointment.payment_status.replace("_", " ")}
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-mist">
            Your booking is confirmed. Check your email for details.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href="/portal">View my account</Button>
          <Button href="/" variant="outline">
            Back to home
          </Button>
        </div>
      </div>
    </section>
  );
}
