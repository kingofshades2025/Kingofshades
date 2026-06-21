/** Canonical public site URL for auth redirects and Stripe. */
export function getSiteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "https://www.kingofshadesnj.com"
  ).replace(/\/$/, "");
}

/** Auth callback URL with optional post-login path. */
export function getAuthCallbackUrl(next = "/admin"): string {
  return `${getSiteBaseUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}
