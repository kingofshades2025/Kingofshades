import { cn } from "@/lib/utils";

/* Brand glyphs as inline SVG (lucide-react dropped brand logos). */
const paths: Record<string, React.ReactNode> = {
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <path d="M14 9h2.5V6H14c-1.93 0-3 1.07-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9.5c0-.3.2-.5.5-.5z" />
  ),
  youtube: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
      <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
    </>
  ),
  tiktok: (
    <path d="M14 3c.4 2.2 1.8 3.8 4 4v2.6c-1.4 0-2.8-.4-4-1.1V15a5 5 0 1 1-5-5c.3 0 .7 0 1 .1v2.7a2.3 2.3 0 1 0 1.6 2.2V3z" />
  ),
};

export function SocialIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      {paths[name] ?? paths.instagram}
    </svg>
  );
}
