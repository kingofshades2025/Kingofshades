import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  from?: string;
};

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const secret = Deno.env.get("EMAIL_FUNCTION_SECRET");
  if (!secret || req.headers.get("x-email-secret") !== secret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload: EmailPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const from =
    payload.from ??
    Deno.env.get("EMAIL_FROM") ??
    "King of Shades <contact@kingofshadesnj.com>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      reply_to: payload.replyTo,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return new Response(JSON.stringify({ error: data.message ?? "Resend error" }), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ id: data.id }), {
    headers: { "Content-Type": "application/json" },
  });
});
