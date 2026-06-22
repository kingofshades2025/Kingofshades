import { Resend } from "resend";
import { EMAIL_FUNCTION_SECRET } from "@/lib/app-config";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/public-config";

let resend: Resend | null = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

async function sendViaEdgeFunction(opts: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "x-email-secret": EMAIL_FUNCTION_SECRET,
    },
    body: JSON.stringify({
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
      from: getEmailFrom(),
    }),
  });

  const data = (await res.json()) as { id?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Email function failed");
  }

  return data;
}

export function getEmailFrom() {
  return process.env.EMAIL_FROM ?? "King of Shades <contact@kingofshadesnj.com>";
}

export function getEmailTo() {
  return process.env.EMAIL_TO ?? "kingofshades2025@gmail.com";
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (process.env.RESEND_API_KEY?.trim()) {
    const { data, error } = await getResend().emails.send({
      from: getEmailFrom(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  return sendViaEdgeFunction(opts);
}

function row(label: string, value: string) {
  if (!value.trim()) return "";
  return `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;font-size:14px;width:140px;">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#111;font-size:14px;">${value}</td></tr>`;
}

function emailButton(label: string, href: string) {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0 8px;">
    <tr><td>
      <a href="${href}" style="display:inline-block;background:#d4af37;color:#0a0a0a;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:6px;">${label}</a>
    </td></tr>
  </table>`;
}

function emailLayout(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;">
        <tr><td style="background:#0a0a0a;padding:24px 32px;">
          <h1 style="margin:0;color:#d4af37;font-size:20px;font-weight:bold;">King of Shades</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 16px;color:#111;font-size:22px;">${title}</h2>
          ${body}
        </td></tr>
        <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;">
          <p style="margin:0;color:#888;font-size:12px;">King of Shades · kingofshadesnj.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function contactNotificationHtml(data: {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}) {
  const rows = [
    row("Name", data.name),
    row("Email", data.email),
    row("Phone", data.phone || "—"),
    row("Service", data.service || "—"),
    row("Message", data.message.replace(/\n/g, "<br>")),
  ].join("");

  return emailLayout(
    "New contact form submission",
    `<p style="color:#555;font-size:15px;margin:0 0 20px;">You received a new message from the website.</p>
     <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;">${rows}</table>`,
  );
}

export function contactConfirmationHtml(name: string) {
  return emailLayout(
    `Thanks for reaching out, ${name.split(" ")[0]}!`,
    `<p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">
       We received your message and will get back to you within one business day.
     </p>
     <p style="color:#555;font-size:15px;line-height:1.6;margin:0;">
       If you need immediate assistance, call us or visit
       <a href="https://kingofshadesnj.com/contact" style="color:#d4af37;">kingofshadesnj.com</a>.
     </p>`,
  );
}

export function bookingNotificationHtml(data: {
  service: string;
  tint: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  details: Record<string, string>;
  photoUrls?: string[];
  appointmentNumber?: string;
}) {
  const detailRows = Object.entries(data.details)
    .filter(([, v]) => typeof v === "string" && v.trim())
    .map(([k, v]) => row(k, v as string))
    .join("");

  const photoRows =
    data.photoUrls && data.photoUrls.length > 0
      ? data.photoUrls
          .map(
            (url, i) =>
              `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;font-size:14px;width:140px;">File ${i + 1}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;"><a href="${url}" style="color:#d4af37;">View attachment</a></td></tr>`,
          )
          .join("")
      : "";

  const rows = [
    row("Appointment #", data.appointmentNumber ?? "—"),
    row("Service", data.service),
    row("Tint / shade", data.tint),
    row("Date", data.date),
    row("Time", data.time),
    row("Name", data.name),
    row("Email", data.email),
    row("Phone", data.phone || "—"),
    row("Notes", data.notes.replace(/\n/g, "<br>") || "—"),
  ].join("");

  const detailsBlock = detailRows || photoRows
    ? `<h3 style="margin:24px 0 12px;color:#111;font-size:16px;">Service details</h3>
       <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;">${detailRows}${photoRows}</table>`
    : "";

  return emailLayout(
    "New booking request",
    `<p style="color:#555;font-size:15px;margin:0 0 20px;">A customer submitted a booking request from the website.</p>
     <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;">${rows}</table>
     ${detailsBlock}`,
  );
}

export function bookingConfirmationHtml(data: {
  name: string;
  service: string;
  date: string;
  time: string;
  appointmentNumber?: string;
}) {
  const first = data.name.split(" ")[0];
  return emailLayout(
    `Booking confirmed, ${first}!`,
    `<p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">
       Thank you for choosing King of Shades. Your appointment request is confirmed:
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;margin-bottom:20px;">
       ${row("Appointment #", data.appointmentNumber ?? "Pending")}
       ${row("Service", data.service)}
       ${row("Date", data.date)}
       ${row("Time", data.time)}
     </table>
     <p style="color:#555;font-size:15px;line-height:1.6;margin:0;">
       We'll send a reminder before your appointment. Questions? Reply to this email or call the shop.
     </p>`,
  );
}

export function appointmentConfirmedHtml(data: {
  name: string;
  service: string;
  date: string;
  time: string;
  appointmentNumber?: string;
}) {
  const first = data.name.split(" ")[0];
  return emailLayout(
    `You're all set, ${first}!`,
    `<p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">
       Your King of Shades appointment has been confirmed by our team.
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;">
       ${row("Appointment #", data.appointmentNumber ?? "—")}
       ${row("Service", data.service)}
       ${row("Date", data.date)}
       ${row("Time", data.time)}
     </table>`,
  );
}

export function quoteSentHtml(data: {
  name: string;
  serviceType: string;
  quotedAmount: string;
  notes?: string;
  paymentUrl?: string;
}) {
  const first = data.name.split(" ")[0];
  const paymentBlock = data.paymentUrl
    ? `${emailButton("Pay now with Stripe", data.paymentUrl)}
       <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px;">
         Secure checkout — pay online to approve your quote and lock in your project.
       </p>`
    : `<p style="color:#555;font-size:15px;line-height:1.6;margin:0;">
         Reply to this email or call us to approve the quote and schedule your project.
       </p>`;

  return emailLayout(
    `Your quote is ready, ${first}`,
    `<p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">
       We've reviewed your custom project request and prepared an estimate.
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;margin-bottom:20px;">
       ${row("Service", data.serviceType)}
       ${row("Quoted amount", data.quotedAmount)}
       ${data.notes ? row("Notes", data.notes.replace(/\n/g, "<br>")) : ""}
     </table>
     ${paymentBlock}`,
  );
}

export function quoteNotificationHtml(data: {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  description: string;
  measurements: string;
  photoUrls?: string[];
  adminQuoteUrl?: string;
}) {
  const photoRows =
    data.photoUrls && data.photoUrls.length > 0
      ? data.photoUrls
          .map(
            (url, i) =>
              row(`Attachment ${i + 1}`, `<a href="${url}" style="color:#d4af37;">View file</a>`),
          )
          .join("")
      : "";

  const rows = [
    row("Name", data.name),
    row("Email", data.email),
    row("Phone", data.phone || "—"),
    row("Service", data.serviceType),
    row("Description", data.description.replace(/\n/g, "<br>")),
    row("Measurements", data.measurements.replace(/\n/g, "<br>") || "—"),
    photoRows,
  ].join("");

  const actionBlock = data.adminQuoteUrl
    ? `${emailButton("Send Quote", data.adminQuoteUrl)}
       <p style="color:#888;font-size:13px;line-height:1.5;margin:0;">
         Open in admin, enter the quoted amount, and click <strong style="color:#555;">quote sent</strong> to email the customer a Stripe payment link.
       </p>`
    : "";

  return emailLayout(
    "New quote request",
    `<p style="color:#555;font-size:15px;margin:0 0 20px;">A customer submitted a custom quote request.</p>
     ${actionBlock}
     <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;">${rows}</table>`,
  );
}
