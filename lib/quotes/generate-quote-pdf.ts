import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { QuoteLineItem } from "@/lib/types/database";

export type QuotePdfData = {
  appointmentNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  serviceTitle: string;
  appointmentDate: string;
  appointmentTime: string;
  vehicleDetails: Record<string, string>;
  lineItems: QuoteLineItem[];
  totalCents: number;
  notes?: string | null;
  businessName?: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  phone?: string | null;
  email?: string | null;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateQuotePdf(data: QuotePdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const gold = rgb(0.83, 0.69, 0.22);
  const ink = rgb(0.04, 0.04, 0.04);
  const gray = rgb(0.4, 0.4, 0.4);
  let y = 740;

  const draw = (text: string, opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> } = {}) => {
    const size = opts.size ?? 11;
    const f = opts.bold ? fontBold : font;
    page.drawText(text, { x: 50, y, size, font: f, color: opts.color ?? ink });
    y -= size + 6;
  };

  page.drawRectangle({ x: 0, y: 720, width: 612, height: 72, color: ink });
  page.drawText(data.businessName ?? "King of Shades", {
    x: 50,
    y: 752,
    size: 22,
    font: fontBold,
    color: gold,
  });
  page.drawText("Service Quote", { x: 50, y: 728, size: 12, font, color: rgb(0.9, 0.9, 0.9) });
  y = 690;

  draw(`Quote #${data.appointmentNumber}`, { bold: true, size: 14 });
  draw(`Prepared for: ${data.customerName}`);
  if (data.customerEmail) draw(`Email: ${data.customerEmail}`, { color: gray });
  if (data.customerPhone) draw(`Phone: ${data.customerPhone}`, { color: gray });
  y -= 8;

  draw("Service", { bold: true, size: 12 });
  draw(data.serviceTitle);
  draw(`Preferred date: ${data.appointmentDate} at ${data.appointmentTime}`, { color: gray });
  y -= 8;

  const vehicleEntries = Object.entries(data.vehicleDetails).filter(
    ([key, val]) => key !== "photo_urls" && typeof val === "string" && val.trim(),
  );
  if (vehicleEntries.length > 0) {
    draw("Vehicle / project details", { bold: true, size: 12 });
    for (const [key, val] of vehicleEntries) {
      draw(`${key}: ${val}`, { color: gray });
    }
    y -= 8;
  }

  draw("Quote breakdown", { bold: true, size: 12 });
  y -= 4;

  page.drawLine({ start: { x: 50, y }, end: { x: 562, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
  y -= 16;

  for (const item of data.lineItems) {
    const labelLines = wrapText(item.label, 50);
    const amount = formatMoney(item.amount_cents);
    page.drawText(amount, { x: 480, y, size: 11, font, color: ink });
    for (const line of labelLines) {
      page.drawText(line, { x: 50, y, size: 11, font, color: ink });
      y -= 16;
    }
    if (labelLines.length === 0) y -= 16;
  }

  y -= 4;
  page.drawLine({ start: { x: 50, y }, end: { x: 562, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
  y -= 20;
  page.drawText("Total", { x: 50, y, size: 13, font: fontBold, color: ink });
  page.drawText(formatMoney(data.totalCents), { x: 480, y, size: 13, font: fontBold, color: ink });
  y -= 24;

  if (data.notes?.trim()) {
    draw("Notes", { bold: true, size: 12 });
    for (const line of wrapText(data.notes.trim(), 80)) {
      draw(line, { color: gray });
    }
    y -= 8;
  }

  y = Math.min(y, 120);
  const footerLines = [
    data.businessName ?? "King of Shades",
    [data.addressLine1, data.addressLine2].filter(Boolean).join(", ") || null,
    data.phone ? `Phone: ${data.phone}` : null,
    data.email ? `Email: ${data.email}` : null,
    "kingofshadesnj.com",
  ].filter(Boolean) as string[];

  for (const line of footerLines) {
    page.drawText(line, { x: 50, y, size: 9, font, color: gray });
    y -= 12;
  }

  return doc.save();
}
