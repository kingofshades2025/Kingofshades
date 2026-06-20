import { Resend } from "resend";

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

function row(label: string, value: string) {
  if (!value.trim()) return "";
  return `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;font-size:14px;width:140px;">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#111;font-size:14px;">${value}</td></tr>`;
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
}) {
  const detailRows = Object.entries(data.details)
    .filter(([, v]) => v.trim())
    .map(([k, v]) => row(k, v))
    .join("");

  const rows = [
    row("Service", data.service),
    row("Tint / shade", data.tint),
    row("Date", data.date),
    row("Time", data.time),
    row("Name", data.name),
    row("Email", data.email),
    row("Phone", data.phone || "—"),
    row("Notes", data.notes.replace(/\n/g, "<br>") || "—"),
  ].join("");

  const detailsBlock = detailRows
    ? `<h3 style="margin:24px 0 12px;color:#111;font-size:16px;">Service details</h3>
       <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;">${detailRows}</table>`
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
}) {
  const first = data.name.split(" ")[0];
  return emailLayout(
    `Booking request received, ${first}!`,
    `<p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">
       Thank you for choosing King of Shades. We've received your appointment request:
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;margin-bottom:20px;">
       ${row("Service", data.service)}
       ${row("Requested date", data.date)}
       ${row("Requested time", data.time)}
     </table>
     <p style="color:#555;font-size:15px;line-height:1.6;margin:0;">
       Our team will confirm your appointment shortly. Payment processing will be added in a future update —
       no deposit has been charged.
     </p>`,
  );
}
